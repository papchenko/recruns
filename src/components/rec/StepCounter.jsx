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

// HH:MM:SS
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

  const [preloadPosition, setPreloadPosition] = useState(null); //!

  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [liveDuration, setLiveDuration] = useState(0);
  const [locationName, setLocationName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [runTitle, setRunTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [saveMapImage, setSaveMapImage] = useState(true); //!

  const [paused, setPaused] = useState(false);
  const [elapsedBeforePause, setElapsedBeforePause] = useState(0);


  const mapRef = useRef();
  const timerRef = useRef(null);

  const STEPS_PER_KM = 1312;
  const MIN_DISTANCE_METERS = 5;
  const MIN_SPEED_KMH = 1.5;

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
  };

  const handleStop = () => {
    setTracking(false);
    const elapsed = paused
      ? elapsedBeforePause
      : elapsedBeforePause + (Date.now() - startTime);
    setDuration(elapsed);
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

  const handleSave = async () => {
    if (!runTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    setUploading(true);
    try {
      const mapWrapper = document.getElementById("mapWrapper");

      const markerPane = mapWrapper.querySelector(".leaflet-marker-pane");
      const shadowPane = mapWrapper.querySelector(".leaflet-shadow-pane");

      if (markerPane) markerPane.style.display = "none";
      if (shadowPane) shadowPane.style.display = "none";

      let mapDataUrl = null;
      if (saveMapImage) {
        const mapWrapper = document.getElementById("mapWrapper");

        const markerPane = mapWrapper.querySelector(".leaflet-marker-pane");
        const shadowPane = mapWrapper.querySelector(".leaflet-shadow-pane");

        if (markerPane) markerPane.style.display = "none";
        if (shadowPane) shadowPane.style.display = "none";

        mapDataUrl = await htmlToImage.toPng(mapWrapper);

        if (markerPane) markerPane.style.display = "";
        if (shadowPane) shadowPane.style.display = "";
      }

      if (markerPane) markerPane.style.display = "";
      if (shadowPane) shadowPane.style.display = "";

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

      const durationMinutes = duration / 60000;
      const pace = distance > 0 ? durationMinutes / distance : 0;

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const username = userDoc.exists()
        ? userDoc.data().username
        : auth.currentUser.email;

      await addDoc(collection(db, "routes"), {
        uid: auth.currentUser.uid,
        title: runTitle.trim(),
        steps,
        distance,
        timestamp: serverTimestamp(),
        createdAt: new Date(),
        pace,
        duration: durationMinutes,
        photos: [
            ...(saveMapImage && mapDataUrl ? [mapDataUrl] : []),
            ...uploadedUrls
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

  return (
    <>
      <div className="main-wrapper-lens">
        <div className="step__container containe">
          <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
            <button
              className="btn btn-custome fs-4 text-white"
              onClick={handleStart}
              disabled={tracking}
              style={{ marginRight: 10 }}
            >
              Record
            </button>

            <button
              className="btn btn-warning fs-4 text-white"
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
              style={{ marginRight: 10 }}
            >
              {paused ? "Resume" : "Pause"}
            </button>

            <button
              className="btn btn-custome fs-4 text-white"
              onClick={handleStop}
              disabled={!tracking}
            >
              Stop
            </button>

            <br />
            <br />
            <p>
              <strong>Distance:</strong> {distance.toFixed(3)} km
            </p>
            <p>
              <strong>Avg Pace:</strong>{" "}
              {distance >= 0.01
                ? ((tracking ? liveDuration : duration) / 60000 / distance).toFixed(1) + " min/km"
                : "—"}
            </p>
            {tracking && (
              <p>
                <strong>Time:</strong> {formatTime(liveDuration)}
              </p>
            )}
            {duration !== null && !tracking && (
              <p>
                <strong>Duration:</strong> {formatTime(duration)}
              </p>
            )}
            {locationName && (
              <p>
                <strong>Location:</strong> {locationName}
              </p>
            )}
            <Achievements 
              distance={distance} 
              pace={distance >= 0.01 ? duration / 60000 / distance : 0} 
              isOwner={true}
            />

            <div
              id="mapWrapper"
              style={{
                height: 400,
                width: "100%",
                marginTop: 20,
                border: "1px solid #ccc",
              }}
            >
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
                {route.length > 0 && (<Marker position={route[route.length - 1]} icon={CustomIcon} />)}
                <RecenterMap position={route[route.length - 1]} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-window bg-dark">
            <p className="text-white fs-3">Save the run</p>
            <input
              type="text"
              placeholder="Enter the run title"
              value={runTitle}
              onChange={(e) => setRunTitle(e.target.value)}
              style={{ width: "100%", marginBottom: 10, padding: 8, fontSize: 16 }}
              autoFocus
            />
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
            <div className="photo-wrapper-route">
            <label style={{ display: "block", marginBottom: 8 }}>
            </label>
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
                className="btn btn-success fs-4"
                disabled={uploading}
                onClick={handleSave}
                style={{ marginRight: 8 }}
              >
                {uploading ? "Saving..." : "Save"}
              </button>
              <button className="btn btn-danger fs-4" onClick={handleCancelSave} disabled={uploading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}