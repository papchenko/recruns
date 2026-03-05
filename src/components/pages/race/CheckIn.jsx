import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CheckIn = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Checking...");
  const [userData, setUserData] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);

  const uid = searchParams.get("uid");
  const category = searchParams.get("category");

  useEffect(() => {
    const checkInUser = async () => {
      if (!uid) {
        setStatus("Invalid QR code: missing UID");
        return;
      }

      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setStatus("User not found in database");
          return;
        }

        const data = userSnap.data();
        setUserData(data);

        const now = new Date();

        await updateDoc(userRef, {
          checkedIn: true,
          checkedInAt: now,
        });

        setCheckInTime(now);
        setStatus(`✅ User successfully checked in (Category: ${category || "N/A"})`);
        toast.success("Check-in completed successfully!");
      } catch (err) {
        console.error("Check-in error:", err);
        toast.error(`Check-in error: ${err.message}`);
        setStatus("❌ Error during check-in. Try again.");
      }
    };

    checkInUser();
  }, [uid, category]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-white bg-dark">
      <h1>Team Run Check-In</h1>
      <p>{status}</p>

      {userData && (
        <div className="mt-3 text-center">
          <img
            src={
              userData.avatarUrl ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="avatar"
            style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 10 }}
          />
          <h3>{userData.username || userData.email}</h3>

          {checkInTime && (
            <p className="mt-2">
              Checked in at:{" "}
              {checkInTime.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckIn;