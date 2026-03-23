import { FaFireAlt, FaPause } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";

export default function ProgressCard({ current, start }) {
  const diff = current - start;
  const formattedDiff = diff.toFixed(2);

  return (
    <div>
      <p>Start: {start} kg</p>
      <p>Current: {current} kg</p>

      <p>
        Change:{" "}
        {diff < 0 && (
          <>
            <FaFireAlt style={{ color: "var(--first-color)" }} /> {formattedDiff} kg
          </>
        )}

        {diff > 0 && (
          <>
            <FaChartLine style={{ color: "var(--first-color)" }} /> +{formattedDiff} kg
          </>
        )}

        {diff === 0 && <><FaPause style={{ color: "var(--first-color)" }} /> 0 kg</>}
      </p>
    </div>
  );
}