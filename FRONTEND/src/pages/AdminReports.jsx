import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    setLoading(true);
    API.get("/reports/admin/all")
      .then((res) => setReports(res.data))
      .finally(() => setLoading(false));
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const tempBan = async (userId) => {
    await API.post("/reports/admin/ban", { userId, days: 7 });
    showToast("User temporarily banned 🔒");
    loadReports();
  };

  const unban = async (userId) => {
    await API.post("/users/unban", { userId });
    showToast("User unbanned ✅");
    loadReports();
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user?")) return;
    await API.delete(`/reports/admin/user/${userId}`);
    showToast("User permanently deleted 🔥", "danger");
    setSelected(null);
    loadReports();
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-6">Admin – All Reports</h1>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full border border-white/20 rounded-xl">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3">Reporter</th>
              <th className="p-3">Reported User</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr
                key={r._id}
                onClick={() => setSelected(r)}
                className="border-t border-white/10 cursor-pointer hover:bg-white/5 transition"
              >
                <td className="p-3">@{r.reporter?.username}</td>
                <td className="p-3 font-semibold text-red-400">
                  @{r.reported?.username}
                </td>
                <td className="p-3">{r.reason}</td>
                <td className="p-3 text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= CENTER DETAILS CARD ================= */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 border border-white/20 rounded-2xl p-6 w-full max-w-lg relative"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-4 text-xl"
              >
                ✖
              </button>

              <h2 className="text-2xl font-bold mb-4 text-center">
                Report Details
              </h2>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-400">Reporter:</span>{" "}
                  @{selected.reporter?.username}
                </p>

                <p>
                  <span className="text-gray-400">Reported User:</span>{" "}
                  @{selected.reported?.username}
                </p>

                <p className="text-red-400 font-semibold">
                  Reason: {selected.reason}
                </p>

                <p>
                  <span className="text-gray-400">Feedback:</span>{" "}
                  {selected.feedback || "—"}
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => tempBan(selected.reported._id)}
                  className="flex-1 py-2 rounded-lg bg-yellow-500/80 hover:bg-yellow-500"
                >
                  Temp Ban
                </button>

                <button
                  onClick={() => unban(selected.reported._id)}
                  className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700"
                >
                  Unban
                </button>

                <button
                  onClick={() => deleteUser(selected.reported._id)}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= TOAST ================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl ${
              toast.type === "danger"
                ? "bg-red-600"
                : "bg-green-600"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
























// import { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Shield, AlertTriangle, Ban, CheckCircle, Trash2, User, Clock, MessageSquare, Zap, TrendingUp, Eye, Filter, Search, X } from "lucide-react";

// export default function AdminReports() {
//   const [reports, setReports] = useState([
//     {
//       _id: "1",
//       reporter: { username: "john_doe", profilePic: "" },
//       reported: { username: "suspicious_user", profilePic: "" },
//       reason: "Harassment",
//       feedback: "User sent threatening messages repeatedly",
//       createdAt: new Date().toISOString(),
//       status: "pending"
//     },
//     {
//       _id: "2",
//       reporter: { username: "sarah_smith", profilePic: "" },
//       reported: { username: "fake_account", profilePic: "" },
//       reason: "Spam",
//       feedback: "Mass messaging and promotional content",
//       createdAt: new Date(Date.now() - 86400000).toISOString(),
//       status: "pending"
//     },
//     {
//       _id: "3",
//       reporter: { username: "mike_johnson", profilePic: "" },
//       reported: { username: "scammer123", profilePic: "" },
//       reason: "Scam",
//       feedback: "Trying to sell fake products",
//       createdAt: new Date(Date.now() - 172800000).toISOString(),
//       status: "resolved"
//     }
//   ]);
  
//   const [loading, setLoading] = useState(false);
//   const [selected, setSelected] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [filter, setFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [stats, setStats] = useState({
//     total: 127,
//     pending: 23,
//     resolved: 104,
//     banned: 15
//   });

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const tempBan = async (userId) => {
//     showToast("🔒 User temporarily banned for 7 days", "warning");
//     setSelected(null);
//   };

//   const unban = async (userId) => {
//     showToast("✅ User unbanned successfully");
//     setSelected(null);
//   };

//   const deleteUser = async (userId) => {
//     if (!window.confirm("⚠️ Permanently delete this user? This cannot be undone!")) return;
//     showToast("🔥 User permanently deleted", "danger");
//     setSelected(null);
//   };

//   const filteredReports = reports.filter(r => {
//     const matchesFilter = filter === "all" || r.status === filter;
//     const matchesSearch = r.reported.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          r.reporter.username.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesFilter && matchesSearch;
//   });

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
//       {/* Animated Background */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
//         <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />
//         <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
//       </div>

//       <div className="relative z-10 max-w-7xl mx-auto p-6">
//         {/* Header */}
//         <motion.div
//           initial={{ y: -50, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           className="mb-8"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-4">
//               <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 shadow-2xl shadow-purple-500/50">
//                 <Shield size={32} className="text-white" />
//               </div>
//               <div>
//                 <h1 className="text-4xl font-black text-white tracking-tight">
//                   Admin Control Center
//                 </h1>
//                 <p className="text-gray-400 mt-1">Monitor and manage user reports</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 className="px-4 py-2 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
//               >
//                 <div className="flex items-center gap-2">
//                   <Zap size={16} className="text-yellow-400" />
//                   <span className="text-sm text-white font-semibold">Live</span>
//                 </div>
//               </motion.div>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-4 gap-4 mb-6">
//             {[
//               { label: "Total Reports", value: stats.total, icon: AlertTriangle, color: "from-blue-500 to-cyan-500" },
//               { label: "Pending", value: stats.pending, icon: Clock, color: "from-yellow-500 to-orange-500" },
//               { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "from-green-500 to-emerald-500" },
//               { label: "Banned Users", value: stats.banned, icon: Ban, color: "from-red-500 to-pink-500" }
//             ].map((stat, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ y: 20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: i * 0.1 }}
//                 whileHover={{ scale: 1.05, y: -5 }}
//                 className="relative group"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity blur-xl" 
//                      style={{ background: `linear-gradient(to bottom right, ${stat.color})` }} />
//                 <div className="relative p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
//                   <div className="flex items-center justify-between mb-3">
//                     <stat.icon size={24} className="text-white/60" />
//                     <TrendingUp size={16} className="text-green-400" />
//                   </div>
//                   <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
//                   <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>

//           {/* Search & Filters */}
//           <div className="flex gap-4 mb-6">
//             <div className="flex-1 relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search by username..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-all"
//               />
//             </div>
//             <div className="flex gap-2">
//               {["all", "pending", "resolved"].map((f) => (
//                 <button
//                   key={f}
//                   onClick={() => setFilter(f)}
//                   className={`px-6 py-3 rounded-xl font-semibold transition-all ${
//                     filter === f
//                       ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
//                       : "bg-white/5 text-gray-400 hover:bg-white/10"
//                   }`}
//                 >
//                   {f.charAt(0).toUpperCase() + f.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </motion.div>

//         {/* Reports Grid */}
//         <div className="space-y-3">
//           <AnimatePresence mode="popLayout">
//             {filteredReports.map((report, i) => (
//               <motion.div
//                 key={report._id}
//                 initial={{ x: -50, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 exit={{ x: 50, opacity: 0 }}
//                 transition={{ delay: i * 0.05 }}
//                 whileHover={{ scale: 1.02, x: 10 }}
//                 onClick={() => setSelected(report)}
//                 className="relative group cursor-pointer"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
//                 <div className="relative p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4 flex-1">
//                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white font-bold">
//                         {report.reported.username[0].toUpperCase()}
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-1">
//                           <span className="text-gray-400 text-sm">@{report.reporter.username}</span>
//                           <span className="text-gray-600">→</span>
//                           <span className="text-red-400 font-semibold">@{report.reported.username}</span>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
//                             {report.reason}
//                           </span>
//                           <span className="text-xs text-gray-500">
//                             {new Date(report.createdAt).toLocaleDateString()}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                         report.status === "pending" 
//                           ? "bg-yellow-500/20 text-yellow-400"
//                           : "bg-green-500/20 text-green-400"
//                       }`}>
//                         {report.status}
//                       </span>
//                       <Eye size={20} className="text-gray-400 group-hover:text-white transition-colors" />
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* Detail Modal */}
//       <AnimatePresence>
//         {selected && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-6"
//             onClick={() => setSelected(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0, y: 50 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 50 }}
//               onClick={(e) => e.stopPropagation()}
//               className="w-full max-w-2xl relative"
//             >
//               {/* Glow Effect */}
//               <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30" />
              
//               <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
//                 <button
//                   onClick={() => setSelected(null)}
//                   className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
//                 >
//                   <X size={20} className="text-gray-400 group-hover:text-white transition-colors" />
//                 </button>

//                 <div className="flex items-center gap-4 mb-6">
//                   <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600">
//                     <AlertTriangle size={28} className="text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-black text-white">Report Details</h2>
//                     <p className="text-gray-400 text-sm">Review and take action</p>
//                   </div>
//                 </div>

//                 <div className="space-y-4 mb-8">
//                   <div className="p-4 rounded-xl bg-white/5 border border-white/10">
//                     <div className="flex items-center gap-3 mb-2">
//                       <User size={16} className="text-gray-400" />
//                       <span className="text-xs text-gray-400 uppercase tracking-wider">Reporter</span>
//                     </div>
//                     <span className="text-white font-semibold">@{selected.reporter.username}</span>
//                   </div>

//                   <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
//                     <div className="flex items-center gap-3 mb-2">
//                       <AlertTriangle size={16} className="text-red-400" />
//                       <span className="text-xs text-red-400 uppercase tracking-wider">Reported User</span>
//                     </div>
//                     <span className="text-white font-semibold">@{selected.reported.username}</span>
//                   </div>

//                   <div className="p-4 rounded-xl bg-white/5 border border-white/10">
//                     <div className="flex items-center gap-3 mb-2">
//                       <MessageSquare size={16} className="text-gray-400" />
//                       <span className="text-xs text-gray-400 uppercase tracking-wider">Reason</span>
//                     </div>
//                     <span className="text-red-400 font-semibold">{selected.reason}</span>
//                   </div>

//                   <div className="p-4 rounded-xl bg-white/5 border border-white/10">
//                     <div className="flex items-center gap-3 mb-2">
//                       <MessageSquare size={16} className="text-gray-400" />
//                       <span className="text-xs text-gray-400 uppercase tracking-wider">Additional Feedback</span>
//                     </div>
//                     <p className="text-gray-300">{selected.feedback || "No additional feedback provided"}</p>
//                   </div>

//                   <div className="p-4 rounded-xl bg-white/5 border border-white/10">
//                     <div className="flex items-center gap-3 mb-2">
//                       <Clock size={16} className="text-gray-400" />
//                       <span className="text-xs text-gray-400 uppercase tracking-wider">Reported On</span>
//                     </div>
//                     <span className="text-gray-300">{new Date(selected.createdAt).toLocaleString()}</span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => tempBan(selected.reported._id)}
//                     className="relative group overflow-hidden py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg shadow-yellow-500/50 transition-all"
//                   >
//                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
//                     <div className="relative flex items-center justify-center gap-2">
//                       <Ban size={18} />
//                       <span>Temp Ban</span>
//                     </div>
//                   </motion.button>

//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => unban(selected.reported._id)}
//                     className="relative group overflow-hidden py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/50 transition-all"
//                   >
//                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
//                     <div className="relative flex items-center justify-center gap-2">
//                       <CheckCircle size={18} />
//                       <span>Unban</span>
//                     </div>
//                   </motion.button>

//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => deleteUser(selected.reported._id)}
//                     className="relative group overflow-hidden py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg shadow-red-500/50 transition-all"
//                   >
//                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
//                     <div className="relative flex items-center justify-center gap-2">
//                       <Trash2 size={18} />
//                       <span>Delete</span>
//                     </div>
//                   </motion.button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Toast Notifications */}
//       <AnimatePresence>
//         {toast && (
//           <motion.div
//             initial={{ y: 100, opacity: 0, scale: 0.8 }}
//             animate={{ y: 0, opacity: 1, scale: 1 }}
//             exit={{ y: 100, opacity: 0, scale: 0.8 }}
//             className="fixed bottom-8 right-8 z-50"
//           >
//             <div className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
//               toast.type === "danger"
//                 ? "bg-red-500/90 border-red-400/50 shadow-red-500/50"
//                 : toast.type === "warning"
//                 ? "bg-yellow-500/90 border-yellow-400/50 shadow-yellow-500/50"
//                 : "bg-green-500/90 border-green-400/50 shadow-green-500/50"
//             }`}>
//               <p className="text-white font-semibold">{toast.msg}</p>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }