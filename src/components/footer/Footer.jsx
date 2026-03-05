import logoImg from '../../assets/logo.png';

import './footer.scss';

const Footer = () => {
  return (
   <>
    <footer className="footer footer-section text-white pt-5">
    <div className="container">
      <div className="footer-top row gy-4">
        <div className="col-lg-3 col-md-6">
          <h4 className="mb-3">Legal</h4>
            <ul className="list-unstyled">
              <li><a href="/terms" className="footer-link">Terms Of Use</a></li>
              <li><a href="/privacy" className="footer-link">Privacy & Coockie</a></li>
            </ul>
        </div>
        <div className="col-lg-3 col-md-6">
          <h4 className="mb-3">Contact</h4>
          <p className="small"><i className="ri-mail-line me-2"></i>recruns@gmail.com</p>
        </div>
      </div>
      <div className="footer-middel mt-5 px-0 py-0 px-md-4 py-md-5">
        <div className="row align-items-center">
          <div className="col-lg-8 d-flex flex-column m-2">
            <a href="/" className="footer-logo">
                <img src={logoImg} alt="Image" className="logo-img" />
            </a>
            <p className="w-50 pt-2">This product is registered. Any use is for entertainment purposes only.</p>
            <div className="d-flex flex-wrap flex-column gap-1 mt-3">
              <div className="copy-text">2025</div>
              <div className="copy-text">All right reserved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </footer>
   </>
 );
};

export default Footer;