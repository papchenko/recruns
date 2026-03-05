import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LocationTracker() {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        console.log('Position:', pos.coords.latitude, pos.coords.longitude);
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        toast.error('Geolocation error:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className='location-tracker'>
      <h3 style={{color: "#f26f55"}}>Your current location:</h3>
      {position
        ? <p>Latitude: {position.lat}, Longitude: {position.lng}</p>
        : <p>Loading coordinates...</p>
      }
    </div>
  );
}

export default LocationTracker;