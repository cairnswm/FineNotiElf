import React from 'react';
import { Button } from 'react-bootstrap';

const PayGateButton = ({createOrder, onApprove}) => {
  if (!createOrder){
    throw new Error("createOrder is required.");
  }
  const click = () => {
    if (createOrder) {
      createOrder();
    };
  }
  return <Button style={{width:"100%", height:"55px"}} onClick={click}>Pay with PayGate</Button>
}

export default PayGateButton;
