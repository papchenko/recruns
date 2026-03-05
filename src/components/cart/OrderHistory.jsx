import { useState } from "react";
import { useAuth } from "../account/AuthContext";
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { toast } from "react-toastify";

import "./orderHistory.scss";

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchOrders = async () => {
    if (!user) {
      toast.info("Please sign in to view your orders", { theme: "dark" });
      return;
    }

    setLoading(true);
    try {
      const ordersRef = collection(db, "users", user.uid, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      const querySnap = await getDocs(q);

      const data = querySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!showHistory) fetchOrders();
    setShowHistory((prev) => !prev);
  };

  return (
    <div className="order-history-wrapper mt-5">
      <div className="text-center">
        <button
          onClick={handleToggle}
          className={`btn toggle-history-btn ${showHistory ? "active" : ""}`}
        >
          {showHistory ? "Hide Order History" : "View Order History"}
        </button>
      </div>

      {showHistory && (
        <div className="order-history mt-4">
          {loading ? (
            <div className="text-center p-4 bg-dark text-white rounded">
              <p>Loading your orders...</p>
            </div>
          ) : !user ? (
            <div className="text-center p-4 bg-dark text-white rounded">
              <p>Please sign in to view your order history</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-4 bg-dark text-white rounded">
              <p>No previous orders found.</p>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="order-item bg-dark text-light p-3 mb-3 rounded"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Order №:</strong> {order.orderNumber}
                      <br />
                      <small className="text-secondary">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleString()
                          : "—"}
                      </small>
                    </div>
                    <span className="fw-bold text-warning">₴ {order.total}</span>
                  </div>

                  <div className="order-products mt-3">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="d-flex align-items-center gap-3 border-bottom border-secondary pb-2 mb-2"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            width={60}
                            height={60}
                            className="rounded"
                          />
                        )}
                        <div>
                          <div className="fw-semibold">{item.title}</div>
                          <small className="text-secondary">{item.description}</small>
                          <div className="small mt-1">
                            {item.type === "premium" ? (
                              <span className="text-info">Premium Plan</span>
                            ) : (
                              <>
                                Size: {item.size} × Qty: {item.quantity}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;