import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import * as htmlToImage from "html-to-image";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { uploadToCloudinary } from "../../utils/cloudinary";

import Achievements from "./achievements/Achievements";

import { FiMinimize2 } from "react-icons/fi";
import { FaPlay, FaPause, FaStop } from "react-icons/fa6";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlagCheckered, faBan } from '@fortawesome/free-solid-svg-icons';

import "./stepcounter.scss";

const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

const CustomIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" 
         viewBox="0 0 24 24" fill="#db3206" stroke="white" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="white"/>
    </svg>
  `,
  className: "",
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -30],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position);
  }, [position, map]);
  return null;
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function StepCounter() {
  const [route, setRoute] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [steps, setSteps] = useState(0);

  const [preloadPosition, setPreloadPosition] = useState(null);

  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [liveDuration, setLiveDuration] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [runTitle, setRunTitle] = useState("");
  const [runNotes, setRunNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [saveMapImage, setSaveMapImage] = useState(true);

  const [paused, setPaused] = useState(false);
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);


  const mapRef = useRef();
  const timerRef = useRef(null);

  const STEPS_PER_KM = 1312;
  const MIN_DISTANCE_METERS = 5;
  const MIN_SPEED_KMH = 1.5;

  const [isMinimized, setIsMinimized] = useState(false);
  const [gpsSignal, setGpsSignal] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("stepCounterState");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.tracking) {
        setTracking(data.tracking);
        setRoute(data.route || []);
        setSteps(data.steps || 0);
        setDistance(data.distance || 0);
        setStartTime(data.startTime || Date.now());
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "stepCounterState",
      JSON.stringify({
        tracking,
        route,
        steps,
        distance,
        startTime,
      })
    );
  }, [tracking, route, steps, distance, startTime]);

  useEffect(() => {
    if (tracking && startTime && !paused) {
      timerRef.current = setInterval(() => {
        setLiveDuration(elapsedBeforePause + (Date.now() - startTime));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [tracking, startTime, paused, elapsedBeforePause]);

    useEffect(() => {
    if (!navigator.geolocation) return;

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsSignal(pos.coords.accuracy);
          setPreloadPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.warn("Preload geo error:", err),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(id);
    }, []);

  useEffect(() => {
    if (!tracking) return;
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsSignal(pos.coords.accuracy);  // new
        const { latitude, longitude } = pos.coords;
        const newPoint = { lat: latitude, lng: longitude };

        setRoute((prevRoute) => {
          if (paused) return prevRoute;

          if (prevRoute.length === 0) {
          fetchLocationName(latitude, longitude);
            return [newPoint];
          }

          const lastPoint = prevRoute[prevRoute.length - 1];
          const segmentDistance = getDistanceFromLatLonInKm(
            lastPoint.lat,
            lastPoint.lng,
            newPoint.lat,
            newPoint.lng
          );
          if (segmentDistance > 0.1) return prevRoute;

          const distanceMeters = segmentDistance * 1000;
          const elapsedSeconds = 2;
          const currentSpeedKmh = (distanceMeters / elapsedSeconds) * 3.6;

          if (
            distanceMeters >= MIN_DISTANCE_METERS &&
            currentSpeedKmh >= MIN_SPEED_KMH
          ) {
            if (prevRoute.length < 3) return [...prevRoute, newPoint];

            const newDistance = distance + segmentDistance;
            setDistance(newDistance);
            setSteps(Math.floor(newDistance * STEPS_PER_KM));
            return [...prevRoute, newPoint];
          }
          return prevRoute;
        });
      },
      (err) => console.error("Geo error:", err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracking, distance, paused]);

  const fetchLocationName = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();

      if (data.address) {
        const street = data.address.road || "";
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.hamlet ||
          "";
        setLocationName(`${street}${street && city ? ", " : ""}${city}`);
      } else {
        setLocationName((prev) =>
          prev && prev !== "Unknown location"
            ? prev
            : `Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`
        );
      }
    } catch (e) {
      console.warn("Could not get address:", e);
      setLocationName((prev) =>
        prev && prev !== "Unknown location"
          ? prev
          : `Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}`
      );
    }
  };
    const handleStart = () => {
    localStorage.removeItem("stepCounterState");

    if (preloadPosition) {
      setRoute([preloadPosition]);
      fetchLocationName(preloadPosition.lat, preloadPosition.lng);
    } else {
      setRoute([]);
    }

    setSteps(0);
    setDistance(0);
    setStartTime(Date.now());
    setDuration(null);
    setLiveDuration(0);
    setLocationName("");
    setRunTitle("");
    setSelectedFiles([]);
    setPreviews([]);
    setTracking(true);
    setPaused(false);
    setElapsedBeforePause(0);

    setIsMinimized(false);
  };

const handleStop = () => {
  setTracking(false);

  const elapsed = paused
    ? elapsedBeforePause
    : elapsedBeforePause + (Date.now() - startTime);

  setDuration(elapsed);  // залишаємо для відображення

  setShowConfirm(true);
  setLiveDuration(0);
  setPaused(false);
  setElapsedBeforePause(0);
  localStorage.removeItem("stepCounterState");

  if (route.length > 0) {
    const lastPoint = route[route.length - 1];
    fetchLocationName(lastPoint.lat, lastPoint.lng);
  }
};

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const deg2rad = (deg) => (deg * Math.PI) / 180;

  const getGpsQuality = () => {
    if (gpsSignal === 0) return "Detecting...";
    if (gpsSignal <= 10) return "Excellent";
    if (gpsSignal <= 25) return "Good";
    if (gpsSignal <= 50) return "Fair";
    return "Weak";
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles(files);
    const prev = files.map((f) => URL.createObjectURL(f));
    setPreviews(prev);
  };

  const handleCancelSave = () => {
    setShowConfirm(false);
    setSelectedFiles([]);
    setPreviews([]);
    setRunTitle("");
    setDuration(null);
    setRoute([]);
    setSteps(0);
    setDistance(0);
    setStartTime(null);
  };

  const resetState = () => {
    setRoute([]);
    setSteps(0);
    setDistance(0);
    setStartTime(null);
    setDuration(null);
    setRunTitle("");
    setSelectedFiles([]);
    setPreviews([]);
    setShowConfirm(false);
    setLiveDuration(0);
  };

const handleSave = async (currentDuration = duration) => {
  if (!runTitle.trim()) {
    toast.error("Please enter a title");
    return;
  }

  setUploading(true);

  try {
    let mapDataUrl = null;
    if (saveMapImage) {
      const mapWrapper = document.getElementById("mapWrapper");
      if (mapWrapper) {
        const markerPane = mapWrapper.querySelector(".leaflet-marker-pane");
        const shadowPane = mapWrapper.querySelector(".leaflet-shadow-pane");

        if (markerPane) markerPane.style.display = "none";
        if (shadowPane) shadowPane.style.display = "none";

        mapDataUrl = await htmlToImage.toPng(mapWrapper);

        if (markerPane) markerPane.style.display = "";
        if (shadowPane) shadowPane.style.display = "";
      }
    }

    let uploadedUrls = [];
    if (selectedFiles.length) {
      const promises = selectedFiles.map((file) =>
        uploadToCloudinary(file, {
          folder: "recrun_photos",
          public_id_prefix: "run",
          tags: ["recrun", "lens"],
          returnType: "secure_url",
        })
      );
      uploadedUrls = await Promise.all(promises);
    }

    const durationMinutes = currentDuration / 60000;
    const pace = distance > 0 ? durationMinutes / distance : 0;

    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const username = userDoc.exists()
      ? userDoc.data().username
      : auth.currentUser.email;

    await addDoc(collection(db, "routes"), {
      uid: auth.currentUser.uid,
      title: runTitle.trim() || getDefaultRunTitle(),
      notes: runNotes.trim() || "",
      steps,
      distance,
      timestamp: serverTimestamp(),
      createdAt: new Date(),
      pace,
      duration: durationMinutes,
      photos: [
        ...(saveMapImage && mapDataUrl ? [mapDataUrl] : []),
        ...uploadedUrls,
      ],
      route,
      locationName,
    });

    toast.success("Route saved!");
    resetState();
  } catch (err) {
    console.error("Save failed:", err);
    toast.error("Saving failed");
  } finally {
    setUploading(false);
  }
};

const getDefaultRunTitle = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Morning Run";
    if (hour >= 12 && hour < 18) return "Afternoon Run";
    return "Evening Run";
  };

  useEffect(() => {
    if (!runTitle) setRunTitle(getDefaultRunTitle());
  }, [showConfirm]);

  return (
    <>
    {tracking && !isMinimized && (
      <div
        className="run-fullscreen"
        onTouchStart={(e) => (window.startY = e.touches[0].clientY)}
        onTouchEnd={(e) => {
          const endY = e.changedTouches[0].clientY;
          if (endY - window.startY > 100) {
            setIsMinimized(true);
          }
        }}
      >
        <div className="run-fullscreen-content">
          <h1 className="animated-number">
            {distance.toFixed(2)} km
          </h1>
          <p className="animated-number">
            {distance > 0
              ? ((liveDuration / 60000) / distance).toFixed(1) + " min/km"
              : "0.0 min/km"}
          </p>
          <p className="animated-number">
            {formatTime(liveDuration)}
          </p>
          <div onClick={() => setIsMinimized(true)}>
            <FiMinimize2 className="fs-1 mt-5" />
          </div>
        </div>
      </div>
    )}
    {(!tracking || isMinimized) && (
      <div className="main-wrapper-lens">
        <div className="step__container containe">
          <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
            <div className="run-controls">
              <button
                className="run-btn record"
                onClick={handleStart}
                disabled={tracking}
              >
                <span className="dot"></span>
              </button>
              <button
                className={`run-btn pause ${paused ? "resume" : ""}`}
                onClick={() => {
                  if (paused) {
                    setPaused(false);
                    setStartTime(Date.now());
                  } else {
                    setPaused(true);
                    setElapsedBeforePause(elapsedBeforePause + (Date.now() - startTime));
                  }
                }}
                disabled={!tracking}
              >
                {paused ? <FaPlay /> : <FaPause />}
              </button>
              <button
                className="run-btn stop"
                onMouseDown={() => (window.stopTimer = setTimeout(handleStop, 400))}
                onMouseUp={() => clearTimeout(window.stopTimer)}
                onMouseLeave={() => clearTimeout(window.stopTimer)}
                onTouchStart={() => (window.stopTimer = setTimeout(handleStop, 400))}
                onTouchEnd={() => clearTimeout(window.stopTimer)}
                disabled={!tracking}
              >
                <FaStop />
              </button>
            </div>

            {duration !== null && !tracking && (
              <p>
                <strong>Duration:</strong> {formatTime(duration)}
              </p>
            )}
            {locationName && (
              <p>
                <strong>Location:</strong> {locationName}{" "}
                {gpsSignal > 0 && (
                  <div className="d-flex gap-2 pt-2">
                <p>GPS: </p>
                  <span
                    style={{
                      fontWeight: "bold",
                      color:
                        gpsSignal <= 10
                          ? "green"
                          : gpsSignal <= 25
                          ? "orange"
                          : "red",
                    }}
                  >
                    {getGpsQuality()}
                  </span>
                  </div>
                )}
              </p>
            )}
            <Achievements 
              distance={distance} 
              pace={distance >= 0.01 ? duration / 60000 / distance : 0} 
              isOwner={true}
            />
            <div className="map-wrapper" id="mapWrapper">
              <MapContainer
                center={route.length ? route[route.length - 1] : [50.4501, 30.5234]}
                zoom={17}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {route.length > 1 && (
                  <Polyline positions={route} pathOptions={{ color: "#db3206", weight: 4 }} />
                )}
                {route.length > 0 && (
                  <Marker position={route[route.length - 1]} icon={CustomIcon} />
                )}
                <RecenterMap position={route[route.length - 1]} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-window bg-dark">
            <p className="text-white fs-3">Save the run</p>

            <div style={{ color: "white", marginBottom: 15 }}>
              <p><strong>Distance:</strong> {distance.toFixed(2)} km</p>
              <p>
                <strong>Pace:</strong>{" "}
                {distance > 0 ? (duration / 60000 / distance).toFixed(1) + " min/km" : "—"}
              </p>
              <p><strong>Time:</strong> {formatTime(duration)}</p>
            </div>

            <div style={{ marginBottom: 15 }}>
              <input
                type="text"
                placeholder="Enter the run title"
                value={runTitle}
                onChange={(e) => setRunTitle(e.target.value)}
                style={{ width: "100%", marginBottom: 10, padding: 8, fontSize: 16 }}
                autoFocus
              />
              <small style={{ color: "#ccc", display: "block", marginBottom: 10 }}>
                (Optional) e.g., Morning Run, Afternoon Run, Evening Run
              </small>

              <textarea
                placeholder="How'd it go? Share more about your activity and tag someone with @"
                value={runNotes}
                onChange={(e) => setRunNotes(e.target.value)}
                style={{ width: "100%", padding: 8, fontSize: 16, minHeight: 80 }}
              />
              <small style={{ color: "#ccc", display: "block", marginTop: 4 }}>
                (Optional) Add notes about your run, feelings, or achievements
              </small>
            </div>

            <div className="save-map-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={saveMapImage}
                  onChange={(e) => setSaveMapImage(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span className="label-text">Save route map</span>
            </div>

            <div className="photo-wrapper-route" style={{ marginTop: 10 }}>
              <label className="custom-file-upload">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesSelected}
                />
                Add photos
              </label>

              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img
                      src={p}
                      alt={`preview-${i}`}
                      style={{ width: 100, height: 70, objectFit: "cover", borderRadius: 6 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 15 }}>
              <button
                className="btn btn-save d-flex align-items-center fs-4"
                disabled={uploading}
                onClick={handleSave}
                style={{
                  marginRight: 10,
                  background: "#db3206",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  color: "white",
                  gap: 8,
                  cursor: uploading ? "not-allowed" : "pointer",
                  transition: "transform 0.1s, background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#ff451c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#db3206")}
              >
                {uploading ? "Saving..." : <><FontAwesomeIcon icon={faFlagCheckered} /> Finish</>}
              </button>

              <button
                className="btn btn-cancel d-flex align-items-center fs-4"
                onClick={handleCancelSave}
                disabled={uploading}
                style={{
                  background: "#555",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  color: "white",
                  gap: 8,
                  cursor: uploading ? "not-allowed" : "pointer",
                  transition: "transform 0.1s, background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#777")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#555")}
              >
                <FontAwesomeIcon icon={faBan} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {tracking && isMinimized && (
    <div className="run-mini-card" onClick={() => setIsMinimized(false)}>
      <div>
        <strong>{distance.toFixed(2)} km</strong>
        <p>Distance</p>
      </div>

      <div>
        <strong>
          {distance > 0
            ? ((liveDuration / 60000) / distance).toFixed(1)
            : "0.0"}
        </strong>
        <p>Pace</p>
      </div>

      <div>
        <strong>{formatTime(liveDuration)}</strong>
        <p>Time</p>
      </div>
    </div>
    )}
    </>
  );
}

