import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import { Menu } from "lucide-react";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [replies, setReplies] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSupport();
  }, []);

  const fetchSupport = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch("http://localhost:3001/api/admin/supports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // get only user tickets
      const userTickets = data.filter((t) => t.sender === "user");

      // check if admin replied to that specific ticket
      const updatedTickets = userTickets.map((ticket) => {
        const replied = data.some(
          (msg) =>
            msg.sender === "admin" &&
            msg.ticketId === ticket.id   // ✅ FIXED
        );

        return { ...ticket, replied };
      });

      setTickets(updatedTickets);
    } catch (error) {
      console.error("Error fetching support:", error);
    }
  };

  const handleReplyChange = (ticketId, value) => {
    setReplies({
      ...replies,
      [ticketId]: value,
    });
  };

  const sendReply = async (ticket) => {
    try {
      if (!replies[ticket.id]) {
        alert("Reply cannot be empty");
        return;
      }

      const token = localStorage.getItem("adminToken");

      await fetch("http://localhost:3001/api/admin/support/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: ticket.userId,
          ticketId: ticket.id,
          message: replies[ticket.id],
        }),
      });

      alert("Reply sent");

      setReplies({
        ...replies,
        [ticket.id]: "",
      });

      fetchSupport();
    } catch (error) {
      console.error("Reply error:", error);
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
          <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center lg:text-left pl-12 lg:pl-1">
              Support Requests
            </h1>

            <div className="space-y-4 sm:space-y-6">
              {tickets.length === 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 sm:p-10 text-center">
                  <p className="text-gray-400 text-base sm:text-lg">
                    No support requests yet.
                  </p>
                </div>
              )}

              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 shadow-lg hover:border-slate-600 transition"
                >
                  {/* Header with User ID and Date */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                    <p className="text-cyan-400 font-semibold text-sm sm:text-base">
                      User: {ticket.userId}
                    </p>

                    <p className="text-gray-400 text-xs sm:text-sm">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Subject */}
                  <h2 className="text-white font-semibold mb-2 text-base sm:text-lg">
                    {ticket.subject}
                  </h2>

                  {/* Message */}
                  <p className="text-gray-300 mb-5 text-sm sm:text-base">
                    {ticket.message}
                  </p>

                  {/* Reply Section */}
                  <div className="border-t border-slate-700 pt-4">
                    {ticket.replied ? (
                      <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <span className="text-lg">✔</span>
                        <span className="text-sm sm:text-base">Already Replied</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          placeholder="Write admin reply..."
                          value={replies[ticket.id] || ""}
                          onChange={(e) =>
                            handleReplyChange(ticket.id, e.target.value)
                          }
                          rows="3"
                          className="w-full bg-slate-900 text-gray-300 p-3 sm:p-4 rounded-lg border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-sm sm:text-base"
                        />

                        <button
                          onClick={() => sendReply(ticket)}
                          className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-cyan-600 text-white hover:bg-cyan-500 rounded-lg font-medium transition transform active:scale-[0.98] text-sm sm:text-base"
                        >
                          Send Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}