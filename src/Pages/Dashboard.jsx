import { useState, useEffect, useRef } from "react";
import Sidebar from "../Components/Sidebar";
import { getCurrentUser } from "../services/authService";
import { Menu } from "lucide-react";

export const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState(null);
  const [watchedSeconds, setWatchedSeconds] = useState({});
  const [ytReady, setYtReady] = useState(false);
  const [activeTimers, setActiveTimers] = useState({});
  const videoRefs = useRef({});
  const ytPlayers = useRef({});
  const ytIntervals = useRef({});
  const watchedSetRef = useRef({});
  const lastUpdateTimeRef = useRef({});

  const user = getCurrentUser();

  // Save to database when user reaches required time
  const saveWatchedTimeToDatabase = async (postId, seconds) => {
    try {
      const token = localStorage.getItem("token");
      const watchedTimeFormatted = formatTimeForBackend(seconds);
      
      await fetch("http://localhost:3001/api/auth/update-watch-progress", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          postId,
          watchedTime: watchedTimeFormatted
        }),
      });
      
      console.log(`Saved watch time for post ${postId}: ${watchedTimeFormatted}`);
    } catch (error) {
      console.error("Error saving watch time:", error);
    }
  };

  // Fetch posts and saved progress
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/api/auth/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPosts(data);
        
        // Fetch saved watch progress for each post
        const savedProgress = {};
        
        for (const post of data) {
          if (post.watchTime && post.watchTime !== "00:00") {
            try {
              const progressRes = await fetch(`http://localhost:3001/api/auth/watch-progress/${post.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (progressRes.ok) {
                const progress = await progressRes.json();
                if (progress.watchedTime && progress.watchedTime !== "00:00") {
                  const [mins, secs] = progress.watchedTime.split(":").map(Number);
                  const totalSeconds = mins * 60 + secs;
                  
                  savedProgress[post.id] = totalSeconds;
                  
                  // Initialize watched set
                  if (!watchedSetRef.current[post.id]) {
                    watchedSetRef.current[post.id] = new Set();
                  }
                  for (let i = 0; i <= totalSeconds; i++) {
                    watchedSetRef.current[post.id].add(i);
                  }
                }
              }
            } catch (err) {
              console.error(`Failed to fetch progress for post ${post.id}:`, err);
            }
          }
        }
        
        setWatchedSeconds(savedProgress);
        
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Load YouTube API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }

    // Load the API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    
    // Define the callback function
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready');
      setYtReady(true);
    };
    
    document.body.appendChild(tag);
    
    return () => {
      // Cleanup
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);

  // Initialize YouTube players when API is ready and posts are loaded
  useEffect(() => {
    if (!ytReady || posts.length === 0) return;
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      posts.forEach((post) => {
        if (!post.link) return;
        
        const embedUrl = getEmbedURL(post.link);
        const videoId = embedUrl?.split("/embed/")[1];
        
        if (videoId && !ytPlayers.current[post.id]) {
          const containerId = `yt-player-${post.id}`;
          const container = document.getElementById(containerId);
          
          if (container && !container.hasChildNodes()) {
            try {
              // Create a new div for the player
              const playerDiv = document.createElement('div');
              playerDiv.id = `yt-player-inner-${post.id}`;
              container.appendChild(playerDiv);
              
              ytPlayers.current[post.id] = new window.YT.Player(`yt-player-inner-${post.id}`, {
                videoId: videoId,
                width: '100%',
                height: '250',
                playerVars: {
                  rel: 0,
                  modestbranding: 1,
                },
                events: {
                  onReady: (event) => onPlayerReady(event, post.id),
                  onStateChange: (event) => onPlayerStateChange(event, post.id),
                },
              });
              console.log(`YouTube player created for post ${post.id}`);
            } catch (err) {
              console.error(`Error creating YouTube player for post ${post.id}:`, err);
            }
          }
        }
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [ytReady, posts]);

  // Pause videos when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        Object.values(videoRefs.current).forEach((video) => {
          if (video && !video.paused) video.pause();
        });
        
        Object.values(ytPlayers.current).forEach((player) => {
          if (player && player.pauseVideo) {
            player.pauseVideo();
          }
        });
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Cleanup intervals and timers on unmount
  useEffect(() => {
    return () => {
      Object.values(ytIntervals.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
      Object.values(activeTimers).forEach(timer => {
        if (timer) clearInterval(timer);
      });
    };
  }, [activeTimers]);

  const openModal = (type, src, postId = null) => setModalMedia({ type, src, postId });
  const closeModal = () => setModalMedia(null);

  const getEmbedURL = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("youtube.com/watch")) {
        videoId = new URL(url).searchParams.get("v");
      } else if (url.includes("youtube.com/shorts/")) {
        videoId = url.split("shorts/")[1].split("?")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    return null;
  };

  // Check if URL is from social media (not YouTube)
  const isSocialMedia = (url) => {
    if (!url) return false;
    return url.includes("instagram.com") || 
           url.includes("facebook.com") || 
           url.includes("fb.com") || 
           url.includes("tiktok.com") || 
           url.includes("twitter.com") || 
           url.includes("x.com");
  };

  // Handle social media click
  const handleSocialMediaClick = (post) => {
    window.open(post.link, '_blank');
    
    if (activeTimers[post.id]) {
      clearInterval(activeTimers[post.id]);
    }
    
    const [mins, secs] = post.watchTime.split(":").map(Number);
    const totalRequiredSeconds = mins * 60 + secs;
    
    const timer = setInterval(() => {
      setWatchedSeconds(prev => {
        const currentWatched = prev[post.id] || 0;
        const newWatched = currentWatched + 1;
        
        if (newWatched >= totalRequiredSeconds) {
          clearInterval(timer);
          setActiveTimers(prevTimers => ({
            ...prevTimers,
            [post.id]: null
          }));
          
          // Save to database when reached required time
          saveWatchedTimeToDatabase(post.id, newWatched);
        }
        
        return {
          ...prev,
          [post.id]: newWatched
        };
      });
    }, 1000);
    
    setActiveTimers(prev => ({
      ...prev,
      [post.id]: timer
    }));
  };

  // Initialize watched set
  const initWatchedSet = (postId) => {
    if (!watchedSetRef.current[postId]) {
      watchedSetRef.current[postId] = new Set();
    }
  };

  // Update watched seconds
  const updateWatchedSeconds = (postId, currentSecond) => {
    if (currentSecond === undefined || currentSecond === null) return;
    
    initWatchedSet(postId);
    
    const second = Math.floor(currentSecond);
    
    if (!watchedSetRef.current[postId].has(second)) {
      watchedSetRef.current[postId].add(second);
      
      const newTotal = watchedSetRef.current[postId].size;
      setWatchedSeconds((prev) => ({
        ...prev,
        [postId]: newTotal
      }));
      
      // Check if user has now reached required time
      const post = posts.find(p => p.id === postId);
      if (post?.watchTime && post.watchTime !== "00:00") {
        const [mins, secs] = post.watchTime.split(":").map(Number);
        const requiredSecs = mins * 60 + secs;
        
        // If user just reached required time, save to database
        if (newTotal >= requiredSecs) {
          saveWatchedTimeToDatabase(postId, newTotal);
        }
      }
    }
  };

  // Local MP4 watch time
  const handleTimeUpdate = (e, postId) => {
    const video = e.target;
    
    if (!video.paused) {
      const currentSec = Math.floor(video.currentTime);
      
      const now = Date.now();
      if (lastUpdateTimeRef.current[postId] && now - lastUpdateTimeRef.current[postId] < 500) {
        return;
      }
      lastUpdateTimeRef.current[postId] = now;
      
      updateWatchedSeconds(postId, currentSec);
    }
  };

  const handleSeeking = (e, postId) => {};

  // YouTube watch time tracking
  const onPlayerReady = (event, postId) => {
    console.log(`Player ready for post ${postId}`);
    
    if (ytIntervals.current[postId]) {
      clearInterval(ytIntervals.current[postId]);
    }
    
    ytIntervals.current[postId] = setInterval(() => {
      if (ytPlayers.current[postId] && typeof ytPlayers.current[postId].getCurrentTime === 'function') {
        try {
          const playerState = ytPlayers.current[postId].getPlayerState();
          // Only count if video is playing (state 1)
          if (playerState === 1) {
            const currentTime = Math.floor(ytPlayers.current[postId].getCurrentTime());
            updateWatchedSeconds(postId, currentTime);
          }
        } catch (err) {
          console.error("Error getting YouTube time:", err);
        }
      }
    }, 1000);
  };

  const onPlayerStateChange = (event, postId) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      if (ytIntervals.current[postId]) {
        clearInterval(ytIntervals.current[postId]);
        ytIntervals.current[postId] = null;
      }
    }
  };

  const hasWatchedEnough = (post) => {
    if (!post.watchTime) return true;
    
    const watchedSec = watchedSeconds[post.id] || 0;
    const [min, sec] = post.watchTime.split(":").map(Number);
    const requiredSec = min * 60 + sec;
    return watchedSec >= requiredSec;
  };

  const formatTimeForBackend = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClaim = async (postId, price) => {
    try {
      const token = localStorage.getItem("token");
        
      const userCheck = await fetch("http://localhost:3001/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const freshUserData = await userCheck.json();
      
      if (freshUserData.disableIncome) {
        alert("Your income has been disabled by admin. You cannot claim earnings.");
        return;
      }
      
      const watchedSecs = watchedSeconds[postId] || 0;
      const post = posts.find(p => p.id === postId);
      const watchedTimeFormatted = formatTimeForBackend(watchedSecs);
      
      const claimRes = await fetch("http://localhost:3001/api/auth/claim-reward", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          postId,
          watchedTime: watchedTimeFormatted
        }),
      });
      
      const claimData = await claimRes.json();
      
      if (!claimRes.ok) {
        alert(claimData.message || "Failed to claim reward");
        return;
      }
      
      const currentUser = getCurrentUser();
      const newWalletBalance = (currentUser.walletBalance || 0) + price;
      
      const walletRes = await fetch("http://localhost:3001/api/auth/updateWallet", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          walletBalance: newWalletBalance,
          totalWithdrawn: currentUser.totalWithdrawn || 0
        }),
      });
      
      const walletData = await walletRes.json();
      
      if (!walletRes.ok) {
        console.error("Failed to update wallet:", walletData);
        alert(`₹${price} added to your wallet but failed to update wallet balance. Please refresh.`);
      } else {
        const updatedUser = {
          ...currentUser,
          walletBalance: walletData.walletBalance
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        alert(`₹${price} added to your wallet successfully!`);
      }
      
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, rewarded: true } : p)));
      
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      <Sidebar 
        role="user"
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        isCollapsed={false}
      />
      
      <div className="flex-1 md:ml-64 p-6">
        <h1 className="text-2xl font-bold text-white mb-8">All Posts</h1>
        {loading ? (
          <p className="text-white">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-white">No posts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const isVideoFile = post.media && post.media.endsWith(".mp4");
              const isImageFile = post.media && /\.(jpe?g|png|gif|webp|jfif)$/i.test(post.media);
              const videoPreview = getEmbedURL(post.link);
              const isSocial = isSocialMedia(post.link);
              const watchedEnough = hasWatchedEnough(post);
              const watchedSecs = watchedSeconds[post.id] || 0;
              const requiredSecs = post.watchTime ? 
                (() => { const [m,s] = post.watchTime.split(":").map(Number); return m*60+s; })() : 0;

              return (
                <div key={post.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg flex flex-col">
                  <h2 className="text-white font-bold text-xl mb-4">{post.title}</h2>

                  {/* Image */}
                  {isImageFile && (
                    <img
                      src={`http://localhost:3001/${post.media}`}
                      alt={post.title}
                      className="w-full max-h-64 object-contain rounded-xl border border-slate-600 mb-4 cursor-pointer"
                      onClick={() => openModal("image", `http://localhost:3001/${post.media}`)}
                    />
                  )}

                  {/* Local Video */}
                  {isVideoFile && (
                    <video
                      ref={(el) => (videoRefs.current[post.id] = el)}
                      src={`http://localhost:3001/${post.media}`}
                      controls
                      controlsList="nodownload nofullscreen noremoteplayback"
                      onContextMenu={(e) => e.preventDefault()}
                      onTimeUpdate={(e) => handleTimeUpdate(e, post.id)}
                      onSeeking={(e) => handleSeeking(e, post.id)}
                      className="w-full max-h-64 object-contain rounded-xl border border-slate-600 mb-4 cursor-pointer"
                      onClick={() => openModal("video", `http://localhost:3001/${post.media}`, post.id)}
                    />
                  )}

                  {/* YouTube - Fixed with Player API */}
                  {!isVideoFile && !isImageFile && post.link && videoPreview && !isSocial && (
                    <div 
                      id={`yt-player-${post.id}`} 
                      className="w-full h-64 rounded-xl border border-slate-600 mb-4 bg-slate-900"
                    />
                  )}

                  {/* Social Media */}
                  {!isVideoFile && !isImageFile && post.link && isSocial && (
                    <div className="mb-4">
                      <button
                        onClick={() => handleSocialMediaClick(post)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-8 rounded-xl transition-colors flex flex-col items-center justify-center gap-2 font-medium border border-slate-600"
                      >
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 12h-4v3l-5-5 5-5v3h4v4z"/>
                        </svg>
                        <span className="text-lg">Open {post.link.includes('instagram') ? 'Instagram' : 'Facebook'} Post</span>
                        <span className="text-sm text-gray-300">Click to open in new tab</span>
                      </button>
                      
                      {activeTimers[post.id] && (
                        <div className="mt-3 p-3 bg-slate-700 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Watched:</span>
                            <span className="text-blue-400 font-semibold">{formatTime(watchedSecs)} / {post.watchTime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price & Watch Time */}
                  <p className="text-gray-300 mb-2">Price: ₹{post.price}</p>
                  {post.watchTime && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Required:</span>
                        <span className="text-gray-300">{post.watchTime}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Watched:</span>
                        <span className="text-blue-400 font-semibold">{formatTime(watchedSecs)}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            isSocial ? 'bg-purple-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min((watchedSecs / requiredSecs) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Claim Button */}
                  {!user?.disableIncome && (
                    <button
                      disabled={post.rewarded || !watchedEnough}
                      onClick={() => handleClaim(post.id, post.price)}
                      className={`px-4 py-2 rounded-xl mt-auto text-white font-semibold transition-colors ${
                        post.rewarded
                          ? "bg-green-600 cursor-default"
                          : !watchedEnough
                          ? "bg-gray-600 cursor-not-allowed opacity-50"
                          : "bg-blue-600 hover:bg-blue-700 cursor-pointer animate-pulse"
                      }`}
                    >
                      {post.rewarded ? "✓ Claimed" : watchedEnough ? "Claim Now" : "Keep Watching..."}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full w-full p-4">
            <button 
              className="absolute top-2 right-2 text-white text-2xl font-bold hover:text-gray-300 z-10" 
              onClick={closeModal}
            >
              &times;
            </button>

            {modalMedia.type === "image" && (
              <img 
                src={modalMedia.src} 
                alt="modal" 
                className="w-full h-auto max-h-screen rounded-xl" 
              />
            )}

            {modalMedia.type === "video" && (
              <video
                ref={(el) => {
                  if (el && modalMedia.postId) {
                    videoRefs.current[modalMedia.postId] = el;
                  }
                }}
                src={modalMedia.src}
                controls
                controlsList="nodownload nofullscreen noremoteplayback"
                onContextMenu={(e) => e.preventDefault()}
                autoPlay
                onTimeUpdate={(e) => modalMedia.postId && handleTimeUpdate(e, modalMedia.postId)}
                onSeeking={(e) => modalMedia.postId && handleSeeking(e, modalMedia.postId)}
                className="w-full h-auto max-h-screen rounded-xl"
              />
            )}

            {modalMedia.type === "iframe" && (
              <iframe 
                src={modalMedia.src} 
                title="modal" 
                className="w-full h-[80vh] rounded-xl" 
                allowFullScreen 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;