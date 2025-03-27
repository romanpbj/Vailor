import { useState, useEffect } from "react";

function usePayPalSDK(clientId) {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
    } else {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        setSdkReady(true);
      };
      script.onerror = () => {
        console.error("Failed to load PayPal SDK");
        setSdkReady(false);
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [clientId]);

  return sdkReady;
}

export default usePayPalSDK;