import { FaFireAlt, FaPause } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";

export default function WeeklyStats({ stats }) {
  return (
    <div>
      {stats.map((w) => (
        <div key={w.week}>
          Week {w.week}:{" "}
          {w.type === "loss" && (
            <>
              <FaFireAlt style={{ color: "var(--first-color)" }} /> - {Math.abs(w.change)} kg
            </>
          )}
          {w.type === "gain" && 
          <>
          <FaChartLine style={{ color: "var(--first-color)" }} /> + {w.change} kg
          </>
          }
          {w.type === "stable" && <><FaPause style={{ color: "var(--first-color)" }} /> 0 kg</>}
        </div>
      ))}
    </div>
  );
}