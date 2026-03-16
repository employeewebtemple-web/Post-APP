import { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import { Menu, Eye, IndianRupee, Users, TrendingUp, Clock } from "lucide-react";
import axios from "axios";

export default function AdminPostReport() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalPayout: 0,
    avgViewsPerPost: 0
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get("http://localhost:3001/api/admin/posts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const postsData = response.data;
      setPosts(postsData);
      
      // Calculate summary
      const totalViews = postsData.reduce((sum, post) => sum + post.totalUsersWatched, 0);
      const totalPayout = postsData.reduce((sum, post) => sum + (post.totalUsersWatched * post.price), 0);
      
      setSummary({
        totalPosts: postsData.length,
        totalViews: totalViews,
        totalPayout: totalPayout,
        avgViewsPerPost: postsData.length ? Math.round(totalViews / postsData.length) : 0
      });
      
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen bg-slate-900">
        <Sidebar role="admin" />
        <div className="flex-1 lg:ml-64 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading posts...</p>
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
        {/* Mobile header spacer */}
        <div className="lg:hidden h-16"></div>
        
        <div className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white pl-12 lg:pl-0">
                Post Performance Report
              </h2>
              <p className="text-gray-400 mt-1 text-sm sm:text-base pl-12 lg:pl-0">
                Overview of all posts and their performance metrics.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Total Posts</p>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{summary.totalPosts}</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Total Views</p>
                  <Eye className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">{summary.totalViews}</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Total Payout</p>
                  <IndianRupee className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">₹{summary.totalPayout}</p>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">Avg Views/Post</p>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{summary.avgViewsPerPost}</p>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid gap-4">
              {posts.length === 0 ? (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 sm:p-10 text-center">
                  <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 text-base sm:text-lg">
                    No posts found
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-slate-600 transition shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
                      {/* Post Info */}
                      <div className="flex items-start gap-3 sm:gap-4 w-full lg:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 flex-shrink-0">
                          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-bold text-base sm:text-lg">
                            {post.title}
                          </h3>
                          <p className="text-gray-400 text-xs sm:text-sm">
                            Created: {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full lg:w-auto">
                        {/* Price */}
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Price</p>
                          <p className="text-cyan-400 font-bold flex items-center gap-1 text-sm sm:text-base">
                            <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                            {post.price}
                          </p>
                        </div>

                        {/* Watch Time */}
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Watch Time</p>
                          <p className="text-white font-bold text-sm sm:text-base">
                            {post.watchTime}
                          </p>
                        </div>

                        {/* Views */}
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Views</p>
                          <p className="text-white font-bold text-sm sm:text-base">
                            {post.totalUsersWatched}
                          </p>
                        </div>

                        {/* Total Payout */}
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Total Payout</p>
                          <p className="text-green-400 font-bold text-sm sm:text-base">
                            ₹{post.totalUsersWatched * post.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}