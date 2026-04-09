import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Video } from "lucide-react";

export default function SwipeCard({
  user,
  isAlreadySwapper,
  isSent,
  setSentRequestIds,
}) {
  const [localIsSent, setLocalIsSent] = useState(isSent);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalIsSent(isSent);
  }, [isSent]);

  if (!user) return null;

  const avatar =
    user.profilePic
      ? user.profilePic.startsWith("/uploads")
        ? `http://localhost:5000${user.profilePic}`
        : user.profilePic
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.username || user.name || "User"
        )}`;

  const backgroundImage =
    user.coverImage?.startsWith("/uploads")
      ? `url(http://localhost:5000${user.coverImage})`
      : user.coverImage
      ? `url(${user.coverImage})`
      : "";

  const teaches = (user.skillsToTeach || []).slice(0, 4);
  const learns = (user.skillsToLearn || []).slice(0, 4);

  const sendRequest = async () => {
    if (isAlreadySwapper || localIsSent) return;

    try {
      await API.post("/swaps/send", {
        toUser: user._id,
        skillOffered: "React",
        skillRequested: "Node",
      });

      setLocalIsSent(true);
      setSentRequestIds((prev) => [...prev, user._id]);
    } catch (err) {
      console.error("Send request failed:", err);
    }
  };








  const startChat = async (e) => {
    e.stopPropagation()
    const res = await API.post("/chats/find-or-create", {
      receiverId: user._id,
    });
    navigate(`/chat/${res.data._id}`);
  };



  // const startVideo = async () => {
  //   const res = await API.post("/chats/find-or-create", {
  //     receiverId: selectedUser._id,
  //   });
  //   navigate(`/video/${res.data._id}`);
  // };








  return (
    <motion.div
      onClick={() => navigate(`/users/${user._id}`)}
      className="relative group cursor-pointer w-full max-w-[340px] min-h-[22.5rem] 
      rounded-[28px] overflow-hidden transition-all duration-300 hover:-translate-y-1

      bg-white dark:bg-transparent
      border border-grey-200 dark:border-gray-500/20
      shadow-md dark:shadow-[0_22px_50px_rgba(0,0,0,0.45)]"
      
      style={{
        backgroundImage: backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}

      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      
      {/* 🔥 Overlay ONLY in dark mode */}
      <div className="absolute inset-0 hidden dark:block bg-black/40 backdrop-blur-[2px]" />

      <div className="relative z-10 flex h-full flex-col items-center p-3">

        {/* Avatar */}
        <motion.img
          src={avatar}
          alt={user.username || user.name}
          className="w-28 h-28 rounded-full border-4 
          border-gray-300 dark:border-white/30 shadow-lg object-cover"
          whileHover={{ scale: 1.05 }}
        />

        {/* Username */}
        <h2 className="mt-4 text-lg font-bold text-gray-800 dark:text-white">
          @{user.username || user.name}
        </h2>

        {/* Age */}
        <div className="text-xs text-gray-500 dark:text-gray-300">
          {user.age ? `Age: ${user.age}` : "Age not shared"}
        </div>

        {/* Skills */}
        <div className="mt-3 w-full rounded-xl p-3 text-sm

        bg-gray-100 dark:bg-black/20
        border border-gray-200 dark:border-white/10
        text-gray-800 dark:text-white">

          {/* Teaches */}
          <div className="text-xs mb-2 text-gray-500 dark:text-gray-300">
            Teaches
          </div>
          <div className="flex flex-wrap gap-1">
            {teaches.length > 0 ? (
              teaches.map((s) => (
                <span
                  key={s}
                  className="bg-gray-200 dark:bg-white/10 px-2 py-1 rounded-full text-xs"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-gray-400">No skills</span>
            )}
          </div>

          {/* Learns */}
          <div className="text-xs mt-3 mb-1 text-gray-500 dark:text-gray-300">
            Learns
          </div>
          <div className="flex flex-wrap gap-1">
            {learns.length > 0 ? (
              learns.map((s) => (
                <span
                  key={s}
                  className="bg-gray-200 dark:bg-white/10 px-2 py-1 rounded-full text-xs"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-gray-400">No skills</span>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-auto w-full">
          {isAlreadySwapper ? (
            <div className="mt-3 grid grid-cols-1 gap-1">
              <button 
                 onClick={startChat}
               className="flex items-center justify-center gap-2 rounded-xl bg-gray-200 dark:bg-white/10 px-3 py-2 text-sm text-gray-800 dark:text-white">
                <MessageCircle className="w-4 h-4" />
             
                Chat
              </button>
              {/* <button className="flex items-center justify-center gap-2 rounded-xl bg-gray-300 dark:bg-white/10 px-3 py-2 text-sm text-gray-800 dark:text-white">
                <Video className="w-4 h-4" />
                Video
              </button> */}
            </div>
          ) : localIsSent ? (
            <div className="mt-3 text-center text-xs text-yellow-500 dark:text-yellow-300">
              ⏳ Request Sent
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                sendRequest();
              }}
              className="w-full mt-3 rounded-xl px-3 py-2 text-sm font-bold text-white
              bg-pink-800 hover:bg-pink-600 transition"
            >
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 fill-white" />
                Swap Skill
              </div>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}










// import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
// import { useState, useEffect, useRef } from "react";
// import API from "../services/api";
// import { useNavigate } from "react-router-dom";
// import { MessageCircle, Video, Zap, CheckCheck } from "lucide-react";

// const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Syne:wght@400;500;600;700;800&display=swap');`;

// const C = {
//   bg0: "#0D1B2A",
//   bg1: "#1B263B",
//   bg2: "#1e2d40",
//   steel: "#415A77",
//   steelMid: "#527090",
//   white: "#FFFFFF",
//   offWhite: "#E0E1DD",
// };

// export default function SwipeCard({
//   user,
//   isAlreadySwapper,
//   isSent,
//   setSentRequestIds,
// }) {
//   const [sent, setSent] = useState(isSent);
//   const [hov, setHov] = useState(false);
//   const [imgErr, setImgErr] = useState(false);
//   const navigate = useNavigate();
//   const ref = useRef(null);

//   // Reduced tilt intensity (lighter performance)
//   const rawX = useMotionValue(0);
//   const rawY = useMotionValue(0);
//   const rx = useSpring(useTransform(rawY, [-1, 1], [4, -4]), {
//     stiffness: 180,
//     damping: 20,
//   });
//   const ry = useSpring(useTransform(rawX, [-1, 1], [-4, 4]), {
//     stiffness: 180,
//     damping: 20,
//   });

//   const onMove = (e) => {
//     const r = ref.current.getBoundingClientRect();
//     rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
//     rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
//   };

//   const onLeave = () => {
//     rawX.set(0);
//     rawY.set(0);
//     setHov(false);
//   };

//   useEffect(() => {
//     setSent(isSent);
//   }, [isSent]);

//   if (!user) return null;

//   const avatar =
//     imgErr || !user.profilePic
//       ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
//           user.name || user.username || "U"
//         )}&background=1B263B&color=FFFFFF&bold=true`
//       : user.profilePic.startsWith("http")
//       ? user.profilePic
//       : `http://localhost:5000${
//           user.profilePic.startsWith("/") ? "" : "/"
//         }${user.profilePic}`;

//   const teaches = (user.skillsToTeach || []).slice(0, 3);
//   const learns = (user.skillsToLearn || []).slice(0, 3);

//   const handleSwap = async (e) => {
//     e.stopPropagation();
//     if (isAlreadySwapper || sent) return;

//     try {
//       await API.post("/swaps/send", {
//         toUser: user._id,
//         skillOffered: "React",
//         skillRequested: "Node",
//       });
//       setSent(true);
//       setSentRequestIds((p) => [...p, user._id]);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <>
//       <style>{FONTS}</style>

//       <motion.div
//         ref={ref}
//         onClick={() => navigate(`/users/${user._id}`)}
//         onMouseMove={onMove}
//         onMouseEnter={() => setHov(true)}
//         onMouseLeave={onLeave}
//         style={{
//           rotateX: rx,
//           rotateY: ry,
//           width: 280,
//           borderRadius: 18,
//           background: `linear-gradient(160deg, ${C.bg2}, ${C.bg1})`,
//           border: hov
//             ? "1px solid rgba(255,255,255,0.18)"
//             : "1px solid rgba(65,90,119,0.25)",
//           boxShadow: hov
//             ? "0 18px 40px rgba(0,0,0,0.55)"
//             : "0 6px 20px rgba(0,0,0,0.35)",
//           cursor: "pointer",
//           overflow: "hidden",
//           fontFamily: "'Syne', sans-serif",
//           transition: "all 0.25s ease",
//         }}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         {/* Avatar */}
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             padding: "26px 18px 16px",
//           }}
//         >
//           <img
//             src={avatar}
//             alt=""
//             onError={() => setImgErr(true)}
//             style={{
//               width: 80,
//               height: 80,
//               borderRadius: "50%",
//               objectFit: "cover",
//               border: "2px solid rgba(255,255,255,0.08)",
//               marginBottom: 10,
//             }}
//           />

//           <div style={{ textAlign: "center" }}>
//             <div
//               style={{
//                 fontFamily: "'Playfair Display', serif",
//                 fontSize: 18,
//                 fontWeight: 700,
//                 color: C.white,
//               }}
//             >
//               {user.name || user.username}
//             </div>
//             <div
//               style={{
//                 fontSize: 11,
//                 color: C.steelMid,
//                 letterSpacing: "0.08em",
//                 textTransform: "uppercase",
//               }}
//             >
//               @{user.username}
//             </div>
//           </div>
//         </div>

//         {/* Skills */}
//         <div style={{ padding: "10px 16px 16px" }}>
//           <SkillRow label="Teaches" skills={teaches} />
//           <SkillRow label="Learns" skills={learns} />
//         </div>

//         {/* Actions */}
//         <div style={{ padding: "0 14px 16px" }}>
//           {isAlreadySwapper ? (
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
//               <ActionBtn icon={<MessageCircle size={14} />} label="Chat" />
//               <ActionBtn icon={<Video size={14} />} label="Video" />
//             </div>
//           ) : sent ? (
//             <div
//               style={{
//                 height: 42,
//                 borderRadius: 10,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: 6,
//                 background: "rgba(255,255,255,0.04)",
//                 border: "1px solid rgba(65,90,119,0.3)",
//                 color: C.steelMid,
//                 fontSize: 12,
//                 fontWeight: 600,
//               }}
//             >
//               <CheckCheck size={14} />
//               Request Sent
//             </div>
//           ) : (
//             // 🔥 New Dark Premium Swap Button
//             <motion.button
//               onClick={handleSwap}
//               style={{
//                 width: "100%",
//                 height: 44,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: 8,
//                 borderRadius: 10,
//                 border: "1px solid rgba(99,102,241,0.35)",
//                 background: "#1E293B",
//                 color: "#E2E8F0",
//                 fontSize: 12,
//                 fontWeight: 700,
//                 letterSpacing: "0.08em",
//                 textTransform: "uppercase",
//                 cursor: "pointer",
//                 transition: "all 0.2s ease",
//               }}
//               whileHover={{
//                 background: "#273449",
//                 borderColor: "#6366F1",
//                 scale: 1.02,
//               }}
//               whileTap={{ scale: 0.96 }}
//             >
//               <Zap size={14} />
//               Swap Skill
//             </motion.button>
//           )}
//         </div>
//       </motion.div>
//     </>
//   );
// }

// function SkillRow({ label, skills }) {
//   return (
//     <div style={{ marginBottom: 8 }}>
//       <div
//         style={{
//           fontSize: 10,
//           color: "#527090",
//           letterSpacing: "0.12em",
//           textTransform: "uppercase",
//           marginBottom: 4,
//         }}
//       >
//         {label}
//       </div>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
//         {skills.length ? (
//           skills.map((s) => (
//             <span
//               key={s}
//               style={{
//                 fontSize: 11,
//                 padding: "3px 8px",
//                 borderRadius: 20,
//                 background: "rgba(255,255,255,0.05)",
//                 border: "1px solid rgba(255,255,255,0.08)",
//                 color: "#E0E1DD",
//               }}
//             >
//               {s}
//             </span>
//           ))
//         ) : (
//           <span style={{ fontSize: 11, color: "#415A77" }}>—</span>
//         )}
//       </div>
//     </div>
//   );
// }

// function ActionBtn({ icon, label }) {
//   return (
//     <motion.button
//       style={{
//         height: 40,
//         borderRadius: 8,
//         border: "1px solid rgba(65,90,119,0.35)",
//         background: "rgba(65,90,119,0.15)",
//         color: "#E0E1DD",
//         fontSize: 12,
//         fontWeight: 600,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: 6,
//         cursor: "pointer",
//       }}
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//     >
//       {icon}
//       {label}
//     </motion.button>
//   );
// }