/* eslint-disable import/no-anonymous-default-export */
import React from "react";
import AsyncSelect from "react-select/async";
import { ethers } from "ethers";
import ERC20ABI from "../data/ERC20.json";

export default ({
  select,
  options,
  setSelect,
  setOptionsState,
  optionsState,
  children,
  styles,
  provider,
}) => {
  const handleSearch = async (inputValue) => {
    let newOpts = options;
    if (inputValue) {
      inputValue = inputValue.toLowerCase();
      newOpts = options.filter((option) =>
        option.name.toLowerCase().includes(inputValue)
      );
    }
    if (ethers.utils.isAddress(inputValue)) {
      const newData = await getTokenInfo(inputValue);

      const optionExists = optionsState.find(
        (option) => option.address === newData.address
      );
      if (!optionExists) {
        newOpts.push({
          name: newData.name,
          value: newData.value,
          address: inputValue,
        });
        const setMe = [...optionsState, newData];
        setOptionsState(setMe);
      } else {
        newOpts.push(optionExists);
      }
    }
    return Promise.resolve(newOpts);
  };

  const getTokenInfo = async (address) => {
    try {
      const token = new ethers.Contract(address, ERC20ABI, provider);
      const symbol = await token.symbol();
      const tokenInfo = {
        value: symbol,
        name: symbol,
        address: address,
      };
      return tokenInfo;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AsyncSelect
        defaultOptions={options}
        value={select}
        getOptionLabel={(option) => option.symbol}
        getOptionValue={(option) => option.symbol}
        onChange={setSelect}
        loadOptions={handleSearch}
        isSearchable
        styles={styles}
      />
      {children}
    </>
  );
};
