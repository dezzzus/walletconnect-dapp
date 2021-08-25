import React from "react";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

const ConnectPage = () => {
  const [connector, setConnector] = React.useState<WalletConnect>();

  const subscribeToEvents = (connector: WalletConnect) => {
    console.log("=========================", connector);

    if (!connector) {
      return;
    }

    connector.on("session_update", async (error, payload) => {
      if (error) {
        throw error;
      }

      const { chainId, accounts } = payload.params[0];
      console.log("<<<<<<< session_update >>>>>>>", chainId, accounts);
    });

    connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      console.log("<<<<<<< connect >>>>>>>");
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }
    });

    console.log("<<<<<<< disconnect >>>>>>>");
  };

  React.useEffect(() => {
    const createSession = async () => {
      if (connector && !connector.connected) {
        await connector.createSession();

      }
    }

    createSession();
  }, [connector]);

  const connect = async () => {
    const bridge = "wss://wc-bridge-5qt5i.ondigitalocean.app:443";

    // create new connector
    const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });
    await connector.createSession();
    subscribeToEvents(connector);
  }

  return (
    <button onClick={connect}>
      Connect Wallet
    </button>
  )
}

export default ConnectPage;