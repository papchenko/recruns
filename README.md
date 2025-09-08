# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

gh
git remote set-url origin git@github.com:papchenko/name.git
git remote -v 

// import React, { useState, useEffect, useRef } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Polyline,
//   Marker,
//   useMap,
// } from "react-leaflet";
// import L from "leaflet";
// import * as htmlToImage from "html-to-image";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "./firebase";
// import LocationTracker from './LocationTracker';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import "leaflet/dist/leaflet.css";

// import iconUrl from "leaflet/dist/images/marker-icon.png";
// import iconShadow from "leaflet/dist/images/marker-shadow.png";
// const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
// L.Marker.prototype.options.icon = DefaultIcon;

// function RecenterMap({ position }) {
//   const map = useMap();
//   useEffect(() => {
//     if (position) map.setView(position);
//   }, [position, map]);
//   return null;
// }

// export default function StepCounter() {
//   const [route, setRoute] = useState([]);
//   const [tracking, setTracking] = useState(false);
//   const [steps, setSteps] = useState(0);
//   const [distance, setDistance] = useState(0);
//   const [startTime, setStartTime] = useState(null);
//   const [locationName, setLocationName] = useState("");
//   const mapRef = useRef();

//   const STEPS_PER_KM = 1312; // середньо кроків на км
//   const MIN_DISTANCE_METERS = 5; // мінімум 5 метрів щоб рахувати крок
//   const MIN_SPEED_KMH = 1.5; // не враховувати рух, якщо швидкість менше 1.5 км/год

//   useEffect(() => {
//     if (!tracking) return;

//     if (!navigator.geolocation) {
//       toast.error("Geolocation is not supported by your browser.");
//       return;
//     }

//     const watchId = navigator.geolocation.watchPosition(
//       async (pos) => {
//         const { latitude, longitude, speed } = pos.coords;
//         const newPoint = { lat: latitude, lng: longitude };

//         setRoute((prevRoute) => {
//           if (prevRoute.length === 0) {
//             fetchLocationName(latitude, longitude);
//             return [newPoint];
//           }

//           const lastPoint = prevRoute[prevRoute.length - 1];
//           const segmentDistance = getDistanceFromLatLonInKm(
//             lastPoint.lat,
//             lastPoint.lng,
//             newPoint.lat,
//             newPoint.lng
//           );

//           const distanceMeters = segmentDistance * 1000;
//           const elapsedSeconds = 2; // приблизно (бо watchPosition працює з затримкою ~2 сек)
//           const currentSpeedKmh = (distanceMeters / elapsedSeconds) * 3.6;

//           if (
//             distanceMeters >= MIN_DISTANCE_METERS &&
//             currentSpeedKmh >= MIN_SPEED_KMH
//           ) {
//             const newDistance = distance + segmentDistance;
//             setDistance(newDistance);
//             setSteps(Math.floor(newDistance * STEPS_PER_KM));
//             return [...prevRoute, newPoint];
//           }

//           return prevRoute;
//         });
//       },
//       (err) => console.error("Geo error:", err),
//       {
//         enableHighAccuracy: true,
//         maximumAge: 1000,
//         timeout: 5000,
//       }
//     );

//     return () => navigator.geolocation.clearWatch(watchId);
//   }, [tracking, distance]);

//   const fetchLocationName = async (lat, lon) => {
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
//       );
//       const data = await res.json();
//       setLocationName(data.display_name || "Unknown location");
//     } catch (e) {
//       console.warn("Could not get address:", e);
//     }
//   };

//   const handleStart = () => {
//     setRoute([]);
//     setSteps(0);
//     setDistance(0);
//     setStartTime(Date.now());
//     setLocationName("");
//     setTracking(true);
//   };

//   const handleStop = async () => {
//     setTracking(false);

//     const elapsedMinutes = (Date.now() - startTime) / 60000;
//     const pace = distance > 0 ? elapsedMinutes / distance : 0;

//     try {
//       const node = document.getElementById("mapWrapper");
//       const dataUrl = await htmlToImage.toPng(node);

//       await addDoc(collection(db, "routes"), {
//         steps,
//         distance,
//         timestamp: serverTimestamp(),
//         pace,
//         image: dataUrl,
//         route,
//         locationName,
//       });

//       toast.success("Route saved to Lens!");
//       setRoute([]);
//       setSteps(0);
//       setDistance(0);
//       setStartTime(null);
//     } catch (err) {
//       console.error("Error saving route:", err);
//       toast.error("Error saving route");
//     }
//   };

//   const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) *
//         Math.cos(deg2rad(lat2)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   const deg2rad = (deg) => deg * (Math.PI / 180);

//   return (
//     <>
//       <ToastContainer position='top-right' autoClose={2500} theme='dark' />
//     <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
//       <h2>Step Counter & Route</h2>
//       <button onClick={handleStart} disabled={tracking} style={{ marginRight: 10 }}>
//         Start
//       </button>
//       <button onClick={handleStop} disabled={!tracking}>
//         Stop & Save to Lens
//       </button>
//       {/* <p><strong>Steps:</strong> {steps}</p> */}
//       <p><strong>Distance:</strong> {distance.toFixed(3)} km</p>
//       <p>
//         <strong>Avg Pace:</strong> {distance > 0 && startTime ? ((Date.now() - startTime) / 60000 / distance).toFixed(2) : 0} min/km
//       </p>
//       {locationName && <p><strong>Location:</strong> {locationName}</p>}

//       <div
//         id="mapWrapper"
//         style={{ height: 400, width: "100%", marginTop: 20, border: "1px solid #ccc" }}
//       >
//         <MapContainer
//           center={route.length ? route[route.length - 1] : [50.4501, 30.5234]}
//           zoom={17}
//           style={{ height: "100%", width: "100%" }}
//           ref={mapRef}
//         >
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//          {route.length > 1 && (
//             <Polyline
//               positions={route}
//               pathOptions={{ color: '#f26f55', weight: 6 }}
//             />
//           )}
//           {route.length > 0 && <Marker position={route[route.length - 1]} />}
//           <RecenterMap position={route[route.length - 1]} />
//         </MapContainer>
//       </div>
//     </div>
//     <LocationTracker />
//     </>
//   );
// }# recruns
