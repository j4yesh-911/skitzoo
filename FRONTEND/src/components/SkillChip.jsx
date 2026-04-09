export default function SkillChip({ skill, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-4 py-2 rounded-xl cursor-pointer transition
      ${active ? "bg-neon" : "glass hover:scale-105"}`}
    >
      {skill}
    </div>
  );
}
