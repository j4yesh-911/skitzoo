import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  BookOpen,
  Zap,
  ArrowRight,
  MapPin,
  Brain,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";

/* ================= SKELETON ================= */
const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-2xl bg-black/40 border border-white/10 p-6 backdrop-blur-xl"
  >
    <div className="flex items-center gap-4 mb-4">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-14 h-14 rounded-full bg-white/10"
      />
      <div className="flex-1 space-y-2">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          className="h-4 bg-white/10 rounded w-3/4"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-3 bg-white/10 rounded w-1/2"
        />
      </div>
    </div>
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
      className="h-3 bg-white/10 rounded mb-2"
    />
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      className="h-3 bg-white/10 rounded w-5/6"
    />
  </motion.div>
);

/* ================= ANIMATED SECTION ================= */
const AnimatedSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

/* ================= FLOATING PARTICLES ================= */
const FloatingParticle = ({ delay = 0, duration = 20 }) => (
  <motion.div
    className="absolute w-1 h-1 bg-white/30 rounded-full"
    initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 100 }}
    animate={{
      y: -100,
      x: Math.random() * window.innerWidth,
      opacity: [0, 1, 1, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

export default function Home() {
  const navigate = useNavigate();
  const login = !!localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Store as Sets for O(1) lookup
  const [mySwapperIds, setMySwapperIds] = useState(new Set());
  const [sentRequestIds, setSentRequestIds] = useState(new Set());

  const [usernameFilter, setUsernameFilter] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  /* ================= ENTER ================= */
  const handleEnter = () => {
    if (!login) navigate("/login");
    else navigate("/dashboard");
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!login) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [meRes, usersRes, sentRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/users"),
          API.get("/swaps/sent"),
        ]);

        setMe(meRes.data);
        setUsers(usersRes.data);
        // ✅ Use Sets for fast lookup
        setMySwapperIds(new Set((meRes.data.swappers || []).map((u) => u._id)));
        setSentRequestIds(new Set(sentRes.data.map((r) => r.toUser)));
      } catch {
        alert("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [login]);

  /* ================= AI MATCH SCORE ================= */
  const matchScore = (user) => {
    if (!me) return 0;
    const learn = me.skillsToLearn || [];
    const teach = user.skillsToTeach || [];
    return learn.filter((s) =>
      teach.map((t) => t.toLowerCase()).includes(s.toLowerCase())
    ).length;
  };

  /* ================= FILTER ================= */
  const filteredUsers = users.filter((u) => {
    const nameOk =
      !usernameFilter ||
      (u.username || u.name || "")
        .toLowerCase()
        .includes(usernameFilter.toLowerCase());

    const skillOk =
      !skillsFilter ||
      (u.skillsToTeach || []).some((s) =>
        s.toLowerCase().includes(skillsFilter.toLowerCase())
      );

    return nameOk && skillOk;
  });

  /* ================= AI RECOMMENDED ================= */
  const recommended = filteredUsers
    .map((u) => ({ ...u, score: matchScore(u) }))
    .filter((u) => u.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  /* ================= NEARBY ================= */
  const nearby = filteredUsers.filter(
    (u) =>
      (me?.city && u.city === me.city) ||
      (me?.state && u.state === me.state)
  );

  /* ================= SWIPECARD PROPS HELPER ================= */
  // ✅ Correctly maps array IDs → boolean props that SwipeCard expects
  const cardProps = (u) => ({
    user: u,
    isAlreadySwapper: mySwapperIds.has(u._id),
    isSent: sentRequestIds.has(u._id),
    setSentRequestIds: (updater) =>
      setSentRequestIds((prev) => {
        const next = new Set(prev);
        // updater receives the old array-like set; we handle the add case
        const fakeArr = [...prev];
        const result = updater(fakeArr);
        return new Set(result);
      }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white overflow-hidden">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 3} duration={20 + Math.random() * 10} />
        ))}
      </div>

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* HERO */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="h-[90vh] flex flex-col items-center justify-center text-center px-6 relative"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl md:text-8xl font-bold mb-6"
        >
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            Exchange Skills.
          </motion.span>
          <br />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text"
          >
            Learn Anything.
          </motion.span>
        </motion.h1>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEnter}
          className="px-10 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-white/90 transition-all shadow-2xl"
        >
          <span className="flex items-center gap-2">
            Enter SkillSwap
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <ArrowRight size={18} />
            </motion.span>
          </span>
        </motion.button>

        {/* FEATURES */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full"
        >
          {[
            { icon: Users, title: "Connect", desc: "Find your tribe", color: "from-blue-500 to-cyan-500" },
            { icon: BookOpen, title: "Exchange", desc: "Share knowledge", color: "from-purple-500 to-pink-500" },
            { icon: Zap, title: "Grow", desc: "Level up daily", color: "from-yellow-500 to-orange-500" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.1 }}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.3)" }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-300 cursor-pointer group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center`}
              >
                <f.icon className="text-white" size={32} />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-white/90 transition-colors">{f.title}</h3>
              <p className="text-white/50 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1 mt-3"
          >
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-4 h-4 border-b-2 border-r-2 border-white/60 rotate-45"
              style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.4))" }}
            />
            <motion.span
              animate={{ opacity: [0.1, 0.8, 0.1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-4 h-4 border-b-2 border-r-2 border-white/40 rotate-45"
              style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* DISCOVER */}
      {login && (
        <section id="discover" className="px-6 py-24 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* FILTERS */}
            <AnimatedSection>
              <div className="flex flex-col md:flex-row gap-4 mb-14">
                <motion.div whileHover={{ scale: 1.02 }} className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    value={usernameFilter}
                    onChange={(e) => setUsernameFilter(e.target.value)}
                    placeholder="Search users"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} className="relative flex-1">
                  <Brain className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    value={skillsFilter}
                    onChange={(e) => setSkillsFilter(e.target.value)}
                    placeholder="Search skills"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                  />
                </motion.div>
              </div>
            </AnimatedSection>

            {/* AI RECOMMENDED */}
            {recommended.length > 0 && (
              <AnimatedSection delay={0.2}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="mb-12"
                >
                  <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <Brain className="text-purple-400" />
                    </motion.div>
                    People You May Like
                  </h2>
                  <p className="text-white/50 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Based on your skills and interests
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 mb-20">
                  <AnimatePresence mode="popLayout">
                    {recommended.map((u, index) => (
                      <motion.div
                        key={u._id}
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                      >
                        {/* ✅ Correct props passed — isAlreadySwapper & isSent are booleans */}
                        <SwipeCard {...cardProps(u)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            )}

            {/* NEARBY */}
            <AnimatedSection delay={0.4}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <MapPin className="text-blue-400" />
                  </motion.div>
                  Nearby Users
                </h2>
                <p className="text-white/50">Connect with learners in your area</p>
              </motion.div>

              {loading ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {nearby.map((u, index) => (
                      <motion.div
                        key={u._id}
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                      >
                        {/* ✅ Correct props passed — isAlreadySwapper & isSent are booleans */}
                        <SwipeCard {...cardProps(u)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {!loading && nearby.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                >
                  <MapPin className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 text-lg">No nearby users found</p>
                  <p className="text-white/30 mt-2">Try expanding your search</p>
                </motion.div>
              )}
            </AnimatedSection>
          </div>
        </section>
      )}
    </div>
  );
}