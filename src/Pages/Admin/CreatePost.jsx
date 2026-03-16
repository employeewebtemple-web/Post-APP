import { useState } from "react";
import axios from "axios";
import Sidebar from "../../Components/Sidebar";
import { Menu } from "lucide-react";

export default function CreatePost() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    media: null,
    link: "",
    price: "",
    time: "",
    minutes: "3",
    seconds: "0"
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Convert URLs to embeddable links where possible
  const getEmbedURL = (url) => {
    if (!url) return null;

    // YouTube standard + Shorts
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("youtube.com/watch")) {
        videoId = url.split("v=")[1].split("&")[0];
      } else if (url.includes("youtube.com/shorts/")) {
        videoId = url.split("shorts/")[1].split("?")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Instagram
    if (url.includes("instagram.com/")) {
      const postPath = url.split("instagram.com")[1].split("/?")[0];
      return `https://www.instagram.com${postPath}/embed`;
    }

    // Facebook
    if (url.includes("facebook.com/")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    }

    // Default: return null (will show fallback)
    return null;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "media" && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, media: file, link: "" });
      setPreview(URL.createObjectURL(file));
    } else if (name === "link") {
      const embedURL = getEmbedURL(value);
      setFormData({ ...formData, link: value, media: null });
      setPreview(embedURL);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) return setError("Title is required");
    if (!formData.media && !formData.link.trim()) return setError("Please upload an image or provide a video link");
    if (!formData.price) return setError("Price is required");

      // Combine minutes and seconds
     const minutes = Number(formData.minutes || 0);
     const seconds = Number(formData.seconds || 0);
     const totalTime = minutes * 60 + seconds;
    if (formData.link &&  totalTime === 0) return setError("Watch time is required for video posts");

    try {
      setLoading(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("price", formData.price);
       if (formData.link) {
        data.append("link", formData.link);
        data.append("watchTime", `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`); // MM:SS format
    }
      if (formData.media) data.append("media", formData.media);

      await axios.post("http://localhost:3001/api/admin/create-post", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      alert("Post created successfully");
      setFormData({ title: "", media: null, link: "", price: "", minutes: 3, seconds: 0 });
      setPreview(null);

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 p-2.5 rounded-lg text-white hover:bg-slate-700 transition-colors shadow-lg"
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
        
        {/* Center the content properly on desktop */}
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center lg:text-left pl-12 lg:pl-56">
              Create Post
            </h1>

            {error && (
              <div className="mb-4 p-3 sm:p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400 text-center text-sm sm:text-base mx-auto max-w-3xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-10 shadow-2xl space-y-4 sm:space-y-6">
              
              {/* Title */}
              <div>
                <label className="text-gray-300 mb-2 block font-medium text-sm sm:text-base">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="Enter post title" 
                  required
                  className="w-full px-4 sm:px-5 py-3 sm:py-3 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-sm sm:text-base"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-gray-300 mb-2 block font-medium text-sm sm:text-base">Image (optional if video link provided)</label>
                <input 
                  type="file" 
                  name="media" 
                  accept="image/*" 
                  onChange={handleChange} 
                  className="w-full text-gray-300 text-sm sm:text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                />
                {preview && formData.media && (
                  <img src={preview} alt="Preview" className="w-full max-h-64 sm:max-h-80 object-contain mt-4 rounded-lg sm:rounded-xl border border-slate-600 shadow-lg" />
                )}
              </div>

              {/* Video Link */}
              <div>
                <label className="text-gray-300 mb-2 block font-medium text-sm sm:text-base">Video Link (optional if image provided)</label>
                <input 
                  type="url" 
                  name="link" 
                  value={formData.link} 
                  onChange={handleChange} 
                  placeholder="Video Link"
                  className="w-full px-4 sm:px-5 py-3 sm:py-3 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-sm sm:text-base"
                />
                {preview && formData.link && (
                  <div className="mt-4 w-full max-h-64 sm:max-h-80">
                    {preview ? (
                      <iframe 
                        src={preview} 
                        title="Video Preview" 
                        className="w-full h-48 sm:h-64 rounded-lg sm:rounded-xl border border-slate-600" 
                        allowFullScreen 
                      />
                    ) : (
                      <a href={formData.link} target="_blank" rel="noopener noreferrer"
                        className="block w-full h-48 sm:h-64 bg-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg">
                        Open Video
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="text-gray-300 mb-2 block font-medium text-sm sm:text-base">Price (₹)</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  placeholder="Enter price" 
                  required
                  className="w-full px-4 sm:px-5 py-3 sm:py-3 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-sm sm:text-base"
                />
              </div>

              {/* Watch Time */}
              {!formData.media && <div>
                <label className="text-gray-300 mb-2 block font-medium text-sm sm:text-base">Watch Time</label>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  {/* Minutes */}
                  <div className="flex-1">
                    <label className="text-gray-400 mb-1 block font-medium text-xs sm:text-sm">Minutes</label>
                    <input
                      type="number"
                      name="minutes"
                      value={formData.minutes != null ? String(formData.minutes).padStart(2, "0") : "03"}
                      onChange={(e) => {
                        let min = Math.max(0, Number(e.target.value));
                        if (min > 59) min = 59;
                        setFormData({ ...formData, minutes: min });
                      }}
                      min="0"
                      max="59"
                      className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-center"
                    />
                  </div>

                  {/* Seconds */}
                  <div className="flex-1">
                    <label className="text-gray-400 mb-1 block font-medium text-xs sm:text-sm">Seconds</label>
                    <input
                      type="number"
                      name="seconds"
                      value={formData.seconds != null ? String(formData.seconds).padStart(2, "0") : "00"}
                      onChange={(e) => {
                        let sec = Number(e.target.value);
                        if (sec > 59) sec = 59;
                        if (sec < 0) sec = 0;
                        setFormData({ ...formData, seconds: sec });
                      }}
                      min="0"
                      max="59"
                      className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg sm:rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition text-center"
                    />
                  </div>
                </div>
              </div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition disabled:opacity-50 transform active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                ) : (
                  "Submit Post"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}