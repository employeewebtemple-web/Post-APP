import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Check, Ban, Edit, Menu } from 'lucide-react';
import { getAuthHeader } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Components/Sidebar';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [showBlockedOnly, setShowBlockedOnly] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/admin/users', getAuthHeader());
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleBlockedStatus = async (userId, currentlyBlocked) => {
        if (!confirm(`Are you sure you want to ${currentlyBlocked ? 'Unblock' : 'Block'} this user?`)) return;
        try {
            await axios.put(
                `http://localhost:3001/api/admin/users/${userId}`,
                { isBlocked: !currentlyBlocked },
                getAuthHeader()
            );
            fetchUsers();
        } catch {
            alert('Failed to update block status');
        }
    };

    const handleEditUser = (user) => navigate(`/admin/users/${user.userId}`);

    const filteredUsers = users
        .filter(u =>
            u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.userId?.toLowerCase().includes(search.toLowerCase())
        )
        .filter(u => showBlockedOnly ? u.isBlocked : !u.isBlocked);

    return (
        <div className="flex min-h-screen bg-gray-900">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-[100] bg-gray-800 p-2 rounded-lg text-white hover:bg-gray-700 transition-colors"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar - Fixed on left for desktop, slide-in for mobile */}
            <div className={`
                fixed lg:static inset-y-0 left-0 transform 
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 transition-transform duration-300 ease-in-out z-[90] w-64
            `}>
                <Sidebar 
                    role="admin" 
                    isMobileOpen={sidebarOpen}
                    onMobileClose={() => setSidebarOpen(false)}
                />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/70 z-[80] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content - Takes remaining width on desktop */}
            <div className="flex-1 min-w-0 p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Mobile header spacer */}
                <div className="lg:hidden h-12"></div>
                
                <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl flex items-center gap-3 flex-1">
                        <Search className="text-gray-400 w-5 h-5 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by Name, Email or ID"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-white outline-none flex-1 text-sm sm:text-base placeholder-gray-500"
                        />
                    </div>
                    <div className="flex gap-2 sm:gap-4">
                        <button
                            onClick={() => setShowBlockedOnly(false)}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                                !showBlockedOnly 
                                    ? 'bg-sky-600 text-white hover:bg-sky-700' 
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                        >
                            All Users
                        </button>
                        <button
                            onClick={() => setShowBlockedOnly(true)}
                            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                                showBlockedOnly 
                                    ? 'bg-red-600 text-white hover:bg-red-700' 
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                        >
                            Blocked Users
                        </button>
                    </div>
                </div>

                {/* Users Table - Responsive */}
                <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden">
                    {/* Mobile Card View */}
                    <div className="block lg:hidden">
                        {loading ? (
                            <div className="p-8 text-center text-white">Loading...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-white">No users found</div>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="p-4 space-y-3 hover:bg-slate-700/50 transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-xs text-gray-500">User ID</div>
                                                <div className="font-mono text-sm text-white break-all">{user.userId}</div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => toggleBlockedStatus(user.userId, user.isBlocked)}
                                                    className={`p-2 rounded-lg hover:bg-slate-600 transition-colors ${
                                                        user.isBlocked ? 'text-green-400' : 'text-red-400'
                                                    }`}
                                                    title={user.isBlocked ? "Unblock" : "Block"}
                                                >
                                                    {user.isBlocked ? <Check size={18} /> : <Ban size={18} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleEditUser(user)} 
                                                    className="p-2 rounded-lg hover:bg-slate-600 text-blue-400 transition-colors" 
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <div className="text-gray-500">Name</div>
                                                <div className="text-white truncate">{user.firstName} {user.lastName}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Email</div>
                                                <div className="text-white truncate">{user.email}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Wallet</div>
                                                <div className="text-white font-medium">₹{user.walletBalance?.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Ledger</div>
                                                <div className="text-white font-medium">₹{user.totalWithdrawn?.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-slate-900 text-gray-200 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">User ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Wallet</th>
                                    <th className="px-6 py-4">Ledger</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-white">Loading...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-6 text-center text-white">No users found</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-700/50 transition">
                                            <td className="px-6 py-4 font-mono">{user.userId}</td>
                                            <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4 text-white">₹{user.walletBalance?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-white">₹{user.totalWithdrawn?.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => toggleBlockedStatus(user.userId, user.isBlocked)}
                                                        className={`p-2 rounded hover:bg-slate-600 transition-colors ${
                                                            user.isBlocked ? 'text-green-400' : 'text-red-400'
                                                        }`}
                                                        title={user.isBlocked ? "Unblock" : "Block"}
                                                    >
                                                        {user.isBlocked ? <Check size={18} /> : <Ban size={18} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditUser(user)} 
                                                        className="p-2 rounded hover:bg-slate-600 text-blue-400 transition-colors" 
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}