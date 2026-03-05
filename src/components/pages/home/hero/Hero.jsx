import BMICalculator from "./calculate/BMICalculator";

// import bgvideo from '../../../../assets/video-hero.mp4';

import './hero.scss';

const Hero = () => {

  return (
   <section className="hero-header section" id='home'>
    {/* <video
      autoPlay
      muted
      loop
      playsInline
      className='hero-video'
    >
      <source src={bgvideo} type='video/mp4' />
    </video> */}
    <div className="hero-overlay text-white">
      <div className="container">
        <div className="row">
          <div className="col-xl-6">
            <h1 className="hero-title">Train smart. Run better.</h1>
            <p className="hero-description mb-2">
              Track every run with precision, analyze your progress, and compete in organized team challenges.
            </p>
            <p className="hero-description hero-description-bottom">
              Connect with teammates, share insights, and push your limits together.
            </p>
          </div>
        </div>
      </div>
      <div className="container w-100 travel-box p-4 bg-dark text-white rounded z-0">
      <BMICalculator />
      </div>
    </div>
   </section>
 );
};

export default Hero;