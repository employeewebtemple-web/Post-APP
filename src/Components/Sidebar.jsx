import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ReactDOM from "react-dom"; // Add this import
import reactLogo from "../assets/react.svg";

import {
  LayoutDashboard,
  FileBarChart2,
  Headset,
  Users,
  Wallet,
  Landmark,
  X,
  Link2,
  LogOut,
  Eye
} from "lucide-react";

const Sidebar = ({ role, isMobileOpen, onMobileClose, isCollapsed }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedLogoutPath, setSelectedLogoutPath] = useState("");

  const isExpanded = !isCollapsed || isHovered;

  const handleLogoutClick = (path, e) => {
    e.preventDefault();
    setSelectedLogoutPath(path);
    setShowLogoutModal(true);
  };

 const confirmLogout = () => {
        if (role === "admin") {
            // Admin logout
            localStorage.removeItem("adminToken");
            localStorage.removeItem("admin");
        } else {
            // User logout
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        
        navigate(selectedLogoutPath);
        setShowLogoutModal(false);
    };

  const cancelLogout = () => {
    setShowLogoutModal(false);
    setSelectedLogoutPath("");
  };

  // USER NAVIGATION
  const userNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Report", path: "/report", icon: FileBarChart2 },
    { name: "Bank Details", path: "/bank-details", icon: Landmark },
    { name: "Withdraw Money", path: "/withdraw", icon: Wallet },
    { name: "Support", path: "/support", icon: Headset },
    { name: "Referral Link", path: "/referral", icon: Link2 },
    { name: "Logout", path: "/", icon: LogOut, isLogout: true }
  ];

  // ADMIN NAVIGATION
  const adminNavItems = [
    { name: "Create Post", path: "/admin/create-post", icon: FileBarChart2 },
    { name: "Manage Posts", path: "/admin/posts", icon: Eye },
    { name: "Manage Users", path: "/admin/users", icon: Users },
    { name: "Support", path: "/admin/support", icon: Headset },
    { name: "Withdrawal Request", path: "/admin/withdrawals", icon: Wallet },
    { name: "Report", path: "/admin/report", icon: FileBarChart2 },
    { name: "Logout", path: "/admin/login", icon: LogOut, isLogout: true }
  ];

  const navItems = role === "admin" ? adminNavItems : userNavItems;

  // Logout Modal Component
  const LogoutModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999] p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">Confirm Logout</h3>
        
        <p className="text-gray-400">
          Are you sure you want to logout?
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={cancelLogout}
            className="w-full sm:flex-1 bg-slate-700 py-3 rounded-lg text-gray-300 hover:bg-slate-600 transition text-sm sm:text-base"
          >
            Cancel
          </button>
          
          <button
            onClick={confirmLogout}
            className="w-full sm:flex-1 bg-red-600 py-3 rounded-lg text-white hover:bg-red-700 transition text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`flex flex-col fixed h-full z-30 transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed && !isHovered ? "md:w-20" : "md:w-64"}
        `}
        style={{
          background:
            "linear-gradient(180deg, rgba(9, 15, 35, 0.98) 0%, rgba(6, 11, 24, 0.98) 100%)",
          borderRight: "1px solid rgba(0, 212, 170, 0.1)",
          boxShadow: "4px 0 30px rgba(0,0,0,0.5)"
        }}
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => isCollapsed && setIsHovered(false)}
      >
        {/* LOGO */}
        <div
          className={`p-6 flex items-center ${
            isExpanded ? "justify-between" : "justify-center"
          } min-h-[88px]`}
          style={{ borderBottom: "1px solid rgba(0,212,170,0.1)" }}
        >
          {isExpanded ? (
            <div className="whitespace-nowrap overflow-hidden">
              <img
                src={reactLogo}
                className="h-16 w-16 object-contain mx-auto"
                alt="logo"
              />
            </div>
          ) : (
            <div className="text-xl font-bold text-[#00d4aa]">P</div>
          )}

          <button
            onClick={onMobileClose}
            className="md:hidden text-[#00d4aa]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={(e) => {
                if (item.isLogout) {
                  handleLogoutClick(item.path, e);
                } else {
                  window.innerWidth < 768 && onMobileClose();
                }
              }}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative font-medium
                ${!isExpanded ? "justify-center" : ""}
                ${item.isLogout ? "hover:bg-red-500/10" : ""}
                `
              }
              style={({ isActive }) =>
                isActive && !item.isLogout
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(0,212,170,0.2) 0%, rgba(139,92,246,0.15) 100%)",
                      border: "1px solid rgba(0,212,170,0.3)",
                      color: "#00d4aa",
                      boxShadow: "0 4px 20px rgba(0,212,170,0.15)"
                    }
                  : item.isLogout
                  ? {
                      border: "1px solid transparent",
                      color: "#ef4444"
                    }
                  : {
                      border: "1px solid transparent",
                      color: "rgba(148,163,184,0.8)"
                    }
              }
            >
              <item.icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0 ${
                  isExpanded ? "mr-3" : ""
                } ${item.isLogout ? "text-red-400" : ""}`}
              />

              <span
                className={`font-medium whitespace-nowrap transition-opacity duration-200
                ${isExpanded ? "opacity-100" : "opacity-0 w-0 hidden"}
                ${item.isLogout ? "text-red-400" : ""}
                `}
              >
                {item.name}
              </span>

              {!isExpanded && (
                <div
                  className="absolute left-full ml-4 px-3 py-1.5 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl"
                  style={{
                    background: "rgba(13,21,38,0.95)",
                    border: "1px solid rgba(0,212,170,0.2)"
                  }}
                >
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM LINE */}
        <div
          className="h-px mx-4 mb-4"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(0,212,170,0.3), transparent)"
          }}
        />
      </aside>

      {/* Render modal at root level using portal */}
      {showLogoutModal && ReactDOM.createPortal(
        <LogoutModal />,
        document.body
      )}
    </>
  );
};

export default Sidebar;