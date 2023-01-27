import React, { useState } from 'react'

const SettingsModal = ({shown,close,children,slippage,deadline,setSlippage,setDeadline}) => {

    const [slippageMessage, setSlippageMessage] = useState();
    const [deadlineMessage, setDeadlineMessage] = useState();

    const handleSlippageChange=(e)=>{
        if(e.target.value>30){
            setSlippage(30)
            setSlippageMessage("Maximum slippage is 30%!")
            e.target.style.border = "solid 1px red"
        }
        else{
            setSlippage(e.target.value)
            setSlippageMessage("")
            e.target.style.border = "none"
        }
    }

    const handleDeadlineChange=(e)=>{
        if(e.target.value>30){
            setDeadline(30);
            setDeadlineMessage("Maximum deadline is 30 minutes")
        }
        else{
            setDeadline(e.target.value);
            setDeadlineMessage("")
        }
    }
   return shown ? (
    <div
      className="modal-backdrop"
      onMouseDown={() => {
        close();
        setSlippageMessage("")
        setDeadlineMessage("")
        
      }}
    >
      <div
        className="modal-content"
        onMouseDown={e => {
          e.stopPropagation();
        }}
      >
      <h4>Transaction Settings</h4>
        <div class="settingField">
          <div class="pretext">Slippage tolerance</div>
          <input type="number" placeholder="%" onChange={handleSlippageChange} value={slippage} onBlur={()=>setSlippageMessage("")} style={{border: slippageMessage?"1px solid red":"none"}}/>
          <div className="alert-slippage">{slippageMessage}</div>
        </div>
        <div class="settingField">
          <div class="pretext">Transaction deadline</div>
          <input type="number" placeholder="minutes" onChange={handleDeadlineChange} value={deadline} onBlur={()=>setDeadlineMessage("")} style={{border: deadlineMessage?"1px solid red":"none"}} />
          <div className="alert-deadline">{deadlineMessage}</div>
        </div>
        <button onClick={close} id="close-modal-button">Close</button>
        {children}
      </div>
    </div>
  ) : null;
}

export default SettingsModal