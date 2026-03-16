import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import { Menu } from "lucide-react";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  const [messages, setMessages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/auth/support/messages", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setMessages(data);

    } catch (error) {
      console.error("Error fetching support messages:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      setLoading(true);

      const res = await fetch("http://localhost:3001/api/auth/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSubmitted(true);

      setFormData({
        subject: "",
        message: ""
      });

      fetchMessages(); // refresh messages

      setTimeout(() => setSubmitted(false), 3000);

    } catch (error) {
      console.error("Support error:", error);
    } finally {
      setLoading(false);
    }
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
          Contact Support
        </h1>

        <p className="text-gray-400 mb-6 text-center">
          If you have any issue or question, send us a message and our team will respond soon.
        </p>

        {/* Support Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-5"
        >

          <div>
            <label className="block text-gray-300 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-900 text-gray-300 outline-none rounded-lg"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="w-full px-4 py-3 bg-slate-900 text-gray-300 outline-none rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-700 text-cyan-400 hover:bg-slate-600 transition rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Sending..." : "Submit Request"}
          </button>

          {submitted && (
            <p className="text-green-400 text-sm text-center">
              Support Request Sent Successfully!
            </p>
          )}

        </form>

        {/* Messages Section */}
        <div className="mt-10 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">

          <h2 className="text-xl font-bold text-white mb-4">
            Your Support Messages
          </h2>

          {messages.length === 0 && (
            <p className="text-gray-400">No messages yet.</p>
          )}

          <div className="space-y-4">

            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg ${
                  msg.sender === "admin"
                    ? "bg-green-900 text-green-200"
                    : "bg-slate-900 text-cyan-300"
                }`}
              >

                <p className="text-sm font-semibold mb-1">
                  {msg.sender === "admin" ? "Admin" : "You"}
                </p>

                <p>{msg.message}</p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}