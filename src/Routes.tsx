import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./SignIn/SignIn";
import Appe from "./Appe"; // Import the Toolpad dashboard wrapper
import HomePage from "./Pages/ClaimPage"; // Import HomePage if needed
import ProtectedRoute from "./ProtectedRoutes";
import Layout from "./Layout/Dashboard"; // Import your layout component

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        
        <Route path="/home" element={<Layout />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;