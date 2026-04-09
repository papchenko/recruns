import BMICalculator from "./calculate/BMICalculator";
import logoImg from '../../assets/logo.png';

import './footer.scss';

const Footer = () => {
  return (
   <>
    <footer className="footer footer-section text-white pt-5">
    <div className="container">
      <div className="footer-top row gy-4">
        <div className="col-lg-3 col-md-6 d-flex flex-column mb-2">
            <a href="/" className="footer-logo">
                <img src={logoImg} alt="Image" className="logo-img" />
            </a>
          <p className="w-100 pt-2">This product is registered. Any use is for entertainment purposes only.</p>
        </div>
        <div className="col-lg-3 col-md-6">
          <h5 className="mb-2">Legal</h5>
            <ul className="list-unstyled">
              <li><a href="/terms" className="footer-link">Terms Of Use</a></li>
              <li><a href="/privacy" className="footer-link">Privacy & Coockie</a></li>
            </ul>
        </div>
        <div className="col-lg-3 col-md-6">
          <h5 className="mb-2">Contact</h5>
          <p><i></i>support@recruns.pro</p>
        </div>
      </div>
      {/* <div className="footer-middel container w-100 p-3 bg-dark text-white rounded z-0">
        <BMICalculator />
      </div> */}
      <div className="footer-middel mt-3 px-2 py-3 px-md-2 py-md-2">
        <div className="copy-text">© {new Date().getFullYear()} All right reserved</div>
      </div>
    </div>
    </footer>
   </>
 );
};

export default Footer;