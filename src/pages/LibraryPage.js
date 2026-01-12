import React, { useEffect, useMemo, useState } from "react";
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
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import api from "../api";
import { useNavigate } from "react-router-dom";
import FeedbackSnackbar from "../components/FeedbackSnackbar";
import { useAuth } from "../auth/AuthContext";

const LibraryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [artefacts, setArtefacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  const canOverrideRegion = (user?.roleGroup === "admin" || user?.roleGroup === "reviewer");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/artefacts", {
        params: {
          ...(search ? { search } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(classificationFilter ? { classification: classificationFilter } : {}),
          ...(ownerFilter ? { ownerId: ownerFilter } : {}),
          ...(canOverrideRegion && regionFilter ? { regionId: regionFilter } : {}),
        },
      });
      setArtefacts(res.data || []);
    } catch (e) {
      setSnack({ open: true, severity: "error", message: e?.response?.data?.error || "Failed to load library" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, classificationFilter, ownerFilter, regionFilter]);

  const owners = useMemo(() => {
    const map = new Map();
    (artefacts || []).forEach((a) => {
      if (a.ownerId && a.ownerId._id) map.set(a.ownerId._id, a.ownerId.name || a.ownerId.email);
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [artefacts]);

  const regions = useMemo(() => {
    const map = new Map();
    (artefacts || []).forEach((a) => {
      if (a.regionId && a.regionId._id) map.set(a.regionId._id, a.regionId.regionName);
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [artefacts]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Library
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="Search (title/description/tags)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load();
            }}
          />
          <Button variant="contained" onClick={load}>
            Search
          </Button>

          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="pending_review">Pending Review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Classification</InputLabel>
            <Select
              value={classificationFilter}
              label="Classification"
              onChange={(e) => setClassificationFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="internal">Internal</MenuItem>
              <MenuItem value="confidential">Confidential</MenuItem>
              <MenuItem value="restricted">Restricted</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Owner</InputLabel>
            <Select value={ownerFilter} label="Owner" onChange={(e) => setOwnerFilter(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {owners.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {canOverrideRegion && (
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Region</InputLabel>
              <Select value={regionFilter} label="Region" onChange={(e) => setRegionFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {regions.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Paper>

      <Paper>
        {loading ? (
          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
            <CircularProgress size={20} />
            <Typography>Loading artefacts...</Typography>
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Classification</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="right">Open</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(artefacts || []).map((a) => (
                <TableRow key={a._id} hover>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell>{a.classification}</TableCell>
                  <TableCell>{a.ownerId?.name || a.ownerId?.email || a.ownerId}</TableCell>
                  <TableCell>{a.regionId?.regionName || a.regionId}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {(a.tags || []).slice(0, 4).map((t) => (
                        <Chip key={t} label={t} size="small" />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/artefacts/${a._id}`)} size="small">
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!artefacts || artefacts.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography sx={{ p: 2 }}>No artefacts found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <FeedbackSnackbar
        open={snack.open}
        severity={snack.severity}
        message={snack.message}
        onClose={() => setSnack({ ...snack, open: false })}
      />
    </Box>
  );
};

export default LibraryPage;
