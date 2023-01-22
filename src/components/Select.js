/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from "react";
import { useEffect } from "react";
import AsyncSelect from "react-select/async";
import { ethers } from "ethers";
import ERC20ABI from "../ERC20.json";

const prov = new ethers.providers.Web3Provider(window.ethereum);

export default ({
  select,
  options,
  setSelect,
  setOptionsState,
  optionsState,
}) => {
  const handleSearch = async (inputValue) => {
    let newOpts = options;
    if (inputValue) {
      inputValue = inputValue.toLowerCase();
      newOpts = options.filter((option) =>
        option.label.toLowerCase().includes(inputValue)
      );
    }
    if (ethers.utils.isAddress(inputValue)) {
      const newData = await getTokenInfo(inputValue);

      const optionExists = optionsState.find(
        (option) => option.addy === newData.addy
      );
      if (!optionExists) {
        newOpts.push({
          label: newData.label,
          value: newData.value,
          addy: inputValue,
        });
        const setMe = [...optionsState, newData];
        setOptionsState(setMe);
      } else {
        newOpts.push(optionExists);
      }
    }
    return Promise.resolve(newOpts);
  };

  const getTokenInfo = async (addy) => {
    try {
      const token = new ethers.Contract(addy, ERC20ABI, prov);
      const symbol = await token.symbol();
      const tokenInfo = {
        value: symbol,
        label: symbol,
        addy: addy,
      };
      return tokenInfo;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AsyncSelect
      defaultOptions={options}
      value={select}
      onChange={setSelect}
      loadOptions={handleSearch}
      isSearchable
    />
  );
};
