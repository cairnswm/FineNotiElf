import React, { useEffect } from "react";
import PayGateButton from "./PayGateButton";
import { combineUrlAndPath } from "../../utils/combineUrlAndPath";

const PayGate = ({ onGetOrder, onPaid }) => {
  if (!onGetOrder) {
    throw new Error("onGetOrder is required.");
  }
  if (!onPaid) {
    throw new Error("onPaid is required.");
  }

  console.log("==== PAYGATE Button")

  const submitPayment = (payment_id, checksum) => {
    console.log("==== PAYGATE Button submitPayment", payment_id, checksum);
    const form = document.createElement("form");
    form.action = "https://secure.paygate.co.za/payweb3/process.trans";
    form.method = "POST";

    const input1 = document.createElement("input");
    input1.type = "hidden";
    input1.name = "PAY_REQUEST_ID";
    input1.value = payment_id;
    form.appendChild(input1);

    const input2 = document.createElement("input");
    input2.type = "hidden";
    input2.name = "CHECKSUM";
    input2.value = checksum;
    form.appendChild(input2);

    document.body.appendChild(form);
    form.submit();
  };

  const createOrder = async (data, actions) => {
    console.log("==== PAYGATE Button createOrder", data, actions)
    try {
      // Send request to your PHP backend to create the PAYGATE order
      const order = await onGetOrder();
      const orderId = order.id;
      const totalPrice = order.total_price;
      const response = await fetch(combineUrlAndPath(process.env.REACT_APP_PAYWEB3_API,"initiate.php?order_id=" + orderId),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const result = await response.json();

      const { payment_id, checksum } = result;

      console.log("==== PAYGATE (PayWeb3) Button response", result)

      // Call this function after retrieving payment_id and checksum
      submitPayment(payment_id, checksum);

      return checksum;
    } catch (error) {
      console.error("Error creating PAYGATE order:", error);
      return Promise.reject(error);
    }
  };

  const onApprove = async (data, actions) => {
    try {
      console.log("==== PAYGATE Button onApprove", data, actions)
      if (onPaid) {
        onPaid();
      }
    } catch (error) {
      console.error("Error handling PAYGATE approval:", error);
    }
  };

  return (
    <div>
      <PayGateButton
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(error) => {
          console.error("PAYGATE Button Error:", error);
        }}
      />
    </div>
  );
};

export default PayGate;
