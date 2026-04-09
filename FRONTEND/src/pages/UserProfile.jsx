import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, currentUserRes] = await Promise.all([
          API.get(`/users/${id}`),
          API.get("/auth/me")
        ]);
        setUser(userRes.data);
        setCurrentUser(currentUserRes.data);
      } catch (err) {
        alert("Failed to load user");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleMessage = async () => {
    try {
      const res = await API.post("/chats/find-or-create", {
        receiverId: user._id,
      });
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      alert("Failed to start chat");
    }
  };

  const handleLike = async () => {
    setLiking(true);
    try {
      const res = await API.post("/likes", {
        toUserId: user._id,
        action: "like",
      });
      if (res.data.chatId) {
        alert("It's a match! Chat created.");
        navigate(`/chat/${res.data.chatId}`);
      } else {
        alert("Skill swap request sent!");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to send request");
    } finally {
      setLiking(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!user) return <p className="p-6">User not found</p>;

  const avatar =
    user.profilePic
      ? user.profilePic.startsWith("/uploads")
        ? `http://localhost:5000${user.profilePic}`
        : user.profilePic
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-8"
        >
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8">
            <motion.img
              src={avatar}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-violet-500 mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            />
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <div className="flex flex-col items-center gap-1">
              {user.username && (
                <p className="text-gray-400">@{user.username}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-200">
                {user.age && <span className="font-medium">Age: {user.age}</span>}
                {user.gender && (
                  <span className="flex items-center gap-1">
                    {user.gender === 'Male' && <span className="text-blue-500 text-xl font-extrabold">♂</span>}
                    {user.gender === 'Female' && <span className="text-pink-500 text-xl font-extrabold">♀</span>}
                    {user.gender === 'Other' && <span className="text-xl font-extrabold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 via-purple-500 bg-clip-text text-transparent">⚲</span>}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-2 mb-8">
            {user.location && (
              <div className="flex gap-2">
                <span className="font-semibold"> Location:</span>
                <span>{user.location}</span>
              </div>
            )}
            {(user.city || user.state) && (
              <div className="flex gap-2">
                <span className="font-semibold"> City/State:</span>
                <span>{[user.city, user.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {currentUser && currentUser._id === user._id && user.phone && (
              <div className="flex gap-2">
                <span className="font-semibold">Phone:</span>
                <span>{user.phone}</span>
              </div>
            )}
            {user.bio && (
              <div className="mt-4">
                <span className="font-semibold block mb-2">Bio:</span>
                <p className="text-gray-700 dark:text-gray-300 bg-white/10 p-3 rounded-lg">
                  {user.bio}
                </p>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="border-t border-white/20 pt-6 mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Skills to Teach:</h3>
              <div className="flex flex-wrap gap-2">
                {user.skillsToTeach?.length > 0 ? (
                  user.skillsToTeach.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-violet-500/20 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Not specified</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Wants to Learn:</h3>
              <div className="flex flex-wrap gap-2">
                {user.skillsToLearn?.length > 0 ? (
                  user.skillsToLearn.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-cyan-500/20 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Not specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleMessage}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-lg font-semibold text-white shadow-lg"
            >
               Message
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleLike}
              disabled={liking}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-semibold text-white shadow-lg disabled:opacity-50"
            >
              {liking ? "Sending..." : "Swap Skill"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
