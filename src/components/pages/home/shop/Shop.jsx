import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import tourData from '../../../../data/Shop.json';
import { CartContext } from '../../../../context/CartContext';
import { toast } from 'react-toastify';

import { IoResize } from "react-icons/io5";

/* Swiper */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from "swiper/modules";
import 'swiper/css';

import './shop.scss';

const Shop = () => {
  const [tours, setTours] = useState([]);
  const { cartItems, addToCart } = useContext(CartContext);

  useEffect(() => {
    setTours(tourData);
  }, []);

  const handleBookNow = (tour) => {
    console.log('Clicked on:', tour.title);

    const alreadyInCart = cartItems.find((item) => item.id === tour.id);

    if (alreadyInCart) {
      toast.info('Item already in cart!');
    } else {
      addToCart({ ...tour, quantity: 1 });
      toast.success('Item added to cart!');
    }
  };

  return (
    <section className="shop-container section" id='shop'>
      <div className="container">
        <div className="row text-center mb-5">
          <div className="section-title d-flex align-items-center flex-column">
            <p>Shop</p>
            <h2>Our shop of branded things</h2>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <Swiper
            slidesPerView={1}
            spaceBetween={20}
            modules={[Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            loop={true}
            breakpoints={{
              1399: { slidesPerView: 2 },
              991: { slidesPerView: 2 },
              0: { slidesPerView: 1 },
            }}
            className="mt-4 swiper position-relative"
          >
            {tours.slice(0, 4).map((tour) => (
              <SwiperSlide key={tour.id}>
                <div className="shop-card shadow-sm position-relative">
                  <div className="position-relative">
                    {/* <Link to={`/ShopDetail/${tour.id}`}> */}
                      <img
                        src={tour.image}
                        alt={tour.title}
                        className="card-img-top-shop rounded-3"
                      />
                    {/* </Link> */}
                    <button
                      className="position-absolute  m-4 btn text-decoration-none btn-link p-0"
                      style={{ pointerEvents: 'auto', zIndex: 100000000 }}
                      onClick={() => handleBookNow(tour)}
                    >
                      <i className="ri-shopping-cart-2-line fs-5 text-white"></i>
                    </button>
                  </div>

                  <div className="shop-card-body py-3">
                    <h5 className="shop-card-title fw-semibold mb-1 pt-3">{tour.title}</h5>
                    <p className="mb-3">{tour.description}</p>
                    <p className="mb-2 text-white">
                      <i><IoResize /> </i>{tour.size}
                    </p>
                    <div className="d-flex align-items-center justify-content-start gap-3 small">
                      <span className="text-white fw-bold">{tour.price}</span>
                      <div>
                        <i className="ri-star-fill first-color me-1"></i>
                        <span>{tour.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Shop;