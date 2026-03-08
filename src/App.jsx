import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React, { useEffect, useState } from "react";
import jQuery from "jquery";
window.jQuery = window.$ = jQuery;
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";
import Swap from "./components/Swap/Swap";
import Facuet from "./components/Facuet/Facuet";
import { BrowserRouter, Routes, Route } from "react-router";
import Reservoir from "./components/Reservoir/Reservoir";
import bg1 from "./images/bg1.jpg";
import { useTranslation } from "react-i18next";
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'

const queryClient = new QueryClient()
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
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div >
          <ToastContainer />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/swap" element={<Swap
              setOneTokenPrice={setOneTokenPrice}
              />} />
              <Route path="/facuet" element={<Facuet
              oneTokenPrice={oneTokenPrice}
              />} />
              <Route path="/reservoir" element={<Reservoir />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;