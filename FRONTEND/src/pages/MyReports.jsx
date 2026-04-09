import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/reports/my");
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const removeAllegation = async (reportId) => {
    if (!window.confirm("Remove allegation and unblock this user?")) return;

    try {
      setRemovingId(reportId);
      await API.delete(`/reports/${reportId}`);
      setReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch (err) {
      alert("Failed to remove allegation");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-6 py-8">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Reported Users
        </h1>
        <p className="text-sm text-gray-500">
          Manage users you’ve reported
        </p>
      </div>

      {/* EMPTY */}
      {reports.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          No reports yet 🚀
        </div>
      ) : (

        <div className="max-w-5xl mx-auto grid gap-6">

          {reports.map((r) => {
            const avatar =
              r.reported?.profilePic ||
              `https://ui-avatars.com/api/?name=${r.reported?.username}`;

            return (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
              >

                {/* TOP */}
                <div className="flex items-center gap-4">

                  {/* AVATAR */}
                  <img
                    src={avatar}
                    className="w-12 h-12 rounded-full object-cover border"
                  />

                  {/* USER INFO */}
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      @{r.reported?.username || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="mt-4 space-y-2 text-sm">

                  <div className="text-red-500 font-medium">
                    Reason: {r.reason}
                  </div>

                  {r.feedback && (
                    <div className="text-gray-600 dark:text-gray-300">
                      {r.feedback}
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="mt-5 flex gap-3">

                  <button
                    onClick={() => navigate(`/users/${r.reported?._id}`)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => removeAllegation(r._id)}
                    disabled={removingId === r._id}
                    className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition disabled:opacity-50"
                  >
                    {removingId === r._id
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}