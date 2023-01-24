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
import Uniswap from "./components/Uniswap";

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
    const temp = select1;
    setSelect1(select2);
    setSelect2(select1);
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
      display: "inline-flex",
      alignItems: "center",
      backgroundColor: "red",
      border: "10px red",
    }),
    option:(styles)=>({color:"red"})
  };

  // display: inline-flex;
  // align-items: center;
  // gap: 8px;
  // height: 2.4rem;
  // padding: 0px 8px;
  // border-radius: 16px;
  // background-color: rgb(255, 255, 255);
  // box-shadow: rgb(0 0 0 / 8%) 0px 6px 10px;

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
          <div id="main-bg">
            <div id="choose-mode">
              <button>Swap</button>
              <button>Liquidity</button>
            </div>
            <div id="main">
              <div id="swap-card">
                <div className="head">Trade</div>
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
                        <div className="balance">
                          {select1 ? tokenBalance1 : 0}
                        </div>
                      </Select>
                    </div>
                    {
                      <div id="switch-arrow" onClick={switchTokens}>
                        <svg
                          width="12"
                          height="7"
                          viewBox="0 0 12 7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          class="sc-33m4yg-8 khlnVY"
                        >
                          <path
                            d="M0.97168 1L6.20532 6L11.439 1"
                            stroke="#AEAEAE"
                          ></path>
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
                      >
                        {" "}
                        <div className="balance">
                          {select2 ? tokenBalance2 : 0}
                        </div>{" "}
                      </Select>
                    </div>
                  </div>
                  <CustomConnect setConnected={setConnected}></CustomConnect>
                  {connected ? <button id="swap">Swap</button> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Uniswap />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
export default App;
