"use client";

export default function ReputationBadge({ reputation }) {
  let level = 1;
  let levelTitle = "Newcomer";
  let color = "gray";
  
  if (reputation >= 5000) {
    level = 5;
    levelTitle = "Legend";
    color = "gold";
  } else if (reputation >= 2000) {
    level = 4;
    levelTitle = "Master";
    color = "purple";
  } else if (reputation >= 500) {
    level = 3;
    levelTitle = "Creator";
    color = "blue";
  } else if (reputation >= 100) {
    level = 2;
    levelTitle = "Contributor";
    color = "green";
  }
  
  const levelColors = {
    gray: "bg-gray-500/20 text-gray-400 border-gray-500",
    green: "bg-green-500/20 text-green-400 border-green-500",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500",
    gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
  };
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${levelColors[color]} text-sm`}>
      <span className="text-lg">
        {level === 1 && "🌱"}
        {level === 2 && "⭐"}
        {level === 3 && "🎨"}
        {level === 4 && "🏆"}
        {level === 5 && "👑"}
      </span>
      <span className="font-semibold">Level {level}</span>
      <span className="text-xs">{levelTitle}</span>
      <span className="ml-1">({reputation} rep)</span>
    </div>
  );
}