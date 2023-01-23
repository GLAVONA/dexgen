import React from 'react'

import '../Uniswap.css'

const Uniswap = () => {
  return (
<div class="section uniswapSection">
  <div class="uniswap">
    <div class="uniswapHead">
      <div class="title">Trade</div>
      <input id="uniswapSettingsTrigger" hidden type="checkbox"/>
      <div class="buttons">
        <label for="uniswapSettingsTrigger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sc-1ndknrv-0 fZuPAR"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </label>
      </div>
      <div class="uniswapSettings">
        <h4>Transaction Settings</h4>
        <div class="settingField">
          <div class="pretext">Slippage tolerance</div>
          <input type="text" placeholder="4.00%"/>
        </div>
        <div class="settingField">
          <div class="pretext">Transaction deadline</div>
          <input type="text" placeholder="20 minutes"/>
        </div>
        <h4>Interface Settings</h4>
        <div class="settingFieldInline">
          <div class="pretext">Toggle Expert Mode</div>
          <input hidden id="toggleExpertMode" type="checkbox"/>
          <label class="uniswapSettingsSwitch" for="toggleExpertMode"></label>
        </div>
        <div class="settingFieldInline">
          <div class="pretext">Disable Multihops</div>
          <input hidden id="disableMultiHops" type="checkbox"/>
          <label class="uniswapSettingsSwitch" for="disableMultiHops"></label>
        </div>
      </div>
    </div>
    <div class="uniswapBody">
      <div class="uniswapFields">
        <div class="uniswapField">
          <div class="uniswapSelector">
            <img class="uniswapSelectorLogo" src="https://assets.coingecko.com/coins/images/4454/thumb/0xbtc.png?1561603765"/>
            <div class="uniswapSelectorText">0XBTC</div>
            <div class="uniswapSelectorArrow">
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" class="sc-33m4yg-8 khlnVY"><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#AEAEAE"></path></svg>
            </div>
          </div>
          <input class="uniswapTextInput" type="text" placeholder="0.0"/>
        </div>
        <div class="uniswapArrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E727D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </div>
        <div class="uniswapField">
          <div class="uniswapSelector">
            <img class="uniswapSelectorLogo" src="https://assets.coingecko.com/coins/images/11035/thumb/0xmnr.PNG?1587357680"/>
            <div class="uniswapSelectorText">0XMR</div>
            <div class="uniswapSelectorArrow">
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg" class="sc-33m4yg-8 khlnVY"><path d="M0.97168 1L6.20532 6L11.439 1" stroke="#AEAEAE"></path></svg>
            </div>
          </div>
          <input class="uniswapTextInput" type="text" placeholder="0.0"/>
        </div>
      </div>
      <button class="uniswapButton">Connect Wallet</button>
    </div>
  </div>
</div>
  )
  }

export default Uniswap;