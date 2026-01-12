import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Stack,
  Chip,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NavButton = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Button
      component={Link}
      to={to}
      color="inherit"
      variant={active ? "outlined" : "text"}
      size="small"
      sx={{ borderColor: "rgba(255,255,255,0.6)" }}
    >
      {label}
    </Button>
  );
};

const roleLabel = (role) => {
  const r = String(role || "").toLowerCase();
  if (r === "system_admin" || r === "admin") return "System Admin";
  if (r === "governance_council_member") return "Governance Council";
  if (r === "knowledge_champion") return "Knowledge Champion";
  if (r === "senior_consultant") return "Senior Consultant";
  if (r === "junior_consultant" || r === "user") return "Junior Consultant";
  return r;
};

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const group = user?.roleGroup || "consultant";
  const canReview = user && (group === "admin" || group === "reviewer");
  const isAdmin = user && group === "admin";

  return (
    <Box className="kv-main">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Digital Knowledge Network (DKN)
          </Typography>

          {user && (
            <Stack direction="row" spacing={1} alignItems="center">
              <NavButton to="/" label="Dashboard" />
              <NavButton to="/upload" label="Upload" />
              <NavButton to="/library" label="Library" />
              {canReview && <NavButton to="/governance" label="Governance" />}
              {canReview && <NavButton to="/audit" label="Audit" />}

              <Chip
                size="small"
                label={roleLabel(user.role)}
                sx={{ ml: 1, bgcolor: "rgba(255,255,255,0.18)", color: "white" }}
              />

              <Button color="inherit" onClick={logout} size="small">
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;
