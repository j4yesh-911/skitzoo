import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import MatchCard from "../components/MatchCard";
import MatchAnimation from "../components/MatchAnimation";
import { useTheme } from "../context/ThemeContext";

export default function Match() {
  const { dark } = useTheme();

  const [learnSkill, setLearnSkill] = useState("");
  const [teachSkill, setTeachSkill] = useState("");
  const [perfectMatch, setPerfectMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  const generateMatch = async () => {
    if (!learnSkill || (perfectMatch && !teachSkill)) {
      setError("Please fill in the required skills.");
      return;
    }

    setLoading(true);
    setMatches([]);
    setError("");

    try {
      const res = await API.post("/users/match", {
        learnSkill: learnSkill.trim(),
        teachSkill: teachSkill.trim(),
        perfectMatch,
      });

      setTimeout(() => {
        if (res.data.length === 0) {
          setError("No matching users found.");
        } else {
          setMatches(res.data);
        }
        setLoading(false);
      }, 2500);
    } catch (err) {
      console.error("MATCH ERROR:", err);
      setError("Something went wrong while finding matches.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* INPUT SECTION */}
      <div className="max-w-3xl mx-auto mt-20">
        <h1 className="text-4xl font-bold text-center mb-10">
          {perfectMatch ? "Find Your Perfect Skill Swap" : "Find Skill Teachers"}
        </h1>

        {/* TOGGLE BUTTON */}
        <div className="flex items-center justify-center mb-6">
          <span className={`mr-3 text-lg ${dark ? 'text-white' : 'text-black'}`}>
            {perfectMatch ? 'Perfect Match' : 'Skill Teachers'}
          </span>
          <motion.div
            className={`w-14 h-8 rounded-full p-1 cursor-pointer ${
              perfectMatch ? 'bg-gradient-to-r from-cyan-500 to-violet-500' : 'bg-gray-400'
            }`}
            onClick={() => setPerfectMatch(!perfectMatch)}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-6 bg-white rounded-full shadow-md"
              animate={{ x: perfectMatch ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
            />
          </motion.div>
        </div>

        {perfectMatch ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Skill you want to learn"
              value={learnSkill}
              onChange={(e) => setLearnSkill(e.target.value)}
              className={`p-4 rounded-xl outline-none border
                ${
                  dark
                    ? "bg-white/10 border-white/20 text-white placeholder-gray-400"
                    : "bg-black/5 border-black/20 text-black placeholder-gray-600"
                }
                focus:ring-2 focus:ring-cyan-400`}
            />

            <input
              type="text"
              placeholder="Skill you can teach"
              value={teachSkill}
              onChange={(e) => setTeachSkill(e.target.value)}
              className={`p-4 rounded-xl outline-none border
                ${
                  dark
                    ? "bg-white/10 border-white/20 text-white placeholder-gray-400"
                    : "bg-black/5 border-black/20 text-black placeholder-gray-600"
                }
                focus:ring-2 focus:ring-violet-400`}
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Skill you want to learn"
              value={learnSkill}
              onChange={(e) => setLearnSkill(e.target.value)}
              className={`p-4 rounded-xl outline-none border w-full
                ${
                  dark
                    ? "bg-white/10 border-white/20 text-white placeholder-gray-400"
                    : "bg-black/5 border-black/20 text-black placeholder-gray-600"
                }
                focus:ring-2 focus:ring-cyan-400`}
            />
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateMatch}
          disabled={!learnSkill || (perfectMatch && !teachSkill) || loading}
          className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-violet-500
                     p-4 rounded-xl font-semibold text-lg text-white
                     disabled:opacity-40"
        >
          {loading ? "Matching..." : perfectMatch ? "Generate Match" : "Find Teachers"}
        </motion.button>
      </div>

      {/* FULLSCREEN ANIMATION */}
      <AnimatePresence>
        {loading && <MatchAnimation perfectMatch={perfectMatch} />}
      </AnimatePresence>

      {/* ERROR */}
      {!loading && error && (
        <p className="text-center text-red-500 mt-12 text-lg">
          {error}
        </p>
      )}

      {/* RESULTS */}
      {!loading && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {matches.map((user, i) => (
            <MatchCard key={user._id} user={user} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
