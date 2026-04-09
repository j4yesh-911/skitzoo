import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import API from "../services/api";

export default function MatchCard({ user, index }) {
  const [mySwappers, setMySwappers] = useState([]);
  const [sentRequestIds, setSentRequestIds] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 🔹 load logged-in user
        const meRes = await API.get("/auth/me");
        setMySwappers(
          (meRes.data.swappers || []).map((u) => u._id.toString())
        );

        // 🔹 load SENT requests
        const sentRes = await API.get("/swaps/sent");
        setSentRequestIds(
          sentRes.data.map((r) => r.toUser.toString())
        );

        console.log("MY SWAPPERS:", meRes.data.swappers);
        console.log("SENT IDS:", sentRes.data);
      } catch (err) {
        console.error("Failed to load state", err);
      }
    };

    loadData();
  }, []);

  const userId = user._id.toString();

  const isAlreadySwapper = mySwappers.includes(userId);
  const isSent = sentRequestIds.includes(userId);

  const sendRequest = async () => {
    if (isAlreadySwapper || isSent) return;

    try {
      await API.post("/swaps/send", {
        toUser: userId,
        skillOffered: "React",
        skillRequested: "Node",
      });

      // 🔥 UI UPDATE GUARANTEED
      setSentRequestIds((prev) => [...prev, userId]);
    } catch (err) {
      console.error("Send request failed:", err.response?.data || err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl"
    >
      <img
        src={
          user.profilePic
            ? user.profilePic.startsWith("/uploads")
              ? `http://localhost:5000${user.profilePic}`
              : user.profilePic
            : "/avatar.png"
        }
        className="w-16 h-16 rounded-full mb-4 object-cover"
        alt="profile"
      />

      <h2 className="text-xl font-semibold">
        {user.username || user.name || "User"}
      </h2>

      <p className="text-sm text-cyan-400 mt-2">
        Can Teach: {user.skillsToTeach?.join(", ") || "N/A"}
      </p>

      <p className="text-sm text-violet-400">
        Wants to Learn: {user.skillsToLearn?.join(", ") || "N/A"}
      </p>

      <div className="flex gap-3 mt-4">
        <button className="flex-1 bg-cyan-500/20 p-2 rounded-lg">
          Chat
        </button>

        <button className="flex-1 bg-violet-500/20 p-2 rounded-lg">
          Video
        </button>

        {/* 🔥 FINAL UX – BUTTON COMPLETELY GONE */}
        {isAlreadySwapper ? (
          <span className="flex-1 text-green-500 text-sm flex items-center justify-center">
            ✓ Swap Partner
          </span>
        ) : isSent ? (
          <span className="flex-1 text-yellow-400 text-sm flex items-center justify-center">
            ⏳ Request Sent
          </span>
        ) : (
          <button
            onClick={sendRequest}
            className="flex-1 bg-emerald-500/20 p-2 rounded-lg"
          >
            SwapSkill
          </button>
        )}
      </div>
    </motion.div>
  );
}
