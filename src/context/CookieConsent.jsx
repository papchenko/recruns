import { useAuth } from "../components/account/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

import logoImg from "../assets/logo.png";

import "./cookie.scss";

const CookieConsent = () => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkConsent = async () => {
      const localConsent = localStorage.getItem("cookie_consent-r");
      if (!user) {
        if (!localConsent) setVisible(true);
        return;
      }

      const consentRef = doc(db, "userConsentsR", user.uid);
      const snap = await getDoc(consentRef);

      if (snap.exists()) {
        localStorage.setItem(
          "cookie_consent-r",
          snap.data().consent ? "accepted" : "rejected"
        );
        setVisible(false);
      } else if (!localConsent) {
        setVisible(true);
      }
    };

    checkConsent();
  }, [user]);

  const handleConsent = async (accepted) => {
    localStorage.setItem("cookie_consent-r", accepted ? "accepted" : "rejected");
    setVisible(false);

    if (user?.uid) {
      const consentRef = doc(db, "userConsentsR", user.uid);
      await setDoc(consentRef, {
        consent: accepted,
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-content">
        <img src={logoImg} alt="Image" className="cookie-icon" />
        <p>
          We use Firebase, Cloudinary, and LocalStorage to improve your experience.
          Data may be stored in your browser and in our database.  
          More details in <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
      <div className="cookie-buttons">
        <button className="accept" onClick={() => handleConsent(true)}>Accept</button>
        {/* <button className="reject" onClick={() => handleConsent(false)}>Reject</button> */}
      </div>
    </div>
  );
};

export default CookieConsent;