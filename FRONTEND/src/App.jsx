import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import { getSocket } from "./services/socket";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const location = useLocation();
  const socket = getSocket();
  const { dark } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);

  // ❌ pages where navbar & sidebar should NOT show
  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  // ================= SOCKET NOTIFICATION =================
  useEffect(() => {
    const handleReceive = (msg) => {
      if (!msg || !msg.chatId) return;

      const currentChatId = location.pathname.startsWith("/chat/")
        ? location.pathname.split("/chat/")[1]
        : null;

      // 🔔 increment unread count if not on chats
      if (!location.pathname.startsWith("/chats")) {
        setUnreadChats((prev) => prev + 1);
      }

      if (currentChatId !== msg.chatId) {
        if (Notification.permission === "granted") {
          new Notification("New message", { body: msg.text });
        }
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [location.pathname, socket]);

  // ================= CLEAR UNREAD ON CHAT PAGE =================
  useEffect(() => {
    if (location.pathname.startsWith("/chats")) {
      setUnreadChats(0);
    }
  }, [location.pathname]);

  return (


       <div className="overflow-y-auto scroll-area">

    <div
    
      className={`min-h-screen ${
        dark
          ? "bg-gradient-to-br from-black via-slate-900 to-black text-white"
          : "bg-gradient-to-br from-white via-gray-100 to-gray-200 text-black"
      }`}
    >
      {/* ✅ NAVBAR */}
      {!hideNavbar && (
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      )}

      {/* ✅ SIDEBAR */}
      {!hideNavbar && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadChats={unreadChats}
        />
      )}

      {/* ✅ ROUTES */}
      <AppRoutes />
    </div>
    </div>
  );
}
