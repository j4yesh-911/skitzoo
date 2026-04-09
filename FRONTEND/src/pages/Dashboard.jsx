import { useEffect, useState } from "react";
import API from "../services/api";
import SwipeCard from "../components/SwipeCard";
import { Search, X } from "lucide-react";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mySwappers, setMySwappers] = useState([]);
  const [sentIds, setSentIds] = useState([]);
  const [uFilter, setUFilter] = useState("");
  const [sFilter, setSFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [me, usersRes, sentRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/users"),
          API.get("/swaps/sent"),
        ]);

        setUsers(usersRes.data || []);
        setMySwappers((me.data?.swappers || []).map((u) => u._id.toString()));
        setSentIds((sentRes.data || []).map((r) => r.toUser.toString()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = users.filter((u) => {
    const nameMatch =
      !uFilter ||
      (u.username || u.name || "")
        .toLowerCase()
        .includes(uFilter.toLowerCase());

    const skillMatch =
      !sFilter ||
      (u.skillsToTeach || []).some((s) =>
        s.toLowerCase().includes(sFilter.toLowerCase())
      );

    return nameMatch && skillMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-900 dark:to-slate-950 px-3 sm:px-6 py-6">

      {/* HEADER */}
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Discover People
        </h1>
        <p className="text-sm text-gray-500">
          Find people to swap skills with
        </p>
      </div>

      {/* SEARCH */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl shadow-md mb-6 flex flex-col sm:flex-row gap-3">

        {/* Username */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            value={uFilter}
            onChange={(e) => setUFilter(e.target.value)}
            placeholder="Search username..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm outline-none"
          />
          {uFilter && (
            <button
              onClick={() => setUFilter("")}
              className="absolute right-2 top-2"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Skill */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            value={sFilter}
            onChange={(e) => setSFilter(e.target.value)}
            placeholder="Search skill..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm outline-none"
          />
          {sFilter && (
            <button
              onClick={() => setSFilter("")}
              className="absolute right-2 top-2"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* STATUS */}
      {!loading && (
        <div className="mb-4 text-sm text-gray-500 text-center sm:text-left">
          {filtered.length} people found
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No users found
        </div>
      )}

      {/* GRID (KEY CHANGE 👇) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {filtered.map((user) => (
          <SwipeCard
            key={user._id}
            user={user}
            isAlreadySwapper={mySwappers.includes(user._id.toString())}
            isSent={sentIds.includes(user._id.toString())}
            setSentRequestIds={setSentIds}
          />
        ))}
      </div>
    </div>
  );
}
