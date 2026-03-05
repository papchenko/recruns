import { useState } from "react";
import Likes from "./Likes";
import Comments from "./Comments";
import { FiShare2 } from "react-icons/fi";
import ShareStory from "./ShareStory";

import "./interactions.scss";

export default function Interactions({
  routeId,
  usersData,
  currentUser,
  photos,
  distance,
  pace,
  steps,
  duration,
  timestamp,
  locationName,
  username,
  avatarUrl,
}) {
  const [showStory, setShowStory] = useState(false);

  return (
    <div className="interactions">
      <Likes routeId={routeId} usersData={usersData} currentUser={currentUser} />
      <Comments routeId={routeId} usersData={usersData} currentUser={currentUser} />

      <button className="share-btn" onClick={() => setShowStory(true)}>
        <FiShare2 size={22} />
      </button>

      {showStory && (
        <div className="popup-overlay-share" onClick={() => setShowStory(false)}>
          <div className="popup-content-share" onClick={(e) => e.stopPropagation()}>
            <ShareStory
              title="Recruns.pro"
              subtitle={`${username || "Runner"}'s run`}
              imageUrl={photos && photos.length > 0 ? photos[0] : null}
              distance={distance}
              pace={pace}
              steps={steps}
              duration={duration}
              timestamp={timestamp}
              locationName={locationName}
              avatarUrl={avatarUrl}
            />
            <button className="close-btn" onClick={() => setShowStory(false)}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}