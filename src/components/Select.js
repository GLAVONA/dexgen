/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from "react";
import { useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import AsyncSelect from "react-select/async";
import { ethers } from "ethers";
import data from "../data";
import ERC20ABI from "../ERC20.json";

const prov = new ethers.providers.Web3Provider(window.ethereum);

export default ({ select, options, setSelect, currentAccount, id }) => {
  const [isClearable, setIsClearable] = useState(false);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState();
  const [isRtl, setIsRtl] = useState(false);
  const [newOptions, setNewOptions] = useState();
  const [inputVal, setInputVal] = useState();

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
      newOpts.push({
        label: newData.label,
        value: newData.value,
        addy: inputValue,
      });
    }
    return Promise.resolve(newOpts);
  };

  useEffect(() => {
    handleSearch("");
  }, []);

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
