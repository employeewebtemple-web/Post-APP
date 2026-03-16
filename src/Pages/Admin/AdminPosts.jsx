// Pages/Admin/AdminPosts.jsx
import { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import { Menu, Trash2, Plus, Play, Image } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminPosts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null); // For modal
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get("http://localhost:3001/api/admin/posts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:3001/api/admin/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const openMedia = (post) => {
    if (post.media) {
      // It's an image
      setSelectedMedia({
        type: 'image',
        url: `http://localhost:3001/${post.media}`,
        title: post.title
      });
    } else if (post.link) {
      // It's a video link
      window.open(post.link, '_blank');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2.5 rounded-lg text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Sidebar 
        role="admin"
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 lg:ml-64">
        <div className="lg:hidden h-16"></div>
        
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white pl-12 lg:pl-0">
              All Posts
            </h1>
            <button
              onClick={() => navigate("/admin/create-post")}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={20} />
              <span>Create New Post</span>
            </button>
          </div>

          {/* Posts Grid */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
                <p className="text-gray-400">No posts found. Create your first post!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-slate-600 transition shadow-lg"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Post Info - Clickable Title */}
                    <div className="flex-1">
                      <div 
                        onClick={() => openMedia(post)}
                        className="cursor-pointer group"
                      >
                        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                          {post.title}
                          {post.media ? (
                            <Image size={16} className="text-gray-400" />
                          ) : (
                            <Play size={16} className="text-gray-400" />
                          )}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-cyan-400">₹{post.price}</span>
                        <span className="text-gray-400">{post.watchTime}</span>
                        <span className="text-green-400">{post.totalUsersWatched} views</span>
                        <span className="text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button - Icon Only */}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors w-10 h-10 flex items-center justify-center"
                      title="Delete Post"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedMedia && selectedMedia.type === 'image' && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              Close
            </button>
            <img 
              src={selectedMedia.url} 
              alt={selectedMedia.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}