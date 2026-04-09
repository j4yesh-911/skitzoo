import { useNavigate } from "react-router-dom";
import {
  X,
  MessageCircle,
  Shuffle,
  Users,
  User,
  Info,
  LogOut,
  Inbox,
  Handshake,
  CircleStop,
  OctagonAlert,
  OctagonXIcon,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose, unreadChats }) {
  const navigate = useNavigate();
  const login = !!localStorage.getItem("token");

  const go = (path) => {
    if (!login) {
      navigate("/login");
    } else {
      navigate(path);
    }
    onClose();
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    onClose();
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white/40 dark:bg-slate-950/40
        backdrop-blur-2xl border-r border-white/20 dark:border-white/10 shadow-2xl z-50 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-slate-800/20 pointer-events-none" />

        <div className="relative h-full flex flex-col p-5">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6 pb-5 border-b border-white/20 dark:border-white/10">
            <h2 className="text-lg font-bold">Menu</h2>
            <button
              onClick={onClose}
              className="w-100 h-100 rounded-lg bg-white/30 dark:bg-white/5 hover:rotate-180 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* MENU */}
          <nav className="flex-1 space-y-1">
            <Item label="Messages" icon={<MessageCircle size={16} />} badge={unreadChats} onClick={() => go("/chats")} />
            <Item label="Match" icon={<Shuffle size={16} />} onClick={() => go("/match")} />
            <Item label="Swappers" icon={<Users size={16} />} onClick={() => go("/swappers")} />
            <Item label="Requests" icon={<Handshake size={16} />} onClick={() => go("/swap-requests")} />
            <Item label="Reports" icon={<OctagonXIcon size={16} />} onClick={() => go("/reports/my")} />
            <Item label="Profile" icon={<User size={16} />} onClick={() => go("/profile")} />
            {/* <Item label="About" icon={<Info size={16} />} onClick={() => go("/about")} /> */}
            <Item label="dashboard" icon={<Info size={16} />} onClick={() => go("/dashboardd")} />
          </nav>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="mt-4 flex items-center gap-3 px-3 py-3 rounded-xl bg-white/30 dark:bg-white/5 hover:bg-white/50 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

function Item({ label, icon, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/30 dark:hover:bg-white/5 transition"
    >
      <div className="w-8 h-8 rounded-lg bg-white/30 dark:bg-white/5 flex items-center justify-center">
        {icon}
      </div>

      <span className="flex-1 text-left text-sm font-medium">{label}</span>

      {badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}
