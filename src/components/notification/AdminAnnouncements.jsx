import { useEffect, useState } from "react";
import { useAuth } from "../account/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import AdminAnnouncementPanel from "../notification/AdminAnnouncementPanel";

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const checkAdmin = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists() && snap.data().isAdmin === true) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate("/");
      }
    };

    checkAdmin();
  }, [user, navigate]);

  if (isAdmin === null) return <p style={{ color: "#fff" }}>Loading...</p>;
  if (isAdmin === false) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px",
        background: "#121212",
        minHeight: "100vh",
      }}
    >
      <AdminAnnouncementPanel />
    </div>
  );
}