// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import API from "../services/api";
// import SwipeCard from "../components/SwipeCard";

// /* ================= MATCH HELPERS ================= */
// const calculateSkillMatch = (me, user) => {
//   if (!me || !user) return 0;

//   const myTeach = me.skillsToTeach || [];
//   const myLearn = me.skillsToLearn || [];
//   const userTeach = user.skillsToTeach || [];
//   const userLearn = user.skillsToLearn || [];

//   return (
//     myLearn.filter((s) => userTeach.includes(s)).length +
//     myTeach.filter((s) => userLearn.includes(s)).length
//   );
// };

// const locationScore = (me, user) => {
//   if (!me || !user) return 0;
//   if (me.city === user.city) return 2;
//   if (me.state === user.state) return 1;
//   return 0;
// };

// const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

// export default function UserProfilePage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [me, setMe] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);

//   const [allUsers, setAllUsers] = useState([]);
//   const [suggestedUsers, setSuggestedUsers] = useState([]);

//   const [mySwappers, setMySwappers] = useState([]);
//   const [sentRequestIds, setSentRequestIds] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   /* ================= BUILD SUGGESTIONS ================= */
//   const buildSuggestions = (currentUser, users, swappers) => {
//     return shuffle(
//       users
//         .filter(
//           (u) =>
//             u._id !== currentUser._id &&
//             !swappers.includes(u._id)
//         )
//         .map((u) => ({
//           ...u,
//           score:
//             calculateSkillMatch(currentUser, u) * 3 +
//             locationScore(currentUser, u),
//         }))
//         .filter((u) => u.score > 0)
//     ).slice(0, 4);
//   };

//   /* ================= INITIAL LOAD ================= */
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [meRes, usersRes, sentRes] = await Promise.all([
//           API.get("/auth/me"),
//           API.get("/users"),
//           API.get("/swaps/sent"),
//         ]);

//         const found = usersRes.data.find((u) => u._id === id);
//         if (!found) return navigate("/dashboard");

//         setMe(meRes.data);
//         setSelectedUser(found);

//         const swapperIds =
//           (meRes.data.swappers || []).map((u) => u._id);

//         setMySwappers(swapperIds);
//         setSentRequestIds(sentRes.data.map((r) => r.toUser));
//         setAllUsers(usersRes.data);

//         setSuggestedUsers(
//           buildSuggestions(found, usersRes.data, swapperIds)
//         );
//       } catch {
//         navigate("/dashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [id, navigate]);

//   if (loading) return <p className="p-6">Loading...</p>;

//   const isSwapper = mySwappers.includes(selectedUser._id);
//   const isSent = sentRequestIds.includes(selectedUser._id);

//   const avatar =
//     selectedUser.profilePic ||
//     `https://ui-avatars.com/api/?name=${selectedUser.username}`;

//   /* ================= ACTIONS ================= */
//   const refreshSuggestions = () => {
//     setRefreshing(true);
//     setTimeout(() => {
//       setSuggestedUsers(
//         buildSuggestions(selectedUser, allUsers, mySwappers)
//       );
//       setRefreshing(false);
//     }, 300);
//   };

//   const sendSwapRequest = async () => {
//     if (isSwapper || isSent) return;
//     try {
//       setSending(true);
//       await API.post("/swaps/send", {
//         toUser: selectedUser._id,
//         skillOffered: "React",
//         skillRequested: "Node",
//       });
//       setSentRequestIds((p) => [...p, selectedUser._id]);
//     } finally {
//       setSending(false);
//     }
//   };

//   const startChat = async () => {
//     const res = await API.post("/chats/find-or-create", {
//       receiverId: selectedUser._id,
//     });
//     navigate(`/chat/${res.data._id}`);
//   };

//   const startVideo = async () => {
//     const res = await API.post("/chats/find-or-create", {
//       receiverId: selectedUser._id,
//     });
//     navigate(`/video/${res.data._id}`);
//   };

//   return (
//     <div className="min-h-screen p-6">
//       <div className="flex flex-col gap-8 max-w-5xl mx-auto">

//         {/* ================= TOP PROFILE ================= */}
//         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
//           <img
//             src={avatar}
//             alt="avatar"
//             className="w-32 h-32 rounded-full mx-auto border-2 border-violet-500"
//           />

//           <h1 className="text-2xl font-bold text-center mt-4">
//             @{selectedUser.username}
//           </h1>

//           <p className="text-center text-gray-400 mt-1">
//             {selectedUser.city || "—"}, {selectedUser.state || "—"}
//           </p>

//           <div className="mt-6 text-sm space-y-2 text-center">
//             <p><b>Teaches:</b> {selectedUser.skillsToTeach?.join(", ") || "N/A"}</p>
//             <p><b>Learns:</b> {selectedUser.skillsToLearn?.join(", ") || "N/A"}</p>
//           </div>

//           <div className="mt-8">
//             {isSwapper ? (
//               <div className="flex gap-3">
//                 <button onClick={startChat} className="flex-1 bg-cyan-500/20 p-2 rounded-lg">
//                   Chat
//                 </button>
//                 <button onClick={startVideo} className="flex-1 bg-violet-500/20 p-2 rounded-lg">
//                   Video
//                 </button>
//               </div>
//             ) : isSent ? (
//               <div className="text-center text-yellow-400 font-semibold">
//                 ⏳ Request Sent
//               </div>
//             ) : (
//               <button
//                 onClick={sendSwapRequest}
//                 disabled={sending}
//                 className="w-full bg-emerald-500/20 p-2 rounded-lg"
//               >
//                 {sending ? "Sending..." : "SwapSkill"}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* ================= BOTTOM SUGGESTIONS ================= */}
//         <div>
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold">
//               People you may like
//             </h2>

//             <button
//               onClick={refreshSuggestions}
//               className="
//                 group w-10 h-10 rounded-full
//                 bg-white/10 backdrop-blur-xl
//                 border border-white/20
//                 hover:bg-white/20 transition
//                 flex items-center justify-center
//               "
//             >
//               <span
//                 className={`
//                   text-lg transition-transform
//                   ${refreshing ? "animate-spin" : "group-hover:rotate-180"}
//                 `}
//               >
//                 ⟳
//               </span>
//             </button>
//           </div>

//           <div className="flex flex-wrap gap-6 justify-center">
//             {suggestedUsers.map((u) => (
//               <SwipeCard
//                 key={u._id}
//                 user={u}
//                 isAlreadySwapper={false}
//                 isSent={sentRequestIds.includes(u._id)}
//                 setSentRequestIds={setSentRequestIds}
//               />
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }






















































// ================= EXISTING IMPORTS =================
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";
import { motion, AnimatePresence } from "framer-motion";

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState(null);
  const [mySwappers, setMySwappers] = useState([]);
  const [sentRequestIds, setSentRequestIds] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [interactionBlocked, setInteractionBlocked] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [reportReason, setReportReason] = useState("");
  const [reportFeedback, setReportFeedback] = useState("");

  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, usersRes, sentRes, blockRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/users"),
          API.get("/swaps/sent"),
          API.get(`/reports/check/${id}`),
        ]);

        const found = usersRes.data.find((u) => u._id === id);
        if (!found) return navigate("/dashboard");

        setSelectedUser(found);

        const swapperIds = (meRes.data.swappers || []).map((u) => u._id);
        setMySwappers(swapperIds);
        setSentRequestIds(sentRes.data.map((r) => r.toUser));

        setSuggestedUsers(
          usersRes.data.filter((u) => u._id !== id).slice(0, 6)
        );

        if (blockRes.data?.blocked) setInteractionBlocked(true);
      } catch {
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  const isSwapper = mySwappers.includes(selectedUser._id);
  const isSent = sentRequestIds.includes(selectedUser._id);

  const avatar =
    selectedUser.profilePic ||
    `https://ui-avatars.com/api/?name=${selectedUser.username}`;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const sendSwapRequest = async () => {
    if (isSwapper || isSent || interactionBlocked) return;

    await API.post("/swaps/send", {
      toUser: selectedUser._id,
      skillOffered: "React",
      skillRequested: "Node",
    });

    setSentRequestIds((p) => [...p, selectedUser._id]);
    showToast("Request sent 🚀");
  };

  const startChat = async () => {
    const res = await API.post("/chats/find-or-create", {
      receiverId: selectedUser._id,
    });
    navigate(`/chat/${res.data._id}`);
  };

  const startVideo = async () => {
    const res = await API.post("/chats/find-or-create", {
      receiverId: selectedUser._id,
    });
    navigate(`/video/${res.data._id}`);
  };

  const submitReport = async () => {
    if (!reportReason) return showToast("Select a reason ⚠️", "error");

    try {
      await API.post("/reports", {
        reportedId: selectedUser._id,
        reason: reportReason,
        feedback: reportFeedback,
      });

      setInteractionBlocked(true);
      setShowReport(false);
      showToast("User reported & blocked 🚫");
    } catch {
      showToast("Report failed ❌", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-900 dark:to-slate-950 py-6 px-3">

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 10, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className={`fixed top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-xl z-[9999] text-sm font-medium
            ${toast.type === "error" ? "bg-red-500" : "bg-green-500"} text-white`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* PROFILE CARD */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl p-5 sm:p-8">

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

            {/* AVATAR */}
            <img
              src={avatar}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full shadow-2xl border-4 border-white object-cover"
            />

            <div className="flex-1 text-center md:text-left">

              <h1 className="text-2xl md:text-3xl font-bold">
                @{selectedUser.username}
              </h1>

              {/* SKILLS */}
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-300">
                  Skills Offered
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {(selectedUser.skillsToTeach || []).map((s) => (
                    <span
                      key={s}
                      className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-3 py-1 rounded-full text-xs shadow"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">

                {interactionBlocked ? (
                  <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
                    🚫 Blocked
                  </div>
                ) : isSwapper ? (
                  <>
                    <button
                      onClick={startChat}
                      className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow"
                    >
                      Chat
                    </button>

                    <button
                      onClick={startVideo}
                      className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow"
                    >
                      Video
                    </button>
                  </>
                ) : isSent ? (
                  <div className="text-yellow-500 font-medium">
                    ⏳ Request Sent
                  </div>
                ) : (
                  <button
                    onClick={sendSwapRequest}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow"
                  >
                    ❤️ Swap Skill
                  </button>
                )}

                {!interactionBlocked && (
                  <button
                    onClick={() => setShowReport(true)}
                    className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl"
                  >
                    🚨 Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SUGGESTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {suggestedUsers.map((u) => (
            <SwipeCard
              key={u._id}
              user={u}
              isAlreadySwapper={false}
              isSent={sentRequestIds.includes(u._id)}
              setSentRequestIds={setSentRequestIds}
            />
          ))}
        </div>
      </div>

      {/* REPORT MODAL */}
      {showReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <h2 className="text-lg font-bold mb-4">🚨 Report User</h2>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full mb-3 p-2 rounded-lg bg-gray-100 dark:bg-slate-700"
            >
              <option value="">Select reason</option>
              <option value="spam">Spam</option>
              <option value="abuse">Abuse</option>
              <option value="fake">Fake Profile</option>
              <option value="other">Other</option>
            </select>

            <textarea
              value={reportFeedback}
              onChange={(e) => setReportFeedback(e.target.value)}
              placeholder="Additional feedback..."
              className="w-full mb-4 p-2 rounded-lg bg-gray-100 dark:bg-slate-700"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowReport(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={submitReport}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg"
              >
                Submit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}









































// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Heart } from "lucide-react";
// import API from "../services/api";
// import SwipeCard from "../components/SwipeCard";

// /* ================= MATCH HELPERS ================= */
// const calculateSkillMatch = (me, user) => {
//   if (!me || !user) return 0;
//   const myTeach = me.skillsToTeach || [];
//   const myLearn = me.skillsToLearn || [];
//   const userTeach = user.skillsToTeach || [];
//   const userLearn = user.skillsToLearn || [];

//   return (
//     myLearn.filter((s) => userTeach.includes(s)).length +
//     myTeach.filter((s) => userLearn.includes(s)).length
//   );
// };

// const locationScore = (me, user) => {
//   if (!me || !user) return 0;
//   if (me.city === user.city) return 2;
//   if (me.state === user.state) return 1;
//   return 0;
// };

// const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

// export default function UserProfilePage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [me, setMe] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [allUsers, setAllUsers] = useState([]);
//   const [suggestedUsers, setSuggestedUsers] = useState([]);
//   const [mySwappers, setMySwappers] = useState([]);
//   const [sentRequestIds, setSentRequestIds] = useState([]);
//   const [userPosts, setUserPosts] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);

//   const [interactionBlocked, setInteractionBlocked] = useState(false);

//   /* ================= INITIAL LOAD ================= */
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [meRes, usersRes, sentRes, blockRes] = await Promise.all([
//           API.get("/auth/me"),
//           API.get("/users"),
//           API.get("/swaps/sent"),
//           API.get(`/reports/check/${id}`),
//         ]);

//         const found = usersRes.data.find((u) => u._id === id);
//         if (!found) return navigate("/dashboard");

//         setMe(meRes.data);
//         setSelectedUser(found);

//         const swapperIds = (meRes.data.swappers || []).map((u) => u._id);

//         setMySwappers(swapperIds);
//         setSentRequestIds(sentRes.data.map((r) => r.toUser));
//         setAllUsers(usersRes.data);

//         setSuggestedUsers(
//           shuffle(
//             usersRes.data.filter(
//               (u) => u._id !== found._id && !swapperIds.includes(u._id),
//             ),
//           ).slice(0, 4),
//         );

//         if (blockRes.data?.blocked) {
//           setInteractionBlocked(true);
//         }

//         // Load posts if swapper
//         if (swapperIds.includes(id)) {
//           const postRes = await API.get(`/posts/user/${id}`);
//           setUserPosts(postRes.data);
//         }
//       } catch {
//         navigate("/dashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [id, navigate]);

//   if (loading || !selectedUser)
//     return (
//       <div className="min-h-screen flex items-center justify-center text-xl">
//         Loading profile...
//       </div>
//     );

//   const isSwapper = mySwappers.includes(selectedUser._id);
//   const isSent = sentRequestIds.includes(selectedUser._id);

//   /* ================= LIKE ================= */
//   const handleLike = async (postId) => {
//     try {
//       const res = await API.post(`/posts/like/${postId}`);

//       setUserPosts((prev) =>
//         prev.map((p) => (p._id === postId ? res.data : p)),
//       );
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /* ================= SEND REQUEST ================= */
//   const sendSwapRequest = async () => {
//     if (isSwapper || isSent || interactionBlocked) return;
//     try {
//       setSending(true);
//       await API.post("/swaps/send", {
//         toUser: selectedUser._id,
//         skillOffered: "React",
//         skillRequested: "Node",
//       });
//       setSentRequestIds((p) => [...p, selectedUser._id]);
//     } finally {
//       setSending(false);
//     }
//   };

//   const skillMatch = calculateSkillMatch(me, selectedUser);
//   const locationMatch = locationScore(me, selectedUser);

//   return (
//     <div
//       className="min-h-screen p-6 transition-colors duration-300
//       bg-gradient-to-br from-zinc-100 to-zinc-200
//       dark:from-zinc-900 dark:to-black"
//     >
//       <div className="flex flex-col gap-10 max-w-6xl mx-auto">
//         {/* PROFILE HEADER */}
//         <div
//           className="relative bg-white/70 dark:bg-white/5 backdrop-blur-xl 
//         border border-white/20 rounded-3xl p-8 shadow-xl"
//         >
//           <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-400/20 blur-3xl rounded-full"></div>

//           <div className="flex flex-col md:flex-row items-center gap-6">
//             {/* Avatar */}
//             <div
//               className="w-28 h-28 rounded-full bg-gradient-to-br
//   from-emerald-400 to-cyan-400 flex items-center justify-center
//   text-3xl font-bold text-white shadow-lg"
//             >
//               {selectedUser?.username
//                 ? selectedUser.username[0].toUpperCase()
//                 : "?"}
//             </div>

//             {/* Info */}
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold">@{selectedUser?.username}</h1>

//               <p className="text-zinc-500 dark:text-zinc-400 mt-1">
//                 {selectedUser?.city}, {selectedUser?.state}
//               </p>

//               {/* Match indicators */}
//               <div className="flex gap-4 mt-4 text-sm">
//                 <span className="bg-emerald-500/20 px-3 py-1 rounded-full">
//                   Skill Match: {skillMatch}
//                 </span>
//                 <span className="bg-cyan-500/20 px-3 py-1 rounded-full">
//                   Location Score: {locationMatch}
//                 </span>
//               </div>

//               {/* Skills */}
//               <div className="flex flex-wrap gap-2 mt-4">
//                 {selectedUser.skillsToTeach?.map((s, i) => (
//                   <span
//                     key={i}
//                     className="px-3 py-1 text-sm rounded-full
//                     bg-emerald-500/20 text-emerald-400"
//                   >
//                     Teach: {s}
//                   </span>
//                 ))}

//                 {selectedUser.skillsToLearn?.map((s, i) => (
//                   <span
//                     key={i}
//                     className="px-3 py-1 text-sm rounded-full
//                     bg-cyan-500/20 text-cyan-400"
//                   >
//                     Learn: {s}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Button */}
//             <div>
//               {interactionBlocked ? (
//                 <div className="text-red-400 font-semibold">
//                   🚫 Interaction blocked
//                 </div>
//               ) : isSwapper ? (
//                 <div className="text-green-400 font-semibold">
//                   🤝 Swappers Connected
//                 </div>
//               ) : isSent ? (
//                 <div className="text-yellow-400 font-semibold">
//                   ⏳ Request Sent
//                 </div>
//               ) : (
//                 <button
//                   onClick={sendSwapRequest}
//                   disabled={sending}
//                   className="px-6 py-2 rounded-xl font-medium
//                   bg-gradient-to-r from-emerald-500 to-cyan-500
//                   hover:scale-105 transition-all shadow-lg"
//                 >
//                   {sending ? "Sending..." : "Swap Skill"}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* POSTS */}
//         {isSwapper && userPosts.length > 0 && (
//           <div
//             className="bg-white/70 dark:bg-white/5 backdrop-blur-xl 
//           border border-white/10 rounded-3xl p-6 shadow-xl"
//           >
//             <h2 className="text-2xl font-semibold mb-6">
//               Posts by @{selectedUser.username}
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {userPosts.map((post) => {
//                 const isLiked = post.likes.some((like) => like === me._id);

//                 return (
//                   <div
//                     key={post._id}
//                     className="group rounded-2xl overflow-hidden
//                     bg-white/50 dark:bg-white/5
//                     hover:scale-[1.02] transition-all
//                     border border-white/10"
//                   >
//                     <img
//                       src={`http://localhost:5000${post.image}`}
//                       className="w-full h-64 object-cover"
//                       alt=""
//                     />

//                     <div className="p-4">
//                       <p className="text-sm mb-4 text-zinc-600 dark:text-zinc-300">
//                         {post.caption}
//                       </p>

//                       <button
//                         onClick={() => handleLike(post._id)}
//                         className={`flex items-center gap-2 transition
//                         ${
//                           isLiked
//                             ? "text-red-500"
//                             : "text-zinc-400 hover:text-red-500"
//                         }`}
//                       >
//                         <Heart size={20} fill={isLiked ? "red" : "none"} />
//                         {post.likes.length}
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* SUGGESTED USERS */}
//         <div>
//           <h2 className="text-xl font-semibold mb-4">Suggested Swappers</h2>

//           <div className="flex flex-wrap gap-6 justify-center">
//             {suggestedUsers.map((u) => (
//               <SwipeCard
//                 key={u._id}
//                 user={u}
//                 isAlreadySwapper={false}
//                 isSent={sentRequestIds.includes(u._id)}
//                 setSentRequestIds={setSentRequestIds}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
