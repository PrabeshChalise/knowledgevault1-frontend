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
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import api from "../api";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [searchTargetId, setSearchTargetId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/audit", {
        params: {
          ...(actionFilter ? { action: actionFilter } : {}),
          ...(targetTypeFilter ? { targetType: targetTypeFilter } : {}),
          ...(actorFilter ? { actorId: actorFilter } : {}),
          ...(searchTargetId ? { targetId: searchTargetId } : {}),
        },
      });
        setLogs(res.data || []);
      } catch (err) {
        const msg = err.response?.data?.error || "Failed to load audit logs";
        setError(msg);
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actionFilter, targetTypeFilter, actorFilter, searchTargetId]);

  return (
    <Paper sx={{ p: 3 }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Audit trail
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel>Action</InputLabel>
          <Select
            label="Action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set((logs || []).map((l) => l.action).filter(Boolean))].map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Target type</InputLabel>
          <Select
            label="Target type"
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set((logs || []).map((l) => l.targetType).filter(Boolean))].map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>User</InputLabel>
          <Select
            label="User"
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Map((logs || []).map((l) => [l.actorId?._id || l.actorId, l.actorId])).values()]
              .filter(Boolean)
              .map((u) => (
                <MenuItem key={u._id || String(u)} value={u._id || String(u)}>
                  {u.name || String(u)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Target ID"
          value={searchTargetId}
          onChange={(e) => setSearchTargetId(e.target.value)}
        />
      </Stack>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Target type</TableCell>
              <TableCell>Target id</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l._id}>
                <TableCell>
                  {l.createdAt ? new Date(l.createdAt).toLocaleString() : ""}
                </TableCell>
                <TableCell>{l.actorId?.name || String(l.actorId || "")}</TableCell>
                <TableCell>{l.action}</TableCell>
                <TableCell>{l.targetType}</TableCell>
                <TableCell>{String(l.targetId || "")}</TableCell>
                <TableCell sx={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {l.details ? JSON.stringify(l.details) : ""}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2">
                    No audit logs yet or you do not have access.
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

export default AuditPage;
