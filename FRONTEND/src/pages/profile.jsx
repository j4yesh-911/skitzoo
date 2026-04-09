import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Edit3,
  Save,
  X,
  User,
  Phone,
  AtSign,
  LogOut,
  FileText,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

/* ─── responsive styles injected once ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .profile-root {
    min-height: 100svh;
    background-image: url(https://i.pinimg.com/1200x/7c/88/56/7c8856e15121993790413dcfb670e1b4.jpg);
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 20px 16px 40px;
    font-family: 'DM Sans', sans-serif;
  }

  .profile-card {
    width: 100%;
    max-width: 860px;
    border-radius: 28px;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.35);
    box-shadow: 0 24px 64px rgba(0,0,0,0.22);
    padding: 28px 20px;
  }

  @media (min-width: 600px) {
    .profile-card { padding: 36px 40px; }
  }

  /* ── header ── */
  .profile-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 28px;
  }
  .profile-header-top {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }
  .profile-header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  @media (min-width: 500px) {
    .profile-header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .profile-header-actions { flex-wrap: nowrap; }
  }

  .avatar-wrap { position: relative; flex-shrink: 0; }
  .avatar-img {
    width: 72px; height: 72px;
    border-radius: 50%; object-fit: cover;
    border: 2px solid rgba(255,255,255,0.5);
  }
  @media (min-width: 600px) {
    .avatar-img { width: 88px; height: 88px; }
  }
  .avatar-placeholder {
    width: 72px; height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #67e8f9, #a78bfa);
    display: flex; align-items: center; justify-content: center;
    color: #fff;
  }
  @media (min-width: 600px) {
    .avatar-placeholder { width: 88px; height: 88px; }
  }
  .avatar-edit-btn {
    position: absolute; bottom: 0; right: 0;
    background: #06b6d4; color: #fff;
    border: none; border-radius: 50%;
    width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s;
  }
  .avatar-edit-btn:hover { background: #0891b2; }
  .avatar-remove-btn {
    position: absolute; top: 0; right: 0;
    background: #ef4444; color: #fff;
    border: none; border-radius: 50%;
    width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s;
  }
  .avatar-remove-btn:hover { background: #dc2626; }

  .profile-name {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(18px, 4vw, 24px);
    font-weight: 400; margin: 0 0 2px;
    color: #111;
  }
  .profile-email { font-size: 13px; opacity: 0.6; margin: 0; }

  /* ── action buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 12px;
    font-size: 13px; font-weight: 600;
    border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.18s, transform 0.1s;
    white-space: nowrap;
  }
  .btn:active { transform: scale(0.97); }
  .btn-edit   { background: rgba(255,255,255,0.4); color: #111; }
  .btn-edit:hover { background: rgba(255,255,255,0.6); }
  .btn-save   { background: rgba(34,197,94,0.25); color: #166534; }
  .btn-save:hover { background: rgba(34,197,94,0.4); }
  .btn-cancel { background: rgba(239,68,68,0.2); color: #991b1b; }
  .btn-cancel:hover { background: rgba(239,68,68,0.35); }
  .btn-logout {
    padding: 9px 12px;
    background: rgba(239,68,68,0.15);
    color: #b91c1c; border: none;
    border-radius: 12px; cursor: pointer;
    transition: background 0.18s;
  }
  .btn-logout:hover { background: rgba(239,68,68,0.3); }
  .btn-ai {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 10px;
    background: linear-gradient(135deg, #a855f7, #ec4899);
    color: #fff; border: none; cursor: pointer;
    font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.18s, transform 0.1s;
    box-shadow: 0 4px 14px rgba(168,85,247,0.35);
  }
  .btn-ai:hover { opacity: 0.9; transform: scale(1.03); }

  /* ── section label ── */
  .section-label {
    font-size: 13px; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase;
    color: rgba(0,0,0,0.4); margin: 0 0 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .section-row {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 10px;
  }

  /* ── bio ── */
  .bio-textarea {
    width: 100%; padding: 12px 14px;
    border-radius: 14px; resize: none;
    background: rgba(255,255,255,0.7);
    border: 1px solid rgba(0,0,0,0.1);
    font-size: 14px; line-height: 1.6;
    color: #111; outline: none;
    font-family: 'DM Sans', sans-serif;
    transition: border 0.2s;
  }
  .bio-textarea:focus { border-color: rgba(99,102,241,0.5); }
  .bio-view {
    font-size: 14px; line-height: 1.6;
    color: rgba(0,0,0,0.75);
    background: rgba(255,255,255,0.3);
    padding: 12px 14px; border-radius: 14px;
    min-height: 60px;
  }
  .char-count { font-size: 11px; opacity: 0.5; margin-top: 4px; text-align: right; }

  /* ── info grid ── */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  @media (min-width: 640px) {
    .info-grid { grid-template-columns: repeat(3, 1fr); }
  }

  .info-card {
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(255,255,255,0.45);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.5);
  }
  .info-card-label {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.05em;
    opacity: 0.5; margin-bottom: 6px;
    display: flex; align-items: center; gap-5px;
  }
  .info-input {
    width: 100%; background: transparent;
    border: none; border-bottom: 1px solid rgba(0,0,0,0.2);
    outline: none; font-size: 14px; font-weight: 500;
    padding: 2px 0; color: #111;
    font-family: 'DM Sans', sans-serif;
  }
  .info-input:focus { border-bottom-color: #6366f1; }
  .info-select {
    width: 100%; background: transparent;
    border: none; border-bottom: 1px solid rgba(0,0,0,0.2);
    outline: none; font-size: 14px; font-weight: 500;
    color: #111; font-family: 'DM Sans', sans-serif;
    cursor: pointer; padding: 2px 0;
  }
  .info-value { font-size: 14px; font-weight: 500; color: #111; }

  /* ── location ── */
  .location-detect-btn {
    font-size: 12px; padding: 5px 14px;
    border-radius: 8px;
    background: rgba(6,182,212,0.15);
    color: #0e7490; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 600;
    transition: background 0.18s;
  }
  .location-detect-btn:hover { background: rgba(6,182,212,0.3); }
  .location-detect-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .location-text { font-size: 13px; opacity: 0.75; }

  /* ── skills ── */
  .skills-section { margin-bottom: 22px; }
  .skill-input {
    width: 100%; padding: 10px 14px;
    border-radius: 12px; border: 1px solid rgba(0,0,0,0.1);
    background: rgba(255,255,255,0.6);
    font-size: 14px; outline: none;
    font-family: 'DM Sans', sans-serif;
    margin-bottom: 10px;
    transition: border 0.2s;
  }
  .skill-input:focus { border-color: rgba(99,102,241,0.45); }
  .skill-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 30px;
    background: rgba(0,0,0,0.08);
    font-size: 13px; font-weight: 500;
  }
  .skill-chip-remove {
    background: none; border: none; cursor: pointer;
    color: #ef4444; font-size: 16px; line-height: 1;
    padding: 0; display: flex; align-items: center;
  }

  /* ── divider ── */
  .divider {
    height: 1px;
    background: rgba(0,0,0,0.08);
    margin: 20px 0;
  }

  /* ── modal ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 20px;
  }
  .modal-card {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(20px);
    border-radius: 22px;
    padding: 24px;
    width: 100%; max-width: 440px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.18);
    border: 1px solid rgba(255,255,255,0.3);
  }
  .modal-header {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 18px;
  }
  .modal-title {
    font-family: 'DM Serif Display', serif;
    font-size: 18px; margin: 0;
    display: flex; align-items: center; gap: 8px;
  }
  .modal-textarea {
    width: 100%; padding: 12px 14px;
    border-radius: 14px; resize: none;
    background: rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.1);
    font-size: 14px; line-height: 1.6; outline: none;
    font-family: 'DM Sans', sans-serif;
    transition: border 0.2s;
  }
  .modal-textarea:focus { border-color: #a855f7; }
  .modal-actions { display: flex; gap: 10px; margin-top: 16px; }
  .btn-modal-cancel {
    flex: 1; padding: 11px; border-radius: 12px;
    background: rgba(0,0,0,0.07); border: none;
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.18s;
  }
  .btn-modal-cancel:hover { background: rgba(0,0,0,0.12); }
  .btn-modal-generate {
    flex: 1; padding: 11px; border-radius: 12px;
    background: linear-gradient(135deg, #a855f7, #ec4899);
    color: #fff; border: none; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: opacity 0.18s;
  }
  .btn-modal-generate:hover { opacity: 0.88; }
  .btn-modal-generate:disabled { opacity: 0.5; cursor: not-allowed; }
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* dark mode */
  @media (prefers-color-scheme: dark) {
    .profile-card { background: rgba(15,15,25,0.55); border-color: rgba(255,255,255,0.1); }
    .profile-name { color: #f0f4ff; }
    .profile-email { color: rgba(255,255,255,0.5); }
    .btn-edit { background: rgba(255,255,255,0.12); color: #e2e8f0; }
    .info-card { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.1); }
    .info-card-label { color: rgba(255,255,255,0.4); }
    .info-input, .info-select, .info-value { color: #f0f4ff; }
    .info-input { border-bottom-color: rgba(255,255,255,0.2); }
    .bio-textarea { background: rgba(255,255,255,0.08); color: #f0f4ff; border-color: rgba(255,255,255,0.1); }
    .bio-view { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.75); }
    .skill-input { background: rgba(255,255,255,0.08); color: #f0f4ff; border-color: rgba(255,255,255,0.1); }
    .skill-chip { background: rgba(255,255,255,0.1); color: #f0f4ff; }
    .section-label { color: rgba(255,255,255,0.35); }
    .location-text { color: rgba(255,255,255,0.65); }
    .divider { background: rgba(255,255,255,0.08); }
    .modal-card { background: rgba(20,20,35,0.92); }
    .modal-title { color: #f0f4ff; }
    .modal-textarea { background: rgba(255,255,255,0.07); color: #f0f4ff; border-color: rgba(255,255,255,0.1); }
    .btn-modal-cancel { background: rgba(255,255,255,0.1); color: #f0f4ff; }
  }
`;

export default function Profile() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [profile, setProfile] = useState({
    name: "", username: "", phone: "", email: "",
    age: "", gender: "", location: "", city: "", state: "",
    bio: "", skillsToTeach: [], skillsToLearn: [], profilePic: "",
  });

  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);

  /* ── fetch ── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/me");
        const data = {
          name: res.data.name || "", username: res.data.username || "",
          phone: res.data.phone || "", email: res.data.email || "",
          age: res.data.age || "", gender: res.data.gender || "",
          location: res.data.location || "", city: res.data.city || "",
          state: res.data.state || "", bio: res.data.bio || "",
          skillsToTeach: res.data.skillsToTeach || [],
          skillsToLearn: res.data.skillsToLearn || [],
          profilePic: res.data.profilePic || "",
        };
        setProfile(data);
        setOriginalProfile(data);
      } catch { navigate("/login"); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };

  const detectLocation = () => {
    if (!navigator.geolocation) return alert("GPS not supported");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          { headers: { "User-Agent": "SkillSwapApp/1.0" } }
        );
        const data = await res.json();
        setProfile((p) => ({
          ...p,
          location: data.display_name || "",
          city: data.address.city || data.address.town || data.address.village || "",
          state: data.address.state || "",
        }));
      } catch { alert("Failed to detect location"); }
      finally { setLocating(false); }
    }, () => { alert("Permission denied"); setLocating(false); });
  };

  const addSkill = (key, value, clear) => {
    if (!value.trim()) return;
    setProfile((p) => p[key].includes(value.trim()) ? p : { ...p, [key]: [...p[key], value.trim()] });
    clear("");
  };
  const removeSkill = (key, skill) =>
    setProfile((p) => ({ ...p, [key]: p[key].filter((s) => s !== skill) }));

  const handleSave = async () => {
    try { await API.put("/users/update-profile", profile); setOriginalProfile(profile); setIsEditing(false); }
    catch { alert("Update failed"); }
  };
  const handleCancel = () => { setProfile(originalProfile); setIsEditing(false); };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const formData = new FormData(); formData.append("profilePic", file);
    try {
      const res = await API.post("/users/upload-profile-pic", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setProfile((prev) => ({ ...prev, profilePic: res.data.user.profilePic }));
      setOriginalProfile((prev) => ({ ...prev, profilePic: res.data.user.profilePic }));
    } catch { alert("Failed to upload profile picture"); }
  };

  const handleRemoveProfilePic = async () => {
    if (!window.confirm("Remove your profile picture?")) return;
    try {
      await API.delete("/users/remove-profile-pic");
      setProfile((prev) => ({ ...prev, profilePic: "" }));
      setOriginalProfile((prev) => ({ ...prev, profilePic: "" }));
    } catch { alert("Failed to remove profile picture"); }
  };

  const handleGenerateBio = async () => {
    if (!aiPrompt.trim()) { alert("Please enter a prompt"); return; }
    setGeneratingBio(true);
    try {
      const res = await API.post("/ai/generate-bio", { prompt: aiPrompt });
      setProfile((prev) => ({ ...prev, bio: res.data.result }));
      setShowAIModal(false); setAiPrompt("");
    } catch { alert("Failed to generate bio. Please try again."); }
    finally { setGeneratingBio(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#6366f1", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const picSrc = profile.profilePic
    ? profile.profilePic.startsWith("/uploads") ? `http://localhost:5000${profile.profilePic}` : profile.profilePic
    : null;

  return (
    <>
      <style>{STYLES}</style>

      <div className="profile-root">
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >

          {/* ══ HEADER ══ */}
          <div className="profile-header">
            <div className="profile-header-top">
              <div className="avatar-wrap">
                {picSrc ? (
                  <img src={picSrc} alt="Profile" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder"><User size={36} /></div>
                )}
                {isEditing && (
                  <>
                    <label className="avatar-edit-btn" title="Change photo">
                      <Edit3 size={13} />
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                    {profile.profilePic && (
                      <button className="avatar-remove-btn" onClick={handleRemoveProfilePic} title="Remove photo">
                        <X size={11} />
                      </button>
                    )}
                  </>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <h1 className="profile-name">{profile.name || "Your Name"}</h1>
                <p className="profile-email">{profile.email}</p>
              </div>
            </div>

            <div className="profile-header-actions">
              {!isEditing ? (
                <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                  <Edit3 size={14} /> Edit Profile
                </button>
              ) : (
                <>
                  <button className="btn btn-save" onClick={handleSave}><Save size={14} /> Save</button>
                  <button className="btn btn-cancel" onClick={handleCancel}><X size={14} /> Cancel</button>
                </>
              )}
              <button className="btn-logout" onClick={handleLogout} title="Logout"><LogOut size={17} /></button>
            </div>
          </div>

          <div className="divider" />

          {/* ══ BIO ══ */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-row">
              <p className="section-label"><FileText size={13} /> Bio</p>
              {isEditing && (
                <button className="btn-ai" onClick={() => setShowAIModal(true)}>
                  <Sparkles size={13} /> AI Generate
                </button>
              )}
            </div>
            {isEditing ? (
              <>
                <textarea
                  className="bio-textarea"
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell people about yourself and your skills…"
                  maxLength={500}
                  rows={4}
                />
                <p className="char-count">{profile.bio.length}/500</p>
              </>
            ) : (
              <p className="bio-view">{profile.bio || "No bio added yet."}</p>
            )}
          </div>

          <div className="divider" />

          {/* ══ INFO GRID ══ */}
          <p className="section-label" style={{ marginBottom: 14 }}>Personal Info</p>
          <div className="info-grid">
            <InfoCard label="Username" icon={<AtSign size={11} />} value={profile.username} isEditing={isEditing}
              onChange={(v) => setProfile((p) => ({ ...p, username: v }))} />
            <InfoCard label="Phone" icon={<Phone size={11} />} value={profile.phone} isEditing={isEditing}
              onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
            <InfoCard label="Age" value={profile.age} isEditing={isEditing}
              onChange={(v) => setProfile((p) => ({ ...p, age: v }))} />
            <InfoCard label="City" value={profile.city} isEditing={isEditing}
              onChange={(v) => setProfile((p) => ({ ...p, city: v }))} />
            <InfoCard label="State" value={profile.state} isEditing={isEditing}
              onChange={(v) => setProfile((p) => ({ ...p, state: v }))} />
            <InfoCard label="Gender" value={profile.gender} isEditing={isEditing}
              onChange={(v) => setProfile((p) => ({ ...p, gender: v }))} />
          </div>

          <div className="divider" />

          {/* ══ LOCATION ══ */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-row">
              <p className="section-label"><MapPin size={13} /> Location</p>
              {isEditing && (
                <button className="location-detect-btn" onClick={detectLocation} disabled={locating}>
                  {locating ? "Detecting…" : "📍 Detect GPS"}
                </button>
              )}
            </div>
            <p className="location-text">{profile.location || "Location not set"}</p>
          </div>

          <div className="divider" />

          {/* ══ SKILLS ══ */}
          {[
            { key: "skillsToTeach", label: "Skills I Teach", input: teachInput, setInput: setTeachInput },
            { key: "skillsToLearn", label: "Skills I Want to Learn", input: learnInput, setInput: setLearnInput },
          ].map(({ key, label, input, setInput }, idx) => (
            <div className="skills-section" key={key}>
              <p className="section-label">{label}</p>
              {isEditing && (
                <input
                  className="skill-input"
                  placeholder="Type a skill & press Enter…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addSkill(key, input, setInput); }
                  }}
                />
              )}
              <div className="skill-chips">
                {profile[key].length === 0 && !isEditing && (
                  <span style={{ fontSize: 13, opacity: 0.45 }}>None added yet</span>
                )}
                {profile[key].map((s) => (
                  <span key={s} className="skill-chip">
                    {s}
                    {isEditing && (
                      <button className="skill-chip-remove" onClick={() => removeSkill(key, s)}>×</button>
                    )}
                  </span>
                ))}
              </div>
              {idx === 0 && <div className="divider" style={{ marginTop: 18 }} />}
            </div>
          ))}

        </motion.div>
      </div>

      {/* ══ AI MODAL ══ */}
      {showAIModal && (
        <div className="modal-overlay">
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                <Sparkles size={18} style={{ color: "#a855f7" }} /> Generate Bio with AI
              </h3>
              <button onClick={() => setShowAIModal(false)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.5, display: "flex" }}>
                <X size={20} />
              </button>
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8, opacity: 0.7 }}>
              Describe yourself or your skills:
            </label>
            <textarea
              className="modal-textarea"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., I'm a web developer who loves teaching React and wants to learn Python…"
              rows={4}
              maxLength={200}
            />
            <p className="char-count">{aiPrompt.length}/200</p>

            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowAIModal(false)} disabled={generatingBio}>
                Cancel
              </button>
              <button className="btn-modal-generate" onClick={handleGenerateBio} disabled={generatingBio || !aiPrompt.trim()}>
                {generatingBio ? (
                  <><div className="spinner" /> Generating…</>
                ) : (
                  <><Sparkles size={15} /> Generate</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

/* ══ INFO CARD ══ */
function InfoCard({ label, value, icon, isEditing, onChange }) {
  if (label === "Gender") {
    return (
      <div className="info-card">
        <p className="info-card-label">{icon} {label}</p>
        {isEditing ? (
          <select className="info-select" value={value || ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">Select</option>
            <option value="Male">♂ Male</option>
            <option value="Female">♀ Female</option>
            <option value="Other">⚲ Other</option>
          </select>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {value === "Male" && <span style={{ color: "#3b82f6", fontSize: 18, fontWeight: 800 }}>♂</span>}
            {value === "Female" && <span style={{ color: "#ec4899", fontSize: 18, fontWeight: 800 }}>♀</span>}
            {value === "Other" && <span style={{ fontSize: 18 }}>⚲</span>}
            {!value && <span className="info-value" style={{ opacity: 0.35 }}>—</span>}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="info-card">
      <p className="info-card-label">{icon} {label}</p>
      {isEditing ? (
        <input
          type="text"
          className="info-input"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <p className="info-value" style={!value ? { opacity: 0.35 } : {}}>{value || "—"}</p>
      )}
    </div>
  );
}