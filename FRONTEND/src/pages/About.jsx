import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function About() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  return (
    <div
      className={`min-h-screen relative ${
        dark
          ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
          : "bg-gradient-to-br from-white via-purple-100 to-pink-100 text-black"
      }`}
    >
      {/* BACKGROUND (CLICK SAFE) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className={`absolute inset-0 ${
            dark
              ? "bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"
              : "bg-gradient-to-br from-blue-300/20 via-purple-300/20 to-pink-300/20"
          }`}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            About SkillSwap
          </h1>
          <p className={`${dark ? "text-gray-300" : "text-gray-700"} text-xl max-w-3xl mx-auto`}>
            Connecting learners and mentors worldwide through innovative technology and collaborative learning experiences.
          </p>
        </motion.div>

        {/* MISSION */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div
            className={`p-8 rounded-2xl max-w-4xl mx-auto backdrop-blur ${
              dark ? "bg-white/10" : "bg-white/70"
            }`}
          >
            <h2 className="text-3xl font-bold text-center mb-6 text-blue-500">
              Our Mission
            </h2>
            <p className={`${dark ? "text-gray-300" : "text-gray-700"} text-lg text-center`}>
              SkillSwap democratizes education by connecting learners with mentors
              across the globe through collaborative learning experiences.
            </p>
          </div>
        </motion.div>

        {/* TEAM */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-center mb-12 text-pink-500">
            Meet Our Team
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Jayesh Gayri",
                role: "Full Stack Developer",
                desc:
                  "Expert in team management and building user-centric applications.",
                tag: "JG",
              },
              {
                name: "Haridrumad Singh Jhala",
                role: "Full Stack Developer",
                desc:
                  "Frontend specialist focused on modern, responsive UI design.",
                tag: "HS",
              },
              {
                name: "Pankaj Joshi",
                role: "Full Stack Developer",
                desc:
                  "Backend expert in scalable APIs and Git/GitHub management.",
                tag: "PJ",
              },
            ].map((dev) => (
              <motion.div
                key={dev.name}
                whileHover={{ scale: 1.05 }}
                className={`p-8 rounded-xl text-center backdrop-blur ${
                  dark ? "bg-white/10" : "bg-white/70"
                }`}
              >
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white">
                  {dev.tag}
                </div>
                <h3 className="text-2xl font-semibold mb-2">{dev.name}</h3>
                <p className={`${dark ? "text-gray-300" : "text-gray-700"} mb-2`}>
                  {dev.role}
                </p>
                <p className={`${dark ? "text-gray-400" : "text-gray-600"} text-sm`}>
                  {dev.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div
            className={`p-8 rounded-2xl max-w-2xl mx-auto backdrop-blur ${
              dark ? "bg-white/10" : "bg-white/70"
            }`}
          >
            <h2 className="text-3xl font-bold mb-6 text-green-500">
              Get In Touch
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:scale-105 transition"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="px-8 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:scale-105 transition"
              >
                View Profile
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
