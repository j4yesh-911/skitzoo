import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [checkedAuth, setCheckedAuth] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    age: "",
    gender: "",
    phone: "",
    location: "",
    city: "",
    state: "",
    skillsToTeach: "",
    skillsToLearn: "",
    profilePic: "",
  });

  /* ================= AUTH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setForm((p) => ({
          ...p,
          name: res.data.name,
          email: res.data.email,
        }));
        setCheckedAuth(true);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (!checkedAuth) return null;

  /* ================= HANDLERS ================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((p) => ({ ...p, profilePic: reader.result }));
    reader.readAsDataURL(file);
  };

  /* ================= CAMERA (FIXED) ================= */
  const openCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      setStream(media);
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      alert("Camera permission denied");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/jpeg", 0.9);
    setForm((p) => ({ ...p, profilePic: img }));
    closeCamera();
  };

  const closeCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setShowCamera(false);
  };

  /* ================= LOCATION (IMPROVED) ================= */
  const detectLocation = () => {
    if (!navigator.geolocation) return alert("GPS not supported");

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await res.json();

        setForm((p) => ({
          ...p,
          location: `${data.city || ""}, ${data.principalSubdivision || ""}`,
          city: data.city || "",
          state: data.principalSubdivision || "",
        }));

        setLocating(false);
      },
      () => {
        alert("Unable to fetch location");
        setLocating(false);
      }
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    await API.post(
      "/users/complete-profile",
      {
        ...form,
        skillsToTeach: form.skillsToTeach.split(","),
        skillsToLearn: form.skillsToLearn.split(","),
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage:
          "url(https://i.pinimg.com/1200x/7c/88/56/7c8856e15121993790413dcfb670e1b4.jpg)",
      }}
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/30 p-10 max-h-[90vh] overflow-y-auto"
      >
        <h1 className="text-3xl font-semibold text-center mb-10">
          Complete your profile
        </h1>

        {/* ================= PROFILE PIC ================= */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative">
            {form.profilePic ? (
              <img
                src={form.profilePic}
                className="w-32 h-32 rounded-full object-cover border border-white/40"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/60" />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <label className="px-4 py-2 rounded-xl bg-white/30 cursor-pointer">
              Upload
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </label>
            <button
              type="button"
              onClick={openCamera}
              className="px-4 py-2 rounded-xl bg-white/30"
            >
              Camera
            </button>
          </div>
        </div>

        <Field value={form.name} readOnly />
        <Field value={form.email} readOnly />

        <Grid>
          <Field name="username" placeholder="Username" value={form.username} onChange={handleChange} />
          <Field name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
        </Grid>

        <Select name="gender" value={form.gender} onChange={handleChange} />

        <Field name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />

        <div className="flex gap-3 mb-4">
          <Field name="location" placeholder="Address" value={form.location} onChange={handleChange} />
          <button
            type="button"
            onClick={detectLocation}
            disabled={locating}
            className="px-4 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center min-w-[100px]"
          >
            {locating ? (
              <span className="animate-spin h-4 w-4 border-2 border-black/30 border-t-black rounded-full" />
            ) : (
              "📍 Detect"
            )}
          </button>
        </div>

        <Grid>
          <Field name="city" placeholder="City" value={form.city} onChange={handleChange} />
          <Field name="state" placeholder="State" value={form.state} onChange={handleChange} />
        </Grid>

        <Field
          name="skillsToTeach"
          placeholder="Skills you can teach"
          value={form.skillsToTeach}
          onChange={handleChange}
        />

        <Field
          name="skillsToLearn"
          placeholder="Skills you want to learn"
          value={form.skillsToLearn}
          onChange={handleChange}
        />

        <button className="w-full mt-8 py-3 rounded-xl bg-black text-white">
          Save Profile
        </button>
      </motion.form>

      {/* ================= CAMERA MODAL ================= */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <video ref={videoRef} autoPlay className="rounded-lg mb-4 w-full" />
            <canvas ref={canvasRef} hidden />
            <div className="flex gap-3">
              <button onClick={capturePhoto} className="flex-1 py-2 bg-black text-white rounded-xl">
                Capture
              </button>
              <button onClick={closeCamera} className="flex-1 py-2 bg-gray-200 rounded-xl">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= UI HELPERS ================= */
const Field = ({ readOnly, ...props }) => (
  <input
    {...props}
    readOnly={readOnly}
    className={`w-full p-3 rounded-xl mb-4 border border-white/30 ${
      readOnly ? "bg-white/20" : "bg-white/40"
    }`}
  />
);

const Grid = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">{children}</div>
);

const Select = (props) => (
  <select {...props} className="w-full p-3 rounded-xl mb-4 bg-white/40">
    <option value="">Select gender</option>
    <option>Male</option>
    <option>Female</option>
    <option>Other</option>
  </select>
);
