import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar"; // adjust path if needed
import { Menu } from "lucide-react";

export default function BankDetails() {

  const [formData, setFormData] = useState({
    accountNumber: "",
    ifsc: "",
    bankName: "",
    upiId: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch bank details on page load
  useEffect(() => {
    const fetchBank = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/auth/bankDetails", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await response.json();
        if (response.ok && data.bank) {
          setFormData(data.bank);
        }
      } catch (err) {
        console.log("No bank details found");
      }
    };
    fetchBank();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call the single upsert API
      const response = await fetch("http://localhost:3001/api/auth/upsertBankDetails", {
        method: "POST", // backend decides create or update
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setFormData({
          accountNumber: "",
          ifsc: "",
          bankName: "",
          upiId: ""
        });
      } else {
        setError(data.message || "Failed to save bank details");
      }
    } catch (err) {
      setError("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
    {/* Mobile Menu Button - Add this */}
    <button
      onClick={() => setSidebarOpen(true)}
      className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg text-white"
    >
      <Menu className="w-6 h-6" />
    </button>

    {/* Update your Sidebar to include these props */}
    <Sidebar 
      role="user" // or "admin"
      isMobileOpen={sidebarOpen}
      onMobileClose={() => setSidebarOpen(false)}
      isCollapsed={false}
    />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
            Edit Bank Details
          </h2>

          {error && (
            <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

            <div>
              <label className="block text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">
                Account Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="accountNumber"
                required
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">
                IFSC Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="ifsc"
                required
                value={formData.ifsc}
                onChange={handleChange}
                placeholder="e.g., SBIN0001234"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">
                Bank Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="bankName"
                required
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g., State Bank of India"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">
                UPI ID
              </label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="e.g., username@okhdfcbank"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
              <p className="text-gray-500 text-xs mt-1 sm:mt-2">
                Optional but recommended for faster withdrawals
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 sm:mt-6 bg-cyan-500 hover:bg-cyan-600 text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Bank Details"
              )}
            </button>

            <p className="text-gray-500 text-xs text-center mt-4">
              Your bank details are securely stored and used only for withdrawals
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}