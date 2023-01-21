/* eslint-disable import/no-anonymous-default-export */
import React, { useState } from 'react';
import { useEffect } from 'react';
import Select from 'react-select';
import { ethers } from 'ethers';
import data from '../data';
import ABI from ''


export default ({children, options, setSelect}) =>

 {
  const [isClearable, setIsClearable] = useState(false);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState();
  const [isRtl, setIsRtl] = useState(false);

  const getTokenInfo=async(e)=>{
    // const token = new Contract()
    // const symbol = await 
  }

  const change = async(e)=>{

    if (data.indexOf(e)===-1){
        getTokenInfo(e.value)
    }

    const tokenAddy = e;
    console.log(e);
    setSelect(e.value);
    setIsLoading(true)
  }

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
        options = {options}
        onChange={e=>change(e)}
      >
      {children}</Select>
    </>
  );
};
