import { useRef, useState } from "react";
import YouTube from "react-youtube";
import "./player.scss";

export default function MusicPlayerPopup({
  tracks,
  isOpen,
  onClose,
  currentIndex,
  setCurrentIndex,
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === tracks.length - 1;

  const onReady = (event) => {
    playerRef.current = event.target;
  };

  const onStateChange = (event) => {
    switch (event.data) {
      case 1: // playing
        setIsPlaying(true);
        break;
      case 2: // paused
        setIsPlaying(false);
        break;
      case 0: // ended
        handleEnded();
        break;
      default:
        break;
    }
  };

  const handleEnded = () => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const prevTrack = () => {
    if (!isFirst) setCurrentIndex((prev) => prev - 1);
  };

  const nextTrack = () => {
    if (!isLast) setCurrentIndex((prev) => prev + 1);
  };

  const toggleMinimize = () => setIsMinimized((prev) => !prev);

  if (!isOpen || !tracks || tracks.length === 0) return null;

  const getYouTubeId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(tracks[currentIndex].src);

  return (
    <>
      {!isMinimized && <div className="mp-overlay" onClick={onClose}></div>}

      {!isMinimized ? (
        <div className="mp-popup" onClick={(e) => e.stopPropagation()}>
          <button className="mp-close" onClick={onClose}>
            &times;
          </button>

          <h2 className="mp-title">{tracks[currentIndex].title}</h2>

          <div className="mp-nav">
            <button onClick={prevTrack} disabled={isFirst} className="mp-btn">
              «
            </button>
            <button onClick={togglePlayPause} className="mp-btn">
              {isPlaying ? "❚❚" : "►"}
            </button>
            <button onClick={nextTrack} disabled={isLast} className="mp-btn">
              »
            </button>
          </div>

          <button className="mp-minimize-toggle" onClick={toggleMinimize}>
            ➖ Minimize
          </button>
        </div>
      ) : (
        <div className="mp-minimized-bar" onClick={toggleMinimize}>
          {tracks[currentIndex].title}
        </div>
      )}

      <YouTube
        videoId={videoId}
        opts={{ width: "0", height: "0", playerVars: { autoplay: 1 } }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </>
  );
}