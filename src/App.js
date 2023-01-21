import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Select from "./components/Select";
import options from "./data";

const prov = new ethers.providers.Web3Provider(window.ethereum);
const ERC20ABI = require("./ERC20.json");

const App = () => {
  const [balance, setBalance] = useState();
  const [babinuBalance, setBabinuBalance] = useState();
  const [currentAccount, setCurrentAccount] = useState();
  const [chainId, setChainId] = useState();
  const [chainName, setChainName] = useState();
  const [select1, setSelect1] = useState();
  const [select2, setSelect2] = useState();
  const [provider, setProvider] = useState(prov);

  const BABINU_ADDRESS = "0x417D676A0b5E7c030697DA795f8718C7c823aE89";
  const BABINU = new ethers.Contract(BABINU_ADDRESS, ERC20ABI, provider);

  const getCoinBalance = async () => {
    const coinBalance = await provider.getBalance(currentAccount);
    setBalance(ethers.utils.formatEther(coinBalance));
  };

  const getTokenBalance = async (addy) => {
    try {
      const tokenBalance = await addy.balanceOf(currentAccount);
      setBabinuBalance(ethers.utils.formatEther(tokenBalance));
    } catch (error) {
      setBabinuBalance("0");
      throw new Error(error);
    }
  };

  const getNetwork = async () => {
    const network = await provider.getNetwork();
    setChainId(network.chainId);
    setChainName(network.name);
  };

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

  const requestAccounts = async () => {
    const accounts = await provider.send("eth_requestAccounts", []);
    try {
      if (accounts.length > 0) setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!currentAccount || !ethers.utils.isAddress(currentAccount)) return;
    if (!window.ethereum) return;
    getCoinBalance();
    getTokenBalance(select1);
    getNetwork();
  }, [currentAccount]);

  useEffect(() => {
    provider.on("accountsChanged", (accounts) => {
      setCurrentAccount(accounts[0]);
    });
    listAccounts();
  }, []);

  const onClickConnect = () => {
    if (!window.ethereum) {
      console.log("Please install MetaMask");
      return;
    }
    requestAccounts();
  };

  return (
    <div>
      <Select
        options={options.filter((option) => option.label !== select2)}
        setSelect={setSelect1}
        currentAccount={currentAccount}
      />
      <Select
        options={options.filter((option) => option.label !== select1)}
        setSelect={setSelect2}
        currentAccount={currentAccount}
      />
      {currentAccount ? null : (
        <button onClick={onClickConnect}>Connect</button>
      )}
      <div>Wallet: {currentAccount} </div>
      <div>Balance: {balance} </div>
      <div>Babinu Balance: {babinuBalance} </div>
      <div>Chain ID: {chainId}</div>
      <div>Chain Name: {chainName}</div>
    </div>
  );
};
export default App;
