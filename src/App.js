import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import "./App.css";
import Swap from "./components/Swap";
import Liquidity from "./components/Liquidity";

import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton, getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { avalanche, avalancheFuji, localhost } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Route, Routes } from "react-router";
import { Link } from "react-router-dom";
import ConnectButtonHOC from "./components/ConnectButtonHOC";
import { CustomConnect } from "./components/CustomConnect";

const App = () => {
  const [mode, setMode] = useState();
  const [shouldReload, setShouldReload] = useState();
  const [connected, setConnected] = useState();


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
    "function removeLiquidityAVAXSupportingFeeOnTransferTokens(address,uint256,uint256,uint256,address,uint256)",
  ];

  const FACTORY_ABI = [
    "function getPair(address,address)view returns(address)",
  ];

  const { chains, provider } = configureChains(
    [avalancheFuji,  avalanche],
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

  const prov = new ethers.providers.Web3Provider(window.ethereum);
  const _0X_ADDRESS = "0xdef1c0ded9bec7f1a1670819833240f027b25eff";
  const factoryAddress = "0x14690446Db665B3d21B92fb6A8b94C73655b5149";
  const routerAddress = "0xecBdEe2285BE419B4fc4d171D9030E2255941329";
  const TJFactoryAddress = "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10";
  const WAVAX_ADDRESS = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
  const TJFactoryContract = new ethers.Contract(
    TJFactoryAddress,
    FACTORY_ABI,
    prov
  );
  const routerContract = new ethers.Contract(
    routerAddress,
    ROUTER_ABI,
    prov
  );
  const factoryContract = new ethers.Contract(
    factoryAddress,
    FACTORY_ABI,
    prov
  );
  const signer = prov.getSigner();
  const routerContractWithWallet = routerContract.connect(signer);
  const factoryContractWithWallet = factoryContract.connect(signer);
  const TJFactoryContractWithWallet = TJFactoryContract.connect(signer);
  const _0xAPI_URL = "https://avalanche.api.0x.org/swap/v1/";

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <div className="App">
          <Navbar>
            <div id="logo">DEXGEN</div>
            <div id="connect">
              <ConnectButtonHOC
                shouldReload={shouldReload}
                setShouldReload={setShouldReload}
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
                    provider={prov}
                    routerContractWithWallet={routerContractWithWallet}
                    TJFactoryContractWithWallet={TJFactoryContractWithWallet}
                    factoryContractWithWallet={factoryContractWithWallet}
                    WAVAX_ADDRESS={WAVAX_ADDRESS}
                    signer={signer}
                    routerAddress={routerAddress}
                    factoryAddress={factoryAddress}
                    setMode={setMode}
                    _0xAPI_URL={_0xAPI_URL}
                    _0X_ADDRESS={_0X_ADDRESS}
                    setShouldReload={setShouldReload}
                    connected = {connected}
                    setConnected = {setConnected}
                  />
                }
              />
              <Route
                path="/liquidity"
                element={
                  <Liquidity
                    provider={prov}
                    routerContractWithWallet={routerContractWithWallet}
                    TJFactoryContractWithWallet={TJFactoryContractWithWallet}
                    factoryContractWithWallet={factoryContractWithWallet}
                    WAVAX_ADDRESS={WAVAX_ADDRESS}
                    signer={signer}
                    routerAddress={routerAddress}
                    factoryAddress={factoryAddress}
                    setMode={setMode}
                    _0xAPI_URL={_0xAPI_URL}
                    _0X_ADDRESS={_0X_ADDRESS}
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
