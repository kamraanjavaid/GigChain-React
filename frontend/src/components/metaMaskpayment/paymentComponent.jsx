// PaymentComponent.jsx
import React, { useState } from "react";
import Web3 from "web3";
import { connectWallet } from "../../services/MetaMaskService";

const PaymentComponent = () => {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");

  const handleConnect = async () => {
    try {
      const userAccount = await connectWallet();
      setAccount(userAccount);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handlePayment = async () => {
    try {
      if (!account || !amount) return;

      const web3 = new Web3(window.ethereum);

      // Convert amount to Wei (1 ETH = 10^18 Wei)
      const amountInWei = web3.utils.toWei(amount, "ether");

      console.log("account", account);

      console.log("amountInWei", amountInWei);

      // Create transaction
      const transaction = {
        from: account,
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Your wallet address
        value: amountInWei,
        gas: "21000", // Standard gas limit
      };

      // Send transaction
      const receipt = await web3.eth.sendTransaction(transaction);

      // Handle successful payment
      console.log("Payment successful:", receipt);

      // Send transaction details to your backend
      await saveTransactionToBackend(receipt);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <div>
      {!account ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETH"
          />
          <button onClick={handlePayment}>Pay with ETH</button>
        </div>
      )}
    </div>
  );
};

export default PaymentComponent;
