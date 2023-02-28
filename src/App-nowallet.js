import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import "./App.css";
import Swap from "./components/Swap";
import Liquidity from "./components/Liquidity";

import "@rainbow-me/rainbowkit/styles.css";
import {
  ConnectButton,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { avalanche, avalancheFuji, localhost } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Route, Routes } from "react-router";
import { Link } from "react-router-dom";
import ConnectButtonHOC from "./components/ConnectButtonHOC";
import { CustomConnect } from "./components/CustomConnect";

const AppNoWallet = () => {
  const [mode, setMode] = useState("swap");
  
  return (
        <div className="App">
          <Navbar>
            <div id="logo">DEXGEN</div>
            <div id="connect-no-wallet">
            Please install a wallet
            </div>
          </Navbar>
          <div id="choose-mode">
            <div className="wrapper">
              <Link to="/">
                <div
                  className={`swap-mode ${mode === "swap" ? "active" : null}`}
                  onClick={() => setMode("swap")}
                >
                  Swap
                </div>
              </Link>
              <Link to="/liquidity">
                <div
                  className={`liq-mode ${mode === "liq" ? "active" : null}`}
                  onClick={() => setMode("liq")}
                >
                  Liquidity
                </div>
              </Link>
            </div>
          </div>
          <div id="main-bg"></div>
          <div id="main">
            <Routes>
              <Route path="/" element={<Swap setMode={setMode}/>} />
              <Route path="/liquidity" element={<Liquidity setMode={setMode}/>} />
            </Routes>
          </div>
        </div>
  );
};
export default AppNoWallet;
