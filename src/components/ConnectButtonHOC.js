import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ConnectButtonHOC = ({shouldReload,setShouldReload}) => {

    setShouldReload(false)

  return (
    <>
      {!shouldReload ? (
        <ConnectButton
          chainStatus={"icon"}
          accountStatus={"address"}
          id={"wallet-connect"}
        />
      ) : null}
    </>
  );
};

export default ConnectButtonHOC;
