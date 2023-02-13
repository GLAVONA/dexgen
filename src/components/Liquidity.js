import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Select from "./Select";
import tokenData from "../data/options.json";

import { CustomConnect } from "./CustomConnect";
import "@rainbow-me/rainbowkit/styles.css";
import SettingsModal from "./SettingsModal";
import CurrencyInput from "react-currency-input-field";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { Link } from "react-router-dom";

const WAVAXABI = ["function deposit () payable", "function withdraw(uint256)"];
const FACTORY_ABI = require("../data/FactoryABI.json");
const ERC20ABI = require("../data/ERC20.json");

const Liquidity = ({
  provider,
  routerContractWithWallet,
  WAVAX_ADDY,
  signer,
  routerAddress,
  setMode,
  factoryAddress,
  factoryContractWithWallet,
  TJFactoryContractWithWallet,
  _0xAPI_URL,
  _0X_ADDRESS,
}) => {
  const [tokenBalance1, setTokenBalance1] = useState();
  const [tokenBalance2, setTokenBalance2] = useState();
  const [currentAccount, setCurrentAccount] = useState();
  const [select1, setSelect1] = useState();
  const [select2, setSelect2] = useState();
  const [optionsState, setOptionsState] = useState(tokenData.tokens);
  const [connected, setConnected] = useState();
  const [value1, setValue1] = useState();
  const [value2, setValue2] = useState();
  const [minVal, setMinval] = useState();
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(ethers.utils.parseUnits("30"));
  const [fromTokenOne, setFromTokenOne] = useState();
  const [allowanceState, setAllowanceState] = useState(false);
  const [lpAllowanceState, setLpAllowanceState] = useState(false);
  const [rightNetwork, setRightNetwork] = useState();
  const [liqMode, setLiqMode] = useState("add");
  const [liqValue, setLiqValue] = useState();
  const [liqBalance, setLiqBalance] = useState();

  const factoryContract = new ethers.Contract(
    factoryAddress,
    FACTORY_ABI,
    provider
  );

  const getQuote = async () => {
    if (select1 && select2) {
      const contract1 = new ethers.Contract(
        select1.addy === "AVAX" ? WAVAX_ADDY : select1.addy,
        ERC20ABI,
        provider
      );
      const contract1Decimals = await contract1.decimals();
      const contract2 = new ethers.Contract(
        select2.addy === "AVAX" ? WAVAX_ADDY : select2.addy,
        ERC20ABI,
        provider
      );
      const contract2Decimals = await contract2.decimals();

      if (
        (select1.addy === "AVAX" && select2.addy === WAVAX_ADDY) ||
        (select1.addy === WAVAX_ADDY && select2.addy === "AVAX")
      ) {
        if (fromTokenOne) {
          setValue2(value1);
        }
        if (!fromTokenOne) {
          setValue1(value2);
        }
        return;
      }

      if (fromTokenOne) {
        const val2 = value2 - (value2 * slippage) / 100;
        setMinval(ethers.utils.parseUnits(val2.toString(), contract2Decimals));
      }

      if (!fromTokenOne) {
        setMinval(
          ethers.utils.parseUnits(value2.toString(), contract2Decimals)
        );
      }

      if (select1.addy !== "AVAX") {
        checkAllowance();
      }

      let addyFrom = select1.addy;
      let addyTo = select2.addy;
      if (select1.addy === "AVAX") {
        addyFrom = WAVAX_ADDY;
      }
      if (select2.addy === "AVAX") {
        addyTo = WAVAX_ADDY;
      }

      let addys = [addyFrom, addyTo];
      if (fromTokenOne && value1 !== "") {
        try {
          const value1wei = parseUnits(value1.toString(), contract1Decimals);
          let arrayOut = await routerContractWithWallet.getAmountsOut(
            value1wei,
            addys
          );
          const tokenOut = formatUnits(arrayOut[arrayOut.length - 1]);
          if (tokenOut) {
            setValue2(tokenOut.toString());
          }
        } catch (error) {
          setValue2("");
          throw new Error(error);
        }
      }

      if (!fromTokenOne && value2 !== "") {
        try {
          const value2wei = parseUnits(value2.toString(), contract2Decimals);

          let arrayOut = await routerContractWithWallet.getAmountsIn(
            value2wei,
            addys
          );
          const tokenOut = formatUnits(arrayOut[0], contract1Decimals);
          if (tokenOut) {
            setValue1(tokenOut.toString());
          }
        } catch (error) {
          setValue1("");
          throw new Error(error);
        }
      }
    }
  };

  const addLiquidityAVAX = async () => {
    let tokenAddy;
    let tokenDesired;
    let avaxAmount;
    let amountTokenMin = 0;
    let amountAvaxMin = 0;
    let decimals = 0;

    if (select1.addy === "AVAX") {
      avaxAmount = value1;
      tokenAddy = select2.addy;
      const contract2 = new ethers.Contract(
        select2.addy === "AVAX" ? WAVAX_ADDY : select2.addy,
        ERC20ABI,
        provider
      );
      decimals = await contract2.decimals();
      tokenDesired = ethers.utils.parseUnits(value2.toString(), decimals);
    } else if (select2.addy === "AVAX") {
      avaxAmount = value2;
      tokenAddy = select1.addy;
      const contract1 = new ethers.Contract(
        select1.addy === "AVAX" ? WAVAX_ADDY : select1.addy,
        ERC20ABI,
        provider
      );
      decimals = await contract1.decimals();
      tokenDesired = ethers.utils.parseUnits(value1.toString(), decimals);
    } else {
      alert("Please only add liquidity to AVAX pairs");
      return;
    }
    const tx = await routerContractWithWallet.addLiquidityAVAX(
      tokenAddy,
      tokenDesired,
      amountTokenMin,
      amountAvaxMin,
      signer.getAddress(),
      deadline,
      {
        value: ethers.utils.parseUnits(avaxAmount),
        gasLimit: 1000000,
      }
    );
    const txComplete = await provider.waitForTransaction(tx.hash);
    if (txComplete) {
      updateTokenBalance();
    }
  };

  const removeLiquidityAvax = async () => {
    let tokenAddy;
    let lpAmount = ethers.utils.parseUnits(liqValue);
    let amountTokenMin = 0;
    let amountAvaxMin = 0;
    // removeLiquidityAVAXSupportingFeeOnTransferTokens

    if (select1.addy === "AVAX") {
      tokenAddy = select2.addy;
    } else if (select2.addy === "AVAX") {
      tokenAddy = select1.addy;
    }

    const tx =
      await routerContractWithWallet.removeLiquidityAVAXSupportingFeeOnTransferTokens(
        tokenAddy,
        lpAmount,
        amountTokenMin,
        amountAvaxMin,
        signer.getAddress(),
        deadline
      );
    const txComplete = await provider.waitForTransaction(tx.hash);
    if (txComplete) {
      updateTokenBalance();
    }
  };

  useEffect(() => {
    setSelect1(optionsState[0]);
    listAccounts();
    getCoinBalance();
    setMode("liq");
  }, []);

  useEffect(() => {
    getQuote();
    getLPBalance();
    checkAllowance();
  }, [value1, value2, select1, select2, liqValue]);

  const getCoinBalance = async () => {
    const coinBalance = await provider.getBalance(currentAccount);
    const normalizeNumber = ethers.utils.formatEther(coinBalance);
    return normalizeNumber;
  };

  const getTokenBalance = async (addy) => {
    try {
      const token = new ethers.Contract(addy, ERC20ABI, provider);
      const tokenBalance = await token.balanceOf(currentAccount);
      return ethers.utils.formatEther(tokenBalance);
    } catch (error) {
      throw new Error(error);
    }
  };

  const updateTokenBalance = async () => {
    try {
      let bal1, bal2;
      if (select1.addy === "AVAX") {
        bal1 = await getCoinBalance();
      } else {
        bal1 = await getTokenBalance(select1.addy);
      }
      if (select2.addy === "AVAX") {
        bal2 = await getCoinBalance();
      } else {
        bal2 = await getTokenBalance(select2.addy);
      }
      setTokenBalance1(bal1);
      setTokenBalance2(bal2);
      getLPBalance();
    } catch (error) {
      throw new Error(error);
    }
  };

  const approveToken = async () => {
    const contract1 = new ethers.Contract(
      select1.addy === "AVAX" ? WAVAX_ADDY : select1.addy,
      ERC20ABI,
      provider
    );
    if (select1.addy !== "AVAX") {
      const contractWithWallet = contract1.connect(signer);
      const tx = await contractWithWallet.approve(
        routerAddress,
        contract1.totalSupply()
      );
      const txComplete = await provider.waitForTransaction(tx.hash);
      if (txComplete) {
        checkAllowance();
      }
    }
  };

  const approveLPToken = async () => {
    const LPContract = new ethers.Contract(getLPAddy(), ERC20ABI, provider);
    const contractWithWallet = LPContract.connect(signer);
    const tx = await contractWithWallet.approve(
      routerAddress,
      ethers.utils.parseUnits(liqValue)
    );
    const txComplete = await provider.waitForTransaction(tx.hash);
    if (txComplete) {
      checkAllowance();
    }
  };

  const listAccounts = async () => {
    const accounts = await provider.listAccounts();
    try {
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  const checkAllowance = async () => {
    if (select1.addy === "AVAX") {
      const contract2 = new ethers.Contract(select2.addy, ERC20ABI, provider);
      const allowance = await contract2.allowance(
        signer.getAddress(),
        routerAddress
      );
      const totalSupply = await contract2.totalSupply();
      if (allowance < totalSupply || allowance === 0) {
        setAllowanceState(false);
      } else {
        setAllowanceState(true);
      }
    }

    if (select2.addy === "AVAX") {
      const contract1 = new ethers.Contract(select1.addy, ERC20ABI, provider);
      const allowance = await contract1.allowance(
        signer.getAddress(),
        routerAddress
      );
      const totalSupply = await contract1.totalSupply();
      if (allowance < totalSupply || allowance === 0) {
        setAllowanceState(false);
      } else {
        setAllowanceState(true);
      }
    }
    if (liqMode === "remove") {
      const LPContract = new ethers.Contract(getLPAddy(), ERC20ABI, provider);
      const allowance = await LPContract.allowance(
        signer.getAddress(),
        routerAddress
      );
      if (ethers.utils.formatUnits(allowance) < liqValue || allowance === 0) {
        setLpAllowanceState(false);
      } else {
        setLpAllowanceState(true);
      }
    }
  };

  const getLPAddy = async () => {
    const LPAddy = await factoryContract.getPair(
      select1.addy === "AVAX" ? WAVAX_ADDY : select1.addy,
      select2.addy === "AVAX" ? WAVAX_ADDY : select2.addy
    );
    return LPAddy;
  };

  const getLPBalance = async () => {
    const LPContract = new ethers.Contract(getLPAddy(), ERC20ABI, provider);
    const LPBalance = await LPContract.balanceOf(currentAccount);
    const formattedVal = ethers.utils.formatUnits(LPBalance);
    setLiqBalance(formattedVal);
  };

  useEffect(() => {
    if (!currentAccount || !select1) return;
    const fetchData = async () => {
      if (select1.addy === "AVAX") {
        const coinBalance = await getCoinBalance();
        setTokenBalance1(coinBalance);
        return;
      } else {
        const contr = new ethers.Contract(
          select1.addy === "AVAX" ? WAVAX_ADDY : select1.addy,
          ERC20ABI,
          provider
        );
      }
      const result = await getTokenBalance(select1.addy);
      setTokenBalance1(result);
      setValue1("");
    };
    checkAllowance();
    fetchData();
  }, [currentAccount, select1]);

  useEffect(() => {
    if (!currentAccount || !select2) return;
    const fetchData = async () => {
      if (select2.addy === "AVAX") {
        const coinBalance = await getCoinBalance();
        setTokenBalance2(coinBalance);
        return;
      } else {
        const contr = new ethers.Contract(
          select2.addy === "AVAX" ? WAVAX_ADDY : select2.addy,
          ERC20ABI,
          provider
        );
      }
      const result = await getTokenBalance(select2.addy);
      setTokenBalance2(result);
      setValue2("");
    };
    fetchData();
  }, [currentAccount, select2]);

  let style = {
    input: (styles) => ({
      ...styles,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "60px",
      gap: "8px",
      cursor: "grab",
    }),
    control: (styles) => ({
      ...styles,
      border: "none",
      boxShadow: "none",
    }),
    indicatorsContainer: (styles) => ({
      ...styles,
      cursor: "grab",
    }),
    valueContainer: (styles) => ({
      ...styles,
      cursor: "grab",
    }),
    singleValue: (styles) => ({
      ...styles,
      cursor: "grab",
    }),
    menu: (styles) => ({
      ...styles,
      zIndex: "30",
      width: "300px",
    }),
    container: (styles) => ({
      ...styles,
    }),
  };

  const handleMax1 = (e) => {
    if (e.target.textContent !== 0) {
      setValue1(tokenBalance1);
      setFromTokenOne(true);
    }
  };

  const handleMax2 = (e) => {
    if (e.target.textContent !== 0) {
      setValue2(tokenBalance2);
      setFromTokenOne(false);
    }
  };

  const handleLiqMax = (e) => {
    if (e.target.textContent !== 0) {
      setLiqValue(liqBalance);
    }
  };

  return (
    <div id="liq-card">
      <div className="head">
        <div id="choose-liq-mode">
          <div className="wrapper">
            <div
              className={`add-mode ${liqMode === "add" ? "active" : null}`}
              onClick={() => setLiqMode("add")}
            >
              Add
            </div>
            <div
              className={`remove-mode ${
                liqMode === "remove" ? "active" : null
              }`}
              onClick={() => setLiqMode("remove")}
            >
              Remove
            </div>
          </div>
        </div>
      </div>
      {liqMode === "add" ? (
        <div className="body-add">
          <div id="select-fields-liq">
            <div className="select-field">
              <Select
                options={
                  select2
                    ? optionsState.filter(
                        (option) => option.addy !== select2.addy
                      )
                    : optionsState
                }
                select={select1}
                setSelect={setSelect1}
                optionsState={optionsState}
                setOptionsState={setOptionsState}
                styles={{
                  ...style,
                  container: (styles) => ({
                    ...styles,
                    border: select2 && !select1 ? "1px solid red" : null,
                  }),
                }}
              >
                <div
                  className="balance"
                  onClick={(e) => {
                    handleMax1(e);
                  }}
                >
                  <span className="max-balance">Balance:</span>
                  {select1 && tokenBalance1 > 0
                    ? Number(tokenBalance1).toFixed(5)
                    : 0}
                </div>
                <span id="from">Token 1:</span>
              </Select>
              <CurrencyInput
                decimalsLimit={18}
                allowNegativeValue={false}
                onValueChange={(e) => {
                  setValue1(e);
                }}
                onKeyDown={() => setFromTokenOne(true)}
                className="amount-input"
                placeholder="0.0"
                value={value1}
              />
            </div>

            <div className="select-field">
              <Select
                options={
                  select1
                    ? optionsState.filter(
                        (option) => option.addy !== select1.addy
                      )
                    : optionsState
                }
                select={select2}
                setSelect={setSelect2}
                optionsState={optionsState}
                setOptionsState={setOptionsState}
                styles={{
                  ...style,
                  container: (styles) => ({
                    ...styles,
                    border:
                      select1 && value1 && !select2 ? "1px solid red" : null,
                  }),
                }}
              >
                {" "}
                <div
                  className="balance"
                  onClick={(e) => {
                    handleMax2(e);
                  }}
                >
                  <span className="max-balance">Balance:</span>
                  {select2 && tokenBalance2 > 0
                    ? Number(tokenBalance2).toFixed(5)
                    : 0}
                </div>{" "}
                <span id="to">Token 2:</span>
              </Select>
              <CurrencyInput
                decimalsLimit={18}
                allowNegativeValue={false}
                onValueChange={async (e) => {
                  setValue2(e);
                }}
                onKeyDown={() => setFromTokenOne(false)}
                className="amount-input"
                placeholder="0.0"
                value={value2}
                disabled={select2 ? false : true}
              />
            </div>
          </div>
          <div id="min-val">
            Min:{" "}
            {minVal
              ? parseFloat(ethers.utils.formatUnits(minVal)).toFixed(5)
              : 0.0}
          </div>
          <CustomConnect
            setConnected={setConnected}
            setRightNetwork={setRightNetwork}
          ></CustomConnect>
          {rightNetwork && connected && allowanceState && select2 && select1 ? (
            <button id="swap" onClick={() => addLiquidityAVAX()}>
              Add Liquidity
            </button>
          ) : null}
          {rightNetwork &&
          connected &&
          !allowanceState &&
          select1 &&
          select2 ? (
            <button id="swap" onClick={() => approveToken()}>
              Approve {select1.addy === "AVAX" ? select2.label : select1.label}
            </button>
          ) : null}
          {rightNetwork && connected && (!select1 || !select2) ? (
            <button id="swap-disabled">Add Liquidity</button>
          ) : null}
          {}
        </div>
      ) : null}
      {liqMode === "remove" ? (
        <div className="body-remove">
          <Select
            options={
              select2
                ? optionsState.filter((option) => option.addy !== select2.addy)
                : optionsState
            }
            select={select1}
            setSelect={setSelect1}
            optionsState={optionsState}
            setOptionsState={setOptionsState}
            styles={{
              ...style,
              container: (styles) => ({
                ...styles,
                border:
                  select2 && !select1
                    ? "1px solid red"
                    : "1px solid rgb(237, 238, 242)",
              }),
            }}
          ></Select>
          <Select
            options={
              select1
                ? optionsState.filter((option) => option.addy !== select1.addy)
                : optionsState
            }
            select={select2}
            setSelect={setSelect2}
            optionsState={optionsState}
            setOptionsState={setOptionsState}
            styles={{
              ...style,
              container: (styles) => ({
                ...styles,
                border:
                  select1 && !select2
                    ? "1px solid red"
                    : "1px solid rgb(237, 238, 242)",
              }),
            }}
          ></Select>
          <div
            className="lp-balance"
            onClick={(e) => {
              handleLiqMax(e);
            }}
          >
            <span className="max-balance">Balance:</span>
            {select1 && select2 && liqBalance > 0
              ? Number(liqBalance).toFixed(5)
              : 0}
          </div>
          <CurrencyInput
            decimalsLimit={18}
            allowNegativeValue={false}
            onValueChange={async (e) => {
              setLiqValue(e);
            }}
            className="liq-input"
            placeholder="0.0"
            value={liqValue}
            disabled={select2 && select1 ? false : true}
          />
          <CustomConnect
            setConnected={setConnected}
            setRightNetwork={setRightNetwork}
          ></CustomConnect>
          {rightNetwork &&
          connected &&
          allowanceState &&
          select2 &&
          select1 &&
          liqMode === "add" ? (
            <button id="swap" onClick={() => addLiquidityAVAX()}>
              Add Liquidity
            </button>
          ) : null}
          {rightNetwork &&
          connected &&
          lpAllowanceState &&
          select2 &&
          select1 &&
          liqMode === "remove" ? (
            <button id="swap" onClick={() => removeLiquidityAvax()}>
              Remove Liquidity
            </button>
          ) : null}
          {rightNetwork &&
          connected &&
          !lpAllowanceState &&
          select1 &&
          select2 ? (
            <button id="swap" onClick={() => approveLPToken()}>
              Approve DLP
            </button>
          ) : null}
          {rightNetwork &&
          connected &&
          (!select1 || !select2) &&
          liqMode === "add" ? (
            <button id="swap-disabled">Add Liquidity</button>
          ) : null}
          {rightNetwork &&
          connected &&
          (!select1 || !select2) &&
          liqMode === "remove" ? (
            <button id="swap-disabled">Remove Liquidity</button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
export default Liquidity;
