import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React, { useEffect, useState } from "react";
import jQuery from "jquery";
window.jQuery = window.$ = jQuery;
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { render } from "react-dom";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";
import Swap from "./components/Swap/Swap";
import Facuet from "./components/Facuet/Facuet";
import { BrowserRouter, Routes, Route } from "react-router";
import Reservoir from "./components/Reservoir/Reservoir";
import bg1 from "./images/bg1.jpg";
import Home from "./Home";
import { useTranslation } from "react-i18next";
function App() {
  const { t, i18n } = useTranslation();
  let [oneTokenPrice, setOneTokenPrice]=useState(0);

  useEffect(() => {

    jQuery(document).ready(function () {
    jQuery(".full-landing-image").ripples({
      resolution: 200,
      perturbance: 0.01,
    });
  })
  }, [jQuery]);
  return (
    <div >
      <ToastContainer />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<Main />} />
          <Route exact path="/swap" element={<Swap 
          setOneTokenPrice={setOneTokenPrice}
          />} />
          <Route exact path="/facuet" element={<Facuet
          oneTokenPrice={oneTokenPrice}
          />} />
          <Route exact path="/reservoir" element={<Reservoir />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;