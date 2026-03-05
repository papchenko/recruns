import { useState, useEffect } from 'react';
import './about.scss';

const About = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showPopup ? 'hidden' : '';
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowPopup(false);
    };
    if (showPopup) window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [showPopup]);

  return (
    <>
      <section className="about-section section-about" id="about" aria-labelledby="about-title">
        <div className="container about">
          <div className="row">
            <div className="about-top">
              <div className="section-title">
                <div className="row">
                  <p>About</p>
                  <h2 id="about-title">Platform for active people.</h2>
                </div>
              </div>

              <p className="about-pera">
                Track your workouts – a convenient activity log for running, cycling and swimming with detailed statistics and progress.
              </p>
              <p className="about-pera">
                Participate in team tournaments – compete with friends or colleagues, collect points and climb the rankings.
              </p>
              <p className="about-pera">
                Get motivated – track your achievements, set goals and share results with like-minded people.
              </p>

              <button
                type="button"
                className="btn btn-center about-learn-btn"
                onClick={() => setShowPopup(true)}
                aria-haspopup="dialog"
                aria-expanded={showPopup}
              >
                Learn More <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {showPopup && (
        <div
          className="popup-overlay-about"
          role="dialog"
          aria-modal="true"
          aria-label="About details"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="popup-content-about bg-dark"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="popup-header bg-dark">
              <h3 className="popup-title" style={{color: "#db3206"}}>About RecRun</h3>
              <button
                type="button"
                className="popup-close text-white"
                onClick={() => setShowPopup(false)}
                aria-label="Close popup"
              >
                &times;
              </button>
            </div>

            <div className="popup-body-about">
              <p>
                Dive deeper into the world of active living. Track your runs, join global challenges,
                discover new routes, and connect with a community that motivates you to push your limits.
              </p>
              <p>
                Stay on top of your progress with personalized stats, earn badges for achievements,
                and make every workout a step towards a healthier, happier you.
              </p>
              <p>
                Explore our team tournaments where strategy meets endurance. Collaborate with friends,
                conquer challenges, and see how your team ranks on the global leaderboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default About;