import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { MessageCircle } from "lucide-react";

export default function Swappers() {
  const [swappers, setSwappers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/auth/me");
        setSwappers(res.data.swappers || []);
      } catch (err) {
        console.error("Failed to load swappers:", err);
      }
    };
    load();
  }, []);

  const openChat = async (receiverId) => {
    try {
      const res = await API.post("/chats/find-or-create", { receiverId });
      navigate(`/chat/${res.data._id}`);
    } catch {
      alert("Chat open failed");
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      {/* HERO HEADER */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight
        bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400
        bg-clip-text text-transparent">
          Your Swappers
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Your trusted circle — connect, chat & grow together
        </p>
      </div>

      {/* EMPTY */}
      {swappers.length === 0 && (
        <div className="text-center text-zinc-400">
          No swappers yet 🤝
        </div>
      )}

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {swappers.map((u) => {
          const name = u.username || u.name || "User";
          const letter = name.charAt(0).toUpperCase();

          return (
            <div
              key={u._id}
              onClick={() => openChat(u._id)}
              className="group relative cursor-pointer rounded-3xl p-[1px]
              bg-gradient-to-br from-sky-400/40 via-transparent to-indigo-400/40
              hover:from-sky-400 hover:to-indigo-500 transition-all duration-500"
            >
              {/* CARD */}
              <div className="relative rounded-3xl p-6
              bg-black/40 dark:bg-black/60 backdrop-blur-xl
              border border-white/10
              transition-all duration-300
              group-hover:-translate-y-1
              group-hover:shadow-[0_25px_60px_-20px_rgba(56,189,248,0.45)]">

                {/* AVATAR + STATUS */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {/* Avatar Ring */}
                    <div className="p-[2px] rounded-full
                    bg-gradient-to-br from-sky-400 to-indigo-500">
                      {u.profilePic ? (
                        <img
                          src={u.profilePic}
                          alt={name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full
                        bg-gradient-to-br from-sky-600 to-indigo-600
                        flex items-center justify-center
                        font-bold text-white text-lg">
                          {letter}
                        </div>
                      )}
                    </div>

                    {/* Online pulse */}
                    <span className="absolute bottom-0 right-0 w-3 h-3
                    bg-green-500 rounded-full border-2 border-black
                    animate-pulse" />
                  </div>

                  {/* INFO */}
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-white leading-tight">
                      {name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Active recently
                    </p>
                  </div>

                  {/* ACTION */}
                  <div className="opacity-0 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full
                    bg-sky-400/20 flex items-center justify-center
                    backdrop-blur-md">
                      <MessageCircle className="text-sky-400" />
                    </div>
                  </div>
                </div>

                {/* SUBTLE FOOTER */}
                <div className="mt-5 text-[11px] text-zinc-500">
                  Click to start conversation →
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
