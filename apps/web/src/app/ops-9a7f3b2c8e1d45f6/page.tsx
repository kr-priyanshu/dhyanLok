"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { hashPassword } from "@/utils/hash";
import { motion } from "framer-motion";
import { Users, ShieldAlert, ArrowLeft, Eye, EyeOff, Plus, UserPlus, Key, FileText, Database, Activity, Mic, X } from "lucide-react";

interface GuestUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
  role?: string;
  sync_fallback?: string;
  plaintext_password?: string;
  google_client_id?: string;
  gemini_api_key?: string;
  sync_data?: any;
  sync_updated_at?: string;
}

export default function AdminDashboard() {
  const { role } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<GuestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Masking state
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  // Report Modal state
  const [reportUser, setReportUser] = useState<GuestUser | null>(null);

  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("guest");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (role && role !== 'admin') {
      router.push("/dashboard");
    }
  }, [role, router]);

  useEffect(() => {
    if (mounted && role === 'admin') {
      fetchUsers();
    }
  }, [mounted, role]);

  const fetchUsers = async () => {
    try {
      const { data, error: dbError } = await supabase
        .from("guest_users")
        .select("id, username, email, created_at, role, sync_fallback, plaintext_password, google_client_id, gemini_api_key, sync_data, sync_updated_at")
        .order("created_at", { ascending: false });

      if (dbError) {
        setError("Failed to connect to Supabase. Check your API keys and ensure the 'guest_users' table exists.");
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      setCreateError("All fields are required.");
      return;
    }
    setCreateLoading(true);
    setCreateError("");

    try {
      const hashedPassword = await hashPassword(newPassword);
      
      const { data, error: insertError } = await supabase
        .from('guest_users')
        .insert([{ 
          username: newUsername.trim(), 
          email: newEmail.trim(),
          password_hash: hashedPassword,
          sync_fallback: btoa(unescape(encodeURIComponent(newPassword))),
          role: newRole
        }])
        .select();
        
      if (insertError) {
        setCreateError(insertError.message);
      } else {
        // Success
        setNewUsername("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("guest");
        setIsCreating(false);
        if (data) {
          setUsers([data[0], ...users]);
        } else {
          fetchUsers(); // Fallback to re-fetching
        }
      }
    } catch (err) {
      setCreateError("Unexpected error during creation.");
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleReveal = (id: number) => {
    const next = new Set(revealedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedIds(next);
  };

  if (!mounted) return null;
  
  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <ShieldAlert size={48} className="text-red-500" />
        <h1 className="text-2xl font-heading">Access Denied</h1>
        <p className="text-premium-muted">You do not have permission to view this page.</p>
        <button onClick={() => router.push("/dashboard")} className="px-4 py-2 mt-4 rounded border border-premium-border">Go Back</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8 mt-12 max-w-6xl mx-auto"
    >
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-premium-border pb-8">
        <div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-premium-muted hover:text-premium-text text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tighter mb-2 flex items-center gap-4 text-premium-text">
            <Users /> HQ Console
          </h1>
          <p className="text-premium-muted font-sans text-sm tracking-wide">
            Centralized overview and identity management.
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className={`px-4 py-2 rounded-full border border-premium-border text-sm font-medium transition-colors flex items-center gap-2 ${isCreating ? 'bg-premium-panel text-premium-text' : 'hover:bg-premium-text hover:text-black'}`}
        >
          {isCreating ? <ArrowLeft size={16} /> : <UserPlus size={16} />}
          {isCreating ? 'Cancel' : 'Provision User'}
        </button>
      </header>

      {isCreating && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-panel p-6 rounded-xl border border-premium-border"
        >
          <h2 className="text-xl font-heading mb-6 flex items-center gap-2"><Key size={18} /> Provision New Account</h2>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Username" 
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="bg-transparent border border-premium-border rounded p-3 text-sm focus:border-premium-text outline-none"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              className="bg-transparent border border-premium-border rounded p-3 text-sm focus:border-premium-text outline-none"
            />
            <input 
              type="text" 
              placeholder="Password (Plaintext)" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="bg-transparent border border-premium-border rounded p-3 text-sm focus:border-premium-text outline-none"
            />
            <select 
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              className="bg-[var(--theme-bg)] border border-premium-border rounded p-3 text-sm focus:border-premium-text outline-none text-premium-text"
            >
              <option value="guest">Guest</option>
              <option value="admin">Admin</option>
            </select>
            
            {createError && <p className="text-red-500 text-xs md:col-span-2">{createError}</p>}
            
            <div className="md:col-span-2 flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={createLoading}
                className="px-6 py-3 bg-premium-text text-black rounded font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {createLoading ? 'Provisioning...' : 'Confirm Provisioning'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500">
          <p className="font-medium mb-2 flex items-center gap-2"><ShieldAlert size={18}/> Database Error</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-premium-text" aria-label="Loading users"></div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-premium-border glass-panel">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-premium-border bg-black/20 text-premium-muted text-xs uppercase tracking-widest font-mono whitespace-nowrap">
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Auth Key</th>
                <th className="p-4 font-medium">Google Drive</th>
                <th className="p-4 font-medium">Gemini Key</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-center">Reveal</th>
                <th className="p-4 font-medium text-center">Report</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-premium-muted text-sm">
                    No users found in the database.
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const isRevealed = revealedIds.has(user.id);
                  const displayPassword = (() => {
                    const raw = user.sync_fallback || user.plaintext_password;
                    if (!raw) return '—';
                    try {
                      return decodeURIComponent(escape(atob(raw)));
                    } catch {
                      return raw;
                    }
                  })();

                  return (
                    <tr key={user.id} className="border-b border-premium-border/30 hover:bg-premium-border/10 transition-colors">
                      <td className="p-4 text-xs text-premium-muted font-mono">{i + 1}</td>
                      <td className="p-4 text-sm font-medium">{user.username}</td>
                      <td className="p-4 text-xs">
                        <span className={`px-2 py-1 rounded font-mono uppercase tracking-widest ${user.role === 'admin' ? 'bg-premium-text text-black' : 'bg-premium-panel border border-premium-border'}`}>
                          {user.role || 'GUEST'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-premium-muted">{user.email}</td>
                      <td className="p-4 text-xs font-mono text-premium-text rounded my-2 inline-block py-1">
                        <span className={isRevealed ? "bg-black/10 px-2 select-all" : "opacity-30 tracking-[0.2em]"}>
                          {isRevealed ? displayPassword : '••••••••'}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-premium-muted max-w-[120px] truncate" title={isRevealed ? user.google_client_id : ''}>
                        <span className={isRevealed ? "bg-black/10 px-1 select-all" : "opacity-30 tracking-[0.2em]"}>
                          {isRevealed ? (user.google_client_id || '—') : '••••••••'}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono text-premium-muted max-w-[120px] truncate" title={isRevealed ? user.gemini_api_key : ''}>
                        <span className={isRevealed ? "bg-black/10 px-1 select-all" : "opacity-30 tracking-[0.2em]"}>
                          {isRevealed ? (user.gemini_api_key || '—') : '••••••••'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-premium-muted whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleReveal(user.id)}
                          className="p-2 rounded-full hover:bg-premium-panel transition-colors text-premium-muted hover:text-premium-text"
                          title={isRevealed ? "Hide Secrets" : "Reveal Secrets"}
                        >
                          {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setReportUser(user)}
                          className="p-2 rounded-full hover:bg-premium-panel transition-colors text-premium-muted hover:text-emerald-400"
                          title="View Detailed Report"
                        >
                          <FileText size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="p-4 border-t border-premium-border/30 text-xs text-premium-muted text-right">
            Total Identities: {users.length}
          </div>
        </div>
      )}

      {/* Admin Detailed Report Modal */}
      {reportUser && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-3xl max-h-[85vh] rounded-2xl border border-premium-border shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-premium-border/50 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-premium-panel border border-premium-border flex items-center justify-center text-xl font-heading text-premium-text">
                  {reportUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-heading tracking-tight text-premium-text">{reportUser.username}'s Audit</h2>
                  <p className="text-xs font-mono text-premium-muted">{reportUser.email} • {reportUser.role?.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setReportUser(null)}
                className="p-2 rounded-full bg-premium-panel hover:bg-premium-border/50 text-premium-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
              
              {!reportUser.sync_data ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-premium-muted opacity-60">
                  <Database size={48} />
                  <p>No Cloud Sync data found for this user.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-premium-border bg-premium-panel flex flex-col gap-1">
                      <span className="text-xs font-mono uppercase tracking-widest text-premium-muted">Habits</span>
                      <span className="text-3xl font-heading text-premium-text">{reportUser.sync_data.habits?.length || 0}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-premium-border bg-premium-panel flex flex-col gap-1">
                      <span className="text-xs font-mono uppercase tracking-widest text-premium-muted">Completions</span>
                      <span className="text-3xl font-heading text-emerald-400">{Object.keys(reportUser.sync_data.logs || {}).length}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-premium-border bg-premium-panel flex flex-col gap-1">
                      <span className="text-xs font-mono uppercase tracking-widest text-premium-muted">Journals</span>
                      <span className="text-3xl font-heading text-violet-400">{Object.keys(reportUser.sync_data.journals || {}).length}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-premium-border bg-premium-panel flex flex-col gap-1">
                      <span className="text-xs font-mono uppercase tracking-widest text-premium-muted">Memos</span>
                      <span className="text-3xl font-heading text-amber-400">{Object.keys(reportUser.sync_data.audioFiles || {}).length}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-heading tracking-tight flex items-center gap-2"><Activity size={16}/> Active Habits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {reportUser.sync_data.habits?.map((h: any) => (
                        <div key={h._id} className="p-3 text-sm rounded border border-premium-border/50 flex justify-between items-center bg-black/10">
                          <span className="truncate pr-2">{h.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-premium-panel font-mono text-premium-muted whitespace-nowrap">
                            {h.type}
                          </span>
                        </div>
                      )) || <p className="text-xs text-premium-muted">No habits configured.</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <h3 className="text-sm font-heading tracking-tight flex items-center gap-2"><Database size={16}/> Raw Payload</h3>
                    <div className="bg-black/50 border border-premium-border p-4 rounded-xl text-xs font-mono text-premium-muted overflow-x-auto max-h-[250px] custom-scrollbar">
                      <pre>{JSON.stringify(reportUser.sync_data, null, 2)}</pre>
                    </div>
                    <p className="text-xs text-right opacity-50 mt-1">Last Synced: {reportUser.sync_updated_at ? new Date(reportUser.sync_updated_at).toLocaleString() : 'Unknown'}</p>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
