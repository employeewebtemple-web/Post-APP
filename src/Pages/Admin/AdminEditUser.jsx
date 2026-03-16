import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthHeader } from "../../services/adminService";
import Sidebar from "../../Components/Sidebar";
import { Menu, ArrowLeft, Save, X } from "lucide-react";

const BACKEND_URL = "http://localhost:3001";

const AdminEditUser = () => {
  const { id } = useParams(); // id = userId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    accountNumber: "",
    ifscCode: "",
    // accountHolderName: "",
    upiId: "",
    disableIncome: false,
    disableWithdrawals: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/users/${id}`, getAuthHeader());
        setFormData({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          accountNumber: res.data.accountNumber || "",
          ifscCode: res.data.ifsc || res.data.ifscCode || "",
          // accountHolderName: res.data.accountHolderName || "",
          upiId: res.data.upiId || "",
          disableIncome: res.data.disableIncome || false,
          disableWithdrawals: res.data.disableWithdrawals || false,
        });
      } catch (err) {
        console.error("Failed to fetch user", err);
        alert("User not found");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/admin/users/${id}`, formData, getAuthHeader());
      alert("User updated successfully");
      navigate(-1);
    } catch (err) {
      console.error("Failed to update user", err);
      alert("Failed to update user");
    }
  };

  const resetPassword = async () => {
    const newPassword = prompt("Enter new password for user:");
    if (!newPassword) return;

    try {
      await axios.post(`${BACKEND_URL}/api/admin/users/${id}/reset-password`, { password: newPassword }, getAuthHeader());
      alert("Password reset successfully");
    } catch (err) {
      console.error("Failed to reset password", err);
      alert("Failed to reset password");
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-900">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading user...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[100] bg-gray-800 p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Back button for mobile */}
      {/* <button
        onClick={() => navigate(-1)}
        className="lg:hidden fixed top-4 right-4 z-[100] bg-gray-800 p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button> */}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out z-[90] w-64
      `}>
        <Sidebar 
          role="admin" 
          isMobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-[80] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-6">
        {/* Mobile header spacer */}
        <div className="lg:hidden h-12"></div>
        
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h1 className="text-3xl font-bold text-white">Edit User</h1>
        </div>

        {/* Mobile Title */}
        <h1 className="lg:hidden text-2xl font-bold text-white text-center mb-6">Edit User</h1>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4 sm:space-y-6 bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
          {/* User Info */}
          <div className="space-y-4">
            {renderInput("Email", formData.email, true, "email", setFormData, formData)}
            {renderInput("First Name", formData.firstName, false, "firstName", setFormData, formData)}
            {renderInput("Last Name", formData.lastName, false, "lastName", setFormData, formData)}
            {renderInput("Phone", formData.phone, false, "phone", setFormData, formData)}
            {renderInput("Account Number", formData.accountNumber, false, "accountNumber", setFormData, formData)}
            {renderInput("UPI ID", formData.upiId, false, "upiId", setFormData, formData)}
            {renderInput("IFSC Code", formData.ifscCode, false, "ifscCode", setFormData, formData)}
            {/* {renderInput("Account Holder Name", formData.accountHolderName, false, "accountHolderName", setFormData, formData)} */}
          </div>

          {/* Password Reset + Checkboxes */}
          <div className="space-y-4">
            {/* Password Reset Button */}
            <div className="flex justify-center lg:justify-start">
              <button
                type="button"
                onClick={resetPassword}
                className="w-full lg:w-auto px-5 py-3 lg:py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                Reset Password
              </button>
            </div>

            {/* Checkboxes - Stack on mobile, row on desktop */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg lg:bg-transparent lg:p-0">
                <input
                  type="checkbox"
                  id="disableIncome"
                  checked={formData.disableIncome}
                  onChange={(e) => setFormData({ ...formData, disableIncome: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="disableIncome" className="text-gray-300 text-sm sm:text-base">
                  Disable Income
                </label>
              </div>

              <div className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg lg:bg-transparent lg:p-0">
                <input
                  type="checkbox"
                  id="disableWithdrawals"
                  checked={formData.disableWithdrawals}
                  onChange={(e) => setFormData({ ...formData, disableWithdrawals: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="disableWithdrawals" className="text-gray-300 text-sm sm:text-base">
                  Disable Withdrawals
                </label>
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-5 py-3 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- Helper Input ---------- */
const renderInput = (label, value, readOnly, key, setFormData, formData) => (
  <div className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
    <label className="block sm:w-48 text-sm font-medium text-gray-300 mb-1 sm:mb-0">
      {label}
    </label>
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => !readOnly && setFormData({ ...formData, [key]: e.target.value })}
      className={`
        w-full p-3 sm:p-2 border rounded-lg sm:rounded
        transition-colors
        ${readOnly 
          ? "cursor-not-allowed bg-gray-700 text-gray-400 border-gray-600" 
          : "bg-gray-800 text-white border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }
      `}
    />
  </div>
);

export default AdminEditUser;