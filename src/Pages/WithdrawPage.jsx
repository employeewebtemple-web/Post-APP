import { useEffect, useState } from "react";
import axios from "axios";
import FundsDrawer from "../Components/FundsDrawer";
import Sidebar from "../Components/Sidebar";
import { Menu, History, X, Check, Clock } from "lucide-react"; // Combined imports

export default function WithdrawPage() {
  const [bankAccount, setBankAccount] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile sidebar
  const [walletBalance, setWalletBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:3001/api/auth/bankDetails",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("res", res.data.bank);

      setBankAccount(res.data.bank);
      setWalletBalance(res.data.bank.walletBalance);

    } catch (err) {
      console.error("Fetch bank account error:", err);
    }
  };

  const fetchWithdrawHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:3001/api/auth/withdrawal-history",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWithdrawHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      console.error("Fetch history error:", err);
      alert("Failed to fetch withdrawal history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleWithdraw = async () => {
    if (!bankAccount) {
      alert("No bank account found");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid withdrawal amount");
      return;
    }

    if (Number(amount) < 200) {
        alert("Minimum withdrawal amount is ₹200");
        return;
    }

    if (Number(amount) > walletBalance) {
      alert("Amount exceeds wallet balance");
      return;
    }

    try {
      const token = localStorage.getItem("token");

       const userCheck = await axios.get(
          "http://localhost:3001/api/auth/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
    const freshUserData = userCheck.data;
    
    // Check if withdrawals are disabled
    if (freshUserData.disableWithdrawals) {
      alert("Your withdrawal ability has been disabled by admin. You cannot withdraw funds at this time.");
      return;
    }

      await axios.post(
        "http://localhost:3001/api/auth/withdraw",
        {
          amount: Number(amount),
          bankAccountId: bankAccount.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Withdrawal request submitted successfully");
      setAmount("");

      fetchAccount(); // refresh wallet balance
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "Withdrawal failed");
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return 'text-green-400 bg-green-500/10';
      case 'rejected':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-yellow-400 bg-yellow-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 p-2 rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* SIDEBAR with mobile props */}
      <Sidebar 
        role="user"
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        isCollapsed={false}
      />

      {/* PAGE CONTENT - removed ml-64 on mobile */}
      <div className="lg:ml-64 pb-24">
        <FundsDrawer title="Withdraw Funds" />

        {/* WALLET BALANCE & HISTORY BUTTON */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">Wallet Balance</h2>
            <button
              onClick={fetchWithdrawHistory}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition text-sm"
            >
              <History className="w-4 h-4" />
              Withdrawal History
            </button>
          </div>
          
          <div className="p-4 rounded-lg border border-slate-700 bg-slate-900">
            <p className="text-gray-400 text-sm">Available Balance</p>
            <p className="text-white text-xl font-semibold">
              ₹{walletBalance}
            </p>
          </div>
        </div>

        {/* BANK DETAILS */}
        <div className="px-5 mt-6">
          <h2 className="text-white text-lg font-semibold mb-4">
            Your Bank Details
          </h2>

          {!bankAccount ? (
            <p className="text-gray-400 text-sm">No bank account found</p>
          ) : (
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-900">
              <p className="text-white font-medium">
                {bankAccount.firstName} {bankAccount.lastName}
              </p>

              <p className="text-gray-400 text-sm mt-1">
                Bank: {bankAccount.bankName || "—"}
              </p>

              <p className="text-gray-400 text-sm">
                A/C: {bankAccount.accountNumber || "—"}
              </p>

              <p className="text-gray-400 text-sm">
                IFSC: {bankAccount.ifsc || "—"}
              </p>
            </div>
          )}
        </div>

        {/* WITHDRAW SECTION */}
        {walletBalance > 0 ? (
          <>
            <div className="px-5 mt-6">
              <h2 className="text-white text-lg font-semibold mb-3">
                Withdrawal Amount
              </h2>

              <input
                type="number"
                placeholder="Enter withdrawal amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-sky-500"
              />
              
                <p className="text-gray-400 text-sm mt-2">
                        Minimum withdrawal: ₹200
                </p>
            </div>

            {/* WITHDRAW BUTTON */}
            <div className="px-5 mt-6">
              <button
                onClick={handleWithdraw}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-medium transition"
              >
                Withdraw Money
              </button>
            </div>
          </>
        ) : (
          <div className="px-5 mt-6">
            <p className="text-gray-400 text-sm">
              No balance available for withdrawal
            </p>
          </div>
        )}

      </div>

      {/* WITHDRAWAL HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-sky-400" />
                Withdrawal History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {loadingHistory ? (
                <p className="text-gray-400 text-center py-8">Loading...</p>
              ) : withdrawHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No withdrawal requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawHistory.map((request) => (
                    <div
                      key={request.id}
                      className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-semibold">
                              ₹{request.amount}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-gray-400 text-xs">
                            Requested: {new Date(request.createdAt).toLocaleString()}
                          </p>
                          
                          {request.admin_message && (
                            <p className="text-gray-400 text-sm mt-2 bg-slate-800/50 p-2 rounded">
                              <span className="text-gray-500">Admin:</span> {request.admin_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}