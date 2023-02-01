import { ConnectButton } from '@rainbow-me/rainbowkit';
export const CustomConnect = ({setConnected, setRightNetwork}) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');
            setConnected(connected)
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" id='connect-wallet'>
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                setRightNetwork(false)
                return (
                  <button onClick={openChainModal} type="button" id='wrong-chain'>
                    Wrong network
                  </button>
                );
              }else{
                setRightNetwork(true);
              }
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};