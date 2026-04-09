import { useEffect, useState } from "react";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../account/AuthContext";

import { MdOutlineTimer } from "react-icons/md";
import { PiSneakerMove } from "react-icons/pi";
import { TbAlarmAverage } from "react-icons/tb";
import { GrLocation } from "react-icons/gr";
// import { MdWorkspacePremium } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

import { auth } from "../../firebase";
import Achievements from "./achievements/Achievements";

import Interactions from "./interactions/Interactions";

import "./steplist.scss";

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

export default function StepsList() {
  const { user, loading: userLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("global");
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState({});
  
  const [visibleCount, setVisibleCount] = useState(6); //9

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setUsersData(data);
    });

    return () => unsub();
  }, []);

      useEffect(() => {
      setVisibleCount(6); //9
    }, [filter]);

  useEffect(() => {
    if (userLoading) return;

    setLoading(true);
    setItems([]);

    let unsubscribe = null;

    const setupSnapshot = () => {
      if (filter === "my") {
        if (!user) {
          setItems([]);
          setLoading(false);
          return;
        }
        const q = query(collection(db, "routes"), where("uid", "==", user.uid));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            let data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => {
              const ta = a.timestamp?.seconds || a.createdAt?.seconds || 0;
              const tb = b.timestamp?.seconds || b.createdAt?.seconds || 0;
              return tb - ta;
            });
            setItems(data);
            setLoading(false);
          },
          (err) => {
            console.error("My Lens snapshot error:", err);
            setItems([]);
            setLoading(false);
          }
        );
      } else if (filter === "global") {
        const q = query(collection(db, "routes"));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            let data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            if (user) data = data.filter((item) => item.uid !== user.uid);
            data.sort((a, b) => {
              const ta = a.timestamp?.seconds || a.createdAt?.seconds || 0;
              const tb = b.timestamp?.seconds || b.createdAt?.seconds || 0;
              return tb - ta;
            });
            setItems(data);
            setLoading(false);
          },
          (err) => {
            console.error("Global snapshot error:", err);
            setItems([]);
            setLoading(false);
          }
        );
      }
    };

    setupSnapshot();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [filter, user, userLoading]);

  if (userLoading || loading) return null;

  return (
    <div className="stepslist-wrapper">
      <div className="stepslist-toggle">
        <button
          className={filter === "my" ? "active" : ""}
          onClick={() => setFilter("my")}
          disabled={!user}
        >
          My Lens
        </button>
        <button
          className={filter === "global" ? "active" : ""}
          onClick={() => setFilter("global")}
        >
          Global Lens
        </button>
      </div>

      {filter === "my" && items.length === 0 && (
        <p className="stepslist-empty">You don’t have any runs yet.</p>
      )}
      {filter === "global" && items.length === 0 && (
        <p className="stepslist-empty">No global runs available yet.</p>
      )}

      {items.length > 0 && (
        <>
        <div className="stepslist-grid">
          {items.slice(0, visibleCount).map(
            ({
              id,
              title,
              notes,
              steps,
              photos = [],
              distance,
              pace,
              locationName,
              uid,
              duration,
              timestamp,
              createdAt,
            }) => {
              const userInfo = usersData[uid] || {};
              const username = userInfo.username || "Unknown";
              const avatarUrl =
                userInfo.avatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png";

              const runDate = timestamp || createdAt;

              return (
                <div key={id} className="stepslist-card">
                  <h5 className="stepslist-title">
                    {title || "Untitled Run"}
                  </h5>
                  <div className="stepslist-title">
                  {notes && (
                    <p className="stepslist-notes">
                      {notes}
                    </p>
                  )}
                  </div>

                  <div className="stepslist-user pt-2">
                     <div style={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="stepslist-avatar avatar"
                    />
                      {userInfo?.premiumPackage?.active && userInfo.premiumPackage.title === "Pro" && (
                        <RiVerifiedBadgeFill
                          className="stepslist-premium-icon"
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            color: "#ffd700",
                            fontSize: "1rem",
                            backgroundColor: "#000a",
                            borderRadius: "50%",
                            padding: "2px"
                          }}
                        />
                      )}
                        </div>
                    <div className="stepslist-author">{username}</div>
                  </div>

                  {photos.length > 0 && (
                    <Swiper
                      pagination={{ clickable: true }}
                      modules={[Pagination]}
                      className="stepslist-swiper"
                    >
                      {photos.map((photoUrl, i) => (
                        <SwiperSlide key={i}>
                          <img
                            src={photoUrl}
                            alt="Run"
                            className="stepslist-img"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                  <Achievements 
                    distance={distance} 
                    pace={pace}
                    steps={steps}
                    isOwner={uid === auth.currentUser?.uid}
                  />

                  <div className="stepslist-info">
                    <p>
                      <MdOutlineTimer className="lens-icon" />{" "}
                      <strong>Duration:</strong>{" "}
                      {duration !== undefined
                        ? formatDuration(duration)
                        : "—"}
                    </p>
                    <p>
                      <MdOutlineTimer className="lens-icon" />{" "}
                      <strong>Date:</strong> {formatDate(runDate)}
                    </p>
                    <p>
                      <PiSneakerMove className="lens-icon" />{" "}
                      <strong>Distance:</strong>{" "}
                      {distance !== undefined
                        ? distance.toFixed(2) + " km"
                        : "—"}
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
                      <strong>Location:</strong>{" "}
                      {locationName || "Unknown"}
                    </p>
                  </div>
                  <Interactions
                    routeId={id}
                    usersData={usersData}
                    currentUser={user}
                    photos={photos}
                    distance={distance}
                    pace={pace}
                    steps={steps}
                    duration={duration}
                    timestamp={timestamp || createdAt}
                    locationName={locationName}
                    username={username}
                    avatarUrl={avatarUrl}
                  />
                </div>
              );
            }
          )}
        </div>
        {visibleCount < items.length && (
          <div className="load-more-wrapper">
            <button
              className="load-more-btn"
              onClick={() => setVisibleCount((prev) => prev + 6)}
            >
              Load more
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
}