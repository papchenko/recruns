import av from '../../../assets/author.svg';
/*    Swiper    */
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import './team.scss';

const Team = () => {
  return (
   <section className="testimonial-container section">
    <div className="team__container container">
        <div className="row text-center mb-5">
            <div className="section-title">
                <p>Our Team</p>
                <h2>Those who work on the project</h2>
            </div>
        </div>
        <div className="container">
            <div className="author-wrapper">
                <div className="">
                    <Swiper
                        className='tst-swiper'
                        loop={true}
                    >
                        <SwiperSlide>
                            <div className="tst-item">
                                <div className="tst-user d-flex align-items-center gap-2 pb-3">
                                    <img src={av} alt="Image" className="img-fluid rounded-circle border-white" width={50} height={50} />
                                    <p className='mb-0 text-white fs-4'>Mykola Papchenko</p>
                                </div>
                                <p className="author-description fs-5 mb-4">
                                    I created this site to bring runners together in a community where you can track your progress and that of other runners. Participate in team competitions.
                                </p>
                                <div className="tst-footer d-flex align-items-center justify-content-between">
                                    <p className="mb-0" style={{color: "#fd5200"}}>Developer</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div>
        </div>
    </div>
   </section>
 );
};

export default Team;