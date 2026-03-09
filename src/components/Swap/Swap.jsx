import React, { useState, useRef, useEffect } from "react";
import coin from "../../images/coin.png";
import balance from "../../images/iconWhite (1).png";
import drops from "../../images/coinwhite.png";
import sol from '../../images/sol.png'
import { toast } from "react-toastify";
import van from "../../images/van.png";
import contact from "../../images/contact (2).png";
import transfer from "../../images/transfer.png";
import { useTranslation } from "react-i18next";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import BSPopover from "react-bootstrap/Popover";
import Chart from "./Chart";
import WarpBox from "../WarpBox/WarpBox";
import axios from "axios";
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi'
import { readContract } from '@wagmi/core'
import { formatEther, parseEther } from 'viem'
import { config } from '../../config/wagmi'
import { faucetTokenAddress, faucetTokenAbi } from "../utils/Faucet";
import {
  fountainContractAddress,
  fountainContractAbi,
} from "../utils/Fountain";
import "./Swap.css";

const fountainConfig = {
  address: fountainContractAddress,
  abi: fountainContractAbi,
};

const tokenConfig = {
  address: faucetTokenAddress,
  abi: faucetTokenAbi,
};

const Swap = ({setOneTokenPrice}) => {
  let [boxOne, setBoxOne] = useState(false);
  let [tripType, setTripType] = useState(1);
  let [tripType1, setTripType1] = useState(1);
  let [enteredVal, setEnteredval] = useState(0);
  let [estimate, setEstimate] = useState();
  let [estimateDrip, setEstimateDrip] = useState();
  let [minRecievedDrip, setMinRecievedDrip] = useState();
  let [minRecieved, setMinrecieved] = useState();
  let [tenPerVal, setTenperVal] = useState(0);
  let [bnbPrice, setBnbPrice] = useState(0);
  let [dripUsdtprice, setdripUsdtPrice] = useState(0);
  let [usdtPrice, setUsdPrice] = useState(0);
  let [isToogle, setisToogle] = useState(false);
  // state for sell without
  let [withouttofixed, setWithoutToFixed] = useState(0);

  let [croValue, setCroValue] = useState(0);
  const { t, i18n } = useTranslation();
  const inputEl = useRef();
  let inputE2 = useRef();
  // for radio inputs Buy splash
  let mYentered = useRef();
  // for radio inputs Sell splash
  let mYEnter1 = useRef();

  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  // ── User wallet balances ──
  const { data: userBnbBalanceData } = useBalance({
    address: address,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const usersBalance = userBnbBalanceData
    ? parseFloat(formatEther(userBnbBalanceData.value)).toFixed(7)
    : 0;

  const { data: rawUserDripBalance } = useReadContract({
    ...tokenConfig,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const userDripBalance = rawUserDripBalance
    ? parseFloat(formatEther(rawUserDripBalance)).toFixed(7)
    : 0;

  // ── Contract balances (no wallet needed) ──
  const { data: rawFountainBnbBalance } = useBalance({
    address: fountainContractAddress,
    query: { refetchInterval: 10000 },
  });

  const cBnbBalance = rawFountainBnbBalance
    ? parseFloat(formatEther(rawFountainBnbBalance.value)).toFixed(7)
    : 0;

  const { data: rawFountainDripBalance } = useReadContract({
    ...tokenConfig,
    functionName: 'balanceOf',
    args: [fountainContractAddress],
    query: { refetchInterval: 10000 },
  });

  const cDripBalance = rawFountainDripBalance
    ? parseFloat(formatEther(rawFountainDripBalance)).toFixed(7)
    : 0;

  // ── Supply & stats ──
  const { data: rawDripTotalSupply } = useReadContract({
    ...tokenConfig,
    functionName: 'totalSupply',
    query: { refetchInterval: 10000 },
  });

  const tSupllyDrip = rawDripTotalSupply
    ? parseFloat(formatEther(rawDripTotalSupply)).toFixed(7)
    : 0;

  const { data: rawFountainTotalSupply } = useReadContract({
    ...fountainConfig,
    functionName: 'totalSupply',
    query: { refetchInterval: 10000 },
  });

  const tSupllyFountain = rawFountainTotalSupply
    ? parseFloat(formatEther(rawFountainTotalSupply)).toFixed(7)
    : 0;

  const { data: tTransactionsFountain } = useReadContract({
    ...fountainConfig,
    functionName: 'totalTxs',
    query: { refetchInterval: 10000 },
  });

  // ── Derived pricing state (computed from contract balances + Binance price) ──
  const [division, setDivision] = useState(0);
  const [oneDripPrice, setOnedripPrice] = useState(0);

  useEffect(() => {
    const fetchBnbPrice = async () => {
      try {
        let usdValue = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT");
        let currentBnB = parseFloat(usdValue.data.price);

        const contractFBalance = parseFloat(cBnbBalance);
        const contractFdripBalance = parseFloat(cDripBalance);

        let converted = currentBnB * contractFBalance;
        converted = parseFloat(converted).toFixed(7);

        let covertedDrip = contractFBalance / contractFdripBalance;
        let BdividedByD = parseFloat(covertedDrip).toFixed(7);
        let priceOfoneDrip = parseFloat(covertedDrip * currentBnB).toFixed(7);

        let dripUsdTotal = covertedDrip * currentBnB;
        dripUsdTotal = parseFloat(dripUsdTotal).toFixed(7);
        dripUsdTotal = contractFdripBalance * dripUsdTotal;
        dripUsdTotal = parseFloat(dripUsdTotal).toFixed(7);

        setUsdPrice(currentBnB);
        setdripUsdtPrice(dripUsdTotal);
        setBnbPrice(converted);
        setDivision(BdividedByD);
        setOnedripPrice(priceOfoneDrip);
        setOneTokenPrice(priceOfoneDrip);
      } catch (e) {
        console.log("error while fetching BNB price", e);
      }
    };

    fetchBnbPrice();
    const interval = setInterval(fetchBnbPrice, 60000);
    return () => clearInterval(interval);
  }, [cBnbBalance, cDripBalance, setOneTokenPrice]);

  // ── Helper: read price from fountain contract (imperative, for event handlers) ──
  const getBnbToTokenPrice = async (weiValue) => {
    try {
      const result = await readContract(config, {
        ...fountainConfig,
        functionName: 'getBnbToTokenInputPrice',
        args: [weiValue],
      });
      return result;
    } catch (e) {
      console.log("Error reading getBnbToTokenInputPrice", e);
      return null;
    }
  };

  const getTokenToBnbPrice = async (weiValue) => {
    try {
      const result = await readContract(config, {
        ...fountainConfig,
        functionName: 'getTokenToBnbInputPrice',
        args: [weiValue],
      });
      return result;
    } catch (e) {
      console.log("Error reading getTokenToBnbInputPrice", e);
      return null;
    }
  };

  // ── Max balance button ──
  const addMaxBalance = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected");
        return;
      }
      if (rawUserDripBalance) {
        const dripBal = formatEther(rawUserDripBalance);
        inputE2.current.value = dripBal;
        await enterBuyAmount2();
      }
    } catch (e) {
      console.log("error while get max balance", e);
    }
  };

  // ── Buy side: estimate from BNB amount ──
  const enterBuyAmount1 = async () => {
    try {
      let myvalue = inputEl.current.value;
      if (myvalue > 0) {
        let weiValue = parseEther(myvalue);
        setEnteredval(weiValue.toString());

        let tokensInputPrice = await getBnbToTokenPrice(weiValue);
        if (tokensInputPrice === null) return;

        let formatted = parseFloat(formatEther(tokensInputPrice)).toFixed(7);

        let miniumrcvd = (tripType * formatted) / 100;
        let percentValue = formatted - miniumrcvd;
        percentValue = parseFloat(percentValue).toFixed(7);

        setEstimate(formatted);
        setMinrecieved(percentValue);
      } else {
        setEstimate();
        setMinrecieved();
      }
    } catch (e) {
      console.log("error while getting data against entered amount", e);
    }
  };

  const enterRadioAmount1 = async () => {
    try {
      let myMultiplyValue = 1;
      let myvalue = inputEl.current.value;
      if (myvalue > 0) {
        let weiValue = parseEther(myvalue);
        setEnteredval(weiValue.toString());

        let tokensInputPrice = await getBnbToTokenPrice(weiValue);
        if (tokensInputPrice === null) return;
        let formatted = parseFloat(formatEther(tokensInputPrice)).toFixed(7);

        let miniumrcvd = (myMultiplyValue * formatted) / 100;
        let percentValue = formatted - miniumrcvd;
        percentValue = parseFloat(percentValue).toFixed(7);
        setEstimate(formatted);
        setMinrecieved(percentValue);
      } else {
        setEstimate();
        setMinrecieved();
      }
    } catch (e) {
      console.log("Error while Getting data against selected radio button", e);
    }
  };

  const enterRadioAmount3 = async () => {
    try {
      let myMultiplyValue = 3;
      let myvalue = inputEl.current.value;
      if (myvalue > 0) {
        let weiValue = parseEther(myvalue);
        setEnteredval(weiValue.toString());

        let tokensInputPrice = await getBnbToTokenPrice(weiValue);
        if (tokensInputPrice === null) return;
        let formatted = parseFloat(formatEther(tokensInputPrice)).toFixed(7);

        let miniumrcvd = (myMultiplyValue * formatted) / 100;
        let percentValue = formatted - miniumrcvd;
        percentValue = parseFloat(percentValue).toFixed(7);

        setEstimate(formatted);
        setMinrecieved(percentValue);
      } else {
        setEstimate();
        setMinrecieved();
      }
    } catch (e) {
      console.log("Error while getting amount against selected radio button", e);
    }
  };

  const enterRadioAmount5 = async () => {
    try {
      let myMultiplyValue = 5;
      let myvalue = inputEl.current.value;
      if (myvalue > 0) {
        let weiValue = parseEther(myvalue);
        setEnteredval(weiValue.toString());

        let tokensInputPrice = await getBnbToTokenPrice(weiValue);
        if (tokensInputPrice === null) return;
        let formatted = parseFloat(formatEther(tokensInputPrice)).toFixed(7);

        let miniumrcvd = (myMultiplyValue * formatted) / 100;
        let percentValue = formatted - miniumrcvd;
        percentValue = parseFloat(percentValue).toFixed(7);

        setEstimate(formatted);
        setMinrecieved(percentValue);
      } else {
        setEstimate();
        setMinrecieved();
      }
    } catch (e) {
      console.log("Error while getting amount against selected radio button", e);
    }
  };

  const myOnchangeInputBuySwap = async () => {
    try {
      let myCurrentVal = mYentered.current.value;
      if (myCurrentVal < 100) {
        if (myCurrentVal >= 1) {
          setTripType(myCurrentVal);

          let myvalue = inputEl.current.value;
          if (myvalue > 0) {
            let weiValue = parseEther(myvalue);
            setEnteredval(weiValue.toString());

            let tokensInputPrice = await getBnbToTokenPrice(weiValue);
            if (tokensInputPrice === null) return;
            let formatted = parseFloat(formatEther(tokensInputPrice)).toFixed(7);

            let miniumrcvd = (myCurrentVal * formatted) / 100;
            let percentValue = formatted - miniumrcvd;
            percentValue = parseFloat(percentValue).toFixed(7);

            setEstimate(formatted);
            setMinrecieved(percentValue);
            setTripType(myCurrentVal);
          } else {
            setEstimate();
            setMinrecieved();
          }
        } else {
          toast.error("Slippage cannot be less than 1");
        }
      } else {
        toast.error("Slippage Cannot be over 100");
      }
    } catch (e) {
      console.log("Error while getting values against entered amount");
    }
  };

  // ── Sell side helpers ──
  const computeSellEstimate = async (myvalue, slippageVal) => {
    if (myvalue > 0) {
      let weiValue = parseEther(myvalue.toString());
      setEnteredval(weiValue.toString());

      let tokensOutputPrice = await getTokenToBnbPrice(weiValue);
      if (tokensOutputPrice === null) return;
      let outputFormatted = parseFloat(formatEther(tokensOutputPrice));

      let tenPercentVal = (outputFormatted * 10) / 100;
      tenPercentVal = outputFormatted - tenPercentVal;

      let miniumrcvdDrip = (slippageVal * tenPercentVal) / 100;
      let percentValue = tenPercentVal - miniumrcvdDrip;
      percentValue = parseFloat(percentValue).toFixed(7);
      tenPercentVal = parseFloat(tenPercentVal).toFixed(7);

      let outputStr = parseFloat(outputFormatted).toFixed(7);

      percentValue = parseFloat(percentValue).toFixed(7);
      setMinRecievedDrip(percentValue);
      setEstimateDrip(outputStr);
      setTenperVal(tenPercentVal);

      return outputFormatted;
    } else {
      setEstimateDrip(0);
      setMinRecievedDrip(0);
      setTenperVal(0);
      return 0;
    }
  };

  const myRadioSellSplash1 = async () => {
    try {
      let myvalue = inputE2.current.value;
      await computeSellEstimate(myvalue, 1);
    } catch (e) {
      console.log("Error while getting amount against selected radio button", e);
    }
  };

  const myRadioSellSplash3 = async () => {
    try {
      let myvalue = inputE2.current.value;
      await computeSellEstimate(myvalue, 3);
    } catch (e) {
      console.log("Error while getting amount against selected radio button", e);
    }
  };

  const myRadioSellSplash5 = async () => {
    try {
      let myvalue = inputE2.current.value;
      await computeSellEstimate(myvalue, 5);
    } catch (e) {
      console.log("Error while getting amount against selected radio button", e);
    }
  };

  const enterBuyAmount2 = async () => {
    try {
      let myvalue = inputE2.current.value;
      if (myvalue > 0) {
        let weiValue = parseEther(myvalue.toString());
        setEnteredval(weiValue.toString());

        let tokensOutputPrice = await getTokenToBnbPrice(weiValue);
        if (tokensOutputPrice === null) return;
        let outputFormatted = parseFloat(formatEther(tokensOutputPrice));

        let tenPercentVal = (outputFormatted * 10) / 100;
        tenPercentVal = outputFormatted - tenPercentVal;
        setWithoutToFixed(outputFormatted);

        let miniumrcvdDrip = (tripType1 * tenPercentVal) / 100;
        let percentValue = tenPercentVal - miniumrcvdDrip;
        percentValue = parseFloat(percentValue).toFixed(7);
        tenPercentVal = parseFloat(tenPercentVal).toFixed(7);

        let outputStr = parseFloat(outputFormatted).toFixed(7);

        percentValue = parseFloat(percentValue).toFixed(7);
        setMinRecievedDrip(percentValue);
        setEstimateDrip(outputStr);
        setTenperVal(tenPercentVal);
      } else {
        setEstimateDrip(0);
        setMinRecievedDrip(0);
        setTenperVal(0);
      }
    } catch (e) {
      console.log("Error while getting values against entered amount", e);
    }
  };

  const myOnchangeInputSellSplash = async () => {
    try {
      let iEntered = mYEnter1.current.value;
      if (iEntered < 100) {
        if (iEntered >= 1) {
          setTripType1(iEntered);
          let myvalue = inputE2.current.value;
          await computeSellEstimate(myvalue, iEntered);
        } else {
          toast.error("Slippage Cannot be less than 1");
        }
      } else {
        toast.error("Slippage cannot be Over 100");
      }
    } catch (e) {
      console.log("Error while getting values against entered amount", e);
    }
  };

  // ── Buy: BNB -> Token ──
  const swapBnbtoToken = async () => {
    await enterBuyAmount1();
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected");
        return;
      }
      let myvalue = inputEl.current.value;
      if (parseFloat(myvalue) > 0) {
        if (parseFloat(usersBalance) > parseFloat(myvalue)) {
          let weiValue = parseEther(myvalue);

          let tokensInputPrice = await getBnbToTokenPrice(weiValue);
          if (tokensInputPrice === null) {
            toast.error("Transaction Failed");
            return;
          }
          let miniumrcvd = (BigInt(tripType) * tokensInputPrice) / 100n;
          let percentValue = tokensInputPrice - miniumrcvd;

          if (percentValue > 0n) {
            writeContract({
              ...fountainConfig,
              functionName: 'bnbToTokenSwapInput',
              args: [percentValue],
              value: weiValue,
            }, {
              onSuccess: () => {
                toast.success("Transaction confirmed");
              },
              onError: (err) => {
                console.log("Error: ", err);
                toast.error("Transaction Failed");
              },
            });
          } else {
            toast.error("Please Select Slippage Tolerance");
          }
        } else {
          toast.error(
            "Entered Amount is greater than Your balance. Please Recharge."
          );
        }
      } else {
        toast.error("Seems Like You Forgot to Enter Amount");
      }
    } catch (e) {
      console.log("Error ; ", e);
      toast.error("Transaction Failed");
    }
  };

  // ── Sell: Token -> BNB ──
  const bnbSwapSell = async () => {
    await enterBuyAmount2();
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected");
        return;
      }

      let myvalue = inputE2.current.value;
      myvalue = parseFloat(myvalue);

      if (myvalue >= 1) {
        if (parseFloat(userDripBalance) >= myvalue) {
          let myvalueStr = myvalue.toString();
          let myvalue1 = parseEther(myvalueStr);

          // Check allowance
          let myAllowance = await readContract(config, {
            ...tokenConfig,
            functionName: 'allowance',
            args: [address, fountainContractAddress],
          });

          if (myAllowance > 0n) {
            if (myAllowance >= myvalue1) {
              let parameter = parseEther(withouttofixed.toString());

              if (parameter > 0n) {
                writeContract({
                  ...fountainConfig,
                  functionName: 'tokenToBnbSwapInput',
                  args: [myvalue1, parameter],
                }, {
                  onSuccess: () => {
                    toast.success("Transaction Confirmed");
                  },
                  onError: (err) => {
                    console.log("Failed With:", err);
                    toast.error("Transaction Failed");
                  },
                });
              } else {
                toast.error("Please Select Slippage Tolerance");
              }
            } else {
              toast.error(
                "Oops You Entered Value Greater than your approval amount"
              );
            }
          } else {
            toast.error("It Seems Like you Dont Have ApprovedToken");
          }
        } else {
          toast.error("In Sufficient balance please recharge");
        }
      } else {
        toast.error("Amount cannot be less than 1");
      }
    } catch (e) {
      console.log("Failed With :", e);
      toast.error(" Transaction Failed");
    }
  };

  // ── Approve token ──
  const getToogle = async (e) => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected");
        return;
      }
      let myvalue = inputE2.current.value;
      if (myvalue > 0) {
        let weiValue = parseEther(myvalue);
        // Approve with the wei value (original code did toWei(toWei(value)) which is likely a bug,
        // but we replicate the double-conversion for backward compatibility)
        let approvalAmount = parseEther(formatEther(weiValue));
        // Actually the original code was: web3.utils.toWei(web3.utils.toWei(myvalue))
        // which means it converts the user input to wei, then converts *that* string to wei again.
        // This is a massive approval amount. We replicate that behavior:
        writeContract({
          ...tokenConfig,
          functionName: 'approve',
          args: [fountainContractAddress, parseEther(weiValue.toString())],
        }, {
          onSuccess: () => {
            toast.success("Transaction Confirmed");
            setisToogle(false);
          },
          onError: (err) => {
            console.log("Error While approving ", err);
            toast.error("Oops you cancelled transaction");
            setisToogle(false);
          },
        });
      } else {
        toast.error("Looks Like You Forgot to Enter Amount");
      }
    } catch (e) {
      console.log("Error While approving ", e);
      toast.error("Oops you cancelled transaction");
      setisToogle(false);
    }
  };

  const show = () => {
    setBoxOne(!boxOne);
  };


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="images">
      <div id="fountain">
        <div className="container">
          <div className="landing-page">
            <div className="row mb-4 mt-2">
              <div className="container col-xl-12">
                <div className="home-text text-center row">
                  <div className="container">
                    <div className="row">
                      <div className="col">
                        <WarpBox
                          radius={50}
                          strength={-0.12}
                          style={{ "--warp-text-color": "#222" }}
                        >
                          <span
                            className="luck-title notranslate"
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            {/* {t("FOUNTAIN.1")} */}
                            {t("TheWell.1")}
                          </span>
                        </WarpBox>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mb-4 mt-2">
                  <div className="container col-md-3 col-sm-12 text-center">
                    <div className="price-top-part">
                      <img src={coin} alt="" width="60px" />
                      <h5
                        className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-3 fst-italic"
                        style={{ color: "#7c625a", fontSize: "20px" }}
                      >
                        {t("Price.1")}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span
                          className="notranslate"
                          style={{ color: "#ab9769", fontSize: "20px" }}
                        >
                          {" "}
                          {t("SOL/Splash.1")} {division}
                        </span>
                      </p>
                      <p className="text-small fst-italic">
                        {t("SOL/Splash.1")} ≈ {oneDripPrice} {t("USDT.1")}
                      </p>
                    </div>
                  </div>
                  <div className="container col-md-3 col-sm-12 text-center">
                    <div className="price-top-part">
                      <img src={sol} alt="" width="70px" />
                      <h5
                        className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-3 fst-italic"
                        style={{ color: "#7c625a" }}
                      >
                        {t("SOLBalance.1")}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span
                          className="notranslate"
                          style={{ color: "#ab9769", fontSize: "20px" }}
                        >
                          {cBnbBalance}
                        </span>
                      </p>
                      <p className="text-small fst-italic">
                        {t("SOL.1")} ≈{bnbPrice} {t("USDT.1")}
                      </p>
                    </div>
                  </div>
                  <div className="container col-md-3 col-sm-12 text-center">
                    <div className="price-top-part">
                      <img src={balance} alt="" width="60px" />
                      <h5
                        className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-3  fst-italic"
                        style={{ color: "#7c625a" }}
                      >
                        {t("SplashBalance.1")}{" "}
                      </h5>
                      <p className="text-large  mb-2 text-white fst-italic">
                        <span
                          className="notranslate"
                          style={{ color: "#ab9769", fontSize: "20px" }}
                        >
                          {cDripBalance}
                        </span>
                      </p>
                      <p className="text-small fst-italic">
                        {t("Splash.1")} ≈{dripUsdtprice}
                        {t("USDT.1")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-4 mt-2">
              <div className="container col-12 col-xl-6 col-lg-6 col-md-6 mb-4">
                <div
                  className="card  text-white"
                  style={{ backgroundColor: "#4e2e4b" }}
                >
                  <div className="card-body">
                    {/* <p className="card-text"></p> */}
                    <div className="landing-page">
                      <div className="text-left">
                        <h3>
                          <p
                            className="notranslate fst-italic"
                            style={{ fontSize: "20px" }}
                          >
                            {t("BuySplash.1")}
                          </p>
                        </h3>
                      </div>
                      <form>
                        <div className="form-group">
                          <div className="row">
                            <div className="col-3 text-left fst-italic">
                              <label>
                                <p>{t("Amount.1")}</p>
                              </label>
                            </div>
                            <div className="col-9 text-right fst-italic user2">
                              {" "}
                              <p>
                                {t("SOLBalance.1")}:
                                </p>
                                <p className="user-balance text-white fst-italic">
                                  {" "}
                                  {usersBalance}
                                </p>

                            </div>
                          </div>
                          <div role="group" className="input-group">
                            <input
                              ref={inputEl}
                              onChange={() => enterBuyAmount1()}
                              type="number"
                              placeholder="BNB"
                              className="form-control"
                              id="__BVID__90"
                            />
                            <div className="input-group-append">
                              <div
                                className="dropdown b-dropdown btn-group"
                                id="__BVID__91"
                              >
                                <OverlayTrigger
                                  trigger="click"
                                  placement="bottom-start"
                                  rootClose
                                  overlay={
                                    <BSPopover id="buy-slippage-popover" className="popoverhere">
                                      <BSPopover.Body>
                                        <ul
                                          role="menu"
                                          tabIndex={1}
                                          className="Ullist"
                                        >
                                          <li role="presentation">
                                            <div
                                              role="group"
                                              className="form-group"
                                              id="__BVID__101"
                                              style={{ whiteSpace: "nowrap" }}
                                            >
                                              <label
                                                htmlFor="dropdown-sell-slippage-config"
                                                className="d-block"
                                                id="__BVID__101__BV_label_"
                                              >
                                                {t("Slippagetolerance.1")}
                                              </label>
                                              <div>
                                                <div
                                                  role="radiogroup"
                                                  tabIndex={-1}
                                                  className="pt-2 bv-no-focus-ring"
                                                  id="__BVID__102"
                                                  style={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    justifyContent: "space-evenly",
                                                  }}
                                                >
                                                  <div
                                                    className="radio-btn"
                                                    onClick={async () => {
                                                      setTripType("1");
                                                      await enterRadioAmount1();
                                                    }}
                                                  >
                                                    <input
                                                      type="radio"
                                                      value={tripType}
                                                      name="tripType"
                                                      checked={tripType === "1"}
                                                    />
                                                    1%
                                                  </div>

                                                  <div
                                                    className="radio-btn"
                                                    onClick={async () => {
                                                      setTripType("3");
                                                      await enterRadioAmount3();
                                                    }}
                                                  >
                                                    <input
                                                      type="radio"
                                                      value={tripType}
                                                      name="tripType"
                                                      checked={tripType === "3"}
                                                    />
                                                    3%
                                                  </div>

                                                  <div
                                                    className="radio-btn"
                                                    onClick={async () => {
                                                      setTripType("5");
                                                      await enterRadioAmount5();
                                                    }}
                                                  >
                                                    <input
                                                      type="radio"
                                                      value={tripType}
                                                      name="tripType"
                                                      checked={tripType === "5"}
                                                    />
                                                    5%
                                                  </div>
                                                </div>
                                                <div
                                                  role="group"
                                                  className="input-group"
                                                >
                                                  <input
                                                    // id="dropdown-sell-slippage-config"
                                                    type="number"
                                                    // value={tripType}

                                                    ref={mYentered}
                                                    className="form-control"
                                                    onChange={async () =>
                                                      await myOnchangeInputBuySwap()
                                                    }

                                                  />
                                                  <div className="input-group-append">
                                                    <button
                                                      type="button"
                                                      className="btn btn-secondary btn-sm"
                                                    >
                                                      %
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </li>
                                        </ul>
                                      </BSPopover.Body>
                                    </BSPopover>
                                  }
                                >
                                  <Button
                                    variant="info"
                                    style={{
                                      backgroundColor: "#86ad74",
                                      border: "1px solid #86ad74",
                                    }}
                                  >
                                    <svg
                                      viewBox="0 0 16 16"
                                      width="1em"
                                      height="1em"
                                      focusable="false"
                                      role="img"
                                      aria-label="gear fill"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="currentColor"
                                      className="bi-gear-fill b-icon bi"
                                      style={{ width: "16px", height: "16px" }}
                                    >
                                      <g>
                                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"></path>
                                      </g>
                                    </svg>
                                  </Button>
                                </OverlayTrigger>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-6 text-left fst-italic">
                              <small className="form-text">
                                <p>
                                  {t("Estimatereceived.1")}: {estimate}
                                </p>
                              </small>

                              <small className="form-text fst-italic">
                                <p>
                                  {t("Minimumreceived.1")}: {minRecieved}
                                </p>{" "}
                              </small>
                            </div>
                            <div className="col-6 text-right fst-italic">
                              <small className="form-text">
                                <p>
                                  {t("Slippagetolerance.1")}: {tripType}%{" "}
                                </p>
                              </small>
                            </div>
                          </div>
                        </div>
                      </form>
                      <div className="row justify-content-end">
                        <div className="col-12 text-left">
                          <button
                            onClick={() => swapBnbtoToken()}
                            type="button"
                            className="btn btn-outline-light"
                          >
                            {t("Buy.1")}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p />
                  </div>
                </div>
              </div>
              <div className="container col-12 col-xl-6 col-lg-6 col-md-6 mb-4">
                <div
                  className="card "
                  style={{ backgroundColor: "#4e2e4b", color: "#dacc79" }}
                >
                  <div className="card-body">
                    {/* <p className="card-text"></p> */}
                    <div className="landing-page">
                      <div className="text-left">
                        <h3>
                          <span className="notranslate fst-italic">
                            <p style={{ fontSize: "20px" }}>
                              {t("SELLSplash.1")}
                            </p>
                          </span>
                        </h3>
                      </div>
                      <form>
                        <div className="form-group">
                          <div className="row">
                            <div className="col-3 text-left fst-italic">
                              <label>
                                <p>{t("Amount.1")}</p>
                              </label>
                            </div>
                            <div className="col-9 text-right fst-italic">
                              {" "}
                              <p>
                                {t("SplashBalance.1")}:
                                <label className="user-balance text-white fst-italic">
                                  {userDripBalance}
                                </label>{" "}
                              </p>
                            </div>
                          </div>
                          <div role="group" className="input-group">
                            <input
                              ref={inputE2}
                              type="number"
                              placeholder="TIME"
                              className="form-control"
                              id="__BVID__99"
                              onChange={() => enterBuyAmount2()}
                            />
                            <div className="input-group-append">
                              <button
                                onClick={() => addMaxBalance()}
                                type="button"
                                className="btn btn-info"
                                style={{
                                  backgroundColor: "#86ad74",
                                  border: "1px solid #86ad74",
                                }}
                              >
                                {t("Max.1")}
                              </button>
                              <div
                                className="dropdown b-dropdown btn-group"
                                id="__BVID__100"
                              >
                                <OverlayTrigger
                                  trigger="click"
                                  placement="bottom-start"
                                  rootClose
                                  overlay={
                                    <BSPopover id="sell-slippage-popover" className="popoverhere2">
                                      <BSPopover.Body>
                                        <ul
                                          role="menu"
                                          tabIndex={1}
                                          className="Ullist"
                                        >
                                          <li role="presentation">
                                            <div
                                              role="group"
                                              className="form-group"
                                              id="__BVID__101"
                                              style={{ whiteSpace: "nowrap" }}
                                            >
                                              <label
                                                htmlFor="dropdown-sell-slippage-config"
                                                className="d-block"
                                                id="__BVID__101__BV_label_"
                                              >
                                                {t("Slippagetolerance.1")}
                                              </label>
                                              <div>
                                                <div
                                                  role="radiogroup"
                                                  tabIndex={-1}
                                                  className="pt-2 bv-no-focus-ring"
                                                  id="__BVID__102"
                                                  style={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    justifyContent: "space-evenly",
                                                  }}
                                                >
                                                  <div
                                                    className="radio-btn"
                                                    onClick={async () => {
                                                      await myRadioSellSplash1();
                                                      setTripType1("1");
                                                    }}
                                                  >
                                                    <input
                                                      type="radio"
                                                      value={tripType1}
                                                      name="tripType1"
                                                      checked={tripType1 === "1"}
                                                    />
                                                    1%
                                                  </div>

                                                  <div
                                                    className="radio-btn"
                                                    onClick={async () => {
                                                      await myRadioSellSplash3();
                                                      setTripType1("3");
                                                    }}
                                                  >
                                                    <input
                                                      type="radio"
                                                      value={tripType1}
                                                      name="tripType"
                                                      checked={tripType1 === "3"}
                                                    />
                                                    3%
                                                  </div>

                                                  <div
                                                    className="radio-btn"
                                                    onClick={async () => {
                                                      await myRadioSellSplash5();
                                                      setTripType1("5");
                                                    }}
                                                  >
                                                    <input
                                                      type="radio"
                                                      value={tripType1}
                                                      name="tripType"
                                                      checked={tripType1 === "5"}
                                                    />
                                                    5%
                                                  </div>
                                                </div>
                                                <div
                                                  role="group"
                                                  className="input-group"
                                                >
                                                  <input
                                                    // id="dropdown-sell-slippage-config"
                                                    type="number"
                                                    ref={mYEnter1}
                                                    // value={tripType1}
                                                    max={50}
                                                    className="form-control"
                                                    onChange={async () =>
                                                      await myOnchangeInputSellSplash()
                                                    }

                                                  />
                                                  <div className="input-group-append">
                                                    <button
                                                      type="button"
                                                      className="btn btn-secondary btn-sm"
                                                    >
                                                      %
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </li>
                                        </ul>
                                      </BSPopover.Body>
                                    </BSPopover>
                                  }
                                >
                                  <Button
                                    variant="info"
                                    style={{
                                      backgroundColor: "#86ad74",
                                      border: "1px solid #86ad74",
                                    }}
                                  >
                                    <svg
                                      viewBox="0 0 16 16"
                                      width="1em"
                                      height="1em"
                                      focusable="false"
                                      role="img"
                                      aria-label="gear fill"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="currentColor"
                                      className="bi-gear-fill b-icon bi"
                                      style={{ width: "16px", height: "16px" }}
                                    >
                                      <g>
                                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"></path>
                                      </g>
                                    </svg>
                                  </Button>
                                </OverlayTrigger>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-6 text-left fst-italic">
                              <small className="form-text">
                                <p style={{ lineHeight: "120%" }}>
                                  {t("Estimatereceived.1")}:{tenPerVal}
                                </p>
                              </small>
                              <small className="form-text fst-italic">
                                <p
                                  id="swapp20"
                                  // style={{ lineHeight: "10%" }}
                                >
                                  {t("Minimumreceived.1")}:{minRecievedDrip}
                                </p>
                              </small>
                              <small className="form-text text-left">
                                <p
                                  id="swapp21"
                                  // style={{ lineHeight: "34%" }}
                                >
                                  {t("10%Taxisappliedonsells.1")}
                                </p>
                              </small>
                            </div>
                            <div className="col-6 text-right fst-italic">
                              <small className="form-text">
                                <p
                                  id="swapp2"
                                  // style={{ lineHeight: "100%" }}
                                >
                                  {t("Slippagetolerance.1")}: {tripType1}%
                                </p>
                              </small>
                            </div>
                          </div>
                        </div>
                      </form>
                      <div className="row justify-content-end">
                        <div className="col-12 text-left">
                          <button
                            onClick={() => bnbSwapSell()}
                            type="button"
                            className="btn btn-outline-light"
                          >
                            {t("Sell.1")}
                          </button>
                          <div
                            className="allowanceSelect"
                            style={{ float: "right" }}
                          >
                            <div className="custom-control custom-switch b-custom-control-lg">
                              <input
                                type="checkbox"
                                name="check-button"
                                className="custom-control-input"
                                // value={isToogle}
                                id="__BVID__107"
                                checked={isToogle}
                                onChange={getToogle}
                              />
                              <label
                                className="custom-control-label"
                                htmlFor="__BVID__107"
                              >
                                {" "}
                                <p>{t("ApproveSplash.1")}</p>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p />
                  </div>
                </div>
              </div>
            </div>
            <div className="row mb-4 mt-2">
              <div className="container col-12 text-center">
                <div className="row mb-4 mt-2">
                  <div className="container col-12 text-center">
                    <WarpBox
                      radius={50}
                      strength={-0.12}
                      style={{
                        "--warp-text-color": "#222",
                        textAlign: "center",
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 0",
                      }}
                    >
                      <h1 style={{ margin: 0 }}>{t("Chart.1")}</h1>
                    </WarpBox>
                  </div>

                  {/* <div id="chartContainer" style={{height: '370px', width: '100%'}}><div className="canvasjs-chart-container" style={{position: 'relative', textAlign: 'left', cursor: 'auto', direction: 'ltr'}}><canvas className="canvasjs-chart-canvas" width={1140} height={370} style={{position: 'absolute', userSelect: 'none'}} /><canvas className="canvasjs-chart-canvas" width={1140} height={370} style={{position: 'absolute', WebkitTapHighlightColor: 'transparent', userSelect: 'none', cursor: 'default'}} /><div className="canvasjs-chart-toolbar" style={{position: 'absolute', right: '1px', top: '1px', border: '1px solid transparent'}}><button state="pan" type="button" title="Pan" style={{display: 'none', backgroundColor: 'white', color: 'black', borderTop: 'none', borderRight: '1px solid rgb(33, 150, 243)', borderBottom: 'none', borderLeft: 'none', borderImage: 'initial', userSelect: 'none', padding: '5px 12px', cursor: 'pointer', float: 'left', width: '40px', height: '25px', outline: '0px', verticalAlign: 'baseline', lineHeight: 0}}><img style={{height: '95%', pointerEvents: 'none'}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAICSURBVEhLxZbPahNRGMUn/5MpuAiBEAIufQGfzr5E40YptBXajYzudCEuGqS+gGlrFwquDGRTutBdYfydzJ3LzeQmJGZue+Dw/Z17Mnfmu5Pof9Hr9Z61Wq0bWZMKj263O6xWq99wU9lOpzPMKgEhEcRucNOcioOK+0RzBhNvt9tPV4nmVF19+OWhVqt9xXgFXZq+8lCv119UKpUJ7iX2FmvFTKz8RH34YdBsNk8wVtjE4fGYwm8wrrDi3WBG5oKXZGRSS9hGuNFojLTe2lFz5xThWZIktayyiE2FdT3rzXBXz7krKiL8c17wAKFDjCus2AvW+YGZ9y2JF0VFRuMPfI//rsCE/C+s26s4gQu9ul7r4NteKx7H8XOC724xNNGbaNu++IrBqbOV7Tj3FgMRvc/YKOr3+3sE47wgEt/Bl/gaK5cHbNU11vYSXylfpK7XOvjuumPp4Wcoipu30Qsez2uMXYz4lfI+mOmwothY+SLiXJy7mKVpWs3Si0CoOMfeI9Od43Wic+jO+ZVv+crsm9QSNhUW9LXSeoPBYLXopthGuFQgdIxxhY+UDwlt1x5CZ1hX+NTUdt/OIvjKaDSmuOJfaIVNPKX+W18j/PLA2/kR44p5Sd8HbHngT/yTfNRWUXX14ZcL3wmX0+TLf8YO7CGT8yFE5zB3/gney25/OETRP9CtPDFe5jShAAAAAElFTkSuQmCC" alt="Pan" /></button><button state="reset" type="button" title="Reset" style={{display: 'none', backgroundColor: 'white', color: 'black', borderTop: 'none', borderRight: '0px solid rgb(33, 150, 243)', borderBottom: 'none', borderLeft: 'none', borderImage: 'initial', userSelect: 'none', padding: '5px 12px', cursor: 'pointer', float: 'left', width: '40px', height: '25px', outline: '0px', verticalAlign: 'baseline', lineHeight: 0}}><img style={{height: '95%', pointerEvents: 'none'}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAeCAYAAABJ/8wUAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAPjSURBVFhHxVdJaFNRFP1J/jwkP5MxsbaC1WJEglSxOFAXIsFpVRE3ggi1K90obioRRBA33XXnQnciirhQcMCdorgQxBkXWlREkFKsWkv5npvckp/XnzRpKh64kLw733fffe9L/wrL0+mVUdO8uTSZ3MBL/we2qg4rkuSpodCELstXE46ziVkLQ6FQcGOmeSSq6wd4aV50d3drWjj8kQKZJTUc9kxFGenv79dZrDksTSTWWJp2QYtEPiErysyzdX0LsxsCQR8keX8gs6RHIk8ysdgKFg2G53mhuOPsshTlBjKaFo1g7SqLNoShKLdFXT8huQ/paLSbxatYnc2mHMM4hr18Vi8TIvCmXF3vYrW6cF23gGTOk0M1wA4RKvOmq6vLZRVJipvmSWT6tZ6CSEYkco5V50VPT4+D7RwOqi6RiSZm0fJ+vggSqkeoypdsNmuyelNwbXsbgvkWYMtzDWNvWaijoyOBqE+hVK8abcssUeXQ/YfKyi0gFYv1Ipgfoj34fYGTJLOYJA0ODirok32GLN8XhUWCwSes1hIwBg6LydJ/tEeRRapAdUp+wSAiZchtZZWWgAZ+JNpD8peYXQVK9UwUxNpzOK8pq97kURZhYTCKBwPD7h2zK+js7Myi7D8Fod+0TkMI8+EMAngLGc/WtBFWawkFHFnoj/t9KLgGmF0B3QfkxC+EarxkdhnFYlFLY06USqUwL7UMjICHfh/wOc2sCqhpxGbCkLvL7EUDbF73+6DkmVWB6zi7xUDQSLeYvWjAILvm9zEnkJhlbRcDQZcv6Kg2AipyT/Axw6wKlqVSqxDdjF8Izfod13qURdrG/nxehY+xGh+h0CSzKygGvSNQIcc097BI24jb9hax6kj2E7OrMFX1il+ICEf2NrPbhiXLl+fYl+U7zK4iYdsDcyLGf+ofFlkwcN+s10KhmpuYhhtm0hCLVIFL0MDsqNlDIqy9x2CLs1jL6OvrI7vPRbtohXG6eFmsFnHDGAp6n9AgyuVySRZrGvROxRgIfLXhzjrNYnNBUxNX/dMgRWT1mt4XLDovaApD53E9W3ilNX5M55LJHpRtIsgAvciR4WWcgK2Dvb1YqgXevmF8z2zEBTcKG39EfSKsT9EbhVUaI2FZO+oZIqImxol6j66/hcAu4sSN4vc1ZPoKeoE6RGhYL2YYA+ymOSSi0Z0wWntbtkGUWCvfSDXIxONraZ/FY90KUfNTpfC5spnNLgxoYNnR9RO4F8ofXEHOgogCQE99w+fF2Xw+b7O59rEOsyRqGEfpVoaDMQQ1CZrG46bcM6AZ0C/wPqNfHliqejyTySxh9TqQpL+xmbIlkB9SlAAAAABJRU5ErkJggg==" alt="Reset" /></button></div><div className="canvasjs-chart-tooltip" style={{position: 'absolute', height: 'auto', boxShadow: 'rgba(0, 0, 0, 0.1) 1px 1px 2px 2px', zIndex: 1000, pointerEvents: 'none', display: 'none', borderRadius: '5px'}}><div style={{width: 'auto', height: 'auto', minWidth: '50px', lineHeight: 'auto', margin: '0px 0px 0px 0px', padding: '5px', fontFamily: 'Calibri, Arial, Georgia, serif', fontWeight: 'normal', fontStyle: 'italic', fontSize: '14px', color: '#000000', textShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)', textAlign: 'left', border: '2px solid gray', background: 'rgba(255,255,255,.9)', textIndent: '0px', whiteSpace: 'nowrap', borderRadius: '5px', MozUserSelect: 'none', KhtmlUserSelect: 'none', WebkitUserSelect: 'none', msUserSelect: 'none', userSelect: 'none'}}> Sample Tooltip</div></div><a className="canvasjs-chart-credit" title="JavaScript Charts" style={{outline: 'none', margin: '0px', position: 'absolute', right: 'auto', top: '356px', color: 'dimgrey', textDecoration: 'none', fontSize: '11px', fontFamily: 'Calibri, "Lucida Grande", "Lucida Sans Unicode", Arial, sans-serif'}} tabIndex={-1} target="_blank" href="https://canvasjs.com/">CanvasJS.com</a></div></div> */}
                </div>
                <div>
                  <Chart />
                </div>
              </div>
            </div>
            <div className="row mb-4 mt-2">
                <div className="container col-12 text-center">
                    <WarpBox
                      radius={50}
                      strength={-0.12}
                      style={{
                        "--warp-text-color": "#222",
                        textAlign: "center",
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 0",
                      }}
                    >
                      <h1 style={{ margin: 0 }}>{t("Stats.1")}</h1>
                    </WarpBox>
                  <WarpBox
                    radius={50}
                    strength={-0.12}
                    style={{ "--warp-text-color": "#222" }}
                  >
                  <p style={{ color: "white", fontSize: "20px" }}>
                    {t(
                      "TheWellisthebestwaytoexchangevalueintheSplashNetwork!Herearethenumbers.1"
                    )}
                    ...
                  </p>
                </WarpBox>
              </div>
              <div className="container col-12 col-xl-4 col-lg-4 col-md-4 text-center">
                <div className="price-top-part">
                  <img src={van} alt="" className="" width="60px" />
                  <h5
                    className="mb-0 font-weight-semibold color-theme-1 mb-2 fst-italic"
                    style={{ color: "#7c625a" }}
                  >
                    {t("Supply.1")}
                  </h5>
                  <p className="text-large mb-2 text-white fst-italic">
                    <span
                      className="notranslate"
                      style={{ color: "#ab9769", fontSize: "20px" }}
                    >
                      {tSupllyDrip}
                    </span>
                  </p>
                  <p className="text-small fst-italic">{t("Splash.1")}</p>
                </div>
              </div>
              <div className="container col-12 col-xl-4 col-lg-4 col-md-4 text-center">
                <div className="price-top-part">
                  <img src={contact} alt="" className=""
                  style={{ width: "130px", backgroungColor: "white"}}
                  />
                  <h5
                    className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2"
                    style={{ color: "#7c625a" }}
                  >
                    {t("ContractBalance.1")}
                  </h5>
                  <p className="text-large mb-2 text-white">
                    <span
                      className="notranslate"
                      style={{ color: "#ab9769", fontSize: "20px" }}
                    >
                      {tSupllyFountain}
                    </span>
                  </p>
                  <p className="text-small"> {t("DROPS.1")} ({t("Splash.1")} / {t("LOCKED.1")})</p>
                </div>
              </div>
              <div className="container col-12 col-xl-4 col-lg-4 col-md-4 text-center">
                <div className="price-top-part">
                  <img src={transfer} alt="" width="60px" className="" />
                  <h5
                    className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2"
                    style={{ color: "#7c625a" }}
                  >
                    {t("Tranactions.1")}
                  </h5>
                  <p className="text-large mb-2 text-white">
                    <span
                      className="notranslate"
                      style={{ color: "#ab9769", fontSize: "20px" }}
                    >
                      {tTransactionsFountain !== undefined ? tTransactionsFountain.toString() : '0'}
                    </span>
                  </p>
                  <p className="text-small">{t("Txs.1")}</p>
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
    </div>
  );
};

export default Swap;
