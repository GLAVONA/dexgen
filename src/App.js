import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import "./App.css";
import Swap from "./components/Swap";
import Liquidity from "./components/Liquidity";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { avalanche, avalancheFuji, localhost } from "wagmi/chains";
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
  "function addLiquidityAVAX(address,uint256,uint256,uint256,address,uint256) payable",
  "function removeLiquidityAVAXSupportingFeeOnTransferTokens(address,uint256,uint256,uint256,address,uint256)"
];

const { chains, provider } = configureChains(
  [avalancheFuji, localhost,avalanche],
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


const App = () => {
  const [mode, setMode] = useState();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const factoryAddress = "0x14690446Db665B3d21B92fb6A8b94C73655b5149";
  const routerAddress = "0xecBdEe2285BE419B4fc4d171D9030E2255941329"; 
  const WAVAX_ADDY = "0x48AA9B88d6DdAf35792d422CE608edcDF33359e0";
  const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, provider);
  const signer = provider.getSigner();
  const routerContractWithWallet = routerContract.connect(signer);

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
                    routerContractWithWallet={routerContractWithWallet}
                    WAVAX_ADDY={WAVAX_ADDY}
                    signer={signer}
                    routerAddress={routerAddress}
                    setMode={setMode}
                  />
                }
              />
              <Route
                path="/liquidity"
                element={
                  <Liquidity
                    provider={provider}
                    routerContractWithWallet={routerContractWithWallet}
                    WAVAX_ADDY={WAVAX_ADDY}
                    signer={signer}
                    routerAddress={routerAddress}
                    factoryAddress={factoryAddress}
                    setMode={setMode}
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
