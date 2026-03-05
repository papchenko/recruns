import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../account/AuthContext";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, setDoc } from "firebase/firestore";

import "./payment.scss";

const PaymentFlow = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const orderNumberRef = useRef("");
  const [orderNumber, setOrderNumber] = useState("");
  const [total, setTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [orderCart, setOrderCart] = useState([]);
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("paymentStep");
    return savedStep ? Number(savedStep) : 1;
  });

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    city: "",
    post: "",
    department: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    localStorage.setItem("paymentStep", step);
  }, [step]);

  useEffect(() => {
    if (!orderNumberRef.current) {
      const random = Math.floor(100000 + Math.random() * 900000);
      orderNumberRef.current = `ORD-${new Date().getFullYear()}${
        new Date().getMonth() + 1
      }${new Date().getDate()}-${random}`;
    }
    setOrderNumber(orderNumberRef.current);

    const totalAmount = cartItems.reduce((sum, item) => {
      const isPremium = item.type === "premium";
      const price = isPremium ? item.price : item.size === "64x64" ? 120 : 90;
      return sum + price * (item.quantity || 1);
    }, 0);

    setTotal(totalAmount);
  }, [cartItems]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const hasPremium = cartItems.some((i) => String(i.id).startsWith("premium-"));
    const hasRegular = cartItems.some((i) => !String(i.id).startsWith("premium-"));

    const requiredFields =
      hasPremium && !hasRegular
        ? ["lastName", "firstName", "phone", "email"]
        : ["lastName", "firstName", "city", "post", "department", "phone"];

    for (let key of requiredFields) {
      if (!formData[key]) {
        toast.error("Please fill all required fields");
        return;
      }
    }

    if (!user) {
      toast.info("Please log in to continue your order");
      return;
    }

    setStep(2);
  };

  const handlePaymentConfirm = async () => {
    setOrderCart([...cartItems]);
    setFinalTotal(total);

    const itemsList = cartItems
      .map((item) => {
        const isPremium = item.type === "premium";
        const price = isPremium ? item.price : item.size === "64x64" ? 120 : 90;

        return isPremium
          ? `${item.title} — Premium Plan (${item.price}₴)`
          : `${item.title} — ${item.quantity} pcs, size: ${item.size}, price: ${price}₴`;
      })
      .join("\n");

    const emailData = {
      ...formData,
      orderNumber,
      message: `🧾 New order RecRun!\n\nOrder: ${orderNumber}\nTotal: ${total}₴\n\nCustomer: ${
        formData.lastName
      } ${formData.firstName}\n${
        cartItems.some((i) => !String(i.id).startsWith("premium-"))
          ? `City: ${formData.city}\nPost: ${formData.post}, Department: ${formData.department}\n`
          : ""
      }Phone: ${formData.phone}${
        formData.email ? `\nEmail: ${formData.email}` : ""
      }\n\nOrdered Items:\n${itemsList}`,
    };

    try {
      await emailjs.send(
        "service_hllb7p1",
        "template_gdn6fcv",
        emailData,
        "v13Oo-YtABqCO9JLF"
      );

      if (user?.uid) {
        const ordersRef = collection(db, "users", user.uid, "orders");
        await addDoc(ordersRef, {
          orderNumber,
          total,
          items: cartItems.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            size: item.size || null,
            price: item.price || (item.size === "64x64" ? 120 : 90),
            image: item.image || null,
            type: item.type || "shop",
          })),
          formData,
          createdAt: serverTimestamp(),
        });
      }
      if (user?.uid) {
  const hasPremium = cartItems.some((i) => i.type === "premium");

  if (hasPremium) {
    const premiumItem = cartItems.find((i) => i.type === "premium");
    const userRef = doc(db, "users", user.uid);

    const now = new Date();
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await setDoc(
          userRef,
          {
            premiumPackage: {
              title: premiumItem.title,
              price: premiumItem.price,
              startedAt: now.toISOString(),
              expiresAt: expiryDate.toISOString(),
              active: false,
              features: premiumItem.features || []
            },
          },
          { merge: true }
        );
        toast.info(`${premiumItem.title} Premium has been added to your account. Our resource administration will activate it after verifying your payment.`);
      }
    }
      toast.success("✅ Order received! Wait for shipment 🚚");
      clearCart();
      localStorage.removeItem("paymentStep");
      setStep(3);
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Error sending order. Try again later.");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("receipt").innerHTML;
    const newWin = window.open("", "_blank");
    newWin.document.write(
      `<html><head><title>Receipt</title></head><body>${printContent}</body></html>`
    );
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  };

  const hasPremium = cartItems.some((i) => String(i.id).startsWith("premium-"));
  const hasRegular = cartItems.some((i) => !String(i.id).startsWith("premium-"));

  return (
    <div className="payment-container container text-white py-5 d-flex flex-column">
      <h3 className="fs-2 mb-3 ms-3" style={{ color: "#fd5200" }}>
        {step === 1
          ? "Step 1: Fill Your Details"
          : step === 2
          ? "Step 2: Payment"
          : "Step 3: Order Receipt"}
      </h3>

      {step === 1 && (
        <form className="payment-form" onSubmit={handleFormSubmit}>
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />

          {(!hasPremium || hasRegular) && (
            <>
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
              <select name="post" value={formData.post} onChange={handleChange} required className="fs-4 text-white">
                <option value="">Select Delivery Service</option>
                <option value="Nova Poshta">Nova Poshta</option>
                <option value="Ukrposhta">Ukrposhta</option>
              </select>
              <input type="text" name="department" placeholder="Department Number" value={formData.department} onChange={handleChange} required />
            </>
          )}

          {hasPremium && (
            <>
              <div className="color-red">
                * Be sure to provide the email address of the account you registered on 
                the site to qualify for the required premium package.
              </div>
              <input type="email" name="email" placeholder="Email (registered on site)" value={formData.email} onChange={handleChange} required />
            </>
          )}

          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone || "+380"} onChange={(e) => {
            let value = e.target.value;
            if (!value.startsWith("+380")) value = "+380";
            if (!/^\+380\d{0,9}$/.test(value)) return;
            setFormData({ ...formData, phone: value });
          }} required />

          <button type="submit" className="btn btn-next mt-3">Next: Payment</button>
        </form>
      )}

      {step === 2 && (
        <div className="payment-summary d-flex align-items-center gap-2 flex-column">
          <div className="d-flex align-items-center gap-2 flex-column">
            <p className="m-0"><b>Order Number:</b></p>
            <div
              className="p-3 rounded bg-black text-white border border-secondary d-inline-block"
              style={{ fontSize: "1.2rem", letterSpacing: "2px" }}
            >
              <span style={{ color: "#fff", fontSize: "1rem", cursor: "pointer", userSelect: "all" }} onClick={() => { navigator.clipboard.writeText(orderNumber); toast.success("Order number copied"); }}>{orderNumber}</span>
            </div>
          </div>

          <p><b>Total Amount:</b> {total}₴</p>

          <div className="d-flex align-items-center gap-2 flex-column">
            <b>Card for Payment:</b>
            <div
              className="p-3 rounded bg-black text-white border border-secondary d-inline-block"
              style={{ fontSize: "1.2rem", letterSpacing: "2px" }}
            >
              <span style={{ color: "#fd5200", fontSize: "1.2rem", cursor: "pointer", userSelect: "all" }} onClick={() => { navigator.clipboard.writeText("4790729928936954"); toast.success("Card number copied"); }}>4790 7299 2893 6954</span>
            </div>
          </div>

          <div
            className="d-flex flex-column w-100 p-3 justify-content-center align-items-center"
            style={{ backgroundColor: "#ffffff11", borderRadius: "8px" }}
          >
            <p className="m-0" style={{ color: "red", textTransform: "uppercase", fontWeight: "600" }}>
              mandatory condition for payment!
            </p>
            <p className="m-0 w-100 text-center">
              🕓 In payment description, enter order number {orderNumber}
            </p>
          </div>

          <button className="btn btn-pay mt-3" onClick={handlePaymentConfirm}>
            I Paid, Get My Order!
          </button>
        </div>
      )}

      {step === 3 && (
        <div id="receipt" className="d-flex flex-column justofy-content-center align-items-center">
          <div className="payment-summary">
            <p><b>Order Number:</b> <span>{orderNumber}</span></p>
            <p><b>Total Amount:</b> {finalTotal}₴</p>
            <p><b>Card for Payment:</b> 4790 7299 2893 6954</p>
          </div>
          <div className="ordered-items ms-0">
            <ul>
              <h4>Ordered Items:</h4>
              {orderCart.map((item) => {
                const isPremium = item.type === "premium";
                const price = isPremium ? item.price : item.size === "64x64" ? 120 : 90;
                return (
                  <li key={item.id}>
                    {item.title}
                    {!String(item.id).startsWith("premium-") && `, size: ${item.size}`}
                    {!String(item.id).startsWith("premium-") && item.quantity > 1 && ` × ${item.quantity}`} — {price * (item.quantity || 1)}₴
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="d-flex gap-3 ms-2">
            <button className="btn btn-outline-recrun mt-2" onClick={handlePrint}>Print Receipt</button>
            <button className="btn btn-outline-recrun-white mt-2" onClick={() => { localStorage.removeItem("paymentStep"); navigate("/"); }}>Back to Home</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentFlow;