import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Select from "./Select";
import tokenData from "../data/options.json";

import { CustomConnect } from "./CustomConnect";
import "@rainbow-me/rainbowkit/styles.css";
import SettingsModal from "./SettingsModal";
import CurrencyInput from "react-currency-input-field";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";

const WAVAXABI = ["function deposit () payable", "function withdraw(uint256)"];
const ERC20ABI = require("../data/ERC20.json");

const Swap = ({
  provider,
  routerContractWithWallet,
  WAVAX_address,
  signer,
  routerAddress,
  setMode,
}) => {
  const [tokenBalance1, setTokenBalance1] = useState();
  const [tokenBalance2, setTokenBalance2] = useState();
  const [currentAccount, setCurrentAccount] = useState();
  const [select1, setSelect1] = useState();
  const [select2, setSelect2] = useState();
  const [optionsState, setOptionsState] = useState(tokenData.tokens);
  const [connected, setConnected] = useState();
  const [showSettings, setShowSettings] = useState(false);
  const [value1, setValue1] = useState();
  const [value2, setValue2] = useState();
  const [minVal, setMinval] = useState();
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(ethers.utils.parseUnits("30"));
  const [fromTokenOne, setFromTokenOne] = useState();
  const [rightNetwork, setRightNetwork] = useState();
  const [allowanceState, setAllowanceState] = useState();

  const getQuote = async () => {
    if (select1 && select2) {
      const contract1 = new ethers.Contract(
        select1.address === "AVAX" ? WAVAX_address : select1.address,
        ERC20ABI,
        provider
      );
      const contract1Decimals = await contract1.decimals();
      const contract2 = new ethers.Contract(
        select2.address === "AVAX" ? WAVAX_address : select2.address,
        ERC20ABI,
        provider
      );
      const contract2Decimals = await contract2.decimals();

      if (
        (select1.address === "AVAX" && select2.address === WAVAX_address) ||
        (select1.address === WAVAX_address && select2.address === "AVAX")
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
        let val2 = value2 - (value2 * slippage) / 100;
        val2 = val2.toFixed(contract2Decimals);
        setMinval(ethers.utils.parseUnits(val2.toString(), contract2Decimals));
      }

      if (!fromTokenOne) {
        setMinval(
          ethers.utils.parseUnits(value2.toString(), contract2Decimals)
        );
      }

      if (select1.address !== "AVAX") {
        checkAllowance();
      }

      let addressFrom = select1.address;
      let addressTo = select2.address;
      if (select1.address === "AVAX") {
        addressFrom = WAVAX_address;
      }
      if (select2.address === "AVAX") {
        addressTo = WAVAX_address;
      }

      let addresss = [addressFrom, addressTo];
      if (fromTokenOne && value1 !== "") {
        try {
          const value1wei = ethers.utils.parseUnits(
            value1.toString(),
            contract1Decimals
          );
          let arrayOut = await routerContractWithWallet.getAmountsOut(
            value1wei,
            addresss
          );
          const tokenOut = ethers.utils.formatUnits(
            arrayOut[arrayOut.length - 1]
          );
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
          const value2wei = ethers.utils.parseUnits(
            value2.toString(),
            contract2Decimals
          );

          let arrayOut = await routerContractWithWallet.getAmountsIn(
            value2wei,
            addresss
          );
          const tokenOut = ethers.utils.formatUnits(
            arrayOut[0],
            contract1Decimals
          );
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

  const swap = async () => {
    if (select1 && select2) {
      let addressFrom = select1.address;
      let addressTo = select2.address;
      if (select1.address === "AVAX") {
        addressFrom = WAVAX_address;
      }
      if (select2.address === "AVAX") {
        addressTo = WAVAX_address;
      }

      const contract1 = new ethers.Contract(
        select1.address === "AVAX" ? WAVAX_address : select1.address,
        ERC20ABI,
        provider
      );
      const contract1Decimals = await contract1.decimals();
      const contract2 = new ethers.Contract(
        select2.address === "AVAX" ? WAVAX_address : select2.address,
        ERC20ABI,
        provider
      );
      const contract2Decimals = await contract2.decimals();

      const pathArr = [addressFrom, addressTo];
      const signeraddress = await signer.getAddress();

      if (select1.address === "AVAX") {
        if (select2.address === WAVAX_address) {
          const contr = new ethers.Contract(WAVAX_address, WAVAXABI, provider);
          const routerContractWithWallet = contr.connect(signer);
          const tx = await routerContractWithWallet.deposit({
            value: ethers.utils.parseUnits(value1),
            gasLimit: 1000000,
          });
          const txComplete = await provider.waitForTransaction(tx.hash);
          if (txComplete) {
            updateTokenBalance();
          }
          return;
        }
        if (fromTokenOne) {
          //swapExactAvaxForTokensSupportingFeeOnTransferTokens
          const tx =
            await routerContractWithWallet.swapExactAVAXForTokensSupportingFeeOnTransferTokens(
              minVal,
              pathArr,
              signeraddress,
              deadline,
              {
                value: ethers.utils.parseUnits(value1),
                gasLimit: 1000000,
              }
            );
          const txComplete = await provider.waitForTransaction(tx.hash);
          if (txComplete) {
            updateTokenBalance();
          }
        }

        if (!fromTokenOne) {
          //swapAVAXForExactTokens
          const tx = await routerContractWithWallet.swapAVAXForExactTokens(
            ethers.utils.parseUnits(value2.toString(), contract2Decimals),
            pathArr,
            signeraddress,
            deadline,
            {
              value: ethers.utils.parseUnits(value1),
              gasLimit: 1000000,
            }
          );
          const txComplete = await provider.waitForTransaction(tx.hash);
          if (txComplete) {
            updateTokenBalance();
          }
        }
      }
      if (select2.address === "AVAX") {
        if (select1.address === WAVAX_address) {
          const contr = new ethers.Contract(WAVAX_address, WAVAXABI, provider);
          const routerContractWithWallet = contr.connect(signer);
          const tx = await routerContractWithWallet.withdraw(
            ethers.utils.parseUnits(value1.toString())
          );
          const txComplete = await provider.waitForTransaction(tx.hash);
          if (txComplete) {
            updateTokenBalance();
          }
          return;
        }
        if (fromTokenOne) {
          //swapExactTokensForAVAXSupportingFeeOnTransferTokens
          const tx =
            await routerContractWithWallet.swapExactTokensForAVAXSupportingFeeOnTransferTokens(
              ethers.utils.parseUnits(value1.toString(), contract1Decimals),
              minVal,
              pathArr,
              signeraddress,
              deadline,
              {
                gasLimit: 1000000,
              }
            );
          const txComplete = await provider.waitForTransaction(tx.hash);
          if (txComplete) {
            updateTokenBalance();
          }
        }
        if (!fromTokenOne) {
          //swapTokensForExactAVAX
          const tx = await routerContractWithWallet.swapTokensForExactAVAX(
            ethers.utils.parseUnits(value2.toString()),
            ethers.utils.parseUnits(value1.toString(), contract1Decimals),
            pathArr,
            signeraddress,
            deadline,
            { gasLimit: 100000 }
          );
          const txComplete = await provider.waitForTransaction(tx.hash);
          if (txComplete) {
            updateTokenBalance();
          }
        }
      }

      if (select1.address !== "AVAX" && select2.address !== "AVAX") {
        if (fromTokenOne) {
          //swapExactTokensForTokensSupportingFeeOnTransferTokens
          const tx =
            await routerContractWithWallet.swapExactTokensForTokensSupportingFeeOnTransferTokens(
              ethers.utils.parseUnits(value1.toString(), contract1Decimals),
              minVal,
              pathArr,
              signeraddress,
              deadline,
              { gasLimit: 1000000 }
            );
          const txComplete = await provider.waitForTransaction(tx.hash);
          if (txComplete) {
            updateTokenBalance();
          }
        }
        if (!fromTokenOne) {
          //swapTokensForExactTokens
          const tx = await routerContractWithWallet.swapTokensForExactTokens(
            ethers.utils.parseUnits(value2.toString(), contract2Decimals),
            ethers.utils.parseUnits(value1.toString(), contract1Decimals),
            pathArr,
            signeraddress,
            deadline,
            { gasLimit: 1000000 }
          );
          const txComplete = await provider.waitForTransaction(tx.hash);
          if (txComplete) {
            updateTokenBalance();
          }
        }
      }
      updateTokenBalance();
    } else {
      return;
    }
  };
  const closeSettings = () => {
    setShowSettings(false);
  };

  useEffect(() => {
    listAccounts();
    setSelect1(optionsState[0]);
    getCoinBalance();
    setMode("swap");
  }, []);

  useEffect(() => {
    getQuote();
  }, [value1, value2, select1, select2]);

  const getCoinBalance = async () => {
    const coinBalance = await provider.getBalance(currentAccount);
    const normalizeNumber = ethers.utils.formatEther(coinBalance);
    return normalizeNumber;
  };

  const getTokenBalance = async (address) => {
    try {
      const token = new ethers.Contract(address, ERC20ABI, provider);
      const tokenBalance = await token.balanceOf(currentAccount);
      return ethers.utils.formatEther(tokenBalance);
    } catch (error) {
      throw new Error(error);
    }
  };

  const approveToken = async () => {
    const contract1 = new ethers.Contract(
      select1.address === "AVAX" ? WAVAX_address : select1.address,
      ERC20ABI,
      provider
    );
    if (select1.address !== "AVAX") {
      const routerContractWithWallet = contract1.connect(signer);
      const tx = await routerContractWithWallet.approve(
        routerAddress,
        contract1.totalSupply()
      );
      const txComplete = await provider.waitForTransaction(tx.hash);
      if (txComplete) {
        checkAllowance();
      }
    }
  };

  const checkAllowance = async () => {
    if (select1.address === "AVAX") {
      setAllowanceState(true);
      return;
    }
    const contract1 = new ethers.Contract(select1.address, ERC20ABI, provider);
    if (select1.address !== "AVAX") {
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
  };

  const updateTokenBalance = async () => {
    try {
      let bal1, bal2;
      if (select1.address === "AVAX") {
        bal1 = await getCoinBalance();
      } else {
        bal1 = await getTokenBalance(select1.address);
      }
      if (select2.address === "AVAX") {
        bal2 = await getCoinBalance();
      } else {
        bal2 = await getTokenBalance(select2.address);
      }
      setTokenBalance1(bal1);
      setTokenBalance2(bal2);
    } catch (error) {
      throw new Error(error);
    }
  };

  const switchTokens = () => {
    const tempSelect = select1;
    setSelect1(select2);
    setSelect2(tempSelect);
    setValue1("");
    setValue2("");
    setFromTokenOne(!fromTokenOne);
  };

  useEffect(() => {
    if (!currentAccount || !select1) return;
    const fetchData = async () => {
      if (select1.address === "AVAX") {
        const coinBalance = await getCoinBalance();
        setTokenBalance1(coinBalance);
        return;
      } else {
        const contr = new ethers.Contract(
          select1.address === "AVAX" ? WAVAX_address : select1.address,
          ERC20ABI,
          provider
        );
      }
      const result = await getTokenBalance(select1.address);
      setTokenBalance1(result);
      setValue1("");
    };
    checkAllowance();
    fetchData();
  }, [currentAccount, select1]);

  useEffect(() => {
    if (!currentAccount || !select2) return;
    const fetchData = async () => {
      if (select2.address === "AVAX") {
        const coinBalance = await getCoinBalance();
        setTokenBalance2(coinBalance);
        return;
      } else {
        const contr = new ethers.Contract(
          select2.address === "AVAX" ? WAVAX_address : select2.address,
          ERC20ABI,
          provider
        );
      }
      const result = await getTokenBalance(select2.address);
      setTokenBalance2(result);
      setValue2("");
    };
    fetchData();
  }, [currentAccount, select2]);

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
    container: (styles) => ({
      ...styles,
      maxWidth: "130px",
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
      top: "70%",
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

  return (
    <div id="swap-card">
      <div className="head">
        <SettingsModal
          close={closeSettings}
          shown={showSettings}
          slippage={slippage}
          setSlippage={setSlippage}
          deadline={deadline}
          setDeadline={setDeadline}
        >
          {" "}
        </SettingsModal>
        <div className="head-title">Trade</div>
        <div
          className="head-button"
          onClick={() => {
            setShowSettings(!showSettings);
          }}
        >
          <div>
            {" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="sc-1ndknrv-0 fZuPAR"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div className="body">
        <button
          onClick={() => {
            console.log(select1.address, optionsState);
          }}
        >
          TEST BUTTON
        </button>
        <div id="select-fields">
          <div className="select-field">
            <Select
              options={
                select2
                  ? optionsState.filter(
                      (option) => option.address !== select2.address
                    )
                  : optionsState
              }
              select={select1}
              setSelect={setSelect1}
              optionsState={optionsState}
              setOptionsState={setOptionsState}
              styles={{
                ...style,
                container: () => ({
                  border: select2 && !select1 ? "1px solid red" : null,
                }),
              }}
              provider={provider}
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
              <span id="from">From:</span>
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
          {
            <div id="switch-arrow" onClick={switchTokens}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6E727D"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
          }{" "}
          <div className="select-field">
            <Select
              options={
                select1
                  ? optionsState.filter(
                      (option) => option.address !== select1.address
                    )
                  : optionsState
              }
              select={select2}
              setSelect={setSelect2}
              optionsState={optionsState}
              setOptionsState={setOptionsState}
              styles={{
                ...style,
                container: () => ({
                  border:
                    select1 && value1 && !select2 ? "1px solid red" : null,
                }),
              }}
              provider={provider}
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
              <span id="to">To:</span>
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
          <button id="swap" onClick={() => swap()}>
            Swap
          </button>
        ) : null}
        {rightNetwork &&
        connected &&
        !allowanceState &&
        select1?.address !== "AVAX" ? (
          <button id="swap" onClick={() => approveToken()}>
            Approve {select1?.symbol}
          </button>
        ) : rightNetwork && connected && (!select1 || !select2) ? (
          <button id="swap-disabled">Swap</button>
        ) : null}
        {/* {rightNetwork && connected && (!select1 || !select2) ? (
          <button id="swap-disabled">Swap</button>
        ) : null} */}
        {}
      </div>
    </div>
  );
};
export default Swap;
