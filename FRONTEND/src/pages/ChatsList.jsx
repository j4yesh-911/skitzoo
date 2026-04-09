import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { getSocket } from "../services/socket";
import { useTheme } from "../context/ThemeContext";

/* ─── tiny icon helpers (no extra deps) ─── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default function ChatsList() {
  const [chats, setChats] = useState([]);
  const [previewMessages, setPreviewMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("list"); // "list" | "preview"

  const socket = getSocket();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const myId = JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id;

  /* ─── detect mobile ─── */
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ─── load chats ─── */
  useEffect(() => {
    API.get("/chats").then((res) => setChats(res.data));
  }, []);

  /* ─── realtime ─── */
  useEffect(() => {
    const handler = (msg) => {
      setChats((prev) =>
        prev.map((c) =>
          c._id === msg.chatId
            ? { ...c, lastMessage: { text: msg.text }, updatedAt: msg.createdAt }
            : c
        )
      );
      if (msg.chatId === activeChatId) setPreviewMessages((prev) => [...prev, msg]);
    };
    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [socket, activeChatId]);

  /* ─── load preview ─── */
  const loadMessages = async (chatId) => {
    try {
      const res = await API.get(`/messages/${chatId}`);
      setPreviewMessages(res.data.slice(-40));
    } catch {}
  };

  const handleHover = (chatId) => {
    if (activeChatId || isMobile) return;
    setHoveredChatId(chatId);
    loadMessages(chatId);
  };

  const handleSelect = (chatId) => {
    setActiveChatId(chatId);
    loadMessages(chatId);
    if (isMobile) setMobileView("preview");
  };

  const handleBack = () => {
    setMobileView("list");
    setActiveChatId(null);
  };

  const currentChatId = activeChatId || hoveredChatId;
  const currentChat = chats.find((c) => c._id === currentChatId);
  const otherUser = currentChat?.members?.find((u) => u._id !== myId);

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return formatTime(date);
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredChats = chats.filter((chat) => {
    const other = chat.members.find((u) => u._id !== myId);
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const bg = dark ? "#0d1117" : "#f4f6fb";
  const surface = dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textPrimary = dark ? "#f0f4ff" : "#111827";
  const textMuted = dark ? "#6b7a99" : "#9ca3af";
  const accent = "#4f8ef7";
  const accentBg = dark ? "rgba(79,142,247,0.15)" : "rgba(79,142,247,0.1)";

  /* ══════════════════════════════════════
     SIDEBAR
  ══════════════════════════════════════ */
  const Sidebar = (
    <motion.div
      key="sidebar"
      initial={isMobile ? { x: -30, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -30, opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        width: isMobile ? "100%" : 320,
        minWidth: isMobile ? "100%" : 280,
        maxWidth: isMobile ? "100%" : 380,
        display: "flex",
        flexDirection: "column",
        background: surface,
        borderRight: `1px solid ${border}`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        height: "100%",
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: textPrimary, margin: 0 }}>
            Messages
          </h1>
          <span style={{
            background: accentBg, color: accent,
            borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600,
          }}>
            {filteredChats.length}
          </span>
        </div>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1px solid ${border}`, borderRadius: 12,
          padding: "9px 14px",
        }}>
          <span style={{ color: textMuted, flexShrink: 0 }}><SearchIcon /></span>
          <input
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent", border: "none", outline: "none",
              fontSize: 14, color: textPrimary, width: "100%",
              fontFamily: "'Sora', sans-serif",
            }}
          />
        </div>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {filteredChats.length === 0 && (
          <div style={{ textAlign: "center", color: textMuted, marginTop: 60, fontSize: 14 }}>
            No conversations found
          </div>
        )}
        {filteredChats.map((chat, i) => {
          const other = chat.members.find((u) => u._id !== myId);
          const unread = chat.unreadCounts?.[myId] || 0;
          const isActive = chat._id === activeChatId || chat._id === hoveredChatId;

          return (
            <motion.div
              key={chat._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onMouseEnter={() => handleHover(chat._id)}
              onMouseLeave={() => setHoveredChatId(null)}
              onClick={() => handleSelect(chat._id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 12px", borderRadius: 14, cursor: "pointer",
                marginBottom: 2,
                background: isActive ? accentBg : "transparent",
                border: `1px solid ${isActive ? "rgba(79,142,247,0.25)" : "transparent"}`,
                transition: "background 0.15s, border 0.15s",
              }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={other?.profilePic || `https://ui-avatars.com/api/?name=${other?.name}&background=4f8ef7&color=fff&bold=true`}
                  style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", display: "block" }}
                  alt={other?.name}
                />
                <span style={{
                  position: "absolute", bottom: 1, right: 1,
                  width: 11, height: 11, background: "#22c55e",
                  border: `2px solid ${dark ? "#0d1117" : "#fff"}`,
                  borderRadius: "50%",
                }} />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0, fontWeight: 600, fontSize: 14,
                  color: isActive ? accent : textPrimary,
                  fontFamily: "'Sora', sans-serif",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {other?.name}
                </p>
                <p style={{
                  margin: "2px 0 0", fontSize: 12, color: textMuted,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {chat.lastMessage?.text || "Start a conversation"}
                </p>
              </div>

              {/* Right side */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: textMuted }}>
                  {chat.updatedAt ? formatDate(chat.updatedAt) : ""}
                </span>
                {unread > 0 ? (
                  <span style={{
                    background: accent, color: "#fff",
                    fontSize: 11, fontWeight: 700,
                    borderRadius: 20, padding: "2px 7px", minWidth: 20, textAlign: "center",
                  }}>
                    {unread > 99 ? "99+" : unread}
                  </span>
                ) : (
                  isMobile && <span style={{ color: textMuted }}><ChevronRight /></span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  /* ══════════════════════════════════════
     PREVIEW PANEL
  ══════════════════════════════════════ */
  const Preview = (
    <motion.div
      key="preview"
      initial={isMobile ? { x: 30, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        background: dark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        height: "100%",
        width: isMobile ? "100%" : undefined,
      }}
    >
      {/* Header */}
      <div style={{
        height: 64, borderBottom: `1px solid ${border}`,
        display: "flex", alignItems: "center", padding: "0 20px", gap: 12,
        background: dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
        flexShrink: 0,
      }}>
        {isMobile && (
          <button
            onClick={handleBack}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: accent, padding: "6px 6px 6px 0", display: "flex", alignItems: "center",
            }}
          >
            <BackIcon />
          </button>
        )}

        {otherUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={otherUser?.profilePic || `https://ui-avatars.com/api/?name=${otherUser?.name}&background=4f8ef7&color=fff&bold=true`}
                style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }}
                alt={otherUser?.name}
              />
              <span style={{
                position: "absolute", bottom: 0, right: 0,
                width: 10, height: 10, background: "#22c55e",
                border: `2px solid ${dark ? "#0d1117" : "#fff"}`,
                borderRadius: "50%",
              }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: textPrimary, fontFamily: "'Sora', sans-serif" }}>
                {otherUser.name}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#22c55e" }}>● Active now</p>
            </div>
            {!isMobile && currentChatId && (
              <button
                onClick={() => navigate(`/chat/${currentChatId}`)}
                style={{
                  marginLeft: "auto",
                  background: accentBg, color: accent,
                  border: `1px solid rgba(79,142,247,0.3)`,
                  borderRadius: 10, padding: "7px 16px", fontSize: 13,
                  fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "background 0.15s",
                  flexShrink: 0,
                }}
              >
                Open chat <SendIcon />
              </button>
            )}
          </div>
        ) : (
          <p style={{ color: textMuted, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>
            {isMobile ? "Select a conversation" : "Hover or select a conversation"}
          </p>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1, overflowY: "auto",
          padding: "20px 16px",
          display: "flex", flexDirection: "column", gap: 8,
          cursor: currentChatId && !isMobile ? "pointer" : "default",
        }}
        onClick={() => !isMobile && currentChatId && navigate(`/chat/${currentChatId}`)}
      >
        {currentChatId ? (
          previewMessages.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: textMuted, fontSize: 14 }}>
              No messages yet
            </div>
          ) : (
            previewMessages.map((m) => {
              const isMine = String(m.sender) === String(myId);
              return (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}
                >
                  <div style={{
                    maxWidth: "72%",
                    padding: "10px 14px",
                    borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isMine
                      ? `linear-gradient(135deg, ${accent}, #6b8ff7)`
                      : dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    color: isMine ? "#fff" : textPrimary,
                    border: isMine ? "none" : `1px solid ${border}`,
                    fontSize: 14, lineHeight: 1.5,
                  }}>
                    <p style={{ margin: 0, wordBreak: "break-word" }}>{m.text}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 10, opacity: 0.6, textAlign: "right" }}>
                      {formatTime(m.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )
        ) : (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: accentBg, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p style={{ color: textMuted, fontSize: 14, textAlign: "center", fontFamily: "'Sora', sans-serif" }}>
              {isMobile ? "Tap a conversation to preview" : "Hover or select a chat to preview"}
            </p>
          </div>
        )}
      </div>

      {/* Mobile open button */}
      {isMobile && currentChatId && otherUser && (
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${border}` }}>
          <button
            onClick={() => navigate(`/chat/${currentChatId}`)}
            style={{
              width: "100%", background: accent, color: "#fff",
              border: "none", borderRadius: 14, padding: "13px",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Sora', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            Open Chat <SendIcon />
          </button>
        </div>
      )}
    </motion.div>
  );

  /* ══════════════════════════════════════
     ROOT
  ══════════════════════════════════════ */
  return (
    <>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');*{box-sizing:border-box;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(79,142,247,0.3);border-radius:4px;}::-webkit-scrollbar-thumb:hover{background:rgba(79,142,247,0.5);}`}</style>

      <div style={{
        height: "100dvh", display: "flex", overflow: "hidden",
        background: bg, fontFamily: "'Sora', sans-serif",
      }}>
        <AnimatePresence mode="wait" initial={false}>
          {/* Mobile: toggle between list and preview */}
          {isMobile ? (
            mobileView === "list" ? Sidebar : Preview
          ) : (
            /* Desktop: side by side */
            <>
              {Sidebar}
              <div style={{ width: 1, background: border, flexShrink: 0 }} />
              {Preview}
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}