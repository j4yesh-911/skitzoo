import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Heart, Upload, X, Clock, Link2, BookOpen, Users, Zap,
  Calendar, LayoutTemplate, Trash2, TrendingUp, Flame,
  Home, BarChart2, Menu, ChevronLeft,
} from "lucide-react";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

const getAvatar = (pic, name) => {
  if (!pic) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=6366f1&color=fff&bold=true`;
  if (pic.startsWith("/uploads")) return `http://localhost:5000${pic}`;
  if (pic.startsWith("uploads")) return `http://localhost:5000/${pic}`;
  if (pic.startsWith("http")) return pic;
  return `http://localhost:5000/uploads/${pic}`;
};

const getPostImage = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  if (img.startsWith("/")) return `http://localhost:5000${img}`;
  return `http://localhost:5000/${img}`;
};

const TEMPLATES = [
  { id: "intro", icon: "🤝", label: "Intro Session", color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)", fill: d => `📚 Skill Session: ${d.skill||"Topic TBD"}\n\n👋 Let's connect!\n\n🗓 ${d.date||"Date TBD"} at ${d.time||"TBD"}\n⏱ Duration: ${d.duration||"30 min"}\n🔗 Join: ${d.link||"Link coming soon"}\n\n✅ We'll cover:\n• Intro & goals\n• Skills overview\n• Open Q&A\n\nLooking forward to it! 🌟` },
  { id: "workshop", icon: "🎓", label: "Workshop", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)", fill: d => `🎓 Workshop: ${d.skill||"Skill Workshop"}\n\n📅 ${d.date||"TBD"} · ⏰ ${d.time||"TBD"}\n⏱ ${d.duration||"60 min"} · 👥 Interactive\n🔗 ${d.link||"Link coming soon"}\n\n📋 Agenda:\n1. Concepts (15 min)\n2. Live demo (20 min)\n3. Practice (20 min)\n4. Q&A (5 min)\n\n💡 Bring your curiosity!` },
  { id: "mentorship", icon: "🌱", label: "Mentorship", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", fill: d => `🌱 Mentorship: ${d.skill||"Skill Development"}\n\n"Every expert was once a beginner." ✨\n\n🗓 ${d.date||"TBD"} at ${d.time||"TBD"}\n⏱ ${d.duration||"45 min"}\n🔗 ${d.link||"Link shared soon"}\n\n🎯 We'll work on:\n• Clear milestones\n• Tackling blockers\n• Building confidence\n\nSee you there! 💪` },
  { id: "swap", icon: "🔄", label: "Skill Swap", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", fill: d => `🔄 Skill Swap!\n\nI'll teach: ${d.skill||"My Skill"}\nI'll learn: ${d.learnSkill||"Your Skill"}\n\n📅 ${d.date||"TBD"} · ⏰ ${d.time||"TBD"}\n⏱ ${d.duration||"60 min"} (30 each way)\n🔗 ${d.link||"Link coming soon"}\n\nEqual exchange, maximum growth! 🚀` },
  { id: "office", icon: "💼", label: "Office Hours", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", fill: d => `💼 Open Office Hours — ${d.skill||"Topic"}\n\nDrop in, ask anything!\n\n🗓 ${d.date||"TBD"} · ⏰ ${d.time||"TBD"}\n⏱ Open for ${d.duration||"60 min"}\n🔗 ${d.link||"Link posted soon"}\n\nWelcome topics:\n✦ ${d.skill||"Skill questions"}\n✦ Career advice\n✦ Code review\n✦ Brainstorming\n\nSee you there! 👋` },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Outfit', sans-serif; background: #07090f; color: #e2e8f0; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

  .page { display: flex; height: 100dvh; overflow: hidden; }
  .sidebar-desktop {
    width: 260px; min-width: 260px; height: 100vh; overflow-y: auto;
    border-right: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    display: flex; flex-direction: column;
    padding: 24px 16px; gap: 0; flex-shrink: 0;
  }
  .feed { flex: 1; height: 100dvh; overflow-y: auto; scroll-behavior: smooth; }
  .feed-inner { max-width: 620px; margin: 0 auto; padding: 28px 20px 100px; }
  .right-panel-desktop {
    width: 280px; min-width: 280px; height: 100vh; overflow-y: auto;
    border-left: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.015);
    display: flex; flex-direction: column;
    padding: 24px 16px; gap: 16px; flex-shrink: 0;
  }

  .drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px); z-index: 150;
  }
  .drawer {
    position: fixed; top: 0; bottom: 0; width: min(320px, 88vw);
    background: #0d1117; overflow-y: auto;
    display: flex; flex-direction: column;
    padding: 24px 18px 32px; gap: 0; z-index: 160;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .drawer-left { left: 0; border-left: none; border-radius: 0 20px 20px 0; }
  .drawer-handle {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #64748b;
  }

  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0; height: 64px;
    background: rgba(7,9,15,0.95); backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: space-around;
    z-index: 100; padding: 0 8px;
  }
  .nav-btn {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 8px 16px; border-radius: 12px;
    background: none; border: none; cursor: pointer;
    color: #475569; font-family: Outfit, sans-serif;
    font-size: 10px; font-weight: 600; transition: color 0.15s, background 0.15s;
    flex: 1; max-width: 80px;
  }
  .nav-btn.active { color: #818cf8; background: rgba(99,102,241,0.1); }
  .nav-btn:hover { color: #94a3b8; }

  .card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .card:hover { border-color: rgba(255,255,255,0.14); box-shadow: 0 4px 32px rgba(0,0,0,0.35); }

  .swapper-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 11px;
    background: rgba(255,255,255,0.03); border: 1px solid transparent;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
  }
  .swapper-row:hover { background: rgba(255,255,255,0.06); border-color: rgba(99,102,241,0.3); }

  .btn-post {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 22px; border-radius: 12px;
    background: linear-gradient(135deg,#6366f1,#06b6d4);
    border: none; color: white; font-weight: 700; font-size: 14px;
    cursor: pointer; font-family: Outfit,sans-serif;
    transition: opacity 0.2s, transform 0.15s;
  }
  .btn-post:hover:not(:disabled) { opacity: 0.88; transform: scale(1.02); }
  .btn-post:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-tpl {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 10px;
    background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.28);
    color: #818cf8; font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: Outfit,sans-serif;
    transition: background 0.2s; white-space: nowrap;
  }
  .btn-tpl:hover { background: rgba(99,102,241,0.22); }

  .caption-input {
    width: 100%; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 14px 16px;
    color: #e2e8f0; font-size: 14px; font-family: Outfit,sans-serif;
    line-height: 1.65; outline: none; resize: none;
    transition: border-color 0.2s;
  }
  .caption-input:focus { border-color: rgba(99,102,241,0.4); }
  .caption-input::placeholder { color: #475569; }

  .like-btn {
    display: flex; align-items: center; gap: 7px;
    background: none; border: none; cursor: pointer;
    font-family: Outfit,sans-serif; font-size: 14px; font-weight: 600;
    transition: transform 0.15s; padding: 6px 0;
  }
  .like-btn:hover { transform: scale(1.1); }

  .delete-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    font-family: Outfit,sans-serif; font-size: 13px; font-weight: 600;
    color: #334155; padding: 6px 10px; border-radius: 8px;
    transition: background 0.15s, color 0.15s;
  }
  .delete-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

  input[type=file] { font-size: 13px; color: #64748b; font-family: Outfit,sans-serif; }
  input[type=file]::file-selector-button {
    padding: 5px 12px; border-radius: 7px;
    background: rgba(99,102,241,0.13); border: 1px solid rgba(99,102,241,0.28);
    color: #818cf8; cursor: pointer; font-family: Outfit,sans-serif;
    font-size: 12px; font-weight: 600; margin-right: 8px; transition: background 0.2s;
  }
  input[type=file]::file-selector-button:hover { background: rgba(99,102,241,0.25); }

  .tpl-card {
    padding: 20px 18px; border-radius: 16px; cursor: pointer;
    text-align: left; font-family: Outfit,sans-serif; border: 1px solid;
    transition: transform 0.15s, box-shadow 0.2s;
  }
  .tpl-card:hover { transform: translateY(-3px); }

  .modal-input {
    width: 100%; padding: 11px 14px; border-radius: 11px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    color: #e2e8f0; font-size: 14px; font-family: Outfit,sans-serif;
    outline: none; transition: border-color 0.2s;
  }
  .modal-input::placeholder { color: #3d4f67; }

  .stat-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 13px; border-radius: 13px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    transition: border-color 0.2s;
  }
  .stat-pill:hover { border-color: rgba(255,255,255,0.12); }

  .activity-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
  .tip-card { padding: 14px; border-radius: 14px; background: rgba(99,102,241,0.07); border: 1px solid rgba(99,102,241,0.18); }

  .confirm-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(10px); z-index: 300;
    display: flex; align-items: center; justify-content: center; padding: 16px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 1100px) { .right-panel-desktop { display: none; } }
  @media (max-width: 768px)  { .sidebar-desktop { display: none; } .feed-inner { padding: 16px 14px 100px; } }
  @media (min-width: 769px)  { .bottom-nav { display: none; } }
`;

function SidebarContent({ user, posts, swappers }) {
  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", background: "linear-gradient(90deg,#6366f1,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SkillSwap</span>
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 2 }}>My Space</h2>
      </div>

      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img src={getAvatar(user.profilePic, user.name)} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(99,102,241,0.4)" }} alt="" onError={e => e.target.src = getAvatar(null, user.name)} />
            <span style={{ position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: "50%", background: "#22c55e", border: "2px solid #07090f" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
            <p style={{ fontSize: 12, color: "#64748b" }}>@{user.username}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
        {[{ v: posts.length, l: "Posts" }, { v: swappers.length, l: "Swappers" }].map(s => (
          <div key={s.l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.v}</p>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>{s.l}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#475569", marginBottom: 10 }}>Network</p>
      {swappers.length === 0 && <p style={{ fontSize: 12, color: "#334155" }}>No swappers yet 🤝</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {swappers.map(s => (
          <div key={s._id} className="swapper-row">
            <img src={getAvatar(s.profilePic, s.name)} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} alt="" onError={e => e.target.src = getAvatar(null, s.name)} />
            <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name || s.username}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function RightPanelContent({ posts, swappers, setShowTpl, setActiveTpl }) {
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const thisWeekPosts = posts.filter(p => (new Date() - new Date(p.createdAt)) < 7 * 24 * 60 * 60 * 1000).length;
  const activityMap = {};
  posts.forEach(p => { const key = new Date(p.createdAt).toDateString(); activityMap[key] = (activityMap[key] || 0) + 1; });
  const days = Array.from({ length: 56 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (55 - i)); return { date: d, count: activityMap[d.toDateString()] || 0 }; });
  const maxActivity = Math.max(...days.map(d => d.count), 1);
  const tips = ["🎯 Try a Skill Swap to grow faster", "📅 Consistent posts build trust", "💬 Sessions with Q&A get 2x engagement", "🌱 Share progress, not just results", "🔗 Always include a meeting link"];
  const dailyTip = tips[new Date().getDay() % tips.length];

  return (
    <>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#475569", marginBottom: 12 }}>Your Activity</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            { icon: <TrendingUp size={14} color="#818cf8" />, bg: "rgba(99,102,241,0.15)", label: "Total posts", val: posts.length },
            { icon: <Heart size={14} color="#f87171" />, bg: "rgba(239,68,68,0.12)", label: "Total likes", val: totalLikes },
            { icon: <Flame size={14} color="#4ade80" />, bg: "rgba(34,197,94,0.12)", label: "This week", val: `${thisWeekPosts} posts` },
            { icon: <Users size={14} color="#fbbf24" />, bg: "rgba(245,158,11,0.12)", label: "Swappers", val: swappers.length },
          ].map((s, i) => (
            <div key={i} className="stat-pill">
              <div style={{ width: 30, height: 30, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: "#475569" }}>{s.label}</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>{s.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#475569", marginBottom: 10 }}>Post Activity</p>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
            {days.map((d, i) => (
              <div key={i} className="activity-dot" title={`${d.date.toDateString()}: ${d.count} post(s)`}
                style={{ background: d.count === 0 ? "rgba(255,255,255,0.04)" : `rgba(99,102,241,${0.2 + (d.count / maxActivity) * 0.75})`, borderRadius: 3 }} />
            ))}
          </div>
          <p style={{ fontSize: 10, color: "#334155", marginTop: 8, textAlign: "right" }}>Last 8 weeks</p>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#475569", marginBottom: 10 }}>Daily Tip</p>
        <div className="tip-card"><p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{dailyTip}</p></div>
      </div>

      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#475569", marginBottom: 10 }}>Quick Templates</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TEMPLATES.map(tpl => (
            <button key={tpl.id} onClick={() => { setShowTpl(true); setActiveTpl(tpl); }}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 11, background: tpl.bg, border: `1px solid ${tpl.border}`, cursor: "pointer", textAlign: "left", fontFamily: "Outfit,sans-serif", transition: "transform 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
              <span style={{ fontSize: 16 }}>{tpl.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: tpl.color }}>{tpl.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ✅ Merges own posts + swapper feed, deduplicates by _id, sorts newest first
function mergeFeed(myPosts, swapperPosts) {
  const map = new Map();
  [...myPosts, ...swapperPosts].forEach(p => map.set(p._id, p));
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export default function Dashboardd() {
  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);       // own posts — for sidebar stats
  const [feedPosts, setFeedPosts] = useState([]);   // merged own + swappers — for the feed
  const [swappers, setSwappers] = useState([]);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTpl, setShowTpl] = useState(false);
  const [activeTpl, setActiveTpl] = useState(null);
  const [tplData, setTplData] = useState({ skill: "", learnSkill: "", date: "", time: "", duration: "60 minutes", link: "" });
  const [previewImg, setPreviewImg] = useState(null);
  const [posting, setPosting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");

  const token = localStorage.getItem("token");
  API.interceptors.request.use(req => { if (token) req.headers.Authorization = `Bearer ${token}`; return req; });

  useEffect(() => {
    (async () => {
      try {
        const me = await API.get("/auth/me");
        setUser(me.data);
        setSwappers(me.data.swappers || []);

        // ✅ Fetch both own posts and swapper feed in parallel
        const [ownRes, feedRes] = await Promise.all([
          API.get("/posts/my"),
          API.get("/posts/feed"),
        ]);

        setMyPosts(ownRes.data);
        // ✅ Merge: own posts show in the feed too, sorted by date
        setFeedPosts(mergeFeed(ownRes.data, feedRes.data));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpload = async () => {
    if (!caption.trim() && !image) return;
    setPosting(true);
    const fd = new FormData();
    if (image) fd.append("image", image);
    fd.append("caption", caption);
    try {
      const r = await API.post("/posts", fd);
      // ✅ Add new post to both states immediately — no refresh needed
      setMyPosts(p => [r.data, ...p]);
      setFeedPosts(p => [r.data, ...p]);
      setImage(null); setCaption(""); setPreviewImg(null);
    } catch (e) {
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const r = await API.post(`/posts/like/${id}`);
      setFeedPosts(p => p.map(x => x._id === id ? r.data : x));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await API.delete(`/posts/${id}`);
      setMyPosts(p => p.filter(x => x._id !== id));
      setFeedPosts(p => p.filter(x => x._id !== id));
      setDeleteConfirm(null);
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const handleImgChange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setImage(f);
    const r = new FileReader();
    r.onload = () => setPreviewImg(r.result);
    r.readAsDataURL(f);
  };

  const useTpl = (tpl) => { setCaption(tpl.fill(tplData)); setShowTpl(false); setActiveTpl(null); };

  if (loading || !user) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100dvh", background: "#07090f", gap: 14 }}>
      <style>{CSS}</style>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.15)", borderTop: "2px solid #6366f1", animation: "spin 0.75s linear infinite" }} />
      <p style={{ fontSize: 13, color: "#475569" }}>Loading your space…</p>
    </div>
  );

  const canPost = caption.trim() || image;

  const MobileStatsView = (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 16 }}>
      <RightPanelContent posts={myPosts} swappers={swappers} setShowTpl={setShowTpl} setActiveTpl={setActiveTpl} />
    </motion.div>
  );

  const MobileProfileView = (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: 16 }}>
      <SidebarContent user={user} posts={myPosts} swappers={swappers} />
    </motion.div>
  );

  return (
    <>
      <style>{CSS}</style>

      <div className="page">

        <aside className="sidebar-desktop">
          <SidebarContent user={user} posts={myPosts} swappers={swappers} />
        </aside>

        <main className="feed">
          <div className="feed-inner">

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <button onClick={() => setShowLeftDrawer(true)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}
                className="mobile-only-flex">
                <Menu size={17} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Menu</span>
              </button>
              <div style={{ flex: 1 }} />
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "stats" ? (
                <motion.div key="stats">{MobileStatsView}</motion.div>
              ) : activeTab === "profile" ? (
                <motion.div key="profile">{MobileProfileView}</motion.div>
              ) : (
                <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                  {/* COMPOSE CARD */}
                  <motion.div className="card" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px 14px", flexWrap: "wrap" }}>
                      <img src={getAvatar(user.profilePic, user.name)} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} alt="" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</p>
                        <p style={{ fontSize: 11, color: "#475569" }}>Share a session or skill</p>
                      </div>
                      <button className="btn-tpl" onClick={() => setShowTpl(true)}>
                        <LayoutTemplate size={13} />Templates
                      </button>
                    </div>

                    <div style={{ padding: "0 20px" }}>
                      <textarea className="caption-input" rows={4} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Share a skill session, meeting link, or learning update…" />
                    </div>

                    <AnimatePresence>
                      {previewImg && (
                        <motion.div initial={{ opacity: 0, scaleY: 0.9 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0.9 }}
                          style={{ margin: "10px 20px", borderRadius: 12, overflow: "hidden", position: "relative" }}>
                          <img src={previewImg} style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} alt="" />
                          <button onClick={() => { setImage(null); setPreviewImg(null); }}
                            style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                            <X size={13} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 18px", flexWrap: "wrap", gap: 10 }}>
                      <input type="file" accept="image/*" onChange={handleImgChange} />
                      <button className="btn-post" onClick={handleUpload} disabled={!canPost || posting}>
                        {posting ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", animation: "spin 0.75s linear infinite" }} /> : <Upload size={14} />}
                        {posting ? "Posting…" : "Post"}
                      </button>
                    </div>
                  </motion.div>

                  {/* FEED POSTS — own + swappers merged */}
                  {feedPosts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "56px 20px", color: "#334155" }}>
                      <p style={{ fontSize: 36, marginBottom: 12 }}>📸</p>
                      <p style={{ fontWeight: 700, marginBottom: 4, color: "#475569" }}>Nothing here yet</p>
                      <p style={{ fontSize: 13 }}>Create your first post or add swappers to see their updates</p>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <AnimatePresence initial={false}>
                      {feedPosts.map((post, i) => {
                        const isLiked = post.likes.includes(user._id);
                        const isOwner = post.user._id === user._id;
                        const postImg = getPostImage(post.image);

                        return (
                          <motion.div key={post._id} className="card"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.3, delay: i < 3 ? i * 0.04 : 0 }}>

                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 14px" }}>
                              <img src={getAvatar(post.user.profilePic, post.user.name)} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} alt="" onError={e => e.target.src = getAvatar(null, post.user.name)} />
                              <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 700, fontSize: 14 }}>{post.user.name}</p>
                                <p style={{ fontSize: 11, color: "#475569" }}>
                                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                                </p>
                              </div>
                              <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Session</span>
                            </div>

                            {/* ✅ Fixed image rendering — uses proper URL helper */}
                            {postImg && (
                              <img src={postImg} style={{ width: "100%", maxHeight: 400, objectFit: "cover", display: "block" }} alt="" />
                            )}

                            <div style={{ padding: "14px 20px 16px" }}>
                              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#94a3b8", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{post.caption}</p>
                              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 0" }} />
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <button className="like-btn" onClick={() => handleLike(post._id)} style={{ color: isLiked ? "#ef4444" : "#475569" }}>
                                  <Heart size={18} fill={isLiked ? "#ef4444" : "none"} stroke={isLiked ? "#ef4444" : "currentColor"} />
                                  <span>{post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</span>
                                </button>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <span style={{ fontSize: 11, color: "#334155", marginRight: 6 }}>@{post.user.username}</span>
                                  {/* ✅ Only show delete button for own posts */}
                                  {isOwner && (
                                    <button className="delete-btn" onClick={() => setDeleteConfirm(post._id)}>
                                      <Trash2 size={14} /><span>Delete</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <aside className="right-panel-desktop">
          <RightPanelContent posts={myPosts} swappers={swappers} setShowTpl={setShowTpl} setActiveTpl={setActiveTpl} />
        </aside>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="bottom-nav">
        {[
          { id: "feed",    icon: <Home size={20} />,      label: "Feed"    },
          { id: "profile", icon: <Users size={20} />,     label: "Profile" },
          { id: "stats",   icon: <BarChart2 size={20} />, label: "Stats"   },
        ].map(tab => (
          <button key={tab.id} className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* LEFT DRAWER */}
      <AnimatePresence>
        {showLeftDrawer && (
          <>
            <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLeftDrawer(false)} />
            <motion.div className="drawer drawer-left" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
              <button className="drawer-handle" onClick={() => setShowLeftDrawer(false)}>
                <ChevronLeft size={16} />
              </button>
              <div style={{ paddingTop: 8 }}>
                <SidebarContent user={user} posts={myPosts} swappers={swappers} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div className="confirm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !deleting && setDeleteConfirm(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#0d1117", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: "28px 28px 24px", maxWidth: 360, width: "100%", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Trash2 size={22} color="#ef4444" />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>Delete this post?</h3>
              <p style={{ fontSize: 13, color: "#475569", marginBottom: 22, lineHeight: 1.55 }}>This can't be undone. Your session post will be permanently removed.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                  style={{ flex: 1, padding: 11, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                  style={{ flex: 1, padding: 11, borderRadius: 12, background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", color: "white", fontWeight: 700, fontSize: 14, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "Outfit,sans-serif", opacity: deleting ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  {deleting ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", animation: "spin 0.75s linear infinite" }} /> : <Trash2 size={14} />}
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TEMPLATE MODAL */}
      <AnimatePresence>
        {showTpl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => { setShowTpl(false); setActiveTpl(null); }}>
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, width: "100%", maxWidth: 680, maxHeight: "88dvh", overflow: "hidden", display: "flex", flexDirection: "column" }}>

              <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800 }}>Session Templates</h2>
                  <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>Pick a template, fill in details, post instantly</p>
                </div>
                <button onClick={() => { setShowTpl(false); setActiveTpl(null); }}
                  style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                  <X size={15} />
                </button>
              </div>

              <div style={{ overflow: "auto", padding: "20px 24px 24px", flex: 1 }}>
                {!activeTpl ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                    {TEMPLATES.map(tpl => (
                      <button key={tpl.id} className="tpl-card" onClick={() => setActiveTpl(tpl)} style={{ background: tpl.bg, borderColor: tpl.border }}>
                        <div style={{ fontSize: 26, marginBottom: 8 }}>{tpl.icon}</div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: tpl.color, marginBottom: 3 }}>{tpl.label}</p>
                        <p style={{ fontSize: 11, color: "#475569" }}>Fill details & post</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setActiveTpl(null)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 13, marginBottom: 18, display: "flex", alignItems: "center", gap: 5, fontFamily: "Outfit,sans-serif" }}>← Back</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "12px 14px", borderRadius: 12, background: activeTpl.bg, border: `1px solid ${activeTpl.border}` }}>
                      <span style={{ fontSize: 22 }}>{activeTpl.icon}</span>
                      <div><p style={{ fontWeight: 700, color: activeTpl.color, fontSize: 14 }}>{activeTpl.label}</p><p style={{ fontSize: 11, color: "#475569" }}>Fill in your session details</p></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                      {[
                        { key: "skill", label: "Skill / Topic", ph: "e.g. React, Python…", icon: <BookOpen size={12} /> },
                        ...(activeTpl.id === "swap" ? [{ key: "learnSkill", label: "Skill to Learn", ph: "e.g. Machine Learning…", icon: <Zap size={12} /> }] : []),
                        { key: "date", label: "Date", ph: "e.g. Jan 25, 2025", icon: <Calendar size={12} /> },
                        { key: "time", label: "Time", ph: "e.g. 5:00 PM IST", icon: <Clock size={12} /> },
                        { key: "duration", label: "Duration", ph: "e.g. 60 minutes", icon: <Clock size={12} /> },
                        { key: "link", label: "Meeting Link", ph: "Zoom / Google Meet…", icon: <Link2 size={12} />, full: true },
                      ].map(f => (
                        <div key={f.key} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{f.icon}{f.label}</label>
                          <input className="modal-input" value={tplData[f.key] || ""} onChange={e => setTplData(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph}
                            onFocus={e => e.target.style.borderColor = activeTpl.color} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#334155", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Live Preview</p>
                      <p style={{ fontSize: 12, color: "#64748b", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{activeTpl.fill(tplData)}</p>
                    </div>
                    <button onClick={() => useTpl(activeTpl)}
                      style={{ width: "100%", marginTop: 14, padding: 13, borderRadius: 13, background: `linear-gradient(135deg,${activeTpl.color},${activeTpl.color}bb)`, border: "none", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Outfit,sans-serif", transition: "opacity 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.88"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                      Use This Template ✓
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 769px) { .mobile-only-flex { display: none !important; } }
        @media (max-width: 768px) { .mobile-only-flex { display: flex !important; } }
      `}</style>
    </>
  );
}