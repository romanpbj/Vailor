import { useEffect } from "react";
import '../paypal.css'
import usePayPalSDK from "../components/usePayPalSDK"

function PayPal({ amount, onSuccess, clientId }) {
  const sdkReady = usePayPalSDK(clientId);

  useEffect(() => {
    if (sdkReady && window.paypal) {
      const container = document.getElementById("paypal-button-container");
      container.innerHTML = "";

      window.paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 40,
            width: 40
          },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toString(),
              },
            }],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            console.log("Transaction completed by", details.payer.name.given_name);
            if (onSuccess) onSuccess(details);
          });
        },
        onError: (err) => {
          console.error("PayPal Checkout onError", err);
        },
      }).render("#paypal-button-container");
    }
  }, [sdkReady, amount, onSuccess]);

  return <div id="paypal-button-container"></div>;
}

export default PayPal;