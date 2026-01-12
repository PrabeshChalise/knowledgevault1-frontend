import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
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
import api from "../api";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [actorId, setActorId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/audit", {
        params: {
          ...(action ? { action } : {}),
          ...(targetType ? { targetType } : {}),
          ...(actorId ? { actorId } : {}),
          ...(targetId ? { targetId } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
      });
      setLogs(res.data || []);
    } catch (e) {
      setSnack({ open: true, severity: "error", message: e?.response?.data?.error || "Failed to load audit logs" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Audit Trail
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Action</InputLabel>
            <Select value={action} label="Action" onChange={(e) => setAction(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ARTEFACT_CREATED">ARTEFACT_CREATED</MenuItem>
              <MenuItem value="ARTEFACT_UPDATED">ARTEFACT_UPDATED</MenuItem>
              <MenuItem value="VERSION_ADDED">VERSION_ADDED</MenuItem>
              <MenuItem value="SUBMITTED_FOR_REVIEW">SUBMITTED_FOR_REVIEW</MenuItem>
              <MenuItem value="GOV_DECISION">GOV_DECISION</MenuItem>
              <MenuItem value="ARTEFACT_ARCHIVED">ARTEFACT_ARCHIVED</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Target Type</InputLabel>
            <Select value={targetType} label="Target Type" onChange={(e) => setTargetType(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Artefact">Artefact</MenuItem>
              <MenuItem value="Version">Version</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Region">Region</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Actor ID"
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <TextField
            size="small"
            label="Target ID"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <TextField
            size="small"
            type="date"
            label="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Button variant="contained" onClick={load}>
            Apply
          </Button>
        </Stack>
      </Paper>

      <Paper>
        {loading ? (
          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 2 }}>
            <CircularProgress size={20} />
            <Typography>Loading audit logs...</Typography>
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(logs || []).map((l) => (
                <TableRow key={l._id} hover>
                  <TableCell>{new Date(l.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{l.action}</TableCell>
                  <TableCell>{l.actorId?.name || l.actorId?.email || l.actorId}</TableCell>
                  <TableCell>
                    {l.targetType}: {l.targetId}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 420 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {l.details ? JSON.stringify(l.details) : ""}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {(!logs || logs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography sx={{ p: 2 }}>No audit entries found.</Typography>
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

export default AuditPage;
