import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { Triangle } from "react-loader-spinner";
import { CustomConnect } from "./utils/CustomConnect";
const ERC20ABI = require("../data/ERC20.json");

const Stake = ({
  rightNetwork,
  setRightNetwork,
  connected,
  setConnected,
  provider,
  signer,
}) => {
  const [currentAllowance, setCurrentAllowance] = useState();
  const [value, setValue] = useState();
  const [enoughAllowance, setEnoughAllowance] = useState();

  const babinuAddress = "0xdf8792befAf777E96761aB8439F2a074252dA6bE";
  const stakingAddress = ""; // SET STAKING CONTRACT ADDRESS
  const babinuContract = new ethers.Contract(babinuAddress, ERC20ABI, provider);

  useEffect(()=>{
  },[])

  const stake = () => {};

  const checkBabinuAllowance = async () => {
    const allowance = await babinuContract.allowance(signer, stakingAddress);
    const babinuDecimals = await babinuContract.decimals();
    const value1wei = ethers.utils.parseUnits(value, babinuDecimals);
    setCurrentAllowance(allowance);
    if (currentAllowance < value1wei) {
      setEnoughAllowance(false);
    } else {
      setEnoughAllowance(true);
    }
  };

  const approveToken = async () => {
    const contractWithWallet = babinuContract.connect(signer);
    const tx = await contractWithWallet.approve(
      stakingAddress,
      babinuContract.totalSupply()
    );
    const txComplete = await provider.waitForTransaction(tx.hash);
    if (txComplete) {
      checkBabinuAllowance();
    }
  };

  return (
    <div id="main">
      <div id="swap-card">
        <div className="head">
          <div className="left">Earn Sartini</div>
          <div className="right"></div>
        </div>
        <div className="body">
        <CurrencyInput
                decimalsLimit={18}
                allowNegativeValue={false}
                onValueChange={(e) => {
                  setValue(e);
                }}
                className="stake-amount-input"
                placeholder="0.0"
                value={value}
              />
          {window.ethereum ? (
            <CustomConnect
              setConnected={setConnected}
              setRightNetwork={setRightNetwork}
            />
          ) : (
            <div className="install-wallet">Please install a wallet</div>
          )}
          {rightNetwork && connected && enoughAllowance ? (
            <button id="swap" onClick={() => stake()}>
              Stake
            </button>
          ) : null}
          {rightNetwork && connected && !enoughAllowance ? (
            <button id="swap" onClick={() => approveToken()}>
              Approve BABINU
            </button>
          ) : rightNetwork && connected ? (
            <button id="swap-disabled">Stake</button>
          ) : null}
          {}
        </div>
      </div>
    </div>
  );
};

export default Stake;
