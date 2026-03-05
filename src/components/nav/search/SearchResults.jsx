import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";

import "./search.scss";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
  const query = useQuery().get("query")?.toLowerCase() || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const routesSnap = await getDocs(collection(db, "routes"));
      const usersSnap = await getDocs(collection(db, "users"));
      
      const routeResults = routesSnap.docs
        .map((d) => ({ id: d.id, ...d.data(), type: "route" }))
        .filter((r) =>
          [r.title, r.locationName]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query))
        );

      const userResults = usersSnap.docs
        .map((d) => ({ id: d.id, ...d.data(), type: "user" }))
        .filter((u) =>
          [u.username, u.email]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query))
        );

      setResults([...routeResults, ...userResults]);
      setLoading(false);
    };

    if (query) fetchResults();
  }, [query]);

  if (loading) return <div className="text-white search-loading">Searching...</div>;

  return (
    <div className="search-results text-white container">
      <h3>Search results for: “{query}”</h3>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="row mt-4">
          {results.map((item) => (
            <div key={item.id} className="col-lg-4 mb-4">
              <div className="search-card p-3 rounded border">
                {item.type === "route" ? (
                  <>
                    <h5>{item.title}</h5>
                    <p><strong>Location:</strong> {item.locationName || "—"}</p>
                    <Link to={`/lens/${item.id}`} className="btn btn-custome">View Run</Link>
                  </>
                ) : (
                  <>
                    <h5>{item.username || item.email}</h5>
                    <p><strong>Race registration category:</strong> {item.runCategory || "not registered"}</p>
                    <Link to={`/profile/${item.id}`} className="btn btn-custome">View Profile</Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}