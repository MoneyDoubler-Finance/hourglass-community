import React, { useState, useRef, useEffect } from "react";
import money from "../../images/money.png";
import astro from "../../images/astro.png";
import dummy from "../../images/dummy.png";
import shake from "../../images/shake.png";
import { ToastContainer, toast } from 'react-toastify';
import user from "../../images/user.png";
import Form from "react-bootstrap/Form";
import { faucetContractAddress, faucetContractAbi, faucetTokenAddress, faucetTokenAbi } from "../utils/Faucet";
import { buddySystemAddress, buddySystemAbi } from "../utils/BuddySystem"
import "./Facuet.css";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router";
import axios from 'axios'
import Table from 'react-bootstrap/Table'
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi'
import { readContract } from '@wagmi/core'
import { formatEther, parseEther } from 'viem'
import { config } from '../../config/wagmi'

const faucetConfig = {
  address: faucetContractAddress,
  abi: faucetContractAbi,
};

const tokenConfig = {
  address: faucetTokenAddress,
  abi: faucetTokenAbi,
};

const buddyConfig = {
  address: buddySystemAddress,
  abi: buddySystemAbi,
};

const Facuet = ({ oneTokenPrice }) => {
  let navigate = useNavigate();
  let buddySearch = useRef()
  let [isChange, setIschange] = useState("Viewer");
  // player
  let [direct, setdirect] = useState(0);
  let [netDepppost, setnetDeposit] = useState(0);
  let [Airdropsent, setAirdropsent] = useState(0);
  let [AirdropLastSent, setAirdroplastsent] = useState(0);
  let [playerTeam, setPlayerteam] = useState(0);
  let airDropPlayerAddress = useRef()

  // for direct air drop
  let airAddress = useRef();
  let airAmount = useRef();

  const { t, i18n } = useTranslation();
  const inputEl = useRef();
  const buddy = useRef();
  let addressInput = useRef();
  let [storeRefarl, setStoreRefral] = useState([])

  // run air drop
  let [checkSplash, setCheckSplash] = useState("1")
  let [checkDirects, setCheckDirects] = useState("0")
  let [checkCompaign, setCheckCompaign] = useState("0")
  let [showCompaign, setShowCompaign] = useState([]);
  let budgetRef = useRef()
  let dividBudgetRef = useRef();
  let [numberOfReciept, setNumberOfReciept] = useState(0);
  let [estimatePerPerson, setEstimatePerPerson] = useState(0)
  let [sendEstimateAmount, setSendEstimateAmount] = useState(0)
  let [sendAddress, setSendAddress] = useState([]);
  let [showTeamData, setShowTeamData] = useState([])
  let [showTeamStatus, setShowTeamStatus] = useState([])

  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  // ── Declarative contract reads (wagmi hooks) ──

  // contractInfo — total_users
  const { data: contractInfoData } = useReadContract({
    ...faucetConfig,
    functionName: 'contractInfo',
    query: { refetchInterval: 10000 },
  });

  const team = contractInfoData ? contractInfoData[0].toString() : '0';

  // userInfoTotals
  const { data: userInfoTotalData } = useReadContract({
    ...faucetConfig,
    functionName: 'userInfoTotals',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const rawTotalDeposits = userInfoTotalData ? userInfoTotalData[1] : BigInt(0);
  const userReferrals = userInfoTotalData ? userInfoTotalData[0].toString() : '0';

  // total_users (for showing total when user has referrals)
  const { data: rawTotalUsers } = useReadContract({
    ...faucetConfig,
    functionName: 'total_users',
    query: { enabled: !!address && Number(userReferrals) > 0, refetchInterval: 10000 },
  });

  const showTotalUser = rawTotalUsers ? rawTotalUsers.toString() : '0';

  // userInfo
  const { data: userInfoData } = useReadContract({
    ...faucetConfig,
    functionName: 'userInfo',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const totalclaimed = userInfoData
    ? parseFloat(formatEther(userInfoData[3])).toFixed(3)
    : '0';

  // payoutOf
  const { data: payoutOfData } = useReadContract({
    ...faucetConfig,
    functionName: 'payoutOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const maxPayout = payoutOfData
    ? parseFloat(formatEther(payoutOfData[1])).toFixed(3)
    : '0';

  // claimsAvailable
  const { data: rawClaimsAvailable } = useReadContract({
    ...faucetConfig,
    functionName: 'claimsAvailable',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const availabe = rawClaimsAvailable
    ? parseFloat(formatEther(rawClaimsAvailable)).toFixed(3)
    : '0';

  // token balance (TIME)
  const { data: rawDripBalance } = useReadContract({
    ...tokenConfig,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const userDripBalance = rawDripBalance
    ? parseFloat(formatEther(rawDripBalance)).toFixed(3)
    : '0';

  // native balance (BNB)
  const { data: nativeBalanceData } = useBalance({
    address: address,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const usersBalance = nativeBalanceData
    ? parseFloat(formatEther(nativeBalanceData.value)).toFixed(3)
    : '0';

  // users (direct_bonus, match_bonus)
  const { data: usersData } = useReadContract({
    ...faucetConfig,
    functionName: 'users',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const directs = usersData
    ? parseFloat(formatEther(usersData[3])).toFixed(1)
    : '0';
  const inDirects = usersData
    ? parseFloat(formatEther(usersData[4])).toFixed(3)
    : '0';

  // custody
  const { data: custodyData } = useReadContract({
    ...faucetConfig,
    functionName: 'custody',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const manager = custodyData ? custodyData[0] : '0';
  const benificiary = custodyData ? custodyData[1] : '0';
  const lastCheckin = custodyData ? custodyData[3].toString() : '0';

  // buddyOf
  const { data: buddyOfData } = useReadContract({
    ...buddyConfig,
    functionName: 'buddyOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const currentWaveStarter = buddyOfData || '0';

  // ── Derived values ──
  const myDeposited = rawTotalDeposits
    ? parseFloat(formatEther(rawTotalDeposits)).toFixed(3)
    : '0';

  const myCal = usersBalance > 0 && userDripBalance > 0
    ? parseFloat(usersBalance / userDripBalance).toFixed(6)
    : '0';

  const showPlayer = userReferrals;

  const avalibleUSDT = availabe
    ? parseFloat(availabe * oneTokenPrice).toFixed(3)
    : '0';

  const depositUSDT = myDeposited
    ? parseFloat(myDeposited * oneTokenPrice).toFixed(3)
    : '0';

  //Direct AirDrop
  const directAirDrop = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected")
        return;
      }

      let enteredAirVal = airAmount.current.value;
      let enteredAddrs = airAddress.current.value;
      if (parseFloat(enteredAirVal) > 0) {
        if (enteredAddrs.length > 10) {
          if (parseFloat(userDripBalance) > parseFloat(enteredAirVal)) {
            let usersinf = await readContract(config, {
              ...faucetConfig,
              functionName: 'users',
              args: [enteredAddrs],
            });
            let uplineAddress = usersinf[0]; // upline
            let weiAmount = parseEther(enteredAirVal);
            if (uplineAddress == "0x0000000000000000000000000000000000000000") {
              toast.error("No Refferral ")
            } else {
              writeContract({
                ...tokenConfig,
                functionName: 'approve',
                args: [faucetContractAddress, weiAmount],
              }, {
                onSuccess: () => {
                  toast.success("Transaction confirmed")
                  writeContract({
                    ...faucetConfig,
                    functionName: 'airdrop',
                    args: [enteredAddrs, weiAmount],
                  }, {
                    onSuccess: () => {
                      toast.success("Transaction confirmed")
                    },
                    onError: () => {
                      toast.error("Transaction Failed")
                    }
                  })
                },
                onError: () => {
                  toast.error("Transaction Failed")
                }
              })
            }
          } else {
            toast.error("Insufficient Balance Please Recharge!")
          }
        } else {
          toast.error("Incorrrect palyer's Address")
        }
      } else {
        toast.error("Looks like you forgot to enter TIME Amount")
      }

    } catch (e) {
      toast.error("Transaction Failed")
      console.log("Error :", e)
    }
  }

  //Player Info
  const goPlayerinfo = async () => {
    let enteredAddress = addressInput.current.value;

    try {
      let data = {
        referee: enteredAddress
      }
      let res = await axios.post("https://splash-test-app.herokuapp.com/api/users/getTreeRef", data);

      let userInfoTotal = await readContract(config, {
        ...faucetConfig,
        functionName: 'userInfoTotals',
        args: [enteredAddress],
      });
      let playeruserInfo = await readContract(config, {
        ...faucetConfig,
        functionName: 'userInfo',
        args: [enteredAddress],
      });

      let myDirect = playeruserInfo[4]; // direct_bonus
      myDirect = formatEther(myDirect);
      myDirect = parseFloat(myDirect).toFixed(3)
      let nedeposit = userInfoTotal[1]; // total_deposits
      let myrefferals = userInfoTotal[0]; // referrals
      nedeposit = formatEther(nedeposit);
      nedeposit = parseFloat(nedeposit).toFixed(3)
      let aidropsent = userInfoTotal[5]; // airdrops_received
      aidropsent = formatEther(aidropsent);
      aidropsent = parseFloat(aidropsent).toFixed(3);
      let airlstdrp = userInfoTotal[4]; // airdrops_total
      airlstdrp = formatEther(airlstdrp);
      airlstdrp = parseFloat(airlstdrp).toFixed(3);
      setnetDeposit(nedeposit);
      setAirdropsent(aidropsent);
      setAirdroplastsent(airlstdrp);
      setPlayerteam(res.data.length);
      setdirect(myrefferals.toString());
    } catch (e) {
      toast.error("Can't Fetch User's Information at the moment please try again later.")
      console.log("error", e)
    }
  }
  const approveAmount = async () => {
    try {
      if (!isConnected) {
        toast.error("No wallet connected")
        return;
      }

      let enteredVal = inputEl.current.value;

      if (enteredVal >= 1) {
        if (parseFloat(userDripBalance) >= parseFloat(enteredVal)) {

          let referral = await readContract(config, {
            ...buddyConfig,
            functionName: 'buddyOf',
            args: [address],
          });

          if (referral && referral.length > 15) {
            writeContract({
              ...tokenConfig,
              functionName: 'approve',
              args: [faucetContractAddress, parseEther(enteredVal)],
            }, {
              onSuccess: () => {
                toast.success("Transaction confirmed")
              },
              onError: () => {
                toast.error("Transaction failed")
              }
            })
          } else {
            toast.error("You have no Buddy.");
          }
        } else {
          toast.error("Entered value is greater than your balance")
        }
      } else {
        toast.error("Deposit amount should be greater than 1")
      }
    } catch (e) {
      toast.error("Transaction failed")
      console.log("error while approve amount", e);
    }
  }
  const depositAmount = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet connected")
        return;
      }

      let enteredVal = inputEl.current.value;
      if (enteredVal >= 1) {
        if (parseFloat(userDripBalance) > parseFloat(enteredVal)) {
          let referral = await readContract(config, {
            ...buddyConfig,
            functionName: 'buddyOf',
            args: [address],
          });

          if (referral != "0x0000000000000000000000000000000000000000") {
            let allowance = await readContract(config, {
              ...tokenConfig,
              functionName: 'allowance',
              args: [address, faucetContractAddress],
            });
            console.log("allowance", allowance);
            if (allowance >= parseEther(enteredVal)) {
              writeContract({
                ...faucetConfig,
                functionName: 'deposit',
                args: [referral, parseEther(enteredVal)],
              }, {
                onSuccess: async (hash) => {
                  let data = {
                    hash: hash,
                    toAddress: faucetContractAddress,
                    fromAddress: address,
                    id: address,
                    amount: enteredVal
                  }
                  await axios.post("https://splash-test-app.herokuapp.com/api/users/postEvents", data);
                  toast.success("Transaction confirmed");
                },
                onError: () => {
                  toast.error("Transaction Failed ")
                }
              })
            } else {
              toast.error("Entered value is greater than your approval amount ")
            }

          } else {
            toast.error("You have no Buddy.");

          }
        } else {
          toast.error("Entered value is greater than your balance")
        }
      } else {
        toast.error("Deposit amount should be greater than 1 ")
      }
    } catch (e) {
      toast.error("Transaction Failed ")
      console.log("Transaction Failed", e)
    }
  }

  const updatemyBuddy = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected");
        return;
      }

      if (buddy.current.value <= 0) {
        toast.error("Please enter buddy refral")
      } else {
        let enteredVal = buddy.current.value;
        let userInfoTotal = await readContract(config, {
          ...faucetConfig,
          functionName: 'userInfoTotals',
          args: [enteredVal],
        });
        let nedeposit = userInfoTotal[1]; // total_deposits
        nedeposit = formatEther(nedeposit);
        nedeposit = parseFloat(nedeposit)
        if (nedeposit <= 0) {
          toast.error("No Directs avaliable")
        } else {
          if (enteredVal == address) {
            toast.error("Same address not accepted")
          } else {
            writeContract({
              ...buddyConfig,
              functionName: 'updateBuddy',
              args: [enteredVal],
            }, {
              onSuccess: async () => {
                let data = {
                  referee: address
                }
                await axios.post("https://splash-test-app.herokuapp.com/api/users/treeReferral", data);
                toast.success("Buddy updated")
              },
              onError: () => {
                toast.error("Buddy rejected")
              }
            })
          }
        }
      }
    } catch (e) {
      toast.error("Buddy rejected")
      console.log("error while update buddy", e);
    }
  }
  const myClaim = async () => {

    try {
      if (!isConnected) {
        toast.error("No Wallet Connected!")
        return;
      }

      if (parseFloat(availabe) > 0) {
        writeContract({
          ...faucetConfig,
          functionName: 'claim',
        }, {
          onSuccess: async (hash) => {
            let data = {
              hash: hash,
              toAddress: address,
              fromAddress: faucetContractAddress,
              id: address,
              amount: availabe
            }
            await axios.post("https://splash-test-app.herokuapp.com/api/users/postEvents", data);
            toast.success("Transaction confirmed")
          },
          onError: () => {
            toast.error("Transaction Failed")
          }
        })
      } else {
        toast.error("No Claims Available")
      }

    } catch (e) {
      toast.error("Transaction Failed")
    }

  }
  const getOwnerReferral = async () => {
    try {
      let ownwerAddrss = await readContract(config, {
        ...faucetConfig,
        functionName: 'dripVaultAddress',
      });
      buddy.current.value = ownwerAddrss;
    } catch (e) {
      console.log("Error :", e)
    }

  }

  const hydarated = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected");
        return;
      }

      if (parseFloat(availabe) > 0) {
        writeContract({
          ...faucetConfig,
          functionName: 'roll',
        }, {
          onSuccess: () => {
            toast.success("Transaction confirmed")
          },
          onError: () => {
            toast.error("Transaction Failed")
          }
        })
      } else {
        toast.error("No Availabe Claims you need to deposit first")
      }

    } catch (e) {
      toast.error("Transaction Failed")
      console.log("Error while calling hydrated function");
    }

  }
  const getMaxBal = async () => {
    try {
      if (!isConnected) {
        toast.error("No wallet Connected")
        return;
      }

      let bal = await readContract(config, {
        ...tokenConfig,
        functionName: 'balanceOf',
        args: [address],
      });
      bal = formatEther(bal);
      inputEl.current.value = bal;

    } catch (e) {
      console.log("error while get max balance", e);
    }
  }
  const getUserAirDropAddress = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected");
        return;
      }
      airDropPlayerAddress.current.value = address;

    } catch (e) {
      console.log("error while get user address", e);
    }
  }
  // run team air drop
  const runTeamDrop = async () => {
    setNumberOfReciept(0)
    setEstimatePerPerson(0)
    setSendEstimateAmount(0);
    setSendAddress([])
    setShowCompaign([])
    setShowTeamStatus([])
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected")
        return;
      }

      if (airDropPlayerAddress.current.value > 0) {
        if (budgetRef.current.value > 0) {
          if (parseFloat(userDripBalance) >= parseFloat(budgetRef.current.value)) {
            let data = {
              referee: airDropPlayerAddress.current.value
            }
            let checkReferal = [];
            let referralData = await axios.post("https://splash-test-app.herokuapp.com/api/users/getTreeRef", data)
            if (referralData.data.length) {
              checkReferal = referralData.data

              let mapReferral = checkReferal.map(async (item) => {
                return await readContract(config, {
                  ...faucetConfig,
                  functionName: 'users',
                  args: [item],
                });
              })

              mapReferral = await Promise.allSettled(mapReferral)
              let filterReferral = mapReferral.filter((item) => {
                // item.value is a tuple: [upline, referrals, total_structure, direct_bonus, match_bonus, deposits, deposit_time, payouts, rolls, ref_claim_pos, entered_address]
                return (formatEther(item.value[3]) >= checkDirects
                  && formatEther(item.value[5]) >= checkSplash)
                  && item.value[0] !== "0x0000000000000000000000000000000000000000"
              })

              if (filterReferral.length) {
                const processSlice = async (slice, totalAmount) => {
                  let dataAdd = []
                  let sAdd = []
                  let amount = totalAmount / slice.length;
                  setEstimatePerPerson(parseFloat(amount).toFixed(2))
                  setSendEstimateAmount(amount)
                  let checkStatus = slice.map(async (item) => {
                    return await readContract(config, {
                      ...faucetConfig,
                      functionName: 'isNetPositive',
                      args: [item.value[10]], // entered_address
                    });
                  })
                  checkStatus = await Promise.allSettled(checkStatus)
                  setShowTeamStatus(checkStatus)

                  slice.forEach((item) => {
                    let deposit = formatEther(item.value[5]); // deposits
                    deposit = parseFloat(deposit).toFixed(2)
                    sAdd.push(item.value[10]) // entered_address
                    dataAdd.push({
                      address: item.value[10], // entered_address
                      directs: item.value[1].toString(), // referrals
                      deposits: deposit,
                      amount: amount
                    })
                  })

                  setNumberOfReciept(sAdd.length)
                  setSendAddress(sAdd)
                  setShowCompaign(dataAdd)
                }

                if (checkCompaign == 0) {
                  setNumberOfReciept(filterReferral.length)
                  await processSlice(filterReferral, parseFloat(budgetRef.current.value))
                } else if (checkCompaign == 1) {
                  await processSlice(filterReferral.slice(0, 1), parseFloat(budgetRef.current.value))
                } else if (checkCompaign == 5) {
                  if (filterReferral.length < 5) {
                    toast.error("Your Referrals are less than the selected compaign")
                  } else {
                    await processSlice(filterReferral.slice(0, 5), parseFloat(budgetRef.current.value))
                  }
                } else if (checkCompaign == 20) {
                  if (filterReferral.length < 20) {
                    toast.error("Your Referrals are less than the selected compaign")
                  } else {
                    await processSlice(filterReferral.slice(0, 20), parseFloat(budgetRef.current.value))
                  }
                } else if (checkCompaign == 50) {
                  if (filterReferral.length < 50) {
                    toast.error("Your Referrals are less than the selected compaign")
                  } else {
                    await processSlice(filterReferral.slice(0, 50), parseFloat(budgetRef.current.value))
                  }
                } else {
                  if (filterReferral.length < 100) {
                    toast.error("Your Referrals are less than the selected compaign")
                  } else {
                    await processSlice(filterReferral.slice(0, 100), parseFloat(budgetRef.current.value))
                  }
                }
              } else {
                setNumberOfReciept(0)
                setEstimatePerPerson(0)
                setSendEstimateAmount(0)
                setSendAddress([])
                setShowCompaign([])
                setShowTeamStatus([])
                toast.error("No users found")
              }

            } else {
              toast.error("You have not got any referral")
            }


          } else {
            toast.error("Oops insufficient Spash balance")
          }
        } else {
          toast.error("Looks like you forgot to enter Budget amount")
        }

      } else {
        toast.error("Please enter address or click use my address")
      }
    } catch (e) {
      console.log("error while run team drop", e);
    }
  }
  const aproveafterRunAmount = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected")
        return;
      }

      if (budgetRef.current.value > 0) {
        if (parseFloat(userDripBalance) >= parseFloat(budgetRef.current.value)) {
          if (sendAddress.length) {
            let value = parseEther(budgetRef.current.value)
            writeContract({
              ...tokenConfig,
              functionName: 'approve',
              args: [faucetContractAddress, value],
            }, {
              onSuccess: () => {
                toast.success("Transaction confirmed")
              },
              onError: () => {
                toast.error("Transaction failed")
              }
            })
          } else {
            toast.error("No recipient found")
          }
        } else {
          toast.error("Entered amount is greater than your balance")
        }
      } else {
        toast.error("Looks like you forgot to enter amount")
      }

    } catch (e) {
      toast.error("Transaction failed")
      console.log("error while aprove amount to addresses");
    }
  }
  const changeResAmount = async() => {
    try{
      let bug = budgetRef.current.value;
      let val = dividBudgetRef.current.value
      if(val > 0){
          bug = bug /  val
          bug = parseFloat(bug).toFixed(3)
          setEstimatePerPerson(bug);
          setNumberOfReciept(val)

      }else{
        setEstimatePerPerson(0);
        setNumberOfReciept(0)
      }
    }catch(e){
      console.error("Error while change res amount", e)
    }
  }
  const sendAmount = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected")
        return;
      }

      if (parseFloat(budgetRef.current.value) > 0) {
        if (sendAddress.length) {
          let allowance = await readContract(config, {
            ...tokenConfig,
            functionName: 'allowance',
            args: [address, faucetContractAddress],
          });

          let all = formatEther(allowance);

          if (parseFloat(budgetRef.current.value) <= parseFloat(all)) {
            let budgetVal = dividBudgetRef.current.value
            if( budgetVal > 0){
              if(budgetVal <= sendAddress.length){
                setNumberOfReciept(budgetVal)
              let oldArr =[]
               oldArr = [...sendAddress];
              let newArr = [];
              for(let i = 0; i < budgetVal; i++){
                let arr = oldArr[Math.floor(Math.random() * oldArr.length)];
                let arrIndex = oldArr.indexOf(arr)
               oldArr.splice(arrIndex,1)
                newArr=[...newArr, arr];
              }
              let amount =budgetRef.current.value/ newArr.length;
              let tosendEstimateAmount = parseEther(amount.toString())

              writeContract({
                ...faucetConfig,
                functionName: 'MultiSendairdrop',
                args: [newArr, tosendEstimateAmount],
              }, {
                onSuccess: () => {
                  toast.success("Transaction confirmed")
                },
                onError: () => {
                  toast.error("Transaction failed")
                }
              })
        }else{
          toast.error("Enterd value is larger than compagin viewer")
        }
        }else{
              toast.error("Oops you forgot to enter recipient numbers")
            }
          } else {
            toast.error("The entered amount is greater than your approval amount")
          }
        } else {
          toast.error("No recipient found")
        }
      } else {
        toast.error("Looks like you forgot to enter the fields")
      }
    } catch (e) {
      toast.error("Transaction failed")
      console.log("error while send amount to addresses", e);
    }
  }
  const getUserAddress = async () => {
    try {
      if (!isConnected) {
        toast.error("No Wallet Connected");
        return;
      }
      buddySearch.current.value = address;
    } catch (e) {
      console.log("error while get user address", e);
    }
  }

  const getRefrals = async () => {
    try {
      setStoreRefral([])
      if (buddySearch.current.value <= 0) {
        toast.error("Enter Referral Address")
        setStoreRefral([])
      } else {
        let data = {
          referee: buddySearch.current.value
        }
        let res = await axios.post("https://splash-test-app.herokuapp.com/api/users/getTreeRef", data);
        if (res.data.length) {
          setStoreRefral(res.data);
        } else {
          setStoreRefral([])
          toast.error("No Referral Found")
        }
      }
    } catch (e) {
      console.log("error while get refrals", e);
    }
  }

  const changeViewer = () => {
    setIschange("Viewer");
  };
  const changeAirdrop = () => {
    setIschange("Airdrop");
  };
  const changeDirect = () => {
    setIschange("Direct");
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="images">
      <div id="faucet">
        <div className="container">
          <div className="landing-page">
            <div className="row mb-4 mt-2">
              <div className="container col-xl-12">
                <div className="home-text text-center row">
                  <div className="container">
                    <div className="row">
                      <div className="col">
                        <span className="luck-title notranslate">
                          {t("THETAP.1")}
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
                      <img src={money} alt="" width="40px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2 fst-italic" style={{ color: "#7c625a" }}>
                        {t("Available.1")}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{availabe}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>
                        {avalibleUSDT} {t("USDT.1")}
                      </p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                    <div className="price-top-part">
                      <img src={astro} alt="" width="40px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2 fst-italic" style={{ color: "#7c625a" }}>
                        {t("Deposit.1")}{" "}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{myDeposited}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>
                        {depositUSDT} {t("USDT.1")}
                      </p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center">
                    <div className="price-top-part">
                      <img src={dummy} alt="" width="40px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-2 fst-italic" style={{ color: "#7c625a" }}>
                        {t("Claimed.1")}{" "}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{totalclaimed}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>{t("Splash.1")}</p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center mt-md-4">
                    <div className="price-top-part">
                      <img src={shake} alt="" width="40px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-1 fst-italic" style={{ color: "#7c625a" }}>
                        {t("Rewarded.1")}{" "}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{directs} / {inDirects}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>
                        {t("Direct.1")} / {t("Indirect.1")}
                      </p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center mt-md-4">
                    <div className="price-top-part">
                      <img src={money} alt="" width="40px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-1 fst-italic" style={{ color: "#7c625a" }}>
                        {t("MaxPayout.1")}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{maxPayout}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>{t("Splash.1")}</p>
                    </div>
                  </div>
                  <div className="container col-6 col-xl-4 col-lg-4 col-md-4 text-center mt-md-4">
                    <div className="price-top-part">
                      <img src={user} alt="" width="40px" />
                      <h5 className="mb-0 font-weight-semibold color-theme-1 mb-2 mt-1 fst-italic" style={{ color: "#7c625a" }}>
                        {t("Team.1")}{" "}
                      </h5>
                      <p className="text-large mb-2 text-white fst-italic">
                        <span className="notranslate" style={{ color: "#ab9769", fontSize: "20px" }}>{showPlayer} / {showTotalUser}</span>
                      </p>
                      <p className="text-small fst-italic" style={{ backgroundColor: "#4e2e4b" }}>
                        {t("Players.1")} ({t("Direct.1")} / {t("Total.1")})
                      </p>
                    </div>
                  </div>
                </div>
                <p className="col-12 white mb-3 text-justify fst-italic text-white mt-md-3" style={{ fontSize: "20px" }}>
                  {" "}
                  {t(
                    "Splassive'sTheTapisalowrisk,highrewardcontractthatoperatessimilarlytoahighyieldcertificateofdepositbypayingout2%dailyreturnoninvestmentupto360%..1"
                  )}
                </p>
                <p className="col-12 white mb-3 text-justify fst-italic text-white" style={{ fontSize: "20px" }}>
                  {" "}
                  {t(
                    "Playerscancompoundandextendtheirearningsthroughdeposits,hydrating(compounding)rewardsaswellasthroughteambasedreferrals..1"
                  )}
                </p>
              </div>
              <div className="container col-12 col-xl-6 col-lg-6 col-md-6">
                <div className="row mb-2">
                  <div className="text-left col-lg-5 col-md-12">
                    <div className="priceDiv">
                      <span className="fst-italic" style={{ color: "#7c625a", fontSize: "19px" }}>
                        {t("Price.1")} {oneTokenPrice} {t("SOL.1")}/{t("Splash.1")}
                      </span>{" "}
                    </div>
                  </div>
                  <div className="actions col-lg-7 col-md-12 text-right">
                    <button
                      id="copyRefButton"
                      type="button"
                      className="btn btn-link"
                      style={{ display: "none", color: "#7c625a" }}
                    >
                      {t("CopyReferralLink.1")}!
                    </button>
                    <Link
                      style={{ color: "#7c625a", fontSize: "19px" }}
                      to="/swap" >
                      {t("GetSplash.1")}
                    </Link>
                    <a target="_blank" href="https://www.youtube.com/watch?v=TOJg308iREw" style={{ color: "#7c625a", fontSize: "19px" }}>
                      {" "}
                      {t("Tutorial.1")}
                    </a>
                  </div>
                </div>
                <div className="card text-white" style={{ backgroundColor: "#4e2e4b", color: "#dacc79", border: "2px solid #4e2e4b" }}>
                  <div className="card-body" >
                    {/* <p className="card-text"></p> */}
                    <div className="landing-page">
                      <div className="text-left">
                        <h3>
                          <span className="notranslate fst-italic">
                            <p style={{ fontSize: "20px" }}>{t("Deposit.1")}</p>
                          </span>
                        </h3>
                      </div>
                      <form>
                        <div className="form-group">
                          <div className="row">
                            <div className="col-6 text-left">
                              <label className="text-white fst-italic">
                                <p>{t("Amount.1")}</p>
                              </label>
                            </div>
                            <div className="col-6 text-right fst-italic">
                              {" "}
                              <p>
                                {t("SplashBalance.1")}:
                                <label className="user-balance text-white fst-italic">
                                  {userDripBalance}
                                </label>
                              </p>
                            </div>
                          </div>
                          <div role="group" className="input-group">
                            <input
                              ref={inputEl}
                              type="number"
                              placeholder="TIME"
                              className="form-control"
                              id="__BVID__213"
                            />
                            <button
                              type="button"
                              className="btn btn-info"
                              onClick={getMaxBal}
                              style={{
                                backgroundColor: "#86ad74",
                                border: "1px solid #86ad74",
                                fontSize: "16px"
                              }}
                            >
                              {t("Max.1")}
                            </button>
                          </div>
                          <small className="form-text text-left fst-italic">
                            <p style={{ fontSize: "13px" }}>
                              {t("Aminimumof1Splashrequiredfordeposits.1")}*
                            </p>
                          </small>
                          <small className="form-text text-left">
                            <p style={{ fontSize: "13px" }}>
                              {t("A10%taxischargedondeposits.1")}*
                            </p>
                          </small>
                        </div>
                        <div className="row justify-content-end">
                          <div className="col-12 d-flex flex-row justify-content-evenly">
                            <button
                              onClick={() => approveAmount()}
                              type="button"
                              className="btn btn-outline-light"
                            >
                              {t("Approve.1")}
                            </button>
                            <button
                              onClick={() => depositAmount()}
                              type="button"
                              className="btn btn-outline-light"
                            >
                              {t("Deposit.1")}

                            </button>
                          </div>

                        </div>
                      </form>
                    </div>
                    <p />
                  </div>
                </div>
                <p className="col-12 white mb-3"></p>
                <div>
                  <button
                    onClick={() => hydarated()}
                    style={{ color: "#7c625a", fontSize: "20px" }}
                    type="button"
                    className="btn btn-outline-light btn-block"
                  >
                    <b>{t("HYDRATE.1")}({t("recompound.1")})</b>
                  </button>
                  <button
                    style={{ color: "#7c625a", fontSize: "20px" }}
                    onClick={() => myClaim()}
                    type="button"
                    className="btn btn-outline-light btn-block"
                  >
                    <b>{t("Claim.1")}</b>
                  </button>
                </div>
                <p />
              </div>
            </div>
            <div className="row mb-4 mt-2">
              {/* Wave section commented out during rebrand
              <div className="container col-12 col-xl-6 col-lg-6 col-md-6 mb-4">
                <h2>{t("JoinTheWave.1")}</h2>
                <div className="card text-white" style={{ backgroundColor: "#4e2e4b", color: "#dacc79", border: "2px solid #4e2e4b" }}>
                  <div className="card-body">
                    <p className=" fst-italic" style={{ fontSize: "18px" }}>
                      {t("CurrentWaveStarter.1")}
                    </p>
                    <span
                      className=" fst-italic"
                      style={{
                        color: "#b8b6b6",
                        fontSize: "20px",
                        lineHeight: "30%",
                      }}
                    >
                      <b>{currentWaveStarter}</b>
                    </span>
                    <p className=" fst-italic" style={{ fontSize: "18px" }}>
                      {t("LastCheckin.1")}
                    </p>
                    <span
                      className=" fst-italic"
                      style={{
                        color: "#b8b6b6",
                        fontSize: "20px",
                        lineHeight: "30%",
                      }}
                    >
                      <b>{lastCheckin}</b>
                    </span>
                    <form className>
                      <div id="buddy-input">
                        <fieldset className="form-group" id="__BVID__216">
                          <h3>
                            <legend
                              tabIndex={-1}
                              className="bv-no-focus-ring col-form-label pt-1 fst-italic"
                              id="__BVID__216__BV_label_"
                            >
                              <p style={{ lineHeight: "40%" }}>
                                {t("WaveStarter.1")}
                              </p>
                            </legend>
                          </h3>
                          <div>
                            <input
                              ref={buddy}
                              type="text"
                              placeholder="Address"
                              className="form-control"
                              id="__BVID__217"
                            />
                          </div>
                        </fieldset>
                        <div>
                          <button
                            onClick={() => updatemyBuddy()}
                            type="button"
                            className="btn btn-outline-light Supportbutton"
                          >
                            {t("Update.1")}
                          </button>
                        </div>
                        <div>
                          <br />
                          <button
                            onClick={() => getOwnerReferral()}
                            type="button"
                            className="btn btn-outline-light Supportbutton"
                          >
                            {t("SupportMarketingandDevelopment.1")}
                          </button>
                        </div>
                      </div>
                    </form>
                    <p />
                  </div>
                </div>
              </div>
              */}
              <div className="container col-12 col-xl-6 col-lg-6 col-md-6 mb-4">
                <h2>{t("CheckoutWhoSplashed.1")}</h2>
                <div className="card text-white" style={{ backgroundColor: "#4e2e4b", color: "#dacc79", border: "2px solid #4e2e4b" }}>
                  <div className="card-body">
                    <p
                      className="card-text fst-italic"
                      style={{ fontSize: "20px" }}
                    >
                      {t("PlayerLookup.1")}
                    </p>
                    <div id="buddy-input">
                      <form className>
                        <div id="buddy-input">
                          <fieldset className="form-group" id="__BVID__216">
                            <h3>
                              <legend
                                tabIndex={-1}
                                className="bv-no-focus-ring col-form-label pt-1 fst-italic"
                                id="__BVID__216__BV_label_"
                              >
                                <p style={{ lineHeight: "40%" }}>
                                  {t("Player.1")}
                                </p>
                              </legend>
                            </h3>
                            <div>
                              <input
                                ref={addressInput}
                                type="text"
                                placeholder="Address"
                                className="form-control"
                                id="__BVID__217"
                              />
                            </div>
                          </fieldset>
                          <div>
                            <button
                              onClick={() => goPlayerinfo()}
                              type="button"
                              className="btn btn-outline-light fst-italic"
                            >
                              {t("GO.1")}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                    <p />
                    <p className="fst-italic" style={{ fontSize: "20px" }}>
                      {t("PlayerInfo.1")}
                    </p>
                    <div className="row">
                      <div className="col-6">
                        <p className="fst-italic" style={{ fontSize: "16px" }}>
                          {t("Directs.1")}
                        </p>
                      </div>
                      <div className="col-6">
                        <span
                          className="fst-italic"
                          style={{ fontSize: "16px" }}
                        >
                          {direct}
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <p className="fst-italic" style={{ fontSize: "16px" }}>
                          {t("Team.1")}
                        </p>
                      </div>
                      <div className="col-6">
                        <span
                          className="fst-italic"
                          style={{ fontSize: "16px" }}
                        >
                          {+direct + +playerTeam}
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <p className="fst-italic" style={{ fontSize: "16px" }}>
                          {t("NetDeposits.1")}
                        </p>
                      </div>
                      <div className="col-6">
                        <span
                          className="fst-italic"
                          style={{ fontSize: "16px" }}
                        >
                          {netDepppost} {t("Splash.1")}
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <p className="fst-italic" style={{ fontSize: "16px" }}>
                          {t("AirdropSent.1")} / {t("Received.1")}
                        </p>
                      </div>
                      <div className="col-6">
                        <span
                          className="fst-italic"
                          style={{ fontSize: "16px" }}
                        >
                          {Airdropsent} {t("Splash.1")}
                        </span>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-6">
                        <p className="fst-italic" style={{ fontSize: "16px" }}>
                          {t("AirdropLastSent.1")}
                        </p>
                      </div>
                      <div className="col-6">
                        <span
                          className="fst-italic"
                          style={{ fontSize: "16px" }}
                        >
                          {AirdropLastSent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="conatiner">
              <div className="row pt-4 mt-4  d-flex justify-content-center">
                <div className="col-12 mb-4 ">
                  <div className="card text-white" style={{ backgroundColor: "#4e2e4b", color: "#dacc79", border: "2px solid #4e2e4b" }}>
                    <div className="tabs" id="__BVID__241">
                      <div className="card-header">
                        <ul
                          role="tablist"
                          className="nav nav-tabs card-header-tabs"
                          id="__BVID__241__BV_tab_controls_"
                        >
                          <li>
                            <a
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                changeViewer();
                              }}
                              className="nav-link"
                            >
                              {t("TeamViewer.1")}
                            </a>
                          </li>
                          <li>
                            <a
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                changeAirdrop();
                              }}
                              className="nav-link"
                            >
                              {t("TeamAirdrop.1")}
                            </a>
                          </li>
                          <li>
                            <a
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                changeDirect();
                              }}
                              className="nav-link"
                            >
                              {t("DirectAirdrop.1")}
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div
                        className="tab-content"
                        id="__BVID__241__BV_tab_container_"
                      >
                        <div
                          role="tabpanel"
                          aria-hidden="false"
                          className="tab-pane active card-body"
                          id="__BVID__242"
                          aria-labelledby="__BVID__242___BV_tab_button__"
                        >
                          {isChange == "Viewer" ? (
                            <div className="row" id="Viewerpart">
                              <div className="col-md-6" id="buddy-input">
                                <form className>
                                  <fieldset
                                    className="form-group"
                                    id="__BVID__216"
                                  >
                                    <h3>
                                      <legend
                                        tabIndex={-1}
                                        className="bv-no-focus-ring col-form-label pt-1 fst-italic"
                                        id="__BVID__216__BV_label_"
                                      >
                                        <p style={{ lineHeight: "40%" }}>
                                          {t("Player.1")}
                                        </p>
                                      </legend>
                                    </h3>
                                    <div className="">
                                      <input
                                        type="text"
                                        placeholder="Address"
                                        className="form-control"
                                        id="__BVID__217"
                                        ref={buddySearch}
                                      />
                                    </div>
                                  </fieldset>
                                  <div className="d-flex flex-md-row flex-column justify-content-start">
                                    <button
                                      style={{ backgroundColor: "#86ad74", color: "white" }}
                                      type="button"
                                      className="btn fst-italic me-md-2 mt-2"
                                      onClick={getUserAddress}
                                    >
                                      {t("Usemyaddress.1")}
                                    </button>
                                    <button
                                      style={{ backgroundColor: "#86ad74", color: "white", border: "1px solid #86ad74" }}
                                      type="button"
                                      className="btn fst-italic mt-2"
                                      onClick={getRefrals}
                                    >
                                      {t("Viewall.1")}
                                    </button>

                                    <button
                                      style={{ backgroundColor: "#7c625a", color: "white", border: "1px solid #7c625a" }}
                                      type="button"
                                      className="btn fst-italic ml-md-3 mt-2"
                                      onClick={getRefrals}
                                    >
                                      {t("Show.1")}
                                    </button>

                                  </div>
                                </form>
                              </div>
                              <div className="col-md-5 col-12 ml-md-auto mt-md-1 mt-3" style={{ backgroundColor: "#86ad74", overflowY: "scroll", height: "170px", dispaly: "flex", justifyContent: "center" }}>
                                {
                                  storeRefarl.map((item) => {
                                    return <>{item}
                                      <br />
                                    </>
                                  })
                                }

                              </div>


                            </div>
                          ) : isChange == "Airdrop" ? (
                            <div>
                              <form className>
                                <div id="buddy-input">
                                  <fieldset
                                    className="form-group"
                                    id="__BVID__216"
                                  >
                                    <h3>
                                      <legend
                                        tabIndex={-1}
                                        className="bv-no-focus-ring col-form-label pt-1 fst-italic"
                                        id="__BVID__216__BV_label_"
                                      >
                                        <p style={{ lineHeight: "40%" }}>
                                          {t("Player.1")}
                                        </p>
                                      </legend>
                                    </h3>
                                    <div>
                                      <input
                                        type="text"
                                        placeholder="Address"
                                        className="form-control"
                                        id="__BVID__217"
                                        ref={airDropPlayerAddress}
                                      />
                                    </div>
                                  </fieldset>
                                  <div className="d-flex justify-content-end">
                                    <button
                                      style={{ backgroundColor: "#86ad74", color: "white", border: "1px solid #86ad74" }}
                                      type="button"
                                      className="btn fst-italic"
                                      onClick={getUserAirDropAddress}
                                    >
                                      {t("Usemyaddress.1")}
                                    </button>
                                  </div>
                                </div>
                              </form>
                              <form className>
                                <div id="buddy-input">
                                  <fieldset
                                    className="form-group"
                                    id="__BVID__216"
                                  >
                                    <h3>
                                      <legend
                                        tabIndex={-1}
                                        className="bv-no-focus-ring col-form-label pt-1 fst-italic"
                                        id="__BVID__216__BV_label_"
                                      >
                                        <p style={{ lineHeight: "40%" }}>
                                          {t("Campaign.1")}
                                        </p>
                                      </legend>
                                    </h3>
                                    <div className="row">
                                      <div className="col-md-12">
                                        <form className="">
                                          <div class="select-wrapper ">
                                            <select class="select form-control"
                                              onChange={(e) => {
                                                setCheckCompaign(e.target.value)
                                              }}
                                            >
                                              <option value="0">
                                                {t(
                                                  "Dividebudgetbetweenmatchingplayers.1"
                                                )}
                                              </option>
                                              <option value="1">
                                                {t(
                                                  "Rewardsbudgettoonematchingplayer.1"
                                                )}{" "}
                                                *
                                              </option>
                                              <option value="5">
                                                {t(
                                                  "Dividedbudgetacross5matchingplayers.1"
                                                )}{" "}
                                                *
                                              </option>
                                              <option value="20">
                                                {t(
                                                  "Dividedbudgetacross20matchingplayers.1"
                                                )}{" "}
                                                *
                                              </option>
                                              <option value="50">
                                                {t(
                                                  "Dividedbudgetacross50matchingplayers.1"
                                                )}{" "}
                                                *
                                              </option>
                                              <option value="100">
                                                {t(
                                                  "Dividedbudgetacross100matchingplayers.1"
                                                )}{" "}
                                                *
                                              </option>
                                            </select>
                                          </div>
                                        </form>
                                      </div>
                                    </div>
                                    <small className="fst-italic">
                                      *{" "}
                                      {t(
                                        "Eligiblematchingplayersselectedatrandom.1"
                                      )}
                                    </small>
                                  </fieldset>
                                </div>
                              </form>
                              <div className="row ">
                                <div className="col-md-3 mt-3">
                                  <p
                                    className="fst-italic"
                                    style={{ lineHeight: "40%" }}
                                  >
                                    {t("Minimumdirects.1")}
                                  </p>
                                  <form className="">
                                    <div class="select-wrapper ">
                                      <select class="select form-control fst-italic"
                                        onChange={(e) => {
                                          setCheckDirects(e.target.value)
                                        }}
                                      >
                                        <option value="0">
                                          {t("None.1")}
                                        </option>
                                        <option value="1">1</option>
                                        <option value="5">5</option>
                                        <option value="15">15</option>
                                      </select>
                                    </div>
                                  </form>
                                </div>

                                <div className="col-md-3 mt-3">
                                  <p
                                    className="fst-italic"
                                    style={{ lineHeight: "40%" }}
                                  >
                                    {t("Minimumnetdeposits.1")}
                                  </p>
                                  <form className="">
                                    <div class="select-wrapper ">
                                      <select class="select form-control fst-italic"
                                        onChange={(e) => {
                                          setCheckSplash(e.target.value)
                                        }}
                                      >
                                        <option value="1">
                                          1+ {t("Splash.1")}
                                        </option>
                                        <option value="25">
                                          25+ {t("Splash.1")}
                                        </option>
                                        <option value="50">
                                          50+ {t("Splash.1")}
                                        </option>
                                        <option value="100">
                                          100+ {t("Splash.1")}
                                        </option>
                                        <option value="250">
                                          250+ {t("Splash.1")}
                                        </option>
                                        <option value="500">
                                          500+ {t("Splash.1")}
                                        </option>
                                        <option value="1000">
                                          1000+ {t("Splash.1")}
                                        </option>
                                        <option value="2000">
                                          2000+ {t("Splash.1")}
                                        </option>
                                      </select>
                                    </div>
                                  </form>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-md-6 mt-4">
                                  <fieldset
                                    className="form-group"
                                    id="__BVID__216"
                                  >
                                    <h3>
                                      <legend
                                        tabIndex={-1}
                                        className="bv-no-focus-ring col-form-label pt-1 fst-italic"
                                        id="__BVID__216__BV_label_"
                                      >
                                        <p style={{ lineHeight: "40%" }}>
                                          {t("Budget.1")}
                                        </p>
                                      </legend>
                                    </h3>
                                    <div>
                                      <input
                                        type="text"
                                        placeholder="0"
                                        className="form-control"
                                        id="__BVID__217"
                                        ref={budgetRef}
                                      />
                                    </div>
                                  </fieldset>
                                  <div>
                                    <button
                                      style={{ backgroundColor: "#86ad74", color: "white", border: "1px solid #86ad74" }}
                                      type="button"
                                      className="btn fst-italic"
                                      onClick={runTeamDrop}
                                    >
                                      {t("RUN.1")}
                                    </button>
                                  </div>
                                </div>
                                <div className="col-md-6 mt-4 lh-base">
                                  <p
                                    className="text-end"
                                    style={{ lineHeight: "30%" }}
                                  >
                                    {t("Available.1")}:
                                    <label className="user-balance text-white fst-italic">
                                      {userDripBalance} {t("Splash.1")}
                                    </label>
                                  </p>
                                  <p
                                    className="text-end"
                                    style={{ lineHeight: "30%" }}
                                  >
                                    {t("Numberofrecipients.1")}:
                                    <label className="user-balance text-white fst-italic">
                                      {numberOfReciept}
                                    </label>
                                  </p>
                                  <p
                                    className="text-end"
                                    style={{ lineHeight: "30%" }}
                                  >
                                    {t("EstimatedSplashperperson.1")}:
                                    <label className="user-balance text-white fst-italic">
                                      {estimatePerPerson}
                                    </label>
                                  </p>
                                  <div className="row d-flex justify-content-end" >
                                  <div className="col-md-8 ">
                                  <fieldset
                                    className="form-group"
                                    id="__BVID__216"
                                  >
                                    <h3>
                                      <legend
                                        tabIndex={-1}
                                        className="bv-no-focus-ring col-form-label pt-1 fst-italic"
                                        id="__BVID__216__BV_label_"
                                      >
                                        <p style={{ lineHeight: "40%" }}>

                                          {t("SelectRandomAddressess.1")}
                                        </p>
                                      </legend>
                                    </h3>
                                    <div>
                                      <input
                                        type="text"
                                        placeholder="0"
                                        className="form-control"
                                        id="__BVID__217"
                                        ref={dividBudgetRef}
                                        onChange={changeResAmount}
                                      />
                                    </div>
                                  </fieldset>
                                    </div>
                                    </div>
                                  <div
                                    className="d-flex justify-content-end"
                                    style={{ lineHeight: "30%" }}
                                  >
                                    <button
                                      style={{ backgroundColor: "#86ad74", color: "white", border: "1px solid #86ad74" }}
                                      type="button"
                                      className="btn fst-italic me-2"
                                      onClick={aproveafterRunAmount}
                                    >
                                      {t("Approve.1")}{" "}
                                    </button>
                                    <button
                                      style={{ backgroundColor: "#86ad74", color: "white", border: "1px solid #86ad74" }}
                                      type="button"
                                      className="btn fst-italic "
                                      onClick={sendAmount}
                                    >
                                      {t("SEND.1")}{" "}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <hr />
                              <div className="row">
                                <div className="col-md-5">
                                  <h3>
                                    <p
                                      style={{
                                        lineHeight: "40%",
                                        fontSize: "20px",
                                      }}
                                    >
                                      {t("CampaignConsole.1")}
                                    </p>
                                    {/* </legend> */}
                                  </h3>
                                  <div
                                    readonly="yes"
                                    className="textarea mt-2 text-center"
                                  >
                                    {
                                      showCompaign.map((item) => {
                                        return (
                                          <table >
                                            <tr>
                                              <td>{item.address.substring(0, 12) + "....." + item.address.substring(item.address.length - 12)}</td>
                                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                              <td>{parseFloat(item.amount).toFixed(2)}</td>
                                            </tr>
                                          </table>
                                        )
                                      })
                                    }

                                  </div>
                                </div>
                                <div className="col-md-7">
                                  <h3>
                                    <legend
                                      tabIndex={-1}
                                      className="bv-no-focus-ring col-form-label pt-1 fst-italic"
                                      id="__BVID__216__BV_label_"
                                    >
                                      <p
                                        style={{
                                          lineHeight: "40%",
                                          fontSize: "20px",
                                        }}
                                      >
                                        {t("CampaignViewer.1")}
                                      </p>
                                    </legend>
                                  </h3>
                                  <div className="row my-custom-scrollbar" responsive="sm">
                                    <div className="col-10">

                                      <Table className="table table-borderless">
                                        <thead>
                                          <tr>
                                            <th><p className="fatchtable">{t("Address.1")}</p></th>
                                            <th><p className="fatchtable">{t("Directs.1")}</p></th>
                                            <th><p className="fatchtable">{t("Deposits.1")}</p></th>
                                          </tr>
                                        </thead>

                                        <tbody>
                                          {
                                            showCompaign.map((item) => {
                                              return (
                                                <tr>
                                                  <th><p className="fatchtable">{item.address.substring(0, 3) + "..." + item.address.substring(item.address.length - 3)}</p></th>
                                                  <th><p className="fatchtable">{item.directs}</p></th>
                                                  <th><p className="fatchtable">{item.deposits}</p></th>
                                                </tr>
                                              )
                                            })
                                          }
                                        </tbody>
                                      </Table>
                                    </div>
                                    <div className="col-2 statuscss ">
                                      <Table className="table table-borderless">
                                        <thead>
                                          <tr>
                                            <th><p className="fatchtable">{t("Status.1")}</p></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {
                                            showTeamStatus.map((item) => {
                                              return (
                                                <tr>

                                                  <th><p className="fatchtable">{item.value === true ? "Active" : "InActive"}</p></th>

                                                </tr>
                                              )
                                            })
                                          }


                                        </tbody>
                                      </Table>

                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : isChange == "Direct" ? (
                            <div id="Airdroppart">
                              <p
                                className="card-text fst-italic"
                                style={{ fontSize: "25px" }}
                              >
                                {t("DirectAirdrop.1")}
                              </p>
                              <div id="buddy-input">
                                <form className>
                                  <div id="buddy-input">
                                    <fieldset
                                      className="form-group"
                                      id="__BVID__216"
                                    >
                                      <h3>
                                        <legend
                                          tabIndex={-1}
                                          className="bv-no-focus-ring col-form-label pt-1 fst-italic"
                                          id="__BVID__216__BV_label_"
                                        >
                                          <p style={{ lineHeight: "40%" }}>
                                            {t("Player.1")}
                                          </p>
                                        </legend>
                                      </h3>
                                      <div>
                                        <input

                                          type="text"
                                          placeholder="Address"
                                          ref={airAddress}
                                          className="form-control"
                                          id="__BVID__217"
                                        />
                                      </div>
                                    </fieldset>
                                  </div>
                                </form>
                              </div>
                              <div className="form-group">
                                <div className="row">
                                  <div className="col-6 text-left">
                                    <label className="text-white fst-italic">
                                      <p style={{ lineHHeight: "30%" }}>
                                        {t("Amount.1")}
                                      </p>
                                    </label>
                                  </div>
                                  <div className="col-6 text-right fst-italic">
                                    {" "}
                                    <p style={{ lineHHeight: "30%" }}>
                                      {t("Available.1")}:
                                      <label className="user-balance text-white fst-italic">
                                        {userDripBalance}
                                      </label>
                                    </p>
                                  </div>
                                </div>
                                <div
                                  role="group"
                                  className="input-group"
                                  style={{ lineHHeight: "30%" }}
                                >
                                  <input
                                    type="number"
                                    placeholder="TIME"
                                    ref={airAmount}
                                    className="form-control"
                                    id="__BVID__213"
                                  />
                                </div>
                              </div>
                              <div>
                                <button

                                  onClick={() => directAirDrop()}
                                  style={{ backgroundColor: "#86ad74", color: "white", border: "1px solid #86ad74" }}
                                  type="button"
                                  className="btn fst-italic"
                                >
                                  {t("SEND.1")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="container col-12">
              <div className="row mb-4 mt-2">
                <h2 className="text-white">{t("About.1")}</h2>
                <p className="text-white fst-italic" style={{ fontSize: "20px" }}>
                  {t(
                    "AboutParagraph1.1"
                  )}
                </p>
                <p id="referral" />
                <p className="text-white fst-italic" style={{ fontSize: "20px" }}>
                  {t(
                    "AboutParagraph2.1"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div>
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
        </div> */}
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
};

export default Facuet;
