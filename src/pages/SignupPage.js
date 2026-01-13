import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth/AuthContext";
import FeedbackSnackbar from "../components/FeedbackSnackbar";

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regionId, setRegionId] = useState("");
  const [regions, setRegions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [role, setRole] = useState("junior_consultant");

  const roleOptions = [
    { value: "junior_consultant", label: "Junior Consultant" },
    { value: "senior_consultant", label: "Senior Consultant" },
    { value: "knowledge_champion", label: "Knowledge Champion" },
    { value: "governance_council_member", label: "Governance Council Member" },
    { value: "system_admin", label: "System Admin" },
  ];

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const res = await api.get("/regions");
        setRegions(res.data);
      } catch (err) {
        setError("Failed to load regions");
        setSnackbarOpen(true);
      }
    };
    loadRegions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password, regionId, role });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Paper sx={{ p: 4, width: 400 }} elevation={4}>
        <Typography variant="h5" gutterBottom>
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            margin="normal"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            margin="normal"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            margin="normal"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            select
            label="User Type"
            fullWidth
            margin="normal"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            {roleOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Region"
            fullWidth
            margin="normal"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            required
          >
            {regions.map((r) => (
              <MenuItem key={r._id} value={r._id}>
                {r.regionName}
              </MenuItem>
            ))}
          </TextField>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} /> : "Create account"}
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already registered? <Link to="/login">Sign in</Link>
        </Typography>
      </Paper>
      <FeedbackSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity="error"
        message={error}
      />
    </Box>
  );
};

export default SignupPage;
