// import { useEffect, useState, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { getSocket } from "../services/socket";
// import VideoRoom from "../components/VideoRoom";
// import { useTheme } from "../context/ThemeContext";
// import EmojiPicker from "emoji-picker-react";
// import API from "../services/api";

// /* ─────────────── STYLES ─────────────── */
// const STYLES = `
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

// .ch *{box-sizing:border-box}
// .ch{font-family:'Inter',sans-serif}

// :root{
//   --ch-bg:#0a0a0f;
//   --ch-surf:#111118;
//   --ch-surf2:#18181f;
//   --ch-border:rgba(255,255,255,0.07);
//   --ch-border2:rgba(255,255,255,0.12);
//   --ch-text:#f0eeff;
//   --ch-muted:rgba(240,238,255,0.38);
//   --ch-accent:#7c6aff;
//   --ch-accent2:#a78bfa;
//   --ch-green:#22c55e;
//   --ch-red:#ef4444;
//   --ch-mono:'JetBrains Mono',monospace;
// }

// .ch-msgs::-webkit-scrollbar{width:2px}
// .ch-msgs::-webkit-scrollbar-thumb{background:rgba(124,106,255,0.2);border-radius:99px}
// .ch-msgs{scrollbar-width:thin;scrollbar-color:rgba(124,106,255,0.15) transparent}

// .ch-field{
//   width:100%;padding:10px 16px;border-radius:13px;
//   background:var(--ch-surf2);border:1px solid var(--ch-border2);
//   color:var(--ch-text);font-size:14px;font-family:'Inter',sans-serif;
//   outline:none;transition:border-color .15s,box-shadow .15s;
//   line-height:1.5;
// }
// .ch-field::placeholder{color:rgba(255,255,255,0.2)}
// .ch-field:focus{border-color:rgba(124,106,255,0.45);box-shadow:0 0 0 3px rgba(124,106,255,0.08)}
// .ch-field:disabled{opacity:.4}

// .ch-icon-btn{
//   flex-shrink:0;width:40px;height:40px;border-radius:11px;
//   background:var(--ch-surf2);border:1px solid var(--ch-border2);
//   display:flex;align-items:center;justify-content:center;
//   cursor:pointer;color:var(--ch-muted);transition:all .15s;
// }
// .ch-icon-btn:hover{background:rgba(124,106,255,0.12);color:var(--ch-accent2);border-color:rgba(124,106,255,0.25)}
// .ch-icon-btn:active{transform:scale(.93)}
// .ch-icon-btn.active{background:rgba(124,106,255,0.14);color:var(--ch-accent2);border-color:rgba(124,106,255,0.28)}
// .ch-icon-btn.rec{background:rgba(239,68,68,0.1);color:#f87171;border-color:rgba(239,68,68,0.22);animation:ch-recpulse 1.1s ease infinite}

// .ch-send{
//   flex-shrink:0;width:40px;height:40px;border-radius:11px;border:none;
//   background:linear-gradient(135deg,#7c6aff,#a78bfa);
//   display:flex;align-items:center;justify-content:center;color:#fff;
//   cursor:pointer;box-shadow:0 3px 14px rgba(124,106,255,0.35);
//   transition:transform .12s,box-shadow .15s;position:relative;overflow:hidden;
// }
// .ch-send::before{
//   content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;
//   background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
//   transform:skewX(-20deg);transition:left .4s ease;
// }
// .ch-send:hover::before{left:150%}
// .ch-send:hover{transform:scale(1.06);box-shadow:0 5px 18px rgba(124,106,255,0.45)}
// .ch-send:active{transform:scale(.93)}

// .ch-bubble{transition:transform .12s}
// .ch-bubble:hover{transform:scale(1.012)}

// .ch-unsend{
//   font-family:var(--ch-mono);font-size:9.5px;letter-spacing:.04em;
//   padding:2px 8px;border-radius:5px;cursor:pointer;
//   background:rgba(239,68,68,0.12);color:rgba(252,165,165,0.8);
//   border:1px solid rgba(239,68,68,0.18);transition:background .12s;
// }
// .ch-unsend:hover{background:rgba(239,68,68,0.22)}

// @keyframes ch-bounce{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-7px);opacity:1}}
// @keyframes ch-online{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}60%{box-shadow:0 0 0 5px rgba(34,197,94,0)}}
// @keyframes ch-recpulse{0%,100%{opacity:1}50%{opacity:.4}}
// @keyframes ch-blob{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(26px,-40px) scale(1.07)}66%{transform:translate(-16px,18px) scale(.94)}}
// @keyframes ch-waveanim{0%,100%{height:4px}50%{height:18px}}
// `;

// /* ─────────────── ICONS ─────────────── */
// const IconArrow = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M19 12H5M12 5l-7 7 7 7"/>
//   </svg>
// );
// const IconVideo = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//     <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
//   </svg>
// );
// const IconEmoji = () => (
//   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
//   </svg>
// );
// const IconMic = ({ active }) => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#f87171" : "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
//     <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
//     <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
//   </svg>
// );
// const IconSend = () => (
//   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//     <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
//   </svg>
// );
// const IconPlay = () => (
//   <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
// );
// const IconPause = () => (
//   <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
// );

// const WAVE = [4,8,14,6,18,10,5,16,9,20,7,13,4,17,8,12,5,15,9,6,11,7];

// /* ─────────────── COMPONENT ─────────────── */
// export default function Chat() {
//   const { chatId } = useParams();
//   const socket = getSocket();
//   const navigate = useNavigate();
//   const { dark } = useTheme();

//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [videoOpen, setVideoOpen] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [hoveredMessageId, setHoveredMessageId] = useState(null);
//   const [otherUserName, setOtherUserName] = useState("");
//   const [otherUserId, setOtherUserId] = useState(null);
//   const [otherUserLastSeen, setOtherUserLastSeen] = useState(null);
//   const [isOnline, setIsOnline] = useState(true);
//   const [playingAudioId, setPlayingAudioId] = useState(null);
//   const [interactionBlocked, setInteractionBlocked] = useState(false);
//   const [showEmoji, setShowEmoji] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);

//   const bottomRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const typingIndicatorTimeoutRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const recordingIntervalRef = useRef(null);
//   const audioRefs = useRef({});

//   const onEmojiClick = (emojiData) => setText((p) => p + emojiData.emoji);
//   const myId = JSON.parse(atob(window.localStorage.getItem("token").split(".")[1])).id;
//   const userBg = window.localStorage.getItem("chat_bg");

//   useEffect(() => {
//     if (!chatId) return;
//     socket.emit("joinChat", chatId);
//     const handler = (msg) => {
//       if (!msg || msg.chatId !== chatId) return;
//       setMessages((prev) => {
//         const idx = prev.findIndex((m) => m._id === msg._id);
//         if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], ...msg }; return u; }
//         return [...prev, msg];
//       });
//     };
//     const statusHandler = ({ chatId: sc, messageIds, messageId, status }) => {
//       if (sc !== chatId) return;
//       const ids = messageIds || (messageId ? [messageId] : []);
//       if (!ids.length) return;
//       setMessages((p) => p.map((m) => (ids.includes(m._id) ? { ...m, status } : m)));
//     };
//     const typingHandler = ({ chatId: tc, userId: tu }) => {
//       if (tc !== chatId || tu === myId) return;
//       setIsTyping(true);
//       clearTimeout(typingIndicatorTimeoutRef.current);
//       typingIndicatorTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
//     };
//     const stopTypingHandler = ({ chatId: tc, userId: tu }) => {
//       if (tc !== chatId || tu === myId) return;
//       setIsTyping(false);
//       clearTimeout(typingIndicatorTimeoutRef.current);
//     };
//     const messageDeletedHandler = ({ chatId: dc, messageId }) => {
//       if (dc !== chatId) return;
//       setMessages((p) => p.filter((m) => m._id !== messageId));
//     };
//     socket.on("receiveMessage", handler);
//     socket.on("messageStatusUpdate", statusHandler);
//     socket.on("typing", typingHandler);
//     socket.on("stopTyping", stopTypingHandler);
//     socket.on("messageDeleted", messageDeletedHandler);
//     return () => {
//       socket.off("receiveMessage", handler);
//       socket.off("messageStatusUpdate", statusHandler);
//       socket.off("typing", typingHandler);
//       socket.off("stopTyping", stopTypingHandler);
//       socket.off("messageDeleted", messageDeletedHandler);
//       clearTimeout(typingIndicatorTimeoutRef.current);
//     };
//   }, [chatId, socket, myId]);

//   useEffect(() => {
//     fetch(`http://localhost:5000/api/messages/${chatId}`, {
//       headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` },
//     }).then((r) => r.json()).then((d) => setMessages(d.filter((m) => !m.isDeleted)));
//   }, [chatId]);

//   useEffect(() => {
//     if (!chatId) return;
//     const token = window.localStorage.getItem("token");
//     if (!token) return;
//     (async () => {
//       try {
//         const res = await fetch("http://localhost:5000/api/chats", { headers: { Authorization: `Bearer ${token}` } });
//         if (!res.ok) return;
//         const chats = await res.json();
//         const chat = chats.find((c) => c._id === chatId || c.id === chatId);
//         if (!chat) return;
//         const other = Array.isArray(chat.members) ? chat.members.find((m) => String(m._id || m) !== String(myId)) : null;
//         setOtherUserId(other?._id || other);
//         setOtherUserName(other?.name || other?.username || other?.displayName || "Unknown");
//       } catch (err) { console.error(err); }
//     })();
//   }, [chatId, myId]);

//   useEffect(() => {
//     if (!otherUserId) return;
//     const token = window.localStorage.getItem("token");
//     if (!token) return;
//     (async () => {
//       try {
//         const res = await fetch(`http://localhost:5000/api/users/${otherUserId}`, { headers: { Authorization: `Bearer ${token}` } });
//         if (!res.ok) return;
//         const user = await res.json();
//         if (user.lastSeen) setOtherUserLastSeen(user.lastSeen);
//         if (user.name) setOtherUserName(user.name);
//         setIsOnline(false);
//       } catch (err) { console.error(err); }
//     })();
//   }, [otherUserId]);

//   useEffect(() => {
//     if (!otherUserId) return;
//     API.get(`/reports/check/${otherUserId}`).then((r) => { if (r.data?.blocked) setInteractionBlocked(true); }).catch(() => {});
//   }, [otherUserId]);

//   useEffect(() => {
//     if (!otherUserId) return;
//     const onOnline = ({ userId }) => { if (String(userId) === String(otherUserId)) setIsOnline(true); };
//     const onOffline = ({ userId, lastSeen }) => { if (String(userId) === String(otherUserId)) { setIsOnline(false); if (lastSeen) setOtherUserLastSeen(lastSeen); } };
//     socket.on("userOnline", onOnline);
//     socket.on("userOffline", onOffline);
//     return () => { socket.off("userOnline", onOnline); socket.off("userOffline", onOffline); };
//   }, [socket, otherUserId]);

//   const formatLastSeen = (iso) => {
//     if (!iso) return "offline";
//     const d = new Date(iso), now = new Date();
//     const yest = new Date(now); yest.setDate(now.getDate() - 1);
//     const t = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
//     if (d.toDateString() === now.toDateString()) return `last seen today at ${t}`;
//     if (d.toDateString() === yest.toDateString()) return `last seen yesterday at ${t}`;
//     return `last seen on ${d.toLocaleDateString()} at ${t}`;
//   };

//   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

//   useEffect(() => {
//     if (!text.trim()) { socket.emit("stopTyping", { chatId }); return; }
//     socket.emit("typing", { chatId });
//     clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = setTimeout(() => socket.emit("stopTyping", { chatId }), 1500);
//     return () => clearTimeout(typingTimeoutRef.current);
//   }, [text, chatId, socket]);

//   const sendMessage = () => {
//     const msg = text.trim();
//     if (!msg || interactionBlocked) return;
//     socket.emit("sendMessage", { chatId, senderId: myId, text: msg });
//     setText(""); setShowEmoji(false);
//   };

//   const unsendMessage = (messageId) => socket.emit("unsendMessage", { chatId, messageId });
//   const formatTime = (date) => new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

//   const startRecording = async () => {
//     if (interactionBlocked) return;
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       let mimeType = "audio/mpeg";
//       if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/wav";
//       if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/webm";
//       mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
//       audioChunksRef.current = [];
//       mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
//       mediaRecorderRef.current.onstop = async () => {
//         const blob = new Blob(audioChunksRef.current, { type: mimeType });
//         await sendVoiceMessage(blob);
//         stream.getTracks().forEach((t) => t.stop());
//       };
//       mediaRecorderRef.current.start();
//       setIsRecording(true); setRecordingTime(0);
//       recordingIntervalRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
//     } catch (err) { console.error(err); alert("Could not access microphone."); }
//   };

//   const stopRecording = () => {
//     if (!isRecording) return;
//     mediaRecorderRef.current?.stop();
//     setIsRecording(false);
//     clearInterval(recordingIntervalRef.current);
//   };

//   const sendVoiceMessage = async (blob) => {
//     if (interactionBlocked) return;
//     try {
//       const fd = new FormData();
//       fd.append("voice", blob, "voice-message.wav");
//       fd.append("chatId", chatId);
//       const res = await fetch("http://localhost:5000/api/messages/upload", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` },
//         body: fd,
//       });
//       if (res.ok) {
//         const msg = await res.json();
//         socket.emit("sendMessage", { chatId, type: "voice", audioUrl: msg.audioUrl });
//       } else {
//         const t = await res.text();
//         alert(`Upload failed: ${res.status} - ${t}`);
//       }
//     } catch (err) { alert(`Upload error: ${err.message}`); }
//   };

//   const playVoiceMessage = async (messageId, audioUrl) => {
//     if (playingAudioId === messageId) {
//       const a = audioRefs.current[messageId];
//       if (a) { a.pause(); a.currentTime = 0; }
//       setPlayingAudioId(null); return;
//     }
//     if (playingAudioId && audioRefs.current[playingAudioId]) {
//       const a = audioRefs.current[playingAudioId]; a.pause(); a.currentTime = 0;
//     }
//     try {
//       const src = audioUrl.startsWith("http") ? audioUrl : `http://localhost:5000${audioUrl.startsWith("/") ? "" : "/"}${audioUrl}`;
//       let a = audioRefs.current[messageId];
//       if (!a) { a = new Audio(src); audioRefs.current[messageId] = a; } else { a.src = src; }
//       a.onended = () => setPlayingAudioId(null);
//       a.onerror = () => { setPlayingAudioId(null); alert("Unable to play audio."); };
//       setPlayingAudioId(messageId);
//       await a.play();
//     } catch (err) { console.error(err); setPlayingAudioId(null); }
//   };

//   const initials = otherUserName ? otherUserName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?";

//   const Tick = ({ status }) => {
//     const s = { fontFamily: "'JetBrains Mono',monospace", fontSize: 11 };
//     if (status === "seen") return <span style={{ ...s, color: "#fbbf24" }}>✓✓</span>;
//     if (status === "delivered") return <span style={{ ...s, color: "rgba(255,255,255,0.3)" }}>✓✓</span>;
//     return <span style={{ ...s, color: "rgba(255,255,255,0.18)" }}>✓</span>;
//   };

//   return (
//     <>
//       <style>{STYLES}</style>
//       <div className="ch" style={{
//         height: "100dvh", width: "100%", display: "flex", flexDirection: "column",
//         position: "relative", overflow: "hidden", background: "var(--ch-bg)",
//       }}>
//         {/* BG */}
//         <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
//           <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 55% at 50% -5%, #12101e 0%, #0a0a0f 60%)" }} />
//           {[
//             { top: "-8%", left: "-6%", w: 500, c: "rgba(124,106,255,0.055)", delay: "0s" },
//             { top: "55%", right: "-8%", w: 440, c: "rgba(167,139,250,0.04)", delay: "2s" },
//             { top: "35%", left: "32%", w: 360, c: "rgba(236,72,153,0.03)", delay: "4s" },
//           ].map((b, i) => (
//             <div key={i} style={{
//               position: "absolute", top: b.top, left: b.left, right: b.right,
//               width: b.w, height: b.w, borderRadius: "50%",
//               background: `radial-gradient(circle, ${b.c} 0%, transparent 68%)`,
//               animation: `ch-blob ${8 + i}s ease infinite`,
//               animationDelay: b.delay,
//             }} />
//           ))}
//           <div style={{
//             position: "absolute", inset: 0, opacity: 0.018,
//             backgroundImage: "linear-gradient(rgba(124,106,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(124,106,255,1) 1px,transparent 1px)",
//             backgroundSize: "52px 52px",
//           }} />
//         </div>

//         {/* HEADER */}
//         <motion.div
//           initial={{ y: -64, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.34, ease: "easeOut" }}
//           style={{
//             position: "relative", zIndex: 10, flexShrink: 0,
//             padding: "12px 16px",
//             background: "rgba(10,10,15,0.92)",
//             backdropFilter: "blur(24px)",
//             borderBottom: "1px solid var(--ch-border)",
//           }}
//         >
//           <div style={{
//             position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
//             background: "linear-gradient(90deg,transparent,rgba(124,106,255,0.45),rgba(167,139,250,0.3),transparent)",
//           }} />
//           <div style={{ display: "flex", alignItems: "center", gap: 11, maxWidth: 860, margin: "0 auto" }}>
//             <button className="ch-icon-btn" onClick={() => navigate("/chats")} style={{ background: "none", border: "1px solid var(--ch-border2)" }}>
//               <IconArrow />
//             </button>
//             <div style={{ position: "relative", flexShrink: 0 }}>
//               <div style={{
//                 width: 42, height: 42, borderRadius: 13,
//                 background: "linear-gradient(135deg,#7c6aff,#ec4899)",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 fontWeight: 600, fontSize: 14, color: "#fff", letterSpacing: "-0.02em",
//                 boxShadow: "0 0 0 2px rgba(124,106,255,0.22)",
//               }}>
//                 {initials}
//               </div>
//               <div style={{
//                 position: "absolute", bottom: -1, right: -1,
//                 width: 10, height: 10, borderRadius: "50%",
//                 background: isOnline ? "var(--ch-green)" : "#4b5563",
//                 border: "2px solid var(--ch-bg)",
//                 animation: isOnline ? "ch-online 2.8s ease infinite" : "none",
//               }} />
//             </div>
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ch-text)", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                 {otherUserName}
//               </div>
//               <AnimatePresence mode="wait">
//                 {isTyping ? (
//                   <motion.div key="t" initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//                     style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
//                     {[0, 0.18, 0.36].map((d, i) => (
//                       <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ch-accent2)", animation: `ch-bounce .9s ease infinite`, animationDelay: `${d}s` }} />
//                     ))}
//                     <span style={{ fontSize: 11.5, color: "var(--ch-accent2)", fontFamily: "var(--ch-mono)", letterSpacing: "0.02em" }}>typing</span>
//                   </motion.div>
//                 ) : (
//                   <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//                     style={{ fontSize: 11.5, color: isOnline ? "var(--ch-green)" : "rgba(255,255,255,0.28)", fontFamily: "var(--ch-mono)", letterSpacing: "0.02em", marginTop: 2 }}>
//                     {isOnline ? "online" : formatLastSeen(otherUserLastSeen)}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//             <button
//               className="ch-icon-btn"
//               onClick={() => { if (!interactionBlocked) setVideoOpen(true); }}
//               disabled={interactionBlocked}
//               style={{ opacity: interactionBlocked ? 0.35 : 1, cursor: interactionBlocked ? "not-allowed" : "pointer" }}
//               title={interactionBlocked ? "Interaction blocked" : "Video call"}
//             >
//               <IconVideo />
//             </button>
//           </div>
//         </motion.div>

//         {/* MESSAGES */}
//         <div className="ch-msgs" style={{ position: "relative", zIndex: 10, flex: 1, overflowY: "auto", padding: "20px 16px" }}>
//           <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 4 }}>
//             <AnimatePresence mode="popLayout">
//               {messages.map((m) => {
//                 if (m.isDeleted) return null;
//                 const isMine = String(m.sender) === String(myId);
//                 const status = m.status || "sent";
//                 const hovered = hoveredMessageId === m._id;
//                 return (
//                   <motion.div key={m._id}
//                     initial={{ opacity: 0, y: 14, scale: 0.96 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.84, transition: { duration: 0.16 } }}
//                     transition={{ type: "spring", stiffness: 480, damping: 30 }}
//                     style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}
//                     onMouseEnter={() => setHoveredMessageId(m._id)}
//                     onMouseLeave={() => setHoveredMessageId(null)}
//                   >
//                     <div style={{ display: "flex", flexDirection: "column", maxWidth: "min(72%, 480px)" }}>
//                       <div className="ch-bubble" style={{
//                         padding: m.type === "voice" ? "10px 14px" : "10px 15px",
//                         borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
//                         ...(isMine ? {
//                           background: "linear-gradient(135deg,#7c6aff,#a78bfa)",
//                           color: "#fff",
//                           boxShadow: "0 3px 16px rgba(124,106,255,0.28)",
//                         } : {
//                           background: "var(--ch-surf2)",
//                           border: "1px solid var(--ch-border2)",
//                           color: "var(--ch-text)",
//                           boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
//                         }),
//                       }}>
//                         {m.type === "voice" ? (
//                           <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
//                             <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//                               onClick={() => playVoiceMessage(m._id, m.audioUrl)}
//                               style={{
//                                 flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
//                                 background: isMine ? "rgba(0,0,0,0.18)" : "rgba(124,106,255,0.18)",
//                                 border: `1px solid ${isMine ? "rgba(255,255,255,0.2)" : "rgba(124,106,255,0.3)"}`,
//                                 display: "flex", alignItems: "center", justifyContent: "center",
//                                 cursor: "pointer", color: isMine ? "#fff" : "var(--ch-accent2)",
//                               }}>
//                               {playingAudioId === m._id ? <IconPause /> : <IconPlay />}
//                             </motion.button>
//                             <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, height: 26 }}>
//                               {WAVE.map((h, i) => (
//                                 <div key={i} style={{
//                                   width: 3, borderRadius: 99,
//                                   background: isMine ? "rgba(255,255,255,0.5)" : "rgba(124,106,255,0.5)",
//                                   height: playingAudioId === m._id ? undefined : h + "px",
//                                   animation: playingAudioId === m._id ? `ch-waveanim ${0.38 + (i % 4) * 0.09}s ease infinite alternate` : "none",
//                                   animationDelay: `${i * 0.035}s`,
//                                 }} />
//                               ))}
//                             </div>
//                             <span style={{ fontSize: 10.5, fontFamily: "var(--ch-mono)", opacity: 0.6 }}>
//                               0:{String(recordingTime).padStart(2, "0")}
//                             </span>
//                           </div>
//                         ) : (
//                           <p style={{ margin: 0, fontSize: 14, lineHeight: 1.57, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
//                             {m.text}
//                           </p>
//                         )}
//                       </div>
//                       <motion.div
//                         initial={false}
//                         animate={{ opacity: hovered ? 1 : 0, height: hovered ? "auto" : 0 }}
//                         style={{
//                           overflow: "hidden", display: "flex", alignItems: "center", gap: 7,
//                           marginTop: 3, paddingInline: 5,
//                           justifyContent: isMine ? "flex-end" : "flex-start",
//                         }}
//                       >
//                         <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontFamily: "var(--ch-mono)", letterSpacing: "0.02em" }}>
//                           {formatTime(m.createdAt)}
//                         </span>
//                         {isMine && (<><Tick status={status} /><button className="ch-unsend" onClick={() => unsendMessage(m._id)}>unsend</button></>)}
//                       </motion.div>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </AnimatePresence>

//             <AnimatePresence>
//               {isTyping && (
//                 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
//                   style={{ display: "flex", justifyContent: "flex-start" }}>
//                   <div style={{
//                     padding: "11px 15px", borderRadius: "18px 18px 18px 4px",
//                     background: "var(--ch-surf2)", border: "1px solid var(--ch-border2)",
//                     display: "flex", alignItems: "center", gap: 5,
//                   }}>
//                     {[0, 0.18, 0.36].map((d, i) => (
//                       <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ch-accent2)", animation: `ch-bounce .9s ease infinite`, animationDelay: `${d}s` }} />
//                     ))}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <div ref={bottomRef} />
//           </div>
//         </div>

//         {/* INPUT */}
//         <motion.div style={{
//           position: "relative", zIndex: 10, flexShrink: 0,
//           padding: "12px 16px 16px",
//           background: "rgba(10,10,15,0.92)",
//           backdropFilter: "blur(24px)",
//           borderTop: "1px solid var(--ch-border)",
//           opacity: interactionBlocked ? 0.5 : 1,
//           pointerEvents: interactionBlocked ? "none" : "auto",
//         }}>
//           <div style={{
//             position: "absolute", top: 0, left: 0, right: 0, height: 1,
//             background: "linear-gradient(90deg,transparent,rgba(124,106,255,0.22),transparent)",
//           }} />
//           {interactionBlocked && (
//             <div style={{
//               textAlign: "center", fontSize: 12, color: "rgba(252,165,165,0.7)",
//               fontFamily: "var(--ch-mono)", letterSpacing: "0.04em", marginBottom: 8,
//               padding: "7px 12px", background: "rgba(239,68,68,0.07)",
//               borderRadius: 9, border: "1px solid rgba(239,68,68,0.14)",
//             }}>
//               🚫 You can no longer interact with this user.
//             </div>
//           )}
//           <div style={{ maxWidth: 820, margin: "0 auto" }}>
//             <AnimatePresence>
//               {isRecording && (
//                 <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
//                   style={{
//                     display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
//                     padding: "8px 14px", borderRadius: 10, marginBottom: 10,
//                     background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
//                   }}>
//                   <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ch-red)", animation: "ch-recpulse 1.1s ease infinite" }} />
//                   <span style={{ fontSize: 11.5, fontFamily: "var(--ch-mono)", letterSpacing: "0.05em", color: "rgba(252,165,165,0.8)" }}>
//                     rec {recordingTime}s — release to send
//                   </span>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//             <div style={{ display: "flex", alignItems: "flex-end", gap: 8, position: "relative" }}>
//               <button className={`ch-icon-btn${showEmoji ? " active" : ""}`} onClick={() => setShowEmoji((p) => !p)}>
//                 <IconEmoji />
//               </button>
//               <AnimatePresence>
//                 {showEmoji && (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0.88, y: 12 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.88, y: 12 }}
//                     style={{ position: "absolute", bottom: 56, left: 0, zIndex: 50 }}
//                   >
//                     <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} emojiStyle="native" />
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//               <input
//                 className="ch-field"
//                 disabled={interactionBlocked || isRecording}
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//                 placeholder="Write a message…"
//                 onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
//               />
//               <button
//                 className={`ch-icon-btn${isRecording ? " rec" : ""}`}
//                 onMouseDown={startRecording}
//                 onMouseUp={stopRecording}
//                 onMouseLeave={stopRecording}
//                 onTouchStart={startRecording}
//                 onTouchEnd={stopRecording}
//               >
//                 <IconMic active={isRecording} />
//               </button>
//               <AnimatePresence>
//                 {text.trim() && (
//                   <motion.button
//                     className="ch-send"
//                     initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
//                     animate={{ opacity: 1, scale: 1, rotate: 0 }}
//                     exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
//                     onClick={sendMessage}
//                   >
//                     <IconSend />
//                   </motion.button>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </motion.div>

//         <AnimatePresence>
//           {videoOpen && <VideoRoom isCaller={true} onClose={() => setVideoOpen(false)} />}
//         </AnimatePresence>
//       </div>
//     </>
//   );
// }

















import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "../services/socket";
import VideoRoom from "../components/VideoRoom";
import { useTheme } from "../context/ThemeContext";
import EmojiPicker from "emoji-picker-react";
import API from "../services/api";

/* ─────────────── STYLES ─────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

.ch *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
.ch{font-family:'Inter',sans-serif;}

:root{
  --ch-bg:#0a0a0f;
  --ch-surf:#111118;
  --ch-surf2:#18181f;
  --ch-border:rgba(255,255,255,0.07);
  --ch-border2:rgba(255,255,255,0.12);
  --ch-text:#f0eeff;
  --ch-muted:rgba(240,238,255,0.38);
  --ch-accent:#7c6aff;
  --ch-accent2:#a78bfa;
  --ch-green:#22c55e;
  --ch-red:#ef4444;
  --ch-mono:'JetBrains Mono',monospace;
  --ch-header-h:60px;
  --ch-input-h:64px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-top: env(safe-area-inset-top, 0px);
}

/* ── scrollbar ── */
.ch-msgs::-webkit-scrollbar{width:2px}
.ch-msgs::-webkit-scrollbar-thumb{background:rgba(124,106,255,0.2);border-radius:99px}
.ch-msgs{scrollbar-width:thin;scrollbar-color:rgba(124,106,255,0.15) transparent}

/* ── field ── */
.ch-field{
  width:100%;padding:10px 14px;border-radius:22px;
  background:var(--ch-surf2);border:1px solid var(--ch-border2);
  color:var(--ch-text);font-size:15px;font-family:'Inter',sans-serif;
  outline:none;transition:border-color .15s,box-shadow .15s;
  line-height:1.5; resize:none; max-height:100px; overflow-y:auto;
}
.ch-field::placeholder{color:rgba(255,255,255,0.22)}
.ch-field:focus{border-color:rgba(124,106,255,0.5);box-shadow:0 0 0 3px rgba(124,106,255,0.1)}
.ch-field:disabled{opacity:.4}

/* ── icon buttons ── */
.ch-icon-btn{
  flex-shrink:0;width:38px;height:38px;border-radius:50%;
  background:var(--ch-surf2);border:1px solid var(--ch-border2);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--ch-muted);transition:all .15s;
  -webkit-user-select:none;user-select:none;
}
.ch-icon-btn:hover{background:rgba(124,106,255,0.12);color:var(--ch-accent2);border-color:rgba(124,106,255,0.3)}
.ch-icon-btn:active{transform:scale(.88)}
.ch-icon-btn.active{background:rgba(124,106,255,0.16);color:var(--ch-accent2);border-color:rgba(124,106,255,0.3)}
.ch-icon-btn.rec{background:rgba(239,68,68,0.12);color:#f87171;border-color:rgba(239,68,68,0.25);animation:ch-recpulse 1.1s ease infinite}

/* ── send button ── */
.ch-send{
  flex-shrink:0;width:38px;height:38px;border-radius:50%;border:none;
  background:linear-gradient(135deg,#7c6aff,#a78bfa);
  display:flex;align-items:center;justify-content:center;color:#fff;
  cursor:pointer;box-shadow:0 2px 12px rgba(124,106,255,0.4);
  transition:transform .12s,box-shadow .15s;position:relative;overflow:hidden;
}
.ch-send:hover{transform:scale(1.08);box-shadow:0 4px 18px rgba(124,106,255,0.5)}
.ch-send:active{transform:scale(.88)}

.ch-bubble{transition:transform .1s}
.ch-bubble:active{transform:scale(0.98)}

.ch-unsend{
  font-family:var(--ch-mono);font-size:9px;letter-spacing:.04em;
  padding:2px 7px;border-radius:5px;cursor:pointer;
  background:rgba(239,68,68,0.12);color:rgba(252,165,165,0.85);
  border:1px solid rgba(239,68,68,0.2);transition:background .12s;
}
.ch-unsend:hover{background:rgba(239,68,68,0.24)}

/* ── incoming call overlay ── */
.ch-call-overlay{
  position:fixed;inset:0;z-index:200;
  display:flex;align-items:center;justify-content:center;
  background:rgba(0,0,0,0.82);backdrop-filter:blur(18px);
}
.ch-call-card{
  background:var(--ch-surf2);border:1px solid var(--ch-border2);
  border-radius:24px;padding:36px 28px;text-align:center;
  width:min(320px,90vw);box-shadow:0 20px 60px rgba(0,0,0,0.5);
}
.ch-call-accept{
  padding:13px 28px;border-radius:50px;border:none;cursor:pointer;
  background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;
  font-size:14px;font-weight:600;font-family:'Inter',sans-serif;
  box-shadow:0 4px 16px rgba(34,197,94,0.35);transition:transform .12s;
}
.ch-call-accept:active{transform:scale(.94)}
.ch-call-reject{
  padding:13px 28px;border-radius:50px;border:none;cursor:pointer;
  background:rgba(239,68,68,0.15);color:#f87171;
  font-size:14px;font-weight:600;font-family:'Inter',sans-serif;
  border:1px solid rgba(239,68,68,0.25);transition:transform .12s;
}
.ch-call-reject:active{transform:scale(.94)}

/* ── animations ── */
@keyframes ch-bounce{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-6px);opacity:1}}
@keyframes ch-online{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}60%{box-shadow:0 0 0 5px rgba(34,197,94,0)}}
@keyframes ch-recpulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes ch-blob{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(26px,-40px) scale(1.07)}66%{transform:translate(-16px,18px) scale(.94)}}
@keyframes ch-waveanim{0%,100%{height:4px}50%{height:18px}}
@keyframes ch-ring{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}
`;

/* ─────────────── ICONS ─────────────── */
const IconArrow = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
const IconVideo = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconEmoji = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const IconMic = ({ active }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={active ? "#f87171" : "currentColor"} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconPlay = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const IconPause = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
);
const IconPhone = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const WAVE = [4,8,14,6,18,10,5,16,9,20,7,13,4,17,8,12,5,15,9,6,11,7];

/* ─────────────── COMPONENT ─────────────── */
export default function Chat() {
  const { chatId } = useParams();
  const socket = getSocket();
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUserId, setOtherUserId] = useState(null);
  const [otherUserLastSeen, setOtherUserLastSeen] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [interactionBlocked, setInteractionBlocked] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  // ── VIDEO CALL FIX: incoming call state ──
  const [incomingCall, setIncomingCall] = useState(null); // { callerId, callerName, roomId }
  const [isCallerRole, setIsCallerRole] = useState(false);
  const [callRoomId, setCallRoomId] = useState(null);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingIndicatorTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioRefs = useRef({});

  const onEmojiClick = (emojiData) => {
    setText((p) => p + emojiData.emoji);
  };

  const myId = JSON.parse(atob(window.localStorage.getItem("token").split(".")[1])).id;

  /* ── socket listeners ── */
  useEffect(() => {
    if (!chatId) return;
    socket.emit("joinChat", chatId);

    const handler = (msg) => {
      if (!msg || msg.chatId !== chatId) return;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m._id === msg._id);
        if (idx >= 0) {
          const u = [...prev];
          u[idx] = { ...u[idx], ...msg };
          return u;
        }
        return [...prev, msg];
      });
    };

    const statusHandler = ({ chatId: sc, messageIds, messageId, status }) => {
      if (sc !== chatId) return;
      const ids = messageIds || (messageId ? [messageId] : []);
      if (!ids.length) return;
      setMessages((p) => p.map((m) => (ids.includes(m._id) ? { ...m, status } : m)));
    };

    const typingHandler = ({ chatId: tc, userId: tu }) => {
      if (tc !== chatId || tu === myId) return;
      setIsTyping(true);
      clearTimeout(typingIndicatorTimeoutRef.current);
      typingIndicatorTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    };

    const stopTypingHandler = ({ chatId: tc, userId: tu }) => {
      if (tc !== chatId || tu === myId) return;
      setIsTyping(false);
      clearTimeout(typingIndicatorTimeoutRef.current);
    };

    const messageDeletedHandler = ({ chatId: dc, messageId }) => {
      if (dc !== chatId) return;
      setMessages((p) => p.filter((m) => m._id !== messageId));
    };

    // ── VIDEO CALL FIX: listen for incoming call ──
    const incomingCallHandler = ({ callerId, callerName, roomId, targetChatId }) => {
      // Only handle if it's for this chat
      if (targetChatId && targetChatId !== chatId) return;
      if (String(callerId) === String(myId)) return; // ignore own emit
      setIncomingCall({ callerId, callerName: callerName || "Someone", roomId });
    };

    const callEndedHandler = ({ roomId }) => {
      if (incomingCall?.roomId === roomId || callRoomId === roomId) {
        setIncomingCall(null);
        setVideoOpen(false);
        setCallRoomId(null);
      }
    };

    socket.on("receiveMessage", handler);
    socket.on("messageStatusUpdate", statusHandler);
    socket.on("typing", typingHandler);
    socket.on("stopTyping", stopTypingHandler);
    socket.on("messageDeleted", messageDeletedHandler);
    socket.on("incomingCall", incomingCallHandler);
    socket.on("callEnded", callEndedHandler);

    return () => {
      socket.off("receiveMessage", handler);
      socket.off("messageStatusUpdate", statusHandler);
      socket.off("typing", typingHandler);
      socket.off("stopTyping", stopTypingHandler);
      socket.off("messageDeleted", messageDeletedHandler);
      socket.off("incomingCall", incomingCallHandler);
      socket.off("callEnded", callEndedHandler);
      clearTimeout(typingIndicatorTimeoutRef.current);
    };
  }, [chatId, socket, myId, incomingCall, callRoomId]);

  /* ── fetch messages ── */
  useEffect(() => {
    fetch(`http://localhost:5000/api/messages/${chatId}`, {
      headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((d) => setMessages(d.filter((m) => !m.isDeleted)));
  }, [chatId]);

  /* ── fetch chat members ── */
  useEffect(() => {
    if (!chatId) return;
    const token = window.localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/chats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const chats = await res.json();
        const chat = chats.find((c) => c._id === chatId || c.id === chatId);
        if (!chat) return;
        const other = Array.isArray(chat.members)
          ? chat.members.find((m) => String(m._id || m) !== String(myId))
          : null;
        setOtherUserId(other?._id || other);
        setOtherUserName(other?.name || other?.username || other?.displayName || "Unknown");
      } catch (err) {
        console.error(err);
      }
    })();
  }, [chatId, myId]);

  /* ── fetch other user profile ── */
  useEffect(() => {
    if (!otherUserId) return;
    const token = window.localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const user = await res.json();
        if (user.lastSeen) setOtherUserLastSeen(user.lastSeen);
        if (user.name) setOtherUserName(user.name);
        setIsOnline(false);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [otherUserId]);

  /* ── check block status ── */
  useEffect(() => {
    if (!otherUserId) return;
    API.get(`/reports/check/${otherUserId}`)
      .then((r) => { if (r.data?.blocked) setInteractionBlocked(true); })
      .catch(() => {});
  }, [otherUserId]);

  /* ── online/offline socket ── */
  useEffect(() => {
    if (!otherUserId) return;
    const onOnline = ({ userId }) => {
      if (String(userId) === String(otherUserId)) setIsOnline(true);
    };
    const onOffline = ({ userId, lastSeen }) => {
      if (String(userId) === String(otherUserId)) {
        setIsOnline(false);
        if (lastSeen) setOtherUserLastSeen(lastSeen);
      }
    };
    socket.on("userOnline", onOnline);
    socket.on("userOffline", onOffline);
    return () => {
      socket.off("userOnline", onOnline);
      socket.off("userOffline", onOffline);
    };
  }, [socket, otherUserId]);

  const formatLastSeen = (iso) => {
    if (!iso) return "offline";
    const d = new Date(iso), now = new Date();
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    const t = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === now.toDateString()) return `last seen today at ${t}`;
    if (d.toDateString() === yest.toDateString()) return `last seen yesterday at ${t}`;
    return `last seen ${d.toLocaleDateString()} at ${t}`;
  };

  /* ── scroll to bottom ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── typing emit ── */
  useEffect(() => {
    if (!text.trim()) {
      socket.emit("stopTyping", { chatId });
      return;
    }
    socket.emit("typing", { chatId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit("stopTyping", { chatId }), 1500);
    return () => clearTimeout(typingTimeoutRef.current);
  }, [text, chatId, socket]);

  /* ── send text message ── */
  const sendMessage = () => {
    const msg = text.trim();
    if (!msg || interactionBlocked) return;
    socket.emit("sendMessage", { chatId, senderId: myId, text: msg });
    setText("");
    setShowEmoji(false);
  };

  const unsendMessage = (messageId) =>
    socket.emit("unsendMessage", { chatId, messageId });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  /* ── voice recording ── */
  const startRecording = async () => {
    if (interactionBlocked) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = "audio/mpeg";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/wav";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/webm";
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendVoiceMessage(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch (err) {
      console.error(err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);
  };

  const sendVoiceMessage = async (blob) => {
    if (interactionBlocked) return;
    try {
      const fd = new FormData();
      fd.append("voice", blob, "voice-message.wav");
      fd.append("chatId", chatId);
      const res = await fetch("http://localhost:5000/api/messages/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${window.localStorage.getItem("token")}` },
        body: fd,
      });
      if (res.ok) {
        const msg = await res.json();
        socket.emit("sendMessage", { chatId, type: "voice", audioUrl: msg.audioUrl });
      } else {
        const t = await res.text();
        alert(`Upload failed: ${res.status} - ${t}`);
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    }
  };

  const playVoiceMessage = async (messageId, audioUrl) => {
    if (playingAudioId === messageId) {
      const a = audioRefs.current[messageId];
      if (a) { a.pause(); a.currentTime = 0; }
      setPlayingAudioId(null);
      return;
    }
    if (playingAudioId && audioRefs.current[playingAudioId]) {
      const a = audioRefs.current[playingAudioId];
      a.pause();
      a.currentTime = 0;
    }
    try {
      const src = audioUrl.startsWith("http")
        ? audioUrl
        : `http://localhost:5000${audioUrl.startsWith("/") ? "" : "/"}${audioUrl}`;
      let a = audioRefs.current[messageId];
      if (!a) {
        a = new Audio(src);
        audioRefs.current[messageId] = a;
      } else {
        a.src = src;
      }
      a.onended = () => setPlayingAudioId(null);
      a.onerror = () => { setPlayingAudioId(null); alert("Unable to play audio."); };
      setPlayingAudioId(messageId);
      await a.play();
    } catch (err) {
      console.error(err);
      setPlayingAudioId(null);
    }
  };

  // ── VIDEO CALL FIX: initiate call ──
  const startVideoCall = () => {
    if (interactionBlocked || !otherUserId) return;
    // Generate a unique room id for this call session
    const roomId = `${chatId}_${Date.now()}`;
    setCallRoomId(roomId);
    setIsCallerRole(true);
    // Notify the other user via socket
    socket.emit("callUser", {
      callerId: myId,
      callerName: "", // server can fill from auth
      targetUserId: otherUserId,
      targetChatId: chatId,
      roomId,
    });
    setVideoOpen(true);
  };

  // ── VIDEO CALL FIX: accept incoming call ──
  const acceptCall = () => {
    if (!incomingCall) return;
    socket.emit("callAccepted", {
      callerId: incomingCall.callerId,
      roomId: incomingCall.roomId,
    });
    setCallRoomId(incomingCall.roomId);
    setIsCallerRole(false);
    setIncomingCall(null);
    setVideoOpen(true);
  };

  // ── VIDEO CALL FIX: reject incoming call ──
  const rejectCall = () => {
    if (!incomingCall) return;
    socket.emit("callRejected", {
      callerId: incomingCall.callerId,
      roomId: incomingCall.roomId,
    });
    setIncomingCall(null);
  };

  // ── VIDEO CALL FIX: end / close video ──
  const closeVideoCall = () => {
    if (callRoomId) {
      socket.emit("endCall", { roomId: callRoomId, targetUserId: otherUserId });
    }
    setVideoOpen(false);
    setCallRoomId(null);
    setIsCallerRole(false);
  };

  const initials = otherUserName
    ? otherUserName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const Tick = ({ status }) => {
    const s = { fontFamily: "'JetBrains Mono',monospace", fontSize: 10 };
    if (status === "seen") return <span style={{ ...s, color: "#fbbf24" }}>✓✓</span>;
    if (status === "delivered") return <span style={{ ...s, color: "rgba(255,255,255,0.28)" }}>✓✓</span>;
    return <span style={{ ...s, color: "rgba(255,255,255,0.16)" }}>✓</span>;
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* ── INCOMING CALL OVERLAY ── */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            className="ch-call-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="ch-call-card"
              initial={{ scale: 0.85, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 40 }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
                background: "linear-gradient(135deg,#7c6aff,#ec4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 700, color: "#fff",
                animation: "ch-ring 1.4s ease infinite",
                boxShadow: "0 0 0 6px rgba(124,106,255,0.2)",
              }}>
                {incomingCall.callerName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div style={{ color: "var(--ch-text)", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
                {incomingCall.callerName}
              </div>
              <div style={{ color: "var(--ch-muted)", fontSize: 13, fontFamily: "var(--ch-mono)", marginBottom: 28 }}>
                Incoming video call…
              </div>
              <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
                <button className="ch-call-reject" onClick={rejectCall}>Decline</button>
                <button className="ch-call-accept" onClick={acceptCall}>Accept</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CHAT LAYOUT ── */}
      <div className="ch" style={{
        // FIX: Use dvh + safe area so it fills exactly the visible screen on mobile
        height: "100dvh",
        maxHeight: "-webkit-fill-available",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        background: "var(--ch-bg)",
      }}>

        {/* BG decorations */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 55% at 50% -5%, #12101e 0%, #0a0a0f 60%)" }} />
          {[
            { top: "-8%", left: "-6%", w: 400, c: "rgba(124,106,255,0.05)", delay: "0s" },
            { top: "55%", right: "-8%", w: 350, c: "rgba(167,139,250,0.038)", delay: "2s" },
            { top: "35%", left: "32%", w: 280, c: "rgba(236,72,153,0.028)", delay: "4s" },
          ].map((b, i) => (
            <div key={i} style={{
              position: "absolute", top: b.top, left: b.left, right: b.right,
              width: b.w, height: b.w, borderRadius: "50%",
              background: `radial-gradient(circle, ${b.c} 0%, transparent 68%)`,
              animation: `ch-blob ${8 + i}s ease infinite`,
              animationDelay: b.delay,
            }} />
          ))}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.015,
            backgroundImage: "linear-gradient(rgba(124,106,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(124,106,255,1) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
          }} />
        </div>

        {/* ── HEADER ── */}
        <motion.div
          initial={{ y: -56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "relative", zIndex: 10, flexShrink: 0,
            // FIX: pad top for notch on iOS
            paddingTop: "max(10px, env(safe-area-inset-top))",
            paddingBottom: 10,
            paddingLeft: 12,
            paddingRight: 12,
            background: "rgba(10,10,15,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--ch-border)",
          }}
        >
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg,transparent,rgba(124,106,255,0.4),rgba(167,139,250,0.28),transparent)",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 600, margin: "0 auto" }}>
            <button className="ch-icon-btn" onClick={() => navigate("/chats")}>
              <IconArrow />
            </button>

            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg,#7c6aff,#ec4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 600, fontSize: 14, color: "#fff", letterSpacing: "-0.02em",
                boxShadow: "0 0 0 2px rgba(124,106,255,0.2)",
              }}>
                {initials}
              </div>
              <div style={{
                position: "absolute", bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: "50%",
                background: isOnline ? "var(--ch-green)" : "#4b5563",
                border: "2px solid var(--ch-bg)",
                animation: isOnline ? "ch-online 2.8s ease infinite" : "none",
              }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 600, fontSize: 15, color: "var(--ch-text)",
                letterSpacing: "-0.02em", whiteSpace: "nowrap",
                overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {otherUserName}
              </div>
              <AnimatePresence mode="wait">
                {isTyping ? (
                  <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                    {[0, 0.18, 0.36].map((d, i) => (
                      <div key={i} style={{
                        width: 4, height: 4, borderRadius: "50%",
                        background: "var(--ch-accent2)",
                        animation: `ch-bounce .9s ease infinite`,
                        animationDelay: `${d}s`,
                      }} />
                    ))}
                    <span style={{ fontSize: 11, color: "var(--ch-accent2)", fontFamily: "var(--ch-mono)", letterSpacing: "0.02em" }}>
                      typing
                    </span>
                  </motion.div>
                ) : (
                  <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                      fontSize: 11, marginTop: 1,
                      color: isOnline ? "var(--ch-green)" : "rgba(255,255,255,0.26)",
                      fontFamily: "var(--ch-mono)", letterSpacing: "0.02em",
                    }}>
                    {isOnline ? "online" : formatLastSeen(otherUserLastSeen)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FIX: pass all needed props to VideoRoom via startVideoCall */}
            <button
              className="ch-icon-btn"
              onClick={startVideoCall}
              disabled={interactionBlocked}
              style={{ opacity: interactionBlocked ? 0.35 : 1, cursor: interactionBlocked ? "not-allowed" : "pointer" }}
              title={interactionBlocked ? "Interaction blocked" : "Video call"}
            >
              <IconVideo />
            </button>
          </div>
        </motion.div>

        {/* ── MESSAGES ── */}
        {/* FIX: flex:1 + overflow:auto so this fills exactly the remaining space */}
        <div
          className="ch-msgs"
          style={{
            position: "relative", zIndex: 10,
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "14px 12px",
            // FIX: prevent content going under input on iOS bounce scroll
            WebkitOverflowScrolling: "touch",
          }}
          onClick={() => showEmoji && setShowEmoji(false)}
        >
          <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 3 }}>
            <AnimatePresence mode="popLayout">
              {messages.map((m) => {
                if (m.isDeleted) return null;
                const isMine = String(m.sender) === String(myId);
                const status = m.status || "sent";
                const hovered = hoveredMessageId === m._id;
                return (
                  <motion.div key={m._id}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.82, transition: { duration: 0.14 } }}
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}
                    onMouseEnter={() => setHoveredMessageId(m._id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                    onTouchStart={() => setHoveredMessageId(m._id)}
                    onTouchEnd={() => setTimeout(() => setHoveredMessageId(null), 1800)}
                  >
                    <div style={{ display: "flex", flexDirection: "column", maxWidth: "min(78%, 420px)" }}>
                      <div className="ch-bubble" style={{
                        padding: m.type === "voice" ? "9px 13px" : "9px 14px",
                        borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        ...(isMine ? {
                          background: "linear-gradient(135deg,#7c6aff,#a78bfa)",
                          color: "#fff",
                          boxShadow: "0 2px 12px rgba(124,106,255,0.25)",
                        } : {
                          background: "var(--ch-surf2)",
                          border: "1px solid var(--ch-border2)",
                          color: "var(--ch-text)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.28)",
                        }),
                      }}>
                        {m.type === "voice" ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 160 }}>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                              onClick={() => playVoiceMessage(m._id, m.audioUrl)}
                              style={{
                                flexShrink: 0, width: 30, height: 30, borderRadius: "50%",
                                background: isMine ? "rgba(0,0,0,0.18)" : "rgba(124,106,255,0.18)",
                                border: `1px solid ${isMine ? "rgba(255,255,255,0.2)" : "rgba(124,106,255,0.28)"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: isMine ? "#fff" : "var(--ch-accent2)",
                              }}>
                              {playingAudioId === m._id ? <IconPause /> : <IconPlay />}
                            </motion.button>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, height: 24 }}>
                              {WAVE.map((h, i) => (
                                <div key={i} style={{
                                  width: 3, borderRadius: 99,
                                  background: isMine ? "rgba(255,255,255,0.48)" : "rgba(124,106,255,0.48)",
                                  height: playingAudioId === m._id ? undefined : h + "px",
                                  animation: playingAudioId === m._id
                                    ? `ch-waveanim ${0.38 + (i % 4) * 0.09}s ease infinite alternate`
                                    : "none",
                                  animationDelay: `${i * 0.035}s`,
                                }} />
                              ))}
                            </div>
                            <span style={{ fontSize: 10, fontFamily: "var(--ch-mono)", opacity: 0.55 }}>
                              0:{String(recordingTime).padStart(2, "0")}
                            </span>
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                            {m.text}
                          </p>
                        )}
                      </div>

                      {/* timestamp + tick + unsend — shown on hover/touch */}
                      <motion.div
                        initial={false}
                        animate={{ opacity: hovered ? 1 : 0, height: hovered ? "auto" : 0 }}
                        style={{
                          overflow: "hidden", display: "flex", alignItems: "center", gap: 6,
                          marginTop: 2, paddingInline: 4,
                          justifyContent: isMine ? "flex-end" : "flex-start",
                        }}
                      >
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "var(--ch-mono)", letterSpacing: "0.02em" }}>
                          {formatTime(m.createdAt)}
                        </span>
                        {isMine && (
                          <>
                            <Tick status={status} />
                            <button className="ch-unsend" onClick={() => unsendMessage(m._id)}>unsend</button>
                          </>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator bubble */}
            <AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{
                    padding: "10px 14px", borderRadius: "18px 18px 18px 4px",
                    background: "var(--ch-surf2)", border: "1px solid var(--ch-border2)",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    {[0, 0.18, 0.36].map((d, i) => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "var(--ch-accent2)",
                        animation: `ch-bounce .9s ease infinite`,
                        animationDelay: `${d}s`,
                      }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── INPUT BAR ── */}
        <motion.div style={{
          position: "relative", zIndex: 10, flexShrink: 0,
          // FIX: proper safe area for iOS home indicator
          paddingTop: 10,
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          paddingLeft: 12,
          paddingRight: 12,
          background: "rgba(10,10,15,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid var(--ch-border)",
          opacity: interactionBlocked ? 0.5 : 1,
          pointerEvents: interactionBlocked ? "none" : "auto",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg,transparent,rgba(124,106,255,0.2),transparent)",
          }} />

          {interactionBlocked && (
            <div style={{
              textAlign: "center", fontSize: 11.5, color: "rgba(252,165,165,0.7)",
              fontFamily: "var(--ch-mono)", letterSpacing: "0.04em", marginBottom: 8,
              padding: "6px 12px", background: "rgba(239,68,68,0.07)",
              borderRadius: 9, border: "1px solid rgba(239,68,68,0.14)",
            }}>
              🚫 You can no longer interact with this user.
            </div>
          )}

          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {/* Recording indicator */}
            <AnimatePresence>
              {isRecording && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                    padding: "7px 14px", borderRadius: 10, marginBottom: 8,
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
                  }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ch-red)", animation: "ch-recpulse 1.1s ease infinite" }} />
                  <span style={{ fontSize: 11, fontFamily: "var(--ch-mono)", letterSpacing: "0.05em", color: "rgba(252,165,165,0.8)" }}>
                    rec {recordingTime}s — release to send
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input row */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7, position: "relative" }}>
              <button
                className={`ch-icon-btn${showEmoji ? " active" : ""}`}
                onClick={() => setShowEmoji((p) => !p)}
              >
                <IconEmoji />
              </button>

              {/* FIX: emoji picker positioned to not overflow screen on mobile */}
              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 10 }}
                    style={{
                      position: "absolute",
                      bottom: 52,
                      left: 0,
                      zIndex: 50,
                      // FIX: constrain width so it doesn't overflow phone screen
                      width: "min(340px, calc(100vw - 24px))",
                    }}
                  >
                    <EmojiPicker
                      theme="dark"
                      onEmojiClick={onEmojiClick}
                      emojiStyle="native"
                      width="100%"
                      height={320}
                      searchDisabled={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                className="ch-field"
                disabled={interactionBlocked || isRecording}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                // FIX: prevent iOS zoom on focus (fontSize >= 16px equivalent)
                style={{ fontSize: 16 }}
              />

              <button
                className={`ch-icon-btn${isRecording ? " rec" : ""}`}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
              >
                <IconMic active={isRecording} />
              </button>

              <AnimatePresence>
                {text.trim() && (
                  <motion.button
                    className="ch-send"
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    onClick={sendMessage}
                  >
                    <IconSend />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── VIDEO ROOM ── */}
        {/* FIX: pass roomId, chatId, otherUserId, isCaller so VideoRoom can connect properly */}
        <AnimatePresence>
          {videoOpen && (
            <VideoRoom
              isCaller={isCallerRole}
              roomId={callRoomId}
              chatId={chatId}
              otherUserId={otherUserId}
              onClose={closeVideoCall}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}