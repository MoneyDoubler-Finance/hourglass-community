import React from "react";
import "./Main.css";
import WarpBox from "../WarpBox/WarpBox";
import I from "../../images/logo4.png";
import user from "../../images/user.png";
import curve from "../../images/curve.png";
import van from "../../images/van.png";
import transfer from "../../images/transfer.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { dripTokenAddress, dripTokenAbi } from "../utils/DripToken";

const contractConfig = {
  address: dripTokenAddress,
  abi: dripTokenAbi,
};

const Main = () => {
  const { t } = useTranslation();
  const tradeNavigate = useNavigate();
  const stakeNavigate = useNavigate();
  const farmNavigate = useNavigate();

  const { data: dripTransaction } = useReadContract({
    ...contractConfig,
    functionName: 'totalTxs',
    query: { refetchInterval: 10000 },
  });

  const { data: dripPlayers } = useReadContract({
    ...contractConfig,
    functionName: 'players',
    query: { refetchInterval: 10000 },
  });

  const { data: rawTotalSupply } = useReadContract({
    ...contractConfig,
    functionName: 'totalSupply',
    query: { refetchInterval: 10000 },
  });

  const dripTotalSupply = rawTotalSupply
    ? parseFloat(formatEther(rawTotalSupply)).toFixed(3)
    : '0';

  return (
    <div className="images">
      <div className="router-view">
        <div className="container landing-page">

          {/* TITLE BUBBLE */}
          <div className="row mb-4 mt-2 justify-content-center">
            <WarpBox
              radius={50}
              strength={-0.12}
              style={{ "--warp-text-color": "#222" }}
            >
              <span className="luck-title notranslate">
                <b>{t("SplashNETWORK.1")}</b>
              </span>
            </WarpBox>
          </div>

          {/* COMBINED BODY BUBBLE */}
          <div className="row justify-content-center mb-4 body-bubble">
            <div className="col-12 col-md-8 col-lg-6 d-flex justify-content-center">
              <WarpBox
                radius={50}
                strength={-0.12}
                style={{ "--warp-text-color": "#222" }}
              >
                <p className="text-white body-paragraph">
                  {t("IntroParagraph1.1")}
                  <br />
                  <br />
                  {t("IntroParagraph2.1")}
                </p>
              </WarpBox>
            </div>
          </div>

          {/* BUTTONS & LOGO */}
          <div className="row mainrow">
            <div className="col-xl-6 col-lg-6 col-md-6 mb-4 pt-4">
              <p className="col-11 white mb-3 text-justify" />
              <div className="col-11 white text-center">
                <div className="d-flex justify-content-center mb-3">
                  <WarpBox radius={50} strength={-0.12} style={{ width: "260px" }}>
                    <button
                      style={{ color: "#7c625a", fontSize: "20px" }}
                      className="btn btn-outline-light btn-block"
                      onClick={() => tradeNavigate("/swap")}
                    >
                      <b>{t("TRADE.1")}</b>
                    </button>
                  </WarpBox>
                </div>
                <div className="d-flex justify-content-center mb-3">
                  <WarpBox radius={50} strength={-0.12} style={{ width: "260px" }}>
                    <button
                      style={{
                        color: "#7c625a",
                        fontSize: "20px",
                        textDecoration: "none",
                      }}
                      className="btn btn-outline-light btn-block"
                      onClick={() => stakeNavigate("/facuet")}
                    >
                      <b>{t("STAKE.1")}</b>
                    </button>
                  </WarpBox>
                </div>
                <div className="d-flex justify-content-center">
                  <WarpBox radius={50} strength={-0.12} style={{ width: "260px" }}>
                    <button
                      style={{
                        color: "#7c625a",
                        fontSize: "20px",
                        textDecoration: "none",
                      }}
                      className="btn btn-outline-light btn-block"
                      onClick={() => farmNavigate("/reservoir")}
                    >
                      <b>{t("LIQUIDITYFARM.1")}</b>
                    </button>
                  </WarpBox>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-4 mb-5 pt-4 mt-5">
              <WarpBox radius={50} strength={-0.12}>
                <img src={I} className="mainimages" alt="Logo" />
              </WarpBox>
            </div>
          </div>

          {/* STATS SECTION */}
          <div className="row mb-5 mt-4">
            <div className="container col-12 text-center">
              <WarpBox
                radius={50}
                strength={-0.12}
                className="stats-warpbox"
              >
                <h1 id="mainh1">{t("STATS.1")}</h1>
              </WarpBox>
              <p id="mainpp" className="text-white">
                {t("StatsParagraph1.1")}
              </p>
            </div>

            {/* Players */}
            <div className="container col-6 col-xl-3 col-lg-3 col-md-3 text-center">
              <div className="price-top-part">
                <img src={user} alt="" />
                <h5
                  className="mb-0 font-weight-semibold mb-2 mt-4"
                  style={{ color: "#7c625a" }}
                >
                  {t("Players.1")}
                </h5>
                <p className="text-large mb-2 text-white">
                  <span
                    className="notranslate"
                    style={{ color: "#ab9769", fontSize: "20px" }}
                  >
                    {dripPlayers != null ? dripPlayers.toString() : '0'}
                  </span>
                </p>
                <p className="text-small">{t("count.1")}</p>
              </div>
            </div>

            {/* Max Daily Return */}
            <div className="container col-6 col-xl-3 col-lg-3 col-md-3 text-center">
              <div className="price-top-part">
                <img src={curve} alt="" width="60px" />
                <h5
                  className="mb-0 font-weight-semibold mb-2 mt-4"
                  style={{ color: "#7c625a" }}
                >
                  {t("Maxdailyreturn.1")}
                  <p className="text-large mb-2 text-white mt-2">
                    <span
                      className="notranslate"
                      style={{ color: "#ab9769", fontSize: "20px" }}
                    >
                      2 %
                    </span>
                  </p>
                  <p className="text-small">returns</p>
                </h5>
              </div>
            </div>

            {/* Total Supply */}
            <div className="container col-6 col-xl-3 col-lg-3 col-md-3 text-center">
              <div className="price-top-part">
                <img src={van} alt="" width="60px" />
                <h5
                  className="mb-0 font-weight-semibold mb-2 mt-4"
                  style={{ color: "#7c625a" }}
                >
                  {t("Totalsupply.1")}
                </h5>
                <p className="text-large mb-2 text-white">
                  <span
                    className="notranslate"
                    style={{ color: "#ab9769", fontSize: "20px" }}
                  >
                    {dripTotalSupply}
                  </span>
                </p>
                <p className="text-small">{t("Splash.1")} ≈ 0</p>
              </div>
            </div>

            {/* Transactions */}
            <div className="container col-6 col-xl-3 col-lg-3 col-md-3 text-center">
              <div className="price-top-part">
                <img src={transfer} alt="" width="60px" />
                <h5
                  className="mb-0 font-weight-semibold mb-2 mt-4"
                  style={{ color: "#7c625a" }}
                >
                  {t("Transactions.1")}
                </h5>
                <p className="text-large mb-2 text-white">
                  <span
                    className="notranslate"
                    style={{ color: "#ab9769", fontSize: "20px" }}
                  >
                    {dripTransaction != null ? dripTransaction.toString() : '0'}
                  </span>
                </p>
                <p className="text-small">{t("count.1")}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Main;
