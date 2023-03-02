import React from 'react'

const ChooseMode = ({setMode, mode}) => {
  return (
    <div id="choose-mode">
            <div className="wrapper">
              <div
                className={`swap-mode ${mode === "swap" ? "active" : null}`}
                onClick={() => setMode("swap")}
              >
                Swap
              </div>
              <div
                className={`liq-mode ${mode === "liq" ? "active" : null}`}
                onClick={() => setMode("liq")}
              >
                Liquidity
              </div>
            </div>
          </div>
  )
}

export default ChooseMode