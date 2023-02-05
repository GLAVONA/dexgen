import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import "./App.css";
import Swap from "./components/Swap";
import Liquidity from "./components/Liquidity";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { avalanche, avalancheFuji } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Route, Routes } from "react-router";
import { Link } from "react-router-dom";

const ROUTER_ABI = [
  "function swapExactAVAXForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256) payable",
  "function getAmountsOut(uint256,address[]) view returns (uint256[])",
  "function getAmountsIn(uint256,address[]) view returns (uint256[])",
  "function swapAVAXForExactTokens( uint256, address[], address, uint256) external payable returns (uint256[] amounts)",
  "function swapExactTokensForAVAXSupportingFeeOnTransferTokens( uint256, uint256, address[], address, uint256) ",
  "function swapTokensForExactAVAX( uint256, uint256, address[], address, uint256) returns (uint256[])",
  "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)",
  "function swapTokensForExactTokens(uint256,uint256,address[],address,uint256)",
];

const { chains, provider } = configureChains(
  [avalancheFuji],
  [publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: "DEXGEN",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const ERC20ABI = require("./data/ERC20.json");

const App = () => {
  const [mode, setMode] = useState("swap");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const routerAddress = "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901";
  const WAVAX_ADDY = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
  const contract = new ethers.Contract(routerAddress, ROUTER_ABI, provider);
  const signer = provider.getSigner();
  const contractWithWallet = contract.connect(signer);

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
              <Route
                path="/"
                element={
                  <Swap
                    provider={provider}
                    contractWithWallet={contractWithWallet}
                    WAVAX_ADDY={WAVAX_ADDY}
                    signer={signer}
                    routerAddress={routerAddress}
                  />
                }
              />
              <Route
                path="/liquidity"
                element={
                  <Liquidity
                    provider={provider}
                    contractWithWallet={contractWithWallet}
                    WAVAX_ADDY={WAVAX_ADDY}
                    signer={signer}
                    routerAddress={routerAddress}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
export default App;
