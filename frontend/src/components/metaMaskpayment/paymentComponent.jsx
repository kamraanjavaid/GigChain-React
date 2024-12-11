import React, { useState } from "react";
import axios from "axios";
import Web3 from "web3";
import { connectWallet } from "../../services/MetaMaskService";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./styles/paymentComponent.module.scss";

const PaymentComponent = () => {
  const { currentUser } = useAuth();
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");

  const handleConnect = async () => {
    try {
      const userAccount = await connectWallet();
      setAccount(userAccount);
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/users/user/${currentUser._id}/update-wallet-address`,
          { walletAddress: userAccount }
        );
        console.log("Wallet address updated successfully:", response);
      } catch (error) {
        console.error("Error updating wallet address:", error);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handlePayment = async () => {
    try {
      if (!account || !amount) return;

      const web3 = new Web3(window.ethereum);

      const amountInWei = web3.utils.toWei(amount, "ether");

      console.log("account", account);

      console.log("amountInWei", amountInWei);

      const transaction = {
        from: account,
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: amountInWei,
        gas: "21000",
      };

      const receipt = await web3.eth.sendTransaction(transaction);

      console.log("Payment successful:", receipt);

      await saveTransactionToBackend(receipt);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <div>
      {!account ? (
        <button
          onClick={handleConnect}
          className={styles.payment_component_button}
        >
          Connect Wallet
        </button>
      ) : (
        <div className={styles.payment_component}>
          <p className={styles.payment_component_text}>
            <i className="fas fa-wallet"></i> Wallet Connected
          </p>
          {/* <p>Connected Account: {account}</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETH"
          />
          <button onClick={handlePayment}>Pay with ETH</button> */}
        </div>
      )}
    </div>
  );
};

export default PaymentComponent;
