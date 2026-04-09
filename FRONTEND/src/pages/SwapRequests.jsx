import { useEffect, useState } from "react";
import API from "../services/api";

export default function SwapRequests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await API.get("/swaps/requests");
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const accept = async (id) => {
    await API.post(`/swaps/accept/${id}`);
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  const decline = async (id) => {
    await API.post(`/swaps/decline/${id}`);
    setRequests(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Skill Swap Requests</h1>

      {requests.length === 0 && (
        <p className="text-gray-400">No pending requests</p>
      )}

      <div className="space-y-4">
        {requests.map(r => (
          <div
            key={r._id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{r.fromUser.username}</p>
              <p className="text-sm text-gray-400">
                Offers: {r.skillOffered} | Wants: {r.skillRequested}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => accept(r._id)}
                className="px-3 py-1 bg-green-600 rounded-lg hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={() => decline(r._id)}
                className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
