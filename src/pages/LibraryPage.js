import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../api";
import { useNavigate } from "react-router-dom";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const LibraryPage = () => {
  const [artefacts, setArtefacts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const load = async (searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/artefacts", {
        params: {
          ...(searchTerm ? { search: searchTerm } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(classificationFilter ? { classification: classificationFilter } : {}),
          ...(ownerFilter ? { ownerId: ownerFilter } : {}),
          ...(regionFilter ? { regionId: regionFilter } : {}),
        },
      });
      setArtefacts(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to load artefacts";
      setError(msg);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Load regions for filtering (admin/reviewer can switch region)
    api
      .get("/regions")
      .then((r) => setRegions(r.data || []))
      .catch(() => setRegions([]));
  }, []);

  const handleSearchKey = (e) => {
    if (e.key === "Enter") {
      load(search);
    }
  };

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6">Artefact library</Typography>
          <TextField
            size="small"
            placeholder="Search title, description, tags"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKey}
            sx={{ width: 320 }}
          />
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                load(search);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="draft">draft</MenuItem>
              <MenuItem value="pending_review">pending_review</MenuItem>
              <MenuItem value="approved">approved</MenuItem>
              <MenuItem value="rejected">rejected</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Classification</InputLabel>
            <Select
              label="Classification"
              value={classificationFilter}
              onChange={(e) => {
                setClassificationFilter(e.target.value);
                load(search);
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="open">open</MenuItem>
              <MenuItem value="restricted">restricted</MenuItem>
              <MenuItem value="confidential">confidential</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Owner</InputLabel>
            <Select
              label="Owner"
              value={ownerFilter}
              onChange={(e) => {
                setOwnerFilter(e.target.value);
                load(search);
              }}
            >
              <MenuItem value="">All</MenuItem>
              {[...new Map((artefacts || []).map((a) => [a.ownerId?._id || a.ownerId, a.ownerId])).values()]
                .filter(Boolean)
                .map((o) => (
                  <MenuItem key={o._id || String(o)} value={o._id || String(o)}>
                    {o.name || String(o)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Region</InputLabel>
            <Select
              label="Region"
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                load(search);
              }}
            >
              <MenuItem value="">My region</MenuItem>
              {regions.map((r) => (
                <MenuItem key={r._id} value={r._id}>
                  {r.regionName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Classification</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artefacts.map((a) => (
              <TableRow key={a._id} hover>
                <TableCell>{a.title}</TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell>{a.classification}</TableCell>
                <TableCell>{a.ownerId?.name || String(a.ownerId)}</TableCell>
                <TableCell>{a.regionId?.regionName || String(a.regionId)}</TableCell>
                <TableCell>
                  {a.tags?.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  {a.updatedAt
                    ? new Date(a.updatedAt).toLocaleDateString()
                    : ""}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/artefacts/${a._id}`)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {artefacts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2">
                    No artefacts found. Try uploading one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <FeedbackSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity="error"
        message={error}
      />
    </Paper>
  );
};

export default LibraryPage;
