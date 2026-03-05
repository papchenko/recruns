import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { MdOutlineTimer } from "react-icons/md";
import { PiSneakerMove } from "react-icons/pi";
import { TbAlarmAverage } from "react-icons/tb";
import { GrLocation } from "react-icons/gr";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import Achievements from "../rec/achievements/Achievements";
import Interactions from "../rec/interactions/Interactions";

import "./lensdetails.scss";

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "—";
  const totalSeconds = Math.floor(minutes * 60);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${mins}:${secs}`;
}

function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date =
    timestamp.seconds !== undefined
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LensDetails({ currentUser, usersData }) {
  const { id } = useParams();
  const location = useLocation();
  const stateData = location.state;
  const [run, setRun] = useState(stateData || null);
  const [loading, setLoading] = useState(!stateData);

  useEffect(() => {
    if (!run) {
      const fetchRun = async () => {
        try {
          const docRef = doc(db, "routes", id);
          const snap = await getDoc(docRef);
          if (snap.exists()) setRun({ id, ...snap.data() });
        } catch (err) {
          console.error("Error loading run:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRun();
    }
  }, [id, run]);

  if (loading) return <p className="loading">Loading...</p>;
  if (!run) return <p className="not-found">Run not found.</p>;

  const {
    title,
    photos = [],
    distance,
    pace,
    steps,
    duration,
    timestamp,
    createdAt,
    locationName,
    username,
    avatarUrl,
    uid,
  } = run;

  const userInfo = usersData?.[uid] || {};

  const displayName = userInfo.username || username || "Unknown";
  const avatar = userInfo.avatarUrl || avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const runDate = timestamp || createdAt;
  const isOwner = currentUser?.uid === uid;

  return (
    <div className="lensdetails-wrapper">
      <div className="lensdetails-card">
        <h2 className="lensdetails-title">{title || "Untitled Run"}</h2>

        <div className="lensdetails-user">
        </div>

        {photos.length > 0 && (
          <Swiper
            pagination={{ clickable: true }}
            modules={[Pagination]}
            className="lensdetails-swiper"
          >
            {photos.map((url, i) => (
              <SwiperSlide key={i}>
                <img src={url} alt={`Run ${i}`} className="lensdetails-img" />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="lensdetails-info">
          <p>
            <MdOutlineTimer className="lens-icon" />{" "}
            <strong>Duration:</strong> {formatDuration(duration)}
          </p>
          <p>
            <MdOutlineTimer className="lens-icon" />{" "}
            <strong>Date:</strong> {formatDate(runDate)}
          </p>
          <p>
            <PiSneakerMove className="lens-icon" />{" "}
            <strong>Distance:</strong>{" "}
            {distance !== undefined ? distance.toFixed(2) + " km" : "—"}
          </p>
          <p>
            <TbAlarmAverage className="lens-icon" />{" "}
            <strong>Pace:</strong>{" "}
            {pace !== undefined && distance >= 0.1
              ? pace.toFixed(1) + " min/km"
              : "—"}
          </p>
          <p>
            <GrLocation className="lens-icon" />{" "}
            <strong>Location:</strong> {locationName || "Unknown"}
          </p>
          <p>
            <strong>Steps:</strong> {steps ?? "—"}
          </p>
        </div>

        <Achievements
          distance={distance}
          pace={pace}
          steps={steps}
          isOwner={isOwner}
        />
        <Interactions
          routeId={id}
          usersData={usersData}
          currentUser={currentUser}
          photos={photos}
          distance={distance}
          pace={pace}
          steps={steps}
          duration={duration}
          timestamp={runDate}
          locationName={locationName}
          username={displayName}
          avatarUrl={avatar}
        />
      </div>
    </div>
  );
}