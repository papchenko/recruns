import { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../account/AuthContext';
import { toast } from "react-toastify";
// swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import './hero.scss';

const Hero = () => {
  const [progress, setProgress] = useState(0);
  const swiperRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProtectedNavigate = (path) => {
    if (!user) {
      toast.info("Please sign in to continue");
    //   toast.info("Please sign in to continue", {
    //   position: "top-center",
    //   autoClose: 2500,
    //   theme: "dark",
    // });
      return;
    }

    navigate(path);
  };

  return (
    <section className="hero-header">
      <Swiper
        ref={swiperRef}
        modules={[Autoplay]}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 15000, disableOnInteraction: false }}
        onAutoplayTimeLeft={(swiper, time, percentage) => setProgress(1 - percentage)}
      >
        {/* SLIDE 1 */}
        <SwiperSlide>
          <div className="hero-slide" style={{ backgroundImage: `url('/path-to-your-image1.jpg')` }}>
            <div className="hero-content container">
              <h1 className="hero-title">Team Races & Challenges</h1>
              <p className="hero-description">
                Join team-based competitions, track results in real time, and fight for the top positions.
              </p>
              <p className="hero-description">
                Compete in organized team races, track collective performance, and climb the leaderboard together.
              </p>
              <button
                className="btn btn-custome text-white rounded-5 px-5 py-2 fs-6 fw-semibold mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProtectedNavigate('/Race');
                }}
              >
                Join Race
              </button>
            </div>
          </div>
        </SwiperSlide>

        {/* SLIDE 2 */}
        <SwiperSlide>
          <div className="hero-slide" style={{ backgroundImage: `url('/path-to-your-image2.jpg')` }}>
          <div className="hero-content container">
              <h1 className="hero-title">Unlock Your Full Potential</h1>
              <p className="hero-description">
                Gain access to premium features, advanced analytics, and personal coaching insights.
              </p>
              <p className="hero-description">
                Push your limits and reach new milestones with your team.
              </p>
               <button
                className="btn btn-custome text-white rounded-5 px-5 py-2 fs-6 fw-semibold mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProtectedNavigate('/Premium');
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </SwiperSlide>

        {/* SLIDE 3 */}
        <SwiperSlide>
          <div className="hero-slide" style={{ backgroundImage: `url('/path-to-your-image3.jpg')` }}>
            <div className="hero-content container">
              <h1 className="hero-title">Fat Control</h1>
              <p className="hero-description">
                Take control of your weight with daily tracking, smart insights, and detailed progress history.
              </p>
              <p className="hero-description">
                Add notes, monitor habits, and build a consistent routine with a complete set of tools designed for real results.
              </p>
              <button
                className="btn btn-custome text-white rounded-5 px-5 py-2 fs-6 fw-semibold mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProtectedNavigate('/fat-control');
                }}
              >
                Track Progress
              </button>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
      <div className="hero-progress">
      <div
        className="hero-progress-fill"
        style={{ transform: `scaleY(${progress})` }}
        />
      </div>
    </section>
  );
};

export default Hero;