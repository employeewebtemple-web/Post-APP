import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole = "user" }) {
  // Check if user is logged in
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  
  // For user routes
  if (requiredRole === "user") {
    if (!token) {
      // Redirect to user login if no token
      return <Navigate to="/" replace />;
    }
    return children;
  }
  
  // For admin routes
  if (requiredRole === "admin") {
    if (!adminToken) {
      // Redirect to admin login if no admin token
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  }
  
  return children;
}