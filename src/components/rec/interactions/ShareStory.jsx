import { useRef } from "react";
import html2canvas from "html2canvas";

import "./sharestory.scss";

export default function ShareStory({
  title = "Recruns.pro",
  subtitle = "Check it out!",
  imageUrl,
  distance,
  pace,
  steps,
  duration,
  timestamp,
  locationName,
  avatarUrl,
}) {
  const canvasRef = useRef();

  const handleDownload = async () => {
    const element = canvasRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      scale: 2,
    });

    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "run-story.png";
    link.click();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date =
      timestamp.seconds !== undefined
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return "—";
    const totalSeconds = Math.floor(minutes * 60);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${mins}:${secs}`;
  };

  return (
    <div className="share-story-wrapper">
      <div className="story-preview" ref={canvasRef}>

        <div className="story-header">
        {imageUrl && <img src={imageUrl} alt="Run" className="story-image" />}
          {avatarUrl && <img src={avatarUrl} alt="Avatar" className="story-avatar" />}
          <div>
            <h5 className="story-title">{title}</h5>
            <p className="story-subtitle username-text">{subtitle}</p>
          </div>
        </div>

        <div className="story-stats">
          <p><strong>Distance:</strong> {distance?.toFixed(2)} km</p>
          <p><strong>Duration:</strong> {formatDuration(duration)}</p>
          <p><strong>Pace:</strong> {pace?.toFixed(1)} min/km</p>
          <p><strong>Steps:</strong> {steps || "—"}</p>
          <p><strong>Location:</strong> {locationName || "Unknown"}</p>
          <p><strong>Date:</strong> {formatDate(timestamp)}</p>
        </div>
      </div>

      <button className="story-btn" onClick={handleDownload}>
        Download Image
      </button>
    </div>
  );
}