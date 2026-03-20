import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* Contexts */
import { AuthProvider } from './components/account/AuthContext';
import { MessagesProvider } from './components/users/MessagesContext';

/* Nav & Footer */
import Nav from './components/nav/Nav';
import Footer from './components/footer/Footer';

/* Components */
import Cart from './components/cart/Cart';

/* Rec */
import StepCounter from './components/rec/StepCounter';
import StepsList from './components/rec/StepsList';
import LensDetails from './components/rec/LensDetails';

/* Main Page (Home) */
import Hero from './components/pages/home/hero/Hero';
import About from './components/pages/home/about/About';
import Shop from './components/pages/home/shop/Shop';

/* Race Page */
import Race from './components/pages/race/Race';

/* News Page */
import Premium from './components/pages/premium/Premium';

/* Team Page */
import Team from './components/pages/team/Team';

/* Account Page */
import PersonalAccount from './components/account/PersonalAccount';

/* Check In */
import CheckIn from './components/pages/race/CheckIn';

/* Explore Page */
import Version from './components/nav/version/Version';
import Terms from './components/footer/explore/Terms';
import Privacy from './components/footer/explore/Privacy';
import CookieConsent from './context/CookieConsent';

/* Search */
import SearchResults from './components/nav/search/SearchResults';
import ProfilePage from './components/nav/search/ProfilePage';

/*    Notifications    */
import AdminAnnouncements from "./components/notification/AdminAnnouncements";

/*    Fatcontrol    */
import FatControl from './components/pages/fatcontrol/FatControl';

import './App.scss';

const App = () => {
  return (
    <AuthProvider>
      <MessagesProvider>
        <Router>
          <Nav />
          <CookieConsent />
          <Routes>
            <Route
              path="/"
              element={
                <main className="main">
                  <Hero />
                  {/* <About /> */}
                  <Shop />
                </main>
              }
            />

            {/* Shop */}
            <Route path="/cart" element={<Cart />} />

            {/* Rec */}
            <Route path="/step" element={<StepCounter />} />
            <Route path="/lens" element={<StepsList />} />
            <Route path="/lens/:id" element={<LensDetails />} />

            {/* Others */}
            <Route path="/Race" element={<Race />} />
            <Route path="/Premium" element={<Premium />} />
            <Route path="/Team" element={<Team />} />
            <Route path="/personal-account" element={<PersonalAccount />} />
            <Route path="/check-in" element={<CheckIn />} />

            {/* Explore */}
            <Route path="/version" element={<Version />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Search */}
            <Route path="/search" element={<SearchResults />} />
            <Route path="/profile/:uid" element={<ProfilePage />} />

            {/* Notifications */}
            <Route path="/admin-announcements" element={<AdminAnnouncements />} />

            {/* Fatcontrol */}
            <Route path="/fat-control" element={<FatControl />} />
          </Routes>

          <Footer />

          <ToastContainer
            position="top-right"
            autoClose={1500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            style={{ zIndex: 99999 }}
          />
        </Router>
      </MessagesProvider>
    </AuthProvider>
  );
};

export default App;