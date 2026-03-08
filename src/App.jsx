// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
//import AdminPage from "./pages/admin/AdminPage";
import UsersProfilePage from "./pages/UsersProfilePage";
import VerificationPage from "./pages/VerificationPage"; // Add this import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        {/* <Route path="/admin" element={<AdminPage />} /> */}
        <Route path="/profile" element={<UsersProfilePage />} />
        <Route path="/verify" element={<VerificationPage />} /> {/* Add this route */}
      </Routes>
    </Router>
  );
}

export default App;