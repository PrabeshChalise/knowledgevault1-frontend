import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * RoleRoute enforces role-based access control at the UI level.
 * allowed can include roleGroup ("admin","reviewer","consultant") or specific roles.
 */
const RoleRoute = ({ allowed = [], children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const role = String(user.role || "").toLowerCase();
  const group = String(user.roleGroup || "").toLowerCase();

  const ok =
    allowed.map((a) => String(a).toLowerCase()).includes(role) ||
    allowed.map((a) => String(a).toLowerCase()).includes(group);

  if (!ok) return <Navigate to="/" replace />;
  return children;
};

export default RoleRoute;
