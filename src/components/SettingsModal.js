import React from 'react'

const SettingsModal = ({shown,close,children}) => {
   return shown ? (
    <div
      className="modal-backdrop"
      onClick={() => {
        // close modal when outside of modal is clicked
        close();
      }}
    >
      <div
        className="modal-content"
        onClick={e => {
          // do not close modal if anything inside modal content is clicked
          e.stopPropagation();
        }}
      >
      <h4>Transaction Settings</h4>
        <div class="settingField">
          <div class="pretext">Slippage tolerance</div>
          <input type="number" placeholder="4.00%"/>
        </div>
        <div class="settingField">
          <div class="pretext">Transaction deadline</div>
          <input type="number" placeholder="20 (minutes)" />
        </div>
        <button onClick={close}>Close</button>
        {children}
      </div>
    </div>
  ) : null;
}

export default SettingsModal