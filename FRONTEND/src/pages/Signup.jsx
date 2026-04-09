import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function Signup() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/signup", data);

      localStorage.setItem("token", res.data.token);
      navigate("/complete-profile");
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* 🔥 BACKGROUND IMAGE SLOT */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://i.pinimg.com/736x/84/c3/23/84c32381e89d99526c3bb265ffabdd2c.jpg)", // 🔁 change anytime
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/80" />

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl
                   bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <h1 className="text-3xl font-extrabold text-white text-center">
          Create Account
        </h1>
        <p className="text-center text-gray-400 mt-2 text-sm">
          Join and start swapping skills
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          {["name", "email", "password"].map((field) => (
            <input
              key={field}
              type={field === "password" ? "password" : "text"}
              placeholder={field.toUpperCase()}
              required
              className="w-full px-4 py-3 rounded-lg
                         bg-black/40 border border-white/10
                         text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-850"
              onChange={(e) =>
                setData({ ...data, [field]: e.target.value })
              }
            />
          ))}

          <button
  className="w-full py-3 rounded-xl font-bold tracking-widest
             bg-black/50 border border-blue-500/60
             text-blue-400
             hover:bg-black/80
             hover:border-blue-400
             hover:text-blue-300
             hover:shadow-md hover:shadow-blue-500/15
             transition-all duration-300 ease-out"
          >
            Signup
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
