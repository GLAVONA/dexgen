import React, { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ConnectButtonHOC = ({ shouldReload, setShouldReload }) => {
    
  useEffect(() => {
    setShouldReload(false);
  }, [shouldReload]);

  return (
        <ConnectButton
          chainStatus={"icon"}
          accountStatus={"address"}
          id={"wallet-connect"}
        />
  );
};

export default ConnectButtonHOC;
