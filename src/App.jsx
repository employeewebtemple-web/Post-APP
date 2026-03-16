import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserLogin from "./Pages/UserLogin";
import UserSignup from "./Pages/UserSignUp";
import AdminLogin from "./Pages/Admin/AdminLogin";
import Dashboard from "./Pages/Dashboard";
import CreatePost from "./Pages/Admin/CreatePost";
import BankDetails from "./Pages/BankDetails";
import ReferralLink from "./Pages/ReferralPage";
import AdminUsersPage from "./Pages/Admin/AdminUserPage";
import AdminEditUser from "./Pages/Admin/AdminEditUser";
import WithdrawPage from "./Pages/WithdrawPage";
import Support from "./Pages/Support";
import AdminSupport from "./Pages/Admin/AdminSupport";
import WithdrawalRequests from "./Pages/Admin/WithdrawalRequests";
import Report from "./Pages/Report";
import ProtectedRoute from "./Components/ProtectedRoute"; // Import the protected route
import AdminReport from "./Pages/Admin/AdminPostReport";
import AdminPosts from "./Pages/Admin/AdminPosts";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes - No login required */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected User Routes - Login required */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="user">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/bank-details" element={
          <ProtectedRoute requiredRole="user">
            <BankDetails />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute requiredRole="user">
            <WithdrawPage />
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute requiredRole="user">
            <Report />
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute requiredRole="user">
            <Support />
          </ProtectedRoute>
        } />
        <Route path="/referral" element={
          <ProtectedRoute requiredRole="user">
            <ReferralLink />
          </ProtectedRoute>
        } />

        {/* Protected Admin Routes - Admin login required */}
        <Route path="/admin/create-post" element={
          <ProtectedRoute requiredRole="admin">
            <CreatePost />
          </ProtectedRoute>
        } />
        <Route path="/admin/support" element={
          <ProtectedRoute requiredRole="admin">
            <AdminSupport />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <AdminUsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:id" element={
          <ProtectedRoute requiredRole="admin">
            <AdminEditUser />
          </ProtectedRoute>
        } />
        <Route path="/admin/withdrawals" element={
          <ProtectedRoute requiredRole="admin">
            <WithdrawalRequests />
          </ProtectedRoute>
        } />
        <Route path="/admin/report" element={
          <ProtectedRoute requiredRole="admin">
            <AdminReport />
          </ProtectedRoute>
        } />
        <Route path="/admin/posts" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPosts />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;