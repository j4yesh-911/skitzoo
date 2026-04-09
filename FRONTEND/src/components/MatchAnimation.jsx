import { motion } from "framer-motion";

export default function MatchAnimation({ perfectMatch = true }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`w-40 h-40 rounded-full ${
          perfectMatch
            ? "bg-gradient-to-r from-cyan-400 to-violet-500"
            : "bg-gradient-to-r from-green-400 to-blue-500"
        }`}
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, 360],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      <motion.p
        className={`mt-8 text-xl ${
          perfectMatch ? "text-cyan-300" : "text-green-300"
        }`}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {perfectMatch ? "Finding perfect skill swaps..." : "Finding skill teachers..."}
      </motion.p>
    </motion.div>
  );
}
