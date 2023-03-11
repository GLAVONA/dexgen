import { ConnectButton } from "@rainbow-me/rainbowkit";

export const CustomConnect = ({ setConnected, setRightNetwork }) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                setConnected(false);
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    id="connect-wallet"
                  >
                    Connect Wallet
                  </button>
                );
              } else {
                setConnected(true);
              }
              if (chain.unsupported) {
                setRightNetwork(false);
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    id="wrong-chain"
                  >
                    Wrong network
                  </button>
                );
              } else {
                setRightNetwork(true);
              }
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
