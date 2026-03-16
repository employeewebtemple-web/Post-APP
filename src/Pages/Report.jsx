import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Menu, Calendar, TrendingUp, Eye, IndianRupee } from "lucide-react";
import axios from "axios";

export default function ReportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportData, setReportData] = useState({
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    postsWatched: 0,
    completionRate: 0,
    recentEarnings: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/auth/report", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <Sidebar 
        role="user"
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        isCollapsed={false}
      />

      {/* Main Content - Exactly like Support page */}
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          My Earnings Report
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Today's Earnings */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Today's Earnings</p>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">₹{reportData.todayEarnings}</p>
          </div>

          {/* Weekly Earnings */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">This Week</p>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">₹{reportData.weeklyEarnings}</p>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">This Month</p>
              <IndianRupee className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">₹{reportData.monthlyEarnings}</p>
          </div>

          {/* Total Earnings */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">₹{reportData.totalEarnings}</p>
          </div>
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Posts Watched */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <p className="text-gray-400 text-sm mb-2">Posts Watched</p>
            <p className="text-3xl font-bold text-white">{reportData.postsWatched}</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <p className="text-gray-400 text-sm mb-2">Completion Rate</p>
            <p className="text-3xl font-bold text-green-400">{reportData.completionRate}%</p>
          </div>
        </div>

        {/* Recent Earnings Table - Like messages section in Support */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Recent Earnings</h2>
          
          {reportData.recentEarnings?.length === 0 ? (
            <p className="text-gray-400">No earnings yet. Start watching posts!</p>
          ) : (
            <div className="space-y-4">
              {reportData.recentEarnings?.map((earning, index) => (
                <div key={index} className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-cyan-300 font-medium">{earning.postTitle}</p>
                      <p className="text-gray-400 text-sm mt-1">{earning.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">₹{earning.amount}</p>
                      <span className="inline-block px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs mt-1">
                        {earning.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}