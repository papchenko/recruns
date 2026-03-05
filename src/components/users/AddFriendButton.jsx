import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../account/AuthContext";
import { toast } from "react-toastify";

import "./addfriendbutton.scss";

export default function AddFriendButton({ targetUid }) {
  const { user } = useAuth();

  const handleAdd = async () => {
    if (!user || user.uid === targetUid) return;

    const targetDoc = doc(db, "friends", targetUid);
    const userDoc = doc(db, "friends", user.uid);

    if (!(await getDoc(targetDoc)).exists()) await setDoc(targetDoc, { friends: [], requests: [] });
    if (!(await getDoc(userDoc)).exists()) await setDoc(userDoc, { friends: [], requests: [] });

    const userSnap = await getDoc(userDoc);
    const userData = userSnap.data();

    if (userData.friends.includes(targetUid)) {
      toast.info("This user is already your friend!");
      return;
    }

    if (userData.requests.includes(targetUid)) {
      toast.info("Friend request already sent!");
      return;
    }

    await updateDoc(targetDoc, { requests: arrayUnion(user.uid) });
    toast.success("Friend request sent!");
  };

  return <button className="add-friend-btn m-2" onClick={handleAdd}>Add Friend</button>;
}