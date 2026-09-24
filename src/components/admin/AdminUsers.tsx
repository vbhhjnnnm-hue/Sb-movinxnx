/**
 * Admin Panel - User Management & RBAC Roles
 */

import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../../types/index.ts';
import { api } from '../../lib/api.ts';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getUsers();
      setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (targetUser: User) => {
    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change ${targetUser.name}'s role to ${newRole}?`)) return;

    setUpdatingId(targetUser.id);
    try {
      await api.admin.updateUserRole(targetUser.id, newRole);
      setMsg(`Updated role for ${targetUser.name} to ${newRole}`);
      fetchUsers();
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-wide">
          User & Access Control (RBAC)
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review registered accounts, monitor viewer activity, and configure administrative privileges
        </p>
      </div>

      {msg && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[#0d0f17] border border-zinc-800/80">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[#0d0f17] border border-zinc-800/80 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Member Since</th>
              <th className="p-4 text-right">Role Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500 animate-pulse">
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          u.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'
                        }
                        alt=""
                        className="h-8 w-8 rounded-full object-cover border border-zinc-700"
                      />
                      <span className="font-semibold text-zinc-100">{u.name}</span>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-zinc-400">{u.email}</td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {u.role === 'ADMIN' ? (
                        <>
                          <Shield className="h-3 w-3" />
                          <span>ADMIN</span>
                        </>
                      ) : (
                        <span>VIEWER</span>
                      )}
                    </span>
                  </td>

                  <td className="p-4 text-zinc-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleRoleToggle(u)}
                      disabled={updatingId === u.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        u.role === 'ADMIN'
                          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                      }`}
                    >
                      {u.role === 'ADMIN' ? 'Revoke Admin' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
