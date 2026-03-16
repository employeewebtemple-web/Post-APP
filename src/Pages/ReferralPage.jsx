import { useState } from "react";
import Sidebar from "../Components/Sidebar";
import { Menu } from "lucide-react";
import { Copy } from "lucide-react";

export default function ReferralLink() {
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const referralLink =
    "http://localhost:5173/register?ref=" + (user?.userId || "USER");

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-900">

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


      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-6">

        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Referral Program
        </h1>

        <p className="text-gray-400 mb-6 text-center">
          Share your referral link with friends. When they register using your link, you will earn rewards.
        </p>

        <div className="flex w-full max-w-full bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">

          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 bg-slate-900 text-gray-300 outline-none text-sm sm:text-base rounded-l-lg"
          />

          <button
            onClick={copyLink}
            className="px-6 py-3 bg-slate-700 text-cyan-400 hover:bg-slate-600 transition rounded-r-lg"
          >
            <Copy size={18} />
          </button>
        </div>

        {copied && (
          <p className="text-green-400 text-sm mt-4 text-center">
            Referral link copied!
          </p>
        )}

      </div>
    </div>
  );
}