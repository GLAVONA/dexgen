import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Select from "./components/Select";
import options from "./data";
import Navbar from "./components/Navbar";
import "./App.css";

import { CustomConnect } from "./components/CustomConnect";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SettingsModal from "./components/SettingsModal";
import CurrencyInput from "react-currency-input-field";

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
  const [slippage, setSlippage] = useState();
  const [deadline, setDeadline] = useState();
  const [mode, setMode] = useState("swap");

  const closeSettings = () => {
    setShowSettings(false);
  };

  useEffect(() => {
    setSelect1(options[0]);
    listAccounts();
    getCoinBalance();
  }, []);

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
    const tempValue = value1;
    setSelect1(select2);
    setSelect2(tempSelect);
    setValue1(value2);
    setValue2(tempValue);
  };

  useEffect(() => {
    if (!currentAccount || !select1) return;
    const fetchData = async () => {
      if (select1.value === "AVAX") {
        const coinBalance = await getCoinBalance();
        setTokenBalance1(coinBalance);
        return;
      }
      const result = await getTokenBalance(select1.addy);
      setTokenBalance1(result);
    };
    fetchData();
  }, [currentAccount, select1]);

  useEffect(() => {
    if (!currentAccount || !select2) return;
    const fetchData = async () => {
      if (select2.value === "AVAX") {
        const coinBalance = await getCoinBalance();
        setTokenBalance2(coinBalance);
        return;
      }
      const result = await getTokenBalance(select2.addy);
      setTokenBalance2(result);
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
  };

  const handleMax1 = (e) => {
    if (e.target.textContent !== 0) {
      setValue1(e.target.textContent);
    }
  };

  const handleMax2 = (e) => {
    if (e.target.textContent !== 0) {
      setValue2(e.target.textContent);
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
              <div className={`swap-mode ${mode==="swap"?"active":null}`} onClick={()=>setMode("swap")}>Swap</div>
              <div className={`liq-mode ${mode==="liq"?"active":null}`} onClick={()=>setMode("liq")}>Liquidity</div>
            </div>
          </div>
          <div id="main-bg"></div>
          <div id="main">
            <div id="swap-card">
              <div className="head">
                <SettingsModal close={closeSettings} shown={showSettings} slippage={slippage} setSlippage={setSlippage} deadline={deadline} setDeadline={setDeadline}>
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
                      styles={style}
                    >
                      <div
                        className="balance"
                        onClick={(e) => {
                          handleMax1(e);
                        }}
                      >
                        {select1 ? tokenBalance1 : 0}
                      </div>
                    </Select>
                    <CurrencyInput
                      decimalsLimit={18}
                      allowNegativeValue={false}
                      onValueChange={(e) => setValue1(e)}
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
                      styles={style}
                    >
                      {" "}
                      <div
                        className="balance"
                        onClick={(e) => {
                          handleMax2(e);
                        }}
                      >
                        {select2 ? tokenBalance2 : 0}
                      </div>{" "}
                    </Select>
                    <CurrencyInput
                      decimalsLimit={18}
                      allowNegativeValue={false}
                      onValueChange={(e) => setValue2(e)}
                      className="amount-input"
                      placeholder="0.0"
                      value={value2}
                    />
                  </div>
                </div>
                <CustomConnect setConnected={setConnected}></CustomConnect>
                {connected ? <button id="swap">Swap</button> : null}
              </div>
            </div>
          </div>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
export default App;
