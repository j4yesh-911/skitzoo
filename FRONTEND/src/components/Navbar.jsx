// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useState, useEffect, useRef } from "react";
// import ThemeToggle from "./ThemeToggle";
// import { getSocket } from "../services/socket";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const socket = getSocket();

//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [unreadChats, setUnreadChats] = useState(0);
//   const dropdownRef = useRef(null);

//   const login = !!localStorage.getItem("token");

//   // ================= CLICK OUTSIDE =================
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () =>
//       document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // ================= SOCKET CHAT NOTIFICATION =================
//   useEffect(() => {
//     if (!socket || !login) return;

//     // when new message arrives
//     socket.on("newChatMessage", () => {
//       // if user is NOT on chats page, increase count
//       if (!location.pathname.startsWith("/chats")) {
//         setUnreadChats((prev) => prev + 1);
//       }
//     });

//     return () => {
//       socket.off("newChatMessage");
//     };
//   }, [socket, login, location.pathname]);

//   // ================= CLEAR COUNT WHEN CHAT PAGE OPEN =================
//   useEffect(() => {
//     if (location.pathname.startsWith("/chats")) {
//       setUnreadChats(0);
//       socket.emit("markChatsRead");
//     }
//   }, [location.pathname, socket]);

//   // ================= ACTIONS =================
//   const logoutfun = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//     alert("logged out");
//   };

//   const handledashboard = () => (login ? navigate("/dashboard") : navigate("/login"));
//   const handlechat = () => (login ? navigate("/chats") : navigate("/login"));
//   const handleprofile = () => (login ? navigate("/profile") : navigate("/login"));

//   const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

//   const handleAbout = () => {
//     navigate("/about");
//     setIsDropdownOpen(false);
//   };

//   const handleSettingsProfile = () => {
//     handleprofile();
//     setIsDropdownOpen(false);
//   };

//   const handleSettingsLogout = () => {
//     logoutfun();
//     setIsDropdownOpen(false);
//   };

//   const match = () => {
//     navigate("/match");
//     setIsDropdownOpen(false);
//   };


//   const swappers =() =>{
//     navigate("/swappers");
//   }

//   return (

//     <div  className="bg-white text-black dark:bg-black dark:text-white">
//     <nav className="flex justify-between items-center px-8 py-4 glass relative">
//       <h1 className="text-xl font-bold text-neon">SkillSwap</h1>

//       <div className="flex gap-6 items-center">
//         <Link to="/" className="hover:text-blue-400 transition-colors">
//           Home
//         </Link>

//         <button onClick={handledashboard} className="hover:text-blue-400 transition-colors">
//           Dashboard
//         </button>

//         {/* 🔔 CHAT WITH BADGE */}
//         <button
//           onClick={handlechat}
//           className="relative hover:text-blue-400 transition-colors"
//         >
//           Chats
//           {unreadChats > 0 && (
//             <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
//               {unreadChats}
//             </span>
//           )}
//         </button>

//         <button onClick={match} className="hover:text-blue-400 transition-colors">
//           Match
//         </button>


//          <button onClick={swappers} className="hover:text-blue-400 transition-colors">
//           swappers
//         </button>

//         <ThemeToggle />

//         {/* SETTINGS */}
//         <div className="relative" ref={dropdownRef}>
//           <button
//             onClick={toggleDropdown}
//             className="flex items-center gap-2 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-white/10"
//           >
//             Settings
//           </button>

//           {isDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50">
//               <button
//                 onClick={handleSettingsProfile}
//                 className="w-full px-4 py-3 text-left hover:bg-gray-700"
//               >
//                 Profile
//               </button>

//               <button
//                 onClick={handleAbout}
//                 className="w-full px-4 py-3 text-left hover:bg-gray-700"
//               >
//                 About Us
//               </button>

//               <div className="border-t border-gray-600" />

//               <button
//                 onClick={handleSettingsLogout}
//                 className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-600/20"
//               >
//                 Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//     </div>
//   );
// }





import { useNavigate } from "react-router-dom";
import { Menu, Home, LayoutDashboard, User, SearchX, SearchAlert, UserSearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import API from "../services/api";

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const login = !!localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const go = (path) => {
    if (!login && path !== "/") {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const loadUser = async () => {
      if (!login) return setLoadingUser(false);

      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [login]);

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-2xl 
      bg-white/30 dark:bg-slate-950/30 
      border-b border-white/20 dark:border-white/10 
      shadow-lg transition-colors duration-300"
    >
      <div className="flex justify-between items-center px-8 py-4">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-white/40 dark:bg-white/5 
              backdrop-blur-xl hover:bg-white/60 dark:hover:bg-white/10 
              border border-white/40 dark:border-white/10 transition"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-2xl font-extrabold bg-gradient-to-r 
            from-slate-800 to-slate-600 
            dark:from-slate-100 dark:to-slate-400 
            bg-clip-text text-transparent"
          >
            SkillSwap
          </h1>
        </div>

        {/* CENTER */}
        <div className="hidden md:flex gap-8">
          <button
            onClick={() => go("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl 
              hover:bg-white/40 dark:hover:bg-white/5 transition"
          >
            <Home size={18} />
            Home
          </button>

          <button
            onClick={() => go("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl 
              hover:bg-white/40 dark:hover:bg-white/5 transition"
          >
            <UserSearchIcon size={18} />
            Discover
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          <ThemeToggle />

          {/* PROFILE AVATAR */}
          {login && (
            <button
              onClick={() => navigate("/profile")}
              className="relative w-10 h-10 rounded-full 
                overflow-hidden border border-white/40 
                dark:border-white/10 
                hover:scale-105 transition"
            >
              {loadingUser ? (
                /* SKELETON */
                <div className="w-full h-full animate-pulse 
                  bg-gradient-to-br from-slate-300/60 to-slate-400/60 
                  dark:from-slate-700/40 dark:to-slate-600/40"
                />
              ) : user?.profilePic ? (
                /* PROFILE PIC */
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                /* FALLBACK ICON */
                <div className="w-full h-full flex items-center justify-center 
                  bg-gradient-to-br from-cyan-400 to-purple-500 text-white"
                >
                  <User size={20} />
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
