/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from "react";
import { useEffect } from "react";
import Select from "react-select";
import { ethers } from "ethers";
import data from "../data";
import ERC20ABI from "../ERC20.json";

const prov = new ethers.providers.Web3Provider(window.ethereum);

export default ({ children, options, setSelect, currentAccount }) => {
  const [isClearable, setIsClearable] = useState(false);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState();
  const [isRtl, setIsRtl] = useState(false);

  const getTokenInfo = async (e) => {
    try {
        const addy = e.value
        const token = new ethers.Contract(addy, ERC20ABI, prov);
        const symbol = await token.symbol();
        const balance = await token.balanceOf(currentAccount);
        const tokenInfo = { value: {symbol}, label: {symbol}, addy: {addy} }
        setIsLoading(false);
        return tokenInfo;
        
    } catch (error) {
        console.log(error)
        
    }
  };

  const change = async (e) => {
    if (data.indexOf(e) === -1) {
      setIsLoading(true);
      const tokenInfo = getTokenInfo(e.value);
      setSelect(tokenInfo);
    } else {
      setSelect(e.value);
    }
  };

  return (
    <>
      <Select
        className="basic-single"
        classNamePrefix="select"
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isRtl={isRtl}
        isSearchable={isSearchable}
        options={options}
        onChange={(e) => change(e)}
      >
        {children}
      </Select>
    </>
  );
};
