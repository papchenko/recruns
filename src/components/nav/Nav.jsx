import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../../context/CartContext';

import logoImg from '../../assets/logo.png';

import { CgMusicNote } from "react-icons/cg";

import MusicPlayerPopup from "./player/Player";

import AuthModal from "../account/AuthModal";
import { useAuth } from '../account/AuthContext';

import { useNavigate } from 'react-router-dom';

import { MdOutlineNewReleases } from "react-icons/md";

import { db } from "../../firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";

import NotificationsBell from "../notification/NotificationsBell";
import { MdWorkspacePremium } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";

import './nav.scss';

function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.length;
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
    const check = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      setIsAdmin(snap.exists() && snap.data().isAdmin);
    };
    check();
  }, [user]);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80 || isMenuOpen) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tracks, setTracks] = useState([
    { title: "Track 1", src: "https://www.youtube.com/watch?v=J3VqczV7IYQ" },
    { title: "Track 2", src: "https://www.youtube.com/watch?v=0AhFghYZQ74" },
    { title: "Track 3", src: "https://youtu.be/oYC8KkNIkZk" },
    { title: "Track 4", src: "https://youtu.be/PI_PpwIvb6E" }
  ]);

  const handleProfileClick = () => {
    if (user) {
      navigate('/personal-account');
    } else {
      setAuthModalOpen(true);
    }
  };

  const [unreadCount, setUnreadCount] = useState({ chats: {}, total: 0 });

  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribes = [];

    const loadFriendsAndListen = async () => {
      const friendsDoc = await getDoc(doc(db, "friends", user.uid));
      const data = friendsDoc.data();
      const friends = data?.friends || [];

      friends.forEach((fid) => {
        const chatId = user.uid < fid ? `${user.uid}_${fid}` : `${fid}_${user.uid}`;
        const messagesRef = collection(db, "messages", chatId, "messages");
        const q = query(messagesRef, where("receiverId", "==", user.uid), where("seen", "==", false));

        const unsub = onSnapshot(q, (snap) => {
          const unreadForThisChat = snap.size;

          setUnreadCount((prev) => {
            const updatedChats = { ...prev.chats, [chatId]: unreadForThisChat };
            const total = Object.values(updatedChats).reduce((sum, n) => sum + n, 0);
            return { chats: updatedChats, total };
          });
        });

        unsubscribes.push(unsub);
      });
    };

    loadFriendsAndListen();

    return () => unsubscribes.forEach((u) => u());
  }, [user]);


  return (
    <>
      <nav className={`text-white p-0 navbar navbar-expand-lg flex-column ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container d-flex align-items-center justify-content-center">
          <div className="row-nav row w-100 py-3">
            <div className="col-lg-12">
              <div className="w-100 top-header d-flex align-items-center justify-content-between">
                {/* Desktop Icons */}
                <div className="call d-none d-lg-flex align-items-center">
                  <a href="/version"><MdOutlineNewReleases className="version fs-4" style={{color: "#fff", opacity: "0.5"}} /></a>
                  {isAdmin && (
                    <a href="/admin-announcements" className="text-white mx-3">
                      Admin
                    </a>
                  )}
                </div>
                <a href="/" className="navbar-logo">
                  <img src={logoImg} alt="Image" className="logo-img" />
                </a>
                <div className="top-header-right d-none d-lg-flex align-items-center gap-4">
                  {user && (
                    <>
                    <div className="notification-icon fs-4">
                      <NotificationsBell />
                    </div>
                  <a href='/step' className="cartpage-cart-link position-relative text-decoration-none">
                    <i className="ri-record-circle-line fs-4 record-btn" style={{color: '#db3206'}}></i>
                  </a>
                    </>
                   )}
                  <div className="divider gradient-divider"></div>
                  <a className="cartpage-cart-link position-relative">
                    <i className="text-white fs-4" onClick={() => { setCurrentIndex(0); setIsPlayerOpen(true); }}><CgMusicNote /></i>
                    <MusicPlayerPopup
                      tracks={tracks}
                      isOpen={isPlayerOpen}
                      onClose={() => setIsPlayerOpen(false)}
                      currentIndex={currentIndex}
                      setCurrentIndex={setCurrentIndex}
                    />
                  </a>
                  <a href="/cart" className="cartpage-cart-link position-relative">
                    <i className="bi bi-cart text-white fs-4"></i>
                    <span className="cart-count" style={{color: "#017b6e"}}>{cartCount}</span>
                  </a>
                  <div
                    className="profile-icon d-flex align-items-center justify-content-center"
                    style={{ cursor: 'pointer' }}
                    onClick={handleProfileClick}
                    title={user ? 'Personal Account' : 'Sign Up / Login'}
                  >
                    {user ? (
                      user.avatarUrl ? (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img
                            src={user.avatarUrl}
                            alt="avatar"
                            className="rounded-circle avatar"
                            style={{ width: "27px", height: "27px", objectFit: "cover" }}
                          />
                            {user?.premiumPackage?.active && user.premiumPackage.title === "Pro" && (
                              <RiVerifiedBadgeFill className="nav-premium-icon" />
                            )}
                            {unreadCount.total > 0 && (
                              <span className="unread-badge-nav">
                                {unreadCount.total}
                              </span>
                            )}
                        </div>
                      ) : (
                        <i className="bi bi-person-circle fs-4 text-white"></i>
                      )
                    ) : (
                      <button
                        className="btn sing-up btn-custome text-white rounded-5 px-5 py-2 fs-6 fw-semibold"
                        onClick={() => setAuthModalOpen(true)}
                      >
                        Sign Up
                      </button>
                    )}
                  </div>
                  <AuthModal
                    isOpen={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                  />
                </div>

                {/* Mobile */}
                <div className="mobile-top d-lg-none gap-3">
                  {user && (
                    <>
                  <div>
                    <a href='/step' className="ri-record-circle-line fs-1 text-decoration-none record-btn" style={{color: '#db3206'}}></a>
                  </div>
                  </>
                   )}
                  <div
                    className="profile-icon d-flex align-items-center justify-content-center position-relative"
                    style={{ cursor: 'pointer' }}
                    onClick={handleProfileClick}
                    title={user ? 'Personal Account' : 'Sign Up / Login'}
                  >
                    {user ? (
                      user.avatarUrl ? (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img
                            src={user.avatarUrl}
                            alt="avatar"
                            className="rounded-circle avatar"
                            style={{ width: "27px", height: "27px", objectFit: "cover" }}
                          />
                            {user?.premiumPackage?.active && user.premiumPackage.title === "Pro" && (
                              <RiVerifiedBadgeFill className="nav-premium-icon" />
                            )}
                            {unreadCount.total > 0 && (
                              <span className="unread-badge-nav">
                                {unreadCount.total}
                              </span>
                            )}
                        </div>
                      ) : (
                        <i className="bi bi-person-circle fs-4 text-white"></i>
                      )
                    ) : (
                      <button
                        className="btn sing-up btn-custome text-white rounded-5 px-5 py-2 fs-6 fw-semibold"
                        onClick={() => setAuthModalOpen(true)}
                      >
                        Sign Up
                      </button>
                    )}
                  </div>
                  <AuthModal
                    isOpen={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                  />
                  <button
                    className='navbar-toggler nav-toggle d-block d-lg-none box-shadow-none'
                    type='button'
                    onClick={toggleMenu}
                    aria-label='Toggle navigation'
                  >
                    <span className="bi bi-list fs-1 text-white"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row py-0 py-lg-4 w-100 d-flex align-items-center">
            <div className="col-lg-9">
              <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''} `} id='navtoggle'>
                <ul className="nav-menu list-unstyled p-3 d-flex flex-column flex-lg-row align-items-end align-tems-lg-center gap-3 gap-lx-5 gap-lg-4">
                  <li className="nav-items position-relative">
                    <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
                  </li>
                  <li className="nav-items position-relative">
                    <Link to="/Lens" className="nav-link" onClick={closeMenu}>Lens</Link>
                  </li>
                  <li className="nav-items position-relative">
                    <Link to="/Race" className="nav-link" onClick={closeMenu}>Races</Link>
                  </li>
                  <li className="nav-items position-relative">
                    <Link to="/Premium" className="nav-link" onClick={closeMenu}>Premium</Link>
                  </li>
                  <li className="nav-items position-relative">
                    <Link to="/Team" className="nav-link" onClick={closeMenu}>Our Team</Link>
                  </li>
                  <div className="call-mobile d-lg-none">
                    <Link to="/version" onClick={closeMenu}><MdOutlineNewReleases className="version fs-3" style={{color: "#fff"}} /></Link>
                    {isAdmin && (
                    <a href="/admin-announcements" className="text-white mx-3 fs-5">
                      Admin
                    </a>
                  )}
                  </div>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="nav-input-box w-100 d-none d-lg-flex align-items-center justify-content-start gap-2">
              <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="form-control form-control-sm w-100"
                  placeholder="username, lens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
              />
            </div>
          </div>
        </div>
      </nav>
      <div className="nav-bottom d-block d-lg-none">
        <div className="mobile-bottom d-flex gap-3">
          <div className="col-lg-3">
            <div className="nav-input-box d-flex align-items-center justify-content-start gap-2">
              <i className="bi bi-search fs-4"></i>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="username, lens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
          {/* Mobile Icon */}
          <div className="mobile-section d-flex d-lg-none justify-content-end gap-3">
          {user && (
            <div className='notification-icon-mobile'>
              <i className="text-white fs-1"><NotificationsBell /></i>
            </div>
          )}
            <a className="cartpage-cart-link position-relative">
              <i className="text-white fs-1" style={{ cursor: "pointer" }} onClick={() => { setCurrentIndex(0); setIsPlayerOpen(true); }}><CgMusicNote /></i>
              <MusicPlayerPopup
                tracks={tracks}
                isOpen={isPlayerOpen}
                onClose={() => setIsPlayerOpen(false)}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
              />
            </a>
            <a href="/cart" className="cartpage-cart-link position-relative">
              <i className="bi bi-bag text-white fs-1"></i>
              <span className="cart-count" style={{color: "#017b6e"}} >{cartCount}</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Nav;