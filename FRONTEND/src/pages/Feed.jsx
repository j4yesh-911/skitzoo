import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import API from "../services/api";

/* ─── helpers ─────────────────────────────────────────── */
const getAvatar = (pic, name) => {
  if (!pic)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=6366f1&color=fff&bold=true`;
  if (pic.startsWith("http")) return pic;
  if (pic.startsWith("/")) return `http://localhost:5000${pic}`;
  return `http://localhost:5000/${pic}`;
};

const getPostImage = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  if (img.startsWith("/")) return `http://localhost:5000${img}`;
  return `http://localhost:5000/${img}`;
};

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ─── heart-pop animation (CSS-only, one tiny injection) ─ */
const ANIM_CSS = `
  @keyframes heartPop {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.45); }
    65%  { transform: scale(0.88); }
    100% { transform: scale(1); }
  }
  .heart-pop { animation: heartPop 0.35s cubic-bezier(0.36,0.07,0.19,0.97); }

  @keyframes floatUp {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-38px) scale(1.3); }
  }
  .float-heart {
    position: absolute; pointer-events: none;
    animation: floatUp 0.65s ease-out forwards;
    font-size: 14px; top: -4px; left: 50%;
    transform: translateX(-50%);
  }
`;

/* ─── LikeButton ───────────────────────────────────────── */
function LikeButton({ postId, likes, currentUserId, onLike }) {
  const isLiked = likes.includes(currentUserId);
  const [animating, setAnimating] = useState(false);
  const [floaters, setFloaters] = useState([]);

  const handleClick = async () => {
    if (!isLiked) {
      setAnimating(true);
      const id = Date.now();
      setFloaters((f) => [...f, id]);
      setTimeout(() => setFloaters((f) => f.filter((x) => x !== id)), 700);
      setTimeout(() => setAnimating(false), 350);
    }
    await onLike(postId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isLiked ? "Unlike" : "Like"}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-xl
        font-semibold text-sm transition-all duration-150
        ${
          isLiked
            ? "text-red-500 bg-red-500/10 hover:bg-red-500/15"
            : "text-slate-400 dark:text-slate-500 hover:bg-red-500/8 hover:text-red-400"
        }
      `}
    >
      <span className="relative inline-flex">
        <Heart
          size={17}
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          className={animating ? "heart-pop" : ""}
          style={{ transition: "fill 0.15s" }}
        />
        {floaters.map((id) => (
          <span key={id} className="float-heart">❤️</span>
        ))}
      </span>
      <span>{likes.length} {likes.length === 1 ? "like" : "likes"}</span>
    </button>
  );
}

/* ─── PostCard ─────────────────────────────────────────── */
function PostCard({ post, currentUserId, onLike }) {
  const postImg = getPostImage(post.image);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28 }}
      className="
        rounded-2xl overflow-hidden
        bg-white/60 dark:bg-white/[0.04]
        border border-white/40 dark:border-white/[0.08]
        backdrop-blur-xl
        shadow-sm hover:shadow-lg
        transition-all duration-200
        hover:-translate-y-0.5
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="relative flex-shrink-0">
          <img
            src={getAvatar(post.user.profilePic, post.user.name)}
            onError={(e) => { e.target.src = getAvatar(null, post.user.name); }}
            alt={post.user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400/40"
          />
          <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-950" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
            {post.user.name}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            @{post.user.username} · {post.createdAt ? timeAgo(post.createdAt) : "recently"}
          </p>
        </div>
      </div>

      {/* Image */}
      {postImg && (
        <div className="overflow-hidden">
          <img
            src={postImg}
            alt="post"
            className="w-full max-h-96 object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>
      )}

      {/* Caption */}
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">
          {post.caption}
        </p>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-slate-200 dark:bg-white/[0.06]" />

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 py-3">
        <LikeButton
          postId={post._id}
          likes={post.likes}
          currentUserId={currentUserId}
          onLike={onLike}
        />
      </div>
    </motion.div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="
      rounded-2xl overflow-hidden
      bg-white/60 dark:bg-white/[0.04]
      border border-white/40 dark:border-white/[0.07]
      backdrop-blur-xl
    ">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/[0.06] animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-slate-200 dark:bg-white/[0.06] animate-pulse" />
          <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-white/[0.05] animate-pulse" />
        </div>
      </div>
      <div className="h-48 bg-slate-200 dark:bg-white/[0.04] animate-pulse" />
      <div className="px-5 py-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-white/[0.05] animate-pulse" />
        <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-white/[0.04] animate-pulse" />
      </div>
    </div>
  );
}

/* ─── Feed (main export) ───────────────────────────────── */
export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [feedRes, meRes] = await Promise.all([
          API.get("/posts/feed"),
          API.get("/auth/me"),
        ]);
        setPosts(feedRes.data);
        setCurrentUserId(meRes.data._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLike = useCallback(async (postId) => {
    try {
      const res = await API.post(`/posts/like/${postId}`);
      setPosts((prev) => prev.map((p) => (p._id === postId ? res.data : p)));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <>
      <style>{ANIM_CSS}</style>

      {/* Matches Navbar: white/slate-100 in light, slate-950 in dark */}
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
        <div className="max-w-2xl mx-auto px-4 py-8 pb-20">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7"
          >
            {/* <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              SkillSwap
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                Swappers Feed
              </h2>
              <span className="text-2xl">🔥</span>
            </div> */}
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {posts.length} post{posts.length !== 1 ? "s" : ""} from your network
              </p>
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex flex-col gap-5">
            {loading ? (
              [0, 1, 2].map((i) => <SkeletonCard key={i} />)
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">👥</div>
                <p className="font-bold text-slate-500 dark:text-slate-400 mb-1">
                  No posts from swappers yet
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-600 max-w-xs">
                  Add swappers to your network and their skill sessions will appear here.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {posts.map((post, i) => (
                  <motion.div
                    key={post._id}
                    transition={{ delay: i < 5 ? i * 0.06 : 0 }}
                  >
                    <PostCard
                      post={post}
                      currentUserId={currentUserId}
                      onLike={handleLike}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

        </div>
      </div>
    </>
  );
}