import { useEffect, useRef } from "react";
import { FaMedal } from "react-icons/fa";
import { GiPathDistance, GiRunningShoe } from "react-icons/gi";
import { MdSpeed } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./achievements.scss";

export default function Achievements({ distance, pace, steps, isOwner }) {

  const shownRef = useRef(
    JSON.parse(localStorage.getItem("shownAchievements") || "[]")
  );

  const achievements = [];

  // --- DISTANCE ACHIEVEMENTS ---
  if (distance >= 1 && distance < 2)
    achievements.push({ key: "1k", type: "distance", label: "Getting Started! 1 km done!", icon: <GiPathDistance /> });
  if (distance >= 2 && distance < 5)
    achievements.push({ key: "2k", type: "distance", label: "First 2 km completed!", icon: <GiPathDistance /> });
  if (distance >= 5 && distance < 10)
    achievements.push({ key: "5k", type: "distance", label: "Great job! 5 km milestone!", icon: <GiPathDistance /> });
  if (distance >= 10 && distance < 20)
    achievements.push({ key: "10k", type: "distance", label: "Awesome! 10 km run!", icon: <GiPathDistance /> });
  if (distance >= 20)
    achievements.push({ key: "20k", type: "distance", label: "Legendary! 20 km conquered!", icon: <GiPathDistance /> });

  // --- PACE ACHIEVEMENTS ---
  if (pace > 0 && pace <= 6)
    achievements.push({ key: "pace6", type: "pace", label: "Steady runner! Avg pace under 6 min/km", icon: <MdSpeed /> });
  if (pace > 0 && pace <= 5)
    achievements.push({ key: "pace5", type: "pace", label: "Speedster! Avg pace under 5.0 min/km!", icon: <MdSpeed /> });
  if (pace > 0 && pace <= 4)
    achievements.push({ key: "pace4", type: "pace", label: "Flying runner! Avg pace under 4.0 min/km!", icon: <MdSpeed /> });

  // --- STEPS ACHIEVEMENTS ---
  if (steps >= 1000 && steps < 3000)
    achievements.push({ key: "1ksteps", type: "steps", label: "Step up! 1k steps!", icon: <GiRunningShoe /> });
  if (steps >= 3000 && steps < 5000)
    achievements.push({ key: "3ksteps", type: "steps", label: "3k steps achieved! Keep going!", icon: <GiRunningShoe /> });
  if (steps >= 5000 && steps < 10000)
    achievements.push({ key: "5ksteps", type: "steps", label: "5k steps! Great effort!", icon: <GiRunningShoe /> });
  if (steps >= 10000)
    achievements.push({ key: "10ksteps", type: "steps", label: "10k steps! You're a champion!", icon: <GiRunningShoe /> });

  useEffect(() => {
    if (!isOwner) return;

    achievements.forEach((a) => {
      if (!shownRef.current.includes(a.key)) {
        let toastOptions = { position: "top-center", autoClose: 3000 };
        if (a.type === "distance") toastOptions.style = { background: "#4caf50", color: "white" };
        if (a.type === "pace") toastOptions.style = { background: "#2196f3", color: "white" };
        if (a.type === "steps") toastOptions.style = { background: "#ff9800", color: "white" };

        toast.success(`🏅 ${a.label}`, toastOptions);

        shownRef.current.push(a.key);
        localStorage.setItem("shownAchievements", JSON.stringify(shownRef.current));
      }
    });
  }, [distance, pace, steps, isOwner]);

  if (!achievements.length) return null;

  return (
    <div className="achievements-wrapper">
      {achievements.map((a) => {
        let cardColor = "";
        if (a.type === "distance") cardColor = "#4caf50";
        if (a.type === "pace") cardColor = "#2196f3";
        if (a.type === "steps") cardColor = "#ff9800";

        return (
          <div key={a.key} className="achievement-card" style={{ borderColor: cardColor }}>
            <span className="achievement-icon" style={{ color: cardColor }}>{a.icon}</span>
            <span className="achievement-text">{a.label}</span>
            <FaMedal className="achievement-medal" style={{ color: cardColor }} />
          </div>
        );
      })}
    </div>
  );
}