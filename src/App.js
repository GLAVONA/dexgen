import React, { useEffect, useState } from "react";
import { BigNumber, ethers, utils } from "ethers";
import Select from "./components/Select";
import options from "./data";
import Navbar from "./components/Navbar";
import "./App.css";

import ABI from "./SwapABI.json";

import { CustomConnect } from "./components/CustomConnect";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, erc20ABI, WagmiConfig } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SettingsModal from "./components/SettingsModal";
import CurrencyInput from "react-currency-input-field";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils.js";

const { chains, provider } = configureChains(
  [avalanche, avalancheFuji],
  [publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: "DEXgen",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const prov = new ethers.providers.Web3Provider(window.ethereum);
const ERC20ABI = require("./ERC20.json");

const App = () => {
  const [tokenBalance1, setTokenBalance1] = useState();
  const [tokenBalance2, setTokenBalance2] = useState();
  const [currentAccount, setCurrentAccount] = useState();
  const [select1, setSelect1] = useState();
  const [select2, setSelect2] = useState();
  const [provider, setProvider] = useState(prov);
  const [optionsState, setOptionsState] = useState(options);
  const [connected, setConnected] = useState();
  const [showSettings, setShowSettings] = useState(false);
  const [value1, setValue1] = useState();
  const [value2, setValue2] = useState();
  const [minVal, setMinval] = useState();
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(1);
  const [mode, setMode] = useState("swap");
  const [fromTokenOne, setFromTokenOne] = useState();

  const routerAddress = "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901";
  const WAVAX_ADDY = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
  const contract = new ethers.Contract(routerAddress, ABI, provider);
  const signer = provider.getSigner();
  const contractWithWallet = contract.connect(signer);

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

      if (fromTokenOne) {
        const val2 = (value2 - (value2 * slippage) / 100);
        setMinval(val2);
      }

      if (!fromTokenOne) {
        const val1 = value1 - (value1 * slippage) / 100;
        setMinval(val1)
      }


      let addyFrom = select1.addy;
      let addyTo = select2.addy;
      if (select1.addy === "AVAX") {
        addyFrom = WAVAX_ADDY;
      }
      if (select2.addy === "AVAX") {
        addyTo = WAVAX_ADDY;
      }

      if (fromTokenOne && value1 !== undefined) {
        try {
          let addys = [addyFrom, addyTo];
          const value1wei = parseUnits(value1, contract1Decimals);
          let arrayOut = await contractWithWallet.getAmountsOut(
            value1wei,
            addys
          );
          const tokenOut = formatUnits(arrayOut[arrayOut.length - 1]);
          if (tokenOut) {
            setValue2(tokenOut.toString());
          }
        } catch (error) {
          throw new Error(error);
        }
      } else if (value1 === undefined) {
        setValue2("");
      }

      if (!fromTokenOne && value2 !== undefined) {
        try {
          let addys = [addyFrom, addyTo];
          const value2wei = parseUnits(value2, contract2Decimals);
          let arrayOut = await contractWithWallet.getAmountsIn(
            value2wei,
            addys
          );
          const tokenOut = formatUnits(arrayOut[0], contract1Decimals);
          if (tokenOut) {
            setValue1(tokenOut.toString());
          }
        } catch (error) {
          throw new Error(error);
        }
      } else if (value2 === undefined) {
        setValue1("");
      }
    }
  };

  const Swap = () => {
    if (select1 && select2) {
      let addyFrom = select1.addy;
      let addyTo = select2.addy;

      if (select1.addy === "AVAX") {
        addyFrom = WAVAX_ADDY;
      }
      if (select2.addy === "AVAX") {
        addyTo = WAVAX_ADDY;
      }


      if (select1.addy === "AVAX") {
        if (fromTokenOne) {
          //swapExactAvaxForTokensSupportingFeeOnTransferTokens
          contractWithWallet.swapExactAvaxForTokensSupportingFeeOnTransferTokens(
            addyFrom,
            minVal,
            
          );
        }
        if (!fromTokenOne) {
          //swapAvaxForExactTokens
        }
      }
      if (select2.addy === "AVAX") {
        if (fromTokenOne) {
          //swapExactTokensForAvaxSupportingFeeOnTransferTokens
        }
        if (!fromTokenOne) {
          //swapTokensForExactAvax
        }
      }

      if (select1.addy !== "AVAX" && select2.addy !== "AVAX") {
        if (fromTokenOne) {
          //swapExactTokensForTokensSupportingFeeOnTransferTokens
        }
        if (!fromTokenOne) {
          //swapTokensForExactTokens
        }
      }
    }
  };
  const closeSettings = () => {
    setShowSettings(false);
  };

  useEffect(() => {
    setSelect1(options[0]);
    listAccounts();
    getCoinBalance();
  }, []);

  useEffect(() => {
    getQuote();
  }, [value1, value2, select1, select2]);

  const getCoinBalance = async () => {
    const coinBalance = await provider.getBalance(currentAccount);
    const normalizeNumber = ethers.utils.formatEther(coinBalance);
    return normalizeNumber;
  };

  const getTokenBalance = async (addy) => {
    try {
      const token = new ethers.Contract(addy, ERC20ABI, prov);
      const tokenBalance = await token.balanceOf(currentAccount);
      return ethers.utils.formatEther(tokenBalance);
    } catch (error) {
      throw new Error(error);
    }
  };

  const switchTokens = () => {
    const tempSelect = select1;
    setSelect1(select2);
    setSelect2(tempSelect);
    setValue1(undefined);
    setValue2(undefined);
    setFromTokenOne(!fromTokenOne);
  };

  useEffect(() => {
    if (!currentAccount || !select1) return;
    const fetchData = async () => {
      if (select1.addy === "AVAX") {
        const coinBalance = await getCoinBalance();
        setTokenBalance1(coinBalance);
        return;
      }
      const result = await getTokenBalance(select1.addy);
      setTokenBalance1(result);
      setValue1("");
    };
    fetchData();
  }, [currentAccount, select1]);

  useEffect(() => {
    if (!currentAccount || !select2) return;
    const fetchData = async () => {
      if (select2.addy === "AVAX") {
        const coinBalance = await getCoinBalance();
        setTokenBalance2(coinBalance);
        return;
      }
      const result = await getTokenBalance(select2.addy);
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
      console.log(error);
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
    }
  };

  const handleMax2 = (e) => {
    if (e.target.textContent !== 0) {
      setValue2(tokenBalance2);
    }
  };

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <div className="App">
          <Navbar>
            <div id="logo">DEXGEN</div>
            <div id="connect">
              <ConnectButton
                chainStatus={"icon"}
                accountStatus={"address"}
                id={"wallet-connect"}
              />
            </div>
          </Navbar>
          <div id="choose-mode">
            <div className="wrapper">
              <div
                className={`swap-mode ${mode === "swap" ? "active" : null}`}
                onClick={() => setMode("swap")}
              >
                Swap
              </div>
              <div
                className={`liq-mode ${mode === "liq" ? "active" : null}`}
                onClick={() => setMode("liq")}
              >
                Liquidity
              </div>
            </div>
          </div>
          <div id="main-bg"></div>
          <div id="main">
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
                    console.log(showSettings);
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
                <div id="select-fields">
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
                        container: () => ({
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
                        {select1 && tokenBalance1 > 0 ? tokenBalance1 : 0}
                      </div>
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
                        container: () => ({
                          border:
                            select1 && value1 && !select2
                              ? "1px solid red"
                              : null,
                        }),
                      }}
                    >
                      {" "}
                      <div
                        className="balance"
                        onClick={(e) => {
                          handleMax2(e);
                          setFromTokenOne(false);
                        }}
                      >
                        <span className="max-balance">Balance:</span>
                        {select2 && tokenBalance2 > 0 ? tokenBalance2 : 0}
                      </div>{" "}
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
                <div id="min-val">Min: {minVal.toFixed(5)}</div>
                <CustomConnect setConnected={setConnected}></CustomConnect>
                {connected ? (
                  <button id="swap" onClick={() => console.log(fromTokenOne)}>
                    Swap
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
export default App;
