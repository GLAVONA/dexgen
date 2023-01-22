import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Select from "./components/Select";
import options from "./data";

const prov = new ethers.providers.Web3Provider(window.ethereum);
const ERC20ABI = require("./ERC20.json");

const App = () => {
  const [balance, setBalance] = useState();
  const [tokenBalance1, setTokenBalance1] = useState();
  const [tokenBalance2, setTokenBalance2] = useState();
  const [currentAccount, setCurrentAccount] = useState();
  const [chainId, setChainId] = useState();
  const [chainName, setChainName] = useState();
  const [select1, setSelect1] = useState();
  const [select2, setSelect2] = useState();
  const [provider, setProvider] = useState(prov);
  const [optionsState, setOptionsState] = useState(options);

  useEffect(() => {
    provider.on("accountsChanged", (accounts) => {
      setCurrentAccount(accounts[0]);
    });
    setSelect1(options[0]);
    getCoinBalance();
    listAccounts();
    getNetwork();
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
        options={
          select2
            ? optionsState.filter((option) => option.addy !== select2.addy)
            : optionsState
        }
        // options={options}
        select={select1}
        setSelect={setSelect1}
        optionsState={optionsState}
        setOptionsState={setOptionsState}
      />
      <button onClick={() => switchTokens()}>Switch</button>
      <Select
        options={
          select1
            ? optionsState.filter((option) => option.addy !== select1.addy)
            : optionsState
        }
        // options={options}
        select={select2}
        setSelect={setSelect2}
        optionsState={optionsState}
        setOptionsState={setOptionsState}
      />
      {currentAccount ? null : (
        <button onClick={onClickConnect}>Connect</button>
      )}
      <div>Wallet: {currentAccount} </div>
      <div>Balance 1: {tokenBalance1} </div>
      <div>Balance 2: {tokenBalance2} </div>
      <div>Chain ID: {chainId}</div>
      <div>Chain Name: {chainName}</div>
      <button onClick={() => console.log(select1, select2)}>
        print select
      </button>
    </div>
  );
};
export default App;
