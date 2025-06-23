import React, { useEffect, useState } from "react";
import "./Main.css";
import WarpBox from "../WarpBox/WarpBox";
import I from "../../images/logo4.png";
import user from "../../images/user.png";
import curve from "../../images/curve.png";
import van from "../../images/van.png";
import transfer from "../../images/transfer.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { dripTokenAddress, dripTokenAbi } from "../utils/DripToken";
import { loadWeb3 } from "../api";
import Web3 from "web3";

const webSupply = new Web3("https://api.avax-test.network/ext/bc/C/rpc");

const Main = () => {
  const { t } = useTranslation();
  const tradeNavigate = useNavigate();
  const stakeNavigate = useNavigate();
  const farmNavigate = useNavigate();

  const [dripTransaction, setDriptransaction] = useState(0);
  const [dripTotalSupply, setDripTotalSupply] = useState(0);
  const [dripPlayers, setDripplayers] = useState(0);
  const [eventDetail, setEventDetail] = useState([]);

  const getData = async () => {
    const tokenContract = new webSupply.eth.Contract(
      dripTokenAbi,
      dripTokenAddress
    );
    try {
      const drptrx = await tokenContract.methods.totalTxs().call();
      const players = await tokenContract.methods.players().call();
      let ttlSply = await tokenContract.methods.totalSupply().call();
      ttlSply = webSupply.utils.fromWei(ttlSply);
      ttlSply = parseFloat(ttlSply).toFixed(3);

      setDriptransaction(drptrx);
      setDripTotalSupply(ttlSply);
      setDripplayers(players);
    } catch (e) {
      console.log("Error while Fetching Data In Main", e);
    }
  };

  const getEventDetail = async () => {
    try {
      const acc = await loadWeb3();
      if (acc === "No Wallet") {
        setEventDetail([]);
      } else {
        const res = await axios.post(
          "https://splash-test-app.herokuapp.com/api/users/getTransactionDetail",
          { address: acc }
        );
        setEventDetail(res.data);
      }
    } catch (e) {
      console.log("error while get events", e);
    }
  };

  useEffect(() => {
    const dataInterval = setInterval(getData, 1000);
    const eventInterval = setInterval(getEventDetail, 10000);
    getEventDetail();

    return () => {
      clearInterval(dataInterval);
      clearInterval(eventInterval);
      window.scrollTo(0, 0);
    };
  }, []);

  return (
    <div className="images">
      <div className="router-view">
        <div className="container landing-page">
          <div className="row mb-4 mt-2">
            <div className="container col-xl-12">
              <div className="home-text text-center row">
                <div className="container">
                  <div className="row">
                    <div className="col">
                      <WarpBox radius={200} strength={0.08}>
                        <span className="luck-title notranslate">
                          <b>{t("SplashNETWORK.1")}</b>
                        </span>
                      </WarpBox>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="container col-12 col-xl-8 col-lg-8 col-md-8 text-white text1"
              style={{ fontSize: "20px" }}
            >
              {t("IntroParagraph1.1")}
            </div>
            <div
              className="container col-12 col-xl-8 col-lg-8 col-md-8 text-white text2"
              style={{ fontSize: "20px" }}
            >
              {t("IntroParagraph2.1")}
            </div>
            <br />
            <div
              className="container col-12 col-xl-8 col-lg-8 col-md-8 text-white text3"
              style={{ fontSize: "20px" }}
            >
              {/* Intentional blank for structure */}
            </div>

            <div className="raw mainrow">
              <div className="col-xl-6 col-lg-6 col-md-6 mb-4 pt-4">
                <p className="col-11 white mb-3 text-justify" />
                <p className="col-11 white text-center">
                  <button
                    style={{ color: "#7c625a", fontSize: "20px" }}
                    className="btn btn-outline-light btn-block m-3"
                    onClick={() => tradeNavigate("/swap")}
                  >
                    <b>{t("TRADE.1")}</b>
                  </button>
                  <button
                    style={{
                      color: "#7c625a",
                      fontSize: "20px",
                      textDecoration: "none",
                    }}
                    className="btn btn-outline-light btn-block m-3"
                    onClick={() => stakeNavigate("/facuet")}
                  >
                    <b>{t("STAKE.1")}</b>
                  </button>
                  <button
                    style={{
                      color: "#7c625a",
                      fontSize: "20px",
                      textDecoration: "none",
                    }}
                    className="btn btn-outline-light btn-block m-3"
                    onClick={() => farmNavigate("/reservoir")}
                  >
                    <b>{t("LIQUIDITYFARM.1")}</b>
                  </button>
                </p>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-4 mb-5 pt-4 mt-5">
                <img src={I} className="mainimages" alt="Logo" />
              </div>
            </div>
          </div>

          <div className="row mb-4 mt-2">
            <div className="container col-12 text-center">
              <h1 id="mainh1">{t("STATS.1")}</h1>
              <p
                id="mainpp"
                className="text-white"
                style={{ fontSize: "20px" }}
              >
                {t("StatsParagraph1.1")}
              </p>
            </div>

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
                    {dripPlayers}
                  </span>
                </p>
                <p className="text-small">{t("count.1")}</p>
              </div>
            </div>

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
                    {dripTransaction}
                  </span>
                </p>
                <p className="text-small">{t("count.1")}</p>
              </div>
            </div>
          </div>

          {/* Activity & Waves Footer unchanged */}
        </div>
      </div>
    </div>
  );
};

export default Main;