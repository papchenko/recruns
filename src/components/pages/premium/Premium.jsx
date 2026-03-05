import { useCart } from "../../../context/CartContext";
import { toast } from "react-toastify";

import basicImg from "../../../assets/premium-basic-img.png";
import advancedImg from "../../../assets/premium-advanced-img.png";
import proImg from "../../../assets/premium-pro-img.png";

import "./premium.scss";

const Price = () => {
  const { cartItems, addToCart } = useCart();

  const handleTryNow = (pkg) => {
    const alreadyInCart = cartItems.find((i) => i.id === pkg.id);
    if (alreadyInCart) {
      toast.info("This package is already in your cart!", { theme: "dark" });
    } else {
      addToCart(pkg);
      toast.success(`${pkg.title} added to cart!`, { theme: "dark" });
    }
  };

const premiumPlans = [
  {
    id: "premium-basic",
    title: "Basic",
    description: "Beat For personal and basic needs",
    price: 250,
    image: basicImg,
    features: [
      { icon: "ri-check-line", text: "Quick acceptance for Team Runs" },
      { icon: "ri-uncheck-line", text: "Help in preparation for Team Runs" },
      { icon: "ri-uncheck-line", text: "Priority support" },
      { icon: "ri-uncheck-line", text: "Premium badge" },
    ],
  },
  {
    id: "premium-advanced",
    title: "Advanced",
    description: "Beat For more demanding users",
    price: 420,
    image: advancedImg,
    tag: "popular",
    features: [
      { icon: "ri-check-line", text: "Quick acceptance for Team Runs" },
      { icon: "ri-check-line", text: "Help in preparation for Team Runs" },
      { icon: "ri-check-line", text: "Priority support" },
      { icon: "ri-uncheck-line", text: "Premium badge" },
    ],
  },
  {
    id: "premium-pro",
    title: "Pro",
    description: "Beat For professionals and teams",
    price: 700,
    image: proImg,
    features: [
      { icon: "ri-check-line", text: "Quick acceptance for Team Runs" },
      { icon: "ri-check-line", text: "Help in preparation for Team Runs" },
      { icon: "ri-check-line", text: "Priority support" },
      { icon: "ri-check-line", text: "Premium badge" },
    ],
  },
];


  return (
    <section className="main-wrapper">
      <div className="price-section">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="section-title">
              <p>Premium</p>
              <h2>Simply Choose The Pricing Plan</h2>
            </div>
          </div>

          <div className="row g-4">
            {premiumPlans.map((pkg) => (
              <div className="col-lg-4" key={pkg.id}>
                <div className="pricing-card">
                  <h5 className="d-flex justify-content-center align-items-center gap-3">
                    {pkg.title}{" "}
                    {pkg.tag && (
                      <span className="popular-tag text-white">
                        {pkg.tag}
                      </span>
                    )}
                  </h5>
                  <p className="mb-3">{pkg.description}</p>
                  <div className="pricing-content d-flex align-items-center gap-3 border-top">
                    <h2>₴{pkg.price}</h2>
                    <span style={{fontSize: '0.8rem'}}>30-day package. You need to renew it each month by making a payment.</span>
                  </div>
                  <ul className="list-unstyled mt-4">
                    {pkg.features.map((feature, index) => (
                        <li key={index} className="mb-4 d-flex align-items-center gap-2">
                        <i className={feature.icon}></i>
                        <span>{feature.text}</span>
                        </li>
                    ))}
                    </ul>
                      <button
                        className="btn text-white"
                        onClick={() =>
                          handleTryNow({
                            id: pkg.id,
                            title: pkg.title,
                            description: pkg.description,
                            image: pkg.image,
                            price: pkg.price,
                            type: "premium",
                            features: pkg.features.filter(f => f.icon === "ri-check-line"),
                          })
                        } 
                      >
                        Try Now <i className="ri-arrow-right-up-line"></i>
                      </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Price;