import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../account/AuthContext";
import { toast } from "react-toastify";
import PaymentFlow from "../payment/PaymentFlow";
import OrderHistory from "./OrderHistory";

import "./cart.scss";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, updateSize } = useContext(CartContext);
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => {
      const isPremium = item.type === "premium";
      const price = isPremium ? item.price : item.size === "64x64" ? 120 : 90;
      return sum + price * (item.quantity || 1);
    },
    0
  );

  const handleNext = () => {
    if (!user) {
      toast.info("Please sign in to continue your order", {
        position: "top-center",
        autoClose: 2500,
        theme: "dark",
      });
      return;
    }
    setShowCheckout(true);
  };

  if (showCheckout) return <PaymentFlow />;

  return (
    <section className="main-wrapper text-white">
      <div className="cartpage-wrapper">
        <div className="container cartpage-container">
          <div className="row cartpage-content">
            {/* --- CART ITEMS --- */}
            <div className="col-md-8 cartpage-cart">
              {cartItems.length === 0 ? (
                <div className="cart-empty text-center p-4 bg-dark text-light rounded">
                  <i className="ri-shopping-cart-2-line fs-1 empty-icon"></i>
                  <h5>Your cart is currently empty</h5>
                  <div className="d-flex justify-content-center gap-2">
                    <a href="/" className="btn btn-outline-recrun">Home Page</a>
                  </div>
                </div>
              ) : (
                <>
                  {/* --- DESKTOP TABLE --- */}
                  <div className="table-responsive d-none d-lg-block">
                    <table className="table table-dark table-hover cart-table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Size</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => {
                        const isPremium = item.type === "premium";
                        const price = isPremium
                          ? item.price
                          : item.size === "64x64"
                          ? 120
                          : 90;

                        return (
                          <tr key={item.id}>
                            <td className="d-flex align-items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.title}
                                width={80}
                                className="rounded cartpage-img"
                              />
                              <div>
                                <strong>{item.title}</strong><br />
                                <small>{item.description}</small>
                              </div>
                            </td>
                            <td>
                              {isPremium ? (
                                <span className="text-secondary">–</span>
                              ) : (
                                <select
                                  value={item.size}
                                  className="form-select bg-dark text-white border-secondary"
                                  onChange={(e) => updateSize(item.id, e.target.value)}
                                >
                                  <option value="34x34">34x34</option>
                                  <option value="64x64">64x64</option>
                                </select>
                              )}
                            </td>
                            <td>
                              {isPremium ? (
                                <span className="text-secondary">–</span>
                              ) : (
                                <input
                                  type="number"
                                  className="form-control bg-dark text-white border-secondary"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(item.id, parseInt(e.target.value))
                                  }
                                  style={{ width: "80px" }}
                                />
                              )}
                            </td>
                            <td>₴ {price.toFixed(2)}</td>
                            <td>
                              <i
                                className="ri-delete-bin-line text-danger fs-5"
                                role="button"
                                onClick={() => removeFromCart(item.id)}
                              ></i>
                            </td>
                          </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>

                  {/* --- MOBILE CARDS --- */}
                  <div className="cart-card-wrapper d-lg-none">
                    {cartItems.map((item) => {
                      const isPremium = item.type === "premium";
                      const price = isPremium ? item.price : item.size === "64x64" ? 120 : 90;
                      return (
                        <div className="cart-card" key={item.id}>
                          <img src={item.image} alt={item.title} className="cart-card-img" />
                          <div className="cart-card-info">
                            <span className="title">{item.title}</span>
                            <span className="description">{item.description}</span>
                            <div className="controls">
                              {!isPremium && (
                                <>
                                  <select
                                    value={item.size}
                                    onChange={(e) => updateSize(item.id, e.target.value)}
                                  >
                                    <option value="34x34">34x34</option>
                                    <option value="64x64">64x64</option>
                                  </select>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateQuantity(item.id, parseInt(e.target.value))
                                    }
                                  />
                                </>
                              )}
                              <span className="price">₴ {(price * (item.quantity || 1)).toFixed(2)}</span>
                              <i
                                className="ri-delete-bin-line remove-btn"
                                onClick={() => removeFromCart(item.id)}
                              ></i>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            {/* --- SUMMARY --- */}
            <div className="col-md-4 mt-4 mt-md-0">
              <div className="p-3 bg-dark text-light rounded">
                <h5>
                  Total
                  <span className="float-end" style={{ color: "#db3206" }}>
                    ₴ {subtotal.toFixed(2)}
                  </span>
                </h5>

                <button
                  className="btn next-btn w-100 fw-bold mt-3"
                  disabled={cartItems.length === 0}
                  onClick={handleNext}
                >
                  Continue & Next
                </button>

                <div className="mt-3 small">
                  <i className="ri-check-line text-success me-1"></i>
                  Free cancellation up to 24h in advance
                </div>
              </div>
            </div>
              <div className="mt-2">
                <OrderHistory />
              </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;