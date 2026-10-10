"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { 
  UserPlus, 
  ShieldCheck, 
  User, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  X,
  Mail
} from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER"
  });

  const fetchUsers = () => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(authData => {
        if (!authData.authenticated || authData.user?.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }
        setCurrentUser(authData.user);
        return fetch("/api/users");
      })
      .then(r => r?.json())
      .then(data => {
        if (data?.users) setUsers(data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, updates: { role: newRole } })
      });
      fetchUsers();
    } catch (err: any) {
      alert("Failed to update role: " + err.message);
    }
  };

  const handleStatusToggle = async (userId: string, currentActive: boolean) => {
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, updates: { isActive: !currentActive } })
      });
      fetchUsers();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      setIsAddUserOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "USER" });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] transition-colors">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 pt-20 px-4 pb-12 md:pt-8 md:px-8 md:ml-64">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">Team &amp; User Management</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Control user accounts, promote scouts to Admins, and manage team permissions.
            </p>
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-4 py-2.5 btn-primary flex items-center justify-center gap-2 text-xs font-semibold shadow-lg shadow-[#C5453E]/20 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>

        {/* Users Table */}
        <div className="card-glass overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-2xl">
          <div className="p-5 border-b border-[var(--border-subtle)]">
            <h2 className="text-base font-bold text-[var(--text-main)]">Registered Workspace Users ({users.length})</h2>
            <p className="text-xs text-[var(--text-muted)]">All registered scouts and system administrators</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[var(--table-header)] text-[var(--text-muted)] text-xs uppercase font-semibold border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="px-5 py-3.5">User Profile</th>
                  <th className="px-5 py-3.5">Assigned Role</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-muted)]">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-[var(--bg-card-hover)] transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C5453E] to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--text-main)] flex items-center gap-2">
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold border border-[var(--border-subtle)]">You</span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-[var(--text-dim)]" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role)}
                        title="Click to toggle Role (ADMIN / USER)"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                          u.role === "ADMIN"
                            ? "bg-[#C5453E]/15 text-[#C5453E] border border-[#C5453E]/30 hover:bg-[#C5453E]/25"
                            : "bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]"
                        }`}
                      >
                        {u.role === "ADMIN" ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#C5453E]" /> Super Admin
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5 text-[var(--text-dim)]" /> Scout User
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleStatusToggle(u.id, u.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Deactivated
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-xs font-mono text-[var(--text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete User"
                          className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-card-hover)] rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {isAddUserOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="card-glass w-full max-w-md p-6 border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-lg font-bold text-[var(--text-main)]">Create New Team Member</h3>
                <button onClick={() => setIsAddUserOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1 font-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                    placeholder="Jordan Smith"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                    placeholder="jordan@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1 font-semibold">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1 font-semibold">Role</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-main)] text-xs focus:outline-none focus:border-[#C5453E]"
                  >
                    <option value="USER">Scout User (Personal Workspace)</option>
                    <option value="ADMIN">Super Admin (Master Access)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 bg-[var(--bg-surface)] text-[var(--text-main)] rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 btn-primary text-xs"
                  >
                    Create Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
