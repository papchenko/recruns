import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from "./components/account/AuthContext.jsx";
import App from './App.jsx'

import './index.scss'

const redirectPath = sessionStorage.getItem('rr_redirect');
if (redirectPath) {
  sessionStorage.removeItem('rr_redirect');
  window.history.replaceState(null, '', redirectPath);
}
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("Swiper Loop Warning")) {
    return; 
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </CartProvider>
  </StrictMode>,
)