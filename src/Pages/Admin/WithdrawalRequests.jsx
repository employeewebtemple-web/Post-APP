import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, Clock, User, IndianRupee, MessageSquare } from "lucide-react";
import Sidebar from "../../Components/Sidebar";
import { Menu } from "lucide-react";

const WithdrawalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalAction, setModalAction] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.get(
        "http://localhost:3001/api/admin/withdrawals",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest) return;

    setActionLoading(selectedRequest.id);

    try {
      const token = localStorage.getItem("adminToken");

      const endpoint = modalAction === "approve" ? "approve" : "reject";

      await axios.post(
        `http://localhost:3001/api/admin/withdrawal/${endpoint}`,
        {
          id: selectedRequest.id,
          admin_message: adminMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowModal(false);
      setAdminMessage("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const openModal = (request, action) => {
    setSelectedRequest(request);
    setModalAction(action);
    setShowModal(true);
  };

  if (loading)
    return (
      <div className="flex min-h-screen bg-slate-900">
        <Sidebar role="admin" />
        <div className="flex-1 lg:ml-64 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading requests...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2.5 rounded-lg text-white hover:bg-gray-700 transition-colors shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 w-64
      `}>
        <Sidebar 
          role="admin"
          isMobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header spacer - THIS FIXES THE HEADING HIDING BEHIND MENU */}
        <div className="lg:hidden h-16"></div>
        
        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white pl-12 lg:pl-0">
                Withdrawal Requests
              </h2>
              <p className="text-gray-400 mt-1 text-sm sm:text-base pl-12 lg:pl-0">
                Manage and process user withdrawal requests.
              </p>
            </div>

            {/* Requests Grid */}
            <div className="grid gap-4">
              {requests.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 sm:p-10 text-center">
                  <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-base sm:text-lg">
                    No withdrawal requests found
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-slate-600 transition shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                      {/* User Info */}
                      <div className="flex items-start gap-3 sm:gap-4 w-full lg:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 flex-shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-bold text-base sm:text-lg truncate">
                            {request.User?.userId || "Unknown User"}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">
                            {request.User?.email}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Requested: {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full lg:w-auto">
                        {/* Amount */}
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Amount</p>
                          <p className="text-white font-bold flex items-center gap-1 text-sm sm:text-base">
                            <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                            {request.amount}
                          </p>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Status</p>
                          <span
                            className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                              request.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : request.status === "approved"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {request.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Bank Details - Full width on mobile */}
                        <div className="col-span-2 lg:col-span-2 mt-2 lg:mt-0">
                          <p className="text-gray-500 text-xs mb-1">Bank Details</p>
                          <div className="text-gray-300 text-xs sm:text-sm break-words space-y-0.5">
                            <p className="truncate">Name: {request.User?.bankName || 'N/A'}</p>
                            <p className="truncate">A/C: {request.User?.accountNumber || 'N/A'}</p>
                            <p className="truncate">IFSC: {request.User?.ifsc || 'N/A'}</p>
                            <p className="truncate">UPI: {request.User?.upiId || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {request.status === "pending" && (
                        <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                          <button
                            onClick={() => openModal(request, "approve")}
                            disabled={actionLoading === request.id}
                            className="flex-1 lg:flex-none px-4 sm:px-5 py-3 lg:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Approve</span>
                            <span className="sm:hidden">Approve</span>
                          </button>

                          <button
                            onClick={() => openModal(request, "reject")}
                            disabled={actionLoading === request.id}
                            className="flex-1 lg:flex-none px-4 sm:px-5 py-3 lg:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline">Reject</span>
                            <span className="sm:hidden">Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-4 sm:p-6 space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {modalAction === "approve" ? "Approve" : "Reject"} Withdrawal
            </h3>

            <p className="text-gray-400 text-sm sm:text-base">
              Are you sure you want to {modalAction} ₹{selectedRequest?.amount}?
            </p>

            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm sm:text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Admin message (optional)"
              rows={3}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:flex-1 bg-slate-700 py-3 sm:py-2 rounded-lg text-gray-300 text-sm sm:text-base hover:bg-slate-600 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>

              <button
                onClick={handleAction}
                className={`w-full sm:flex-1 py-3 sm:py-2 rounded-lg text-white text-sm sm:text-base transition-colors order-1 sm:order-2 ${
                  modalAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;