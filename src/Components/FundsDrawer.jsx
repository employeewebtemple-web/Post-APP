import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getCurrentUser } from "../services/authService";

const user = getCurrentUser();

export default function FundsDrawer({
  title = "Funds",
  defaultOpen = false
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);

  const [funds, setFunds] = useState({
    totalWithdrawn: 0,
    walletBalance: 0
  });

  useEffect(() => {
    fetchUserFunds();
  }, []);

  const fetchUserFunds = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:3001/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();

        setFunds({
          totalWithdrawn: data.totalWithdrawn || 0,
          walletBalance: data.walletBalance || 0
        });
      }

    } catch (error) {
      console.error("Error fetching funds:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header - Added pl-12 on mobile to account for menu button */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 pl-12 lg:pl-0">
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sky-400 hover:text-sky-300"
        >
          {isOpen ? <ChevronUp size={26} /> : <ChevronDown size={26} />}
        </button>
      </div>

      {/* Funds */}
      {isOpen && (
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-5">
          <h3 className="text-lg font-semibold text-white mb-5 pl-12 lg:pl-0">Funds</h3>

          {loading ? (
            <p className="text-gray-400 pl-12 lg:pl-0">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 text-sm">
              
              <div>
                <p className="text-gray-400">Total Withdrawn</p>
                <p className="text-2xl font-bold text-white">
                  ₹{Number(funds.totalWithdrawn).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-gray-400">Wallet Balance</p>
                <p className="text-2xl font-bold text-green-400">
                  ₹{Number(funds.walletBalance).toLocaleString()}
                </p>
              </div>

            </div>
          )}
        </div>
      )}
    </>
  );
}