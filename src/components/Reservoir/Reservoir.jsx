import React, { useState, useRef, useEffect } from "react";
import balance from "../../images/balance.png";
import undo from "../../images/undo.png";
import refresh from "../../images/refresh.png";
import speedometer from "../../images/speedometer.png";
import astro from "../../images/drops.png";
import contact from "../../images/contact (2).png";
import user from "../../images/user.png";
import pearl from "../../images/pearl.png";
import dummy from "../../images/dollar.png";
import transfer from "../../images/transfer.png";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import axios from "axios";
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi'
import { readContract } from '@wagmi/core'
import { formatEther, parseEther } from 'viem'
import { config } from '../../config/wagmi'
import { fountainContractAbi, fountainContractAddress } from '../utils/Fountain';
import { dripTokenAbi, dripTokenAddress } from '../utils/DripToken';
import { reservoirAbi, reservoirAddress } from '../utils/Reservoir';

import './Reservuior.css'

const reservoirConfig = {
  address: reservoirAddress,
  abi: reservoirAbi,
};

const fountainConfig = {
  address: fountainContractAddress,
  abi: fountainContractAbi,
};

const tokenConfig = {
  address: dripTokenAddress,
  abi: dripTokenAbi,
};

function Reservoir() {
  const { t, i18n } = useTranslation();
  let buyInput = useRef()
  let withdrawInput = useRef();

  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  // ── User BNB balance ──
  const { data: userBnbBalanceData } = useBalance({
    address: address,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const userBnbBalance = userBnbBalanceData
    ? parseFloat(formatEther(userBnbBalanceData.value)).toFixed(3)
    : 0;

  // ── User fountain (DROP) balance ──
  const { data: rawFountainBalance } = useReadContract({
    ...fountainConfig,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const totalDrops = rawFountainBalance
    ? parseFloat(formatEther(rawFountainBalance)).toFixed(5)
    : 0;

  // ── User reservoir balance (for withdraw validation) ──
  const { data: rawUserDropBalance } = useReadContract({
    ...reservoirConfig,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const userDropBalance = rawUserDropBalance
    ? parseFloat(formatEther(rawUserDropBalance)).toFixed(3)
    : 0;

  // ── User dividends ──
  const { data: rawDividends } = useReadContract({
    ...reservoirConfig,
    functionName: 'dividendsOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  // ── Convert dividends to BNB equivalent ──
  const { data: rawDividendsBnb } = useReadContract({
    ...reservoirConfig,
    functionName: 'calculateLiquidityToBnb',
    args: [rawDividends ?? BigInt(0)],
    query: { enabled: !!address && rawDividends != null, refetchInterval: 10000 },
  });

  const userReward = rawDividendsBnb
    ? parseFloat(formatEther(rawDividendsBnb)).toFixed(11)
    : 0;

  // ── statsOf — returns uint256[15] ──
  const { data: stats } = useReadContract({
    ...reservoirConfig,
    functionName: 'statsOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const stake = stats
    ? parseFloat(formatEther(stats[0])).toFixed(3)
    : 0;

  const totalWithDraw = stats
    ? parseFloat(formatEther(stats[1])).toFixed(7)
    : 0;

  const compundTotal = stats
    ? parseFloat(formatEther(stats[13])).toFixed(7)
    : 0;

  const compund = stats
    ? stats[14].toString()
    : 0;

  // ── Global stats (no wallet needed) ──

  // Players
  const { data: rawPlayers } = useReadContract({
    ...reservoirConfig,
    functionName: 'players',
    query: { refetchInterval: 10000 },
  });

  const player = rawPlayers ? rawPlayers.toString() : 0;

  // Locked token balance
  const { data: rawLockedBalance } = useReadContract({
    ...reservoirConfig,
    functionName: 'lockedTokenBalance',
    query: { refetchInterval: 10000 },
  });

  const loackedValue = rawLockedBalance
    ? parseFloat(formatEther(rawLockedBalance)).toFixed(3)
    : 0;

  // Total transactions
  const { data: rawTotalTxs } = useReadContract({
    ...reservoirConfig,
    functionName: 'totalTxs',
    query: { refetchInterval: 10000 },
  });

  const totalTxs = rawTotalTxs ? rawTotalTxs.toString() : 0;

  // Dividend balance (rewards pool)
  const { data: rawDividendBalance } = useReadContract({
    ...reservoirConfig,
    functionName: 'dividendBalance',
    query: { refetchInterval: 10000 },
  });

  const reward = rawDividendBalance
    ? parseFloat(formatEther(rawDividendBalance)).toFixed(3)
    : 0;

  // Collateral balance
  const { data: rawCollateralBalance } = useReadContract({
    ...reservoirConfig,
    functionName: 'collateralBalance',
    query: { refetchInterval: 10000 },
  });

  // Dividend pool = collateral / locked
  const dividendPool = (rawCollateralBalance && rawLockedBalance && rawLockedBalance > BigInt(0))
    ? parseFloat(
        parseFloat(formatEther(rawCollateralBalance)) / parseFloat(formatEther(rawLockedBalance))
      ).toFixed(5)
    : 0;

  // Contract BNB balance
  const { data: rawContractBnb } = useBalance({
    address: reservoirAddress,
    query: { refetchInterval: 10000 },
  });

  const contractBal = rawContractBnb
    ? parseFloat(formatEther(rawContractBnb.value)).toFixed(7)
    : 0;

  // ── BNB/DRIP price ──
  const { data: rawTokenBalOfReservoir } = useReadContract({
    ...tokenConfig,
    functionName: 'balanceOf',
    args: [reservoirAddress],
    query: { refetchInterval: 10000 },
  });

  const bnbDripPrice = (rawTokenBalOfReservoir && rawContractBnb && rawTokenBalOfReservoir > BigInt(0))
    ? parseFloat(
        parseFloat(formatEther(rawContractBnb.value)) / parseFloat(formatEther(rawTokenBalOfReservoir))
      ).toFixed(3)
    : 0;

  // ── Write handlers ──

  const buy = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected")
        return;
      }
      const userValue = buyInput.current.value;
      if (userValue === "" || userValue === undefined) {
        toast.error("Looks like you forgot to enter amount")
        return;
      }
      if (parseFloat(userValue) <= 0.01) {
        toast.error("Amount cannot be less than 0.01")
        return;
      }
      if (parseFloat(userValue) > parseFloat(userBnbBalance)) {
        toast.error("Insufficient balance")
        return;
      }

      writeContract({
        ...reservoirConfig,
        functionName: 'buy',
        value: parseEther(userValue),
      }, {
        onSuccess: async (hash) => {
          let data = {
            hash: hash,
            toAddress: reservoirAddress,
            fromAddress: address,
            id: address,
            amount: userValue,
          }
          await axios.post("https://splash-test-app.herokuapp.com/api/users/postEvents", data);
          toast.success("Transaction confirmed")
        },
        onError: () => {
          toast.error("Transaction Failed")
        },
      })
    } catch (e) {
      console.log("error while buy function", e);
      toast.error("Transaction Failed")
    }
  }

  const compound = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected")
        return;
      }

      const divs = await readContract(config, {
        ...reservoirConfig,
        functionName: 'dividendsOf',
        args: [address],
      });

      if (divs > BigInt(0)) {
        writeContract({
          ...reservoirConfig,
          functionName: 'reinvest',
        }, {
          onSuccess: () => {
            toast.success("Transaction confirmed")
          },
        })
      } else {
        toast.error("Insufficient dividend balance")
      }
    } catch (e) {
      console.log("error while compound", e);
    }
  }

  const claim = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected")
        return;
      }

      const divs = await readContract(config, {
        ...reservoirConfig,
        functionName: 'dividendsOf',
        args: [address],
      });

      const divsEth = parseFloat(formatEther(divs));
      if (divsEth <= 0) {
        toast.error("Dividends cannot be zero")
      } else {
        writeContract({
          ...reservoirConfig,
          functionName: 'withdraw',
        }, {
          onSuccess: () => {
            toast.success("Transaction confirmed")
          },
          onError: () => {
            toast.error("Transaction failed")
          },
        })
      }
    } catch (e) {
      toast.error("Transaction failed")
      console.log("error while claim", e);
    }
  }

  const withdraw = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected")
        return;
      }

      const bal = await readContract(config, {
        ...reservoirConfig,
        functionName: 'balanceOf',
        args: [address],
      });

      const balEth = parseFloat(formatEther(bal));

      if (withdrawInput.current.value === "") {
        toast.error("Withdrawal amount field cannot be empty");
      } else if (parseFloat(withdrawInput.current.value) <= 0) {
        toast.error("Withdrawal amount must be greater than 0")
      } else if (balEth <= 0) {
        toast.error("Insufficient Balance")
      } else if (parseFloat(withdrawInput.current.value) <= balEth) {
        const val = parseEther(withdrawInput.current.value);
        writeContract({
          ...reservoirConfig,
          functionName: 'sell',
          args: [val],
        }, {
          onSuccess: async (hash) => {
            let data = {
              hash: hash,
              toAddress: reservoirAddress,
              fromAddress: address,
              id: address,
              amount: withdrawInput.current.value,
            }
            await axios.post("https://splash-test-app.herokuapp.com/api/users/postEvents", data);
            toast.success("Withdraw confirmed")
          },
          onError: () => {
            toast.error("Transaction Failed")
          },
        })
      } else {
        toast.error("Insufficient balance")
      }
    } catch (e) {
      toast.error("Transaction Failed")
      console.log("error while withdraw", e);
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="images">
      <div id="reservoir">
        <div className="container">
          <div className="landing-page">
            <div className="row mb-4 mt-2">
              <div className="container col-xl-12">
                <div className="home-text text-center row">
                  <div className="container ">
                    <div className="row ">
                      <div className="col">
                        <span className="luck-title notranslate">
                          {t("THESHORE.1")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="container col-xl-6 col-lg-6 col-md-6 mb-4 pt-4">
                <div id="topStatsContainer" className="row">
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                    <div className="price-top-part">
                      <img src={balance} alt="" width="40px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2 fst-italic" style={{ color: "#7c625a" }}>
                        {t("Rewards.1")}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{userReward}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>{t("SOL.1")}</p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                    <div className="price-top-part">
                      <img src={astro} alt="" width="40px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2 fst-italic" style={{ color: "#7c625a" }}>
                        {t("TotalDROPS.1")}{" "}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{totalDrops}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>{t("DROP.1")}</p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                    <div className="price-top-part">
                      <img src={speedometer} alt="" width="40px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2 fst-italic" style={{ color: "#7c625a" }}>
                        {t("Stake.1")}{" "}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{stake}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>%</p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                    <div className="price-top-part">
                      <img src={refresh} alt="" width="54px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-1 fst-italic" style={{ color: "#7c625a" }}>
                        {t("Compounds.1")}{" "}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{compund}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>{t("Count.1")}</p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                    <div className="price-top-part">
                      <img src={contact} alt="" width="94px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-1 fst-italic" style={{ color: "#7c625a" }}>
                        {t("TotalWithdrawn.1")}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{totalWithDraw}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>{t("SOL.1")}</p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                    <div className="price-top-part">
                      <img src={undo} alt="" width="30px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-1 fst-italic" style={{ color: "#7c625a" }}>
                        {t("CompoundedTotal.1")}{" "}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{compundTotal}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>{t("SOL.1")}</p>
                    </div>
                  </div>
                </div>
                <p className="col-12 white mb-3 text-justify fst-italic text-white" style={{ fontSize: "20px" }}>
                  {" "}
                  {t("TheShoreisTheSplashNetwork'ssolutionforplayersthatwantbenefitfromnon-inflationaryyieldfarmingthroughaddingliquiditytoSplash.1")}
                </p>
                <p className="col-12 white mb-3"></p>
                <div>
                  <button
                    style={{ color: "#7c625a", fontSize: "20px" }}
                    type="button"
                    className="btn btn-outline-light btn-block"
                    onClick={compound}
                  >
                    <b>{t("COMPOUND.1")}</b>

                  </button>
                  <button
                    style={{ color: "#7c625a", fontSize: "20px" }}
                    type="button"
                    className="btn btn-outline-light btn-block"
                    onClick={claim}
                  >
                    <b>{t("CLAIM.1")}</b>
                  </button>
                </div>
                <p />
              </div>
              <div className="container col-12 col-xl-6 col-lg-6 col-md-6 mb-4">
                <div className="card mb-2 text-white" style={{ backgroundColor: "#4e2e4b", color: "#dacc79", border: "2px solid #4e2e4b" }}>
                  <div className="card-body">
                    {/* <div className="landing-page"> */}
                    <div className="text-left">
                      <h3>
                        <span className="notranslate fst-italic">
                          <p style={{ fontSize: "20px" }}>{t("BuyandDeposit.1")}</p>
                        </span>
                      </h3>
                      {/* <div className="col-6 text-right fst-italic "> */}{" "}
                      <p
                        className="d-flex justify-content-end fst-italic"
                        style={{ lineHeight: "10%" }}
                      >
                        {t("SOLBalance.1")}:
                        <label className="user-balance text-white fst-italic">
                          {userBnbBalance}
                        </label>
                      </p>
                      {/* </div> */}
                    </div>

                    <form>
                      <div className="form-group">
                        <div className="row">
                          <div className="col-6 text-left">
                            <label className="text-white fst-italic">
                              <p style={{ lineHeight: "20%" }}>{t("Amount.1")}</p>
                            </label>
                          </div>
                          <div className="col-6 text-right fst-italic user2">
                            {" "}
                            <p >
                              {t("Price.1")}:
                              </p>
                              <p className="user-balance text-white fst-italic">
                                {t("SOL.1")}/{t("Splash.1")}
                                ≈
                                {bnbDripPrice}
                              </p>

                          </div>
                        </div>
                        <div role="group" className="input-group">
                          <input
                            type="number"
                            placeholder="BNB"
                            className="form-control"
                            id="__BVID__213"
                            ref={buyInput}
                          />
                        </div>

                      </div>
                      <div className="row justify-content-end">
                        <div className="col-12 text-left">
                          <button
                            type="button"
                            onClick={() => buy()}
                            className="btn btn-outline-light"
                          >
                            {t("BUY.1")}
                          </button>
                        </div>
                      </div>
                    </form>
                    {/* </div> */}
                    <p />
                  </div>
                </div>
                <div className="card mb-2 text-white" style={{ backgroundColor: "#4e2e4b", color: "#dacc79", border: "2px solid #4e2e4b" }}>
                  <div className="card-body">
                    <div className="landing-page">
                      <div className="text-left">
                        <h3>
                          <span className="notranslate fst-italic">
                            <p style={{ fontSize: "20px" }}>{t("Withdraw.1")}</p>
                          </span>
                        </h3>
                      </div>
                      <form>
                        <div className="form-group">
                          <div className="row">
                            <div className="col-4 text-left">
                              <label className="text-white fst-italic">
                                <p style={{ lineHeight: "20%" }}>{t("Amount.1")}</p>
                              </label>
                            </div>
                            <div className="col-8 text-right fst-italic user2">
                              {" "}
                              <p>
                                {t("DropBalance.1")}:
                                </p>
                                <p className="user-balance text-white fst-italic">
                                  {userDropBalance}
                                </p>

                            </div>
                          </div>
                          <div role="group" className="input-group">
                            <input
                              type="number"
                              placeholder="DROPS"
                              className="form-control"
                              id="__BVID__213"
                              ref={withdrawInput}
                            />
                          </div>
                        </div>
                        <div className="row justify-content-end">
                          <div className="col-12 text-left">
                            <button
                              type="button"
                              className="btn btn-outline-light"

                              onClick={withdraw}
                            >

                              {t("Withdraw.1")}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                    <p />
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-4 mt-2">
              <div className="container col-10 text-center">
                <h1>{t("Stats.1")}</h1>
                <p className="text-white mb-4" style={{ fontSize: "20px" }}>
                  {t("TheShoreisTheSplashNetwork'ssolutionforplayersthatwantbenefitfromnoninflationaryyieldfarmingthroughaddingliquiditytoSplash.Herearethenumbers.1")}...
                </p>
              </div>
              <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                <div className="price-top-part">
                  <img src={user} alt="" className="" width="60px" />
                  <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-3 fst-italic" style={{ color: "#7c625a" }}>
                    {t("Players.1")}
                  </h5>
                  <p className="text-large mb-2 text-white fst-italic">
                    <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{player}</span>
                  </p>
                  <p className="text-small fst-italic">{t("UserCount.1")}</p>
                </div>
              </div>
              <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                <div className="price-top-part">
                  <img src={astro} alt="" width="60px" />
                  <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-3 fst-italic" style={{ color: "#7c625a" }}>
                    {t("TotalValueLocked.1")}
                  </h5>
                  <p className="text-large mb-2 text-white fst-italic">
                    <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{loackedValue}</span>
                  </p>
                  <p className="text-small fst-italic">{t("DROPS.1")}</p>
                </div>
              </div>
              <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                <div className="price-top-part">
                  <img src={dummy} alt="" width="60px" className="" />
                  <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2" style={{ color: "#7c625a" }}>
                    {t("Rewards.1")}
                  </h5>
                  <p className="text-large mb-2 text-white">
                    <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{reward}</span>
                  </p>
                  <p className="text-small">{t("SOL.1")}</p>
                </div>
              </div>
              <div className="container col-6 col-xl-4 col-lg-4 col-md-4 mt-3 text-center">
                <div className="price-top-part">
                  <img src={contact} alt="" width="120px" className="" />
                  <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2" style={{ color: "#7c625a" }}>
                    {t("Dividend Pool.1")}
                  </h5>
                  <p className="text-large mb-2 text-white">
                    <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{dividendPool}</span>
                  </p>
                  <p className="text-small">{t("DROPS.1")} ({t("Splash.1")} / {t("LOCKED.1")})</p>
                </div>
              </div>
              <div className="container col-6 col-xl-4 col-lg-4 col-md-4 mt-3 text-center">
                <div className="price-top-part">
                  <img src={balance} alt="" width="60px" className="" />
                  <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2" style={{ color: "#7c625a" }}>
                    {t("ContractBalance.1")}
                  </h5>
                  <p className="text-large mb-2 text-white">
                    <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}> {contractBal} {t("SOL.1")}</span>
                  </p>
                  <p className="text-small">{t("DROPS.1")} ≈{t("USDT.1")}</p>
                </div>
              </div>
              <div className="container col-6 col-xl-4 col-lg-4 col-md-4 mt-3 text-center">
                <div className="price-top-part">
                  <img src={transfer} alt="" width="50px" className="" />
                  <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2" style={{ color: "#7c625a" }}>
                    {t("Transactions.1")}
                  </h5>
                  <p className="text-large mb-2 text-white">
                    <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{totalTxs}</span>
                  </p>
                  <p className="text-small">{t("Txs.1")}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div>
        <div>
          <div className="header">
            <div>
              <svg
                data-v-ab5e3c86
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
                shapeRendering="auto"
                className="waves"
              >
                <defs data-v-ab5e3c86>
                  <path
                    data-v-ab5e3c86
                    id="gentle-wave"
                    d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                  />
                </defs>
                <g data-v-ab5e3c86 className="parallax">
                  <use
                    data-v-ab5e3c86
                    xlinkHref="#gentle-wave"
                    x={48}
                    y={0}
                    fill="rgba(255,255,255,0.7"
                  />
                  <use
                    data-v-ab5e3c86
                    xlinkHref="#gentle-wave"
                    x={48}
                    y={3}
                    fill="rgba(255,255,255,0.5)"
                  />
                  <use
                    data-v-ab5e3c86
                    xlinkHref="#gentle-wave"
                    x={48}
                    y={5}
                    fill="rgba(255,255,255,0.3)"
                  />
                  <use
                    data-v-ab5e3c86
                    xlinkHref="#gentle-wave"
                    x={48}
                    y={7}
                    fill="#fff"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reservoir;
