import React from "react";
import styled from "styled-components";

// import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

import Web3 from "web3";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97, 137, 80001],
});

const walletconnect = new WalletConnectConnector({
  rpc: { 1: process.env.REACT_APP_INFURA_URL || "" },
  bridge: process.env.REACT_APP_BRIDGE_SERVER || "https://bridge.walletconnect.org",
  qrcodeModal: QRCodeModal,
});

const ConnectPage = () => {
  const { activate, account, library } = useWeb3React();
  const [state, setState] = React.useState<string>("");

  // const [connector, setConnector] = React.useState<WalletConnect | undefined>();
  // const subscribeToEvents = (connector: WalletConnect) => {
  //   console.log("=========================", connector);

  //   if (!connector) {
  //     return;
  //   }

  //   connector.on("session_update", async (error, payload) => {
  //     if (error) {
  //       throw error;
  //     }

  //     const { chainId, accounts } = payload.params[0];
  //     console.log("<<<<<<< session_update >>>>>>>", chainId, accounts);
  //   });

  //   connector.on("connect", (error, payload) => {
  //     if (error) {
  //       throw error;
  //     }

  //     console.log("<<<<<<< connect >>>>>>>");
  //   });

  //   connector.on("disconnect", (error, payload) => {
  //     if (error) {
  //       throw error;
  //     }

  //     console.log("<<<<<<< disconnect >>>>>>>");
  //   });

  //   setConnector(connector);
  // };

  // React.useEffect(() => {
  //   const createSession = async () => {
  //     if (connector && !connector.connected) {
  //       await connector.createSession();
  //     }
  //   };

  //   createSession();
  // }, [connector]);

  React.useEffect(() => {
    if (account && account.length > 0) {
      const web3 = new Web3(library.provider);
      const msgParams = JSON.stringify({
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
          ],
          Mail: [
            { name: "Address", type: "address" },
            { name: "Nonce", type: "string" },
          ],
        },
        primaryType: "Mail",
        domain: {
          name: "Privi Pix",
          version: "1.0.0-beta",
        },
        message: {
          Address: account,
          Nonce: "0x123456789",
        },
      });
      let params = [account, msgParams];
      let method = "eth_signTypedData_v3";
      const provider = web3.currentProvider;

      (provider as any).sendAsync(
        {
          method,
          params,
          from: account,
        },
        function (err: any, result: any) {
          console.log("sign error", err);
          if (result.error) {
            console.log("sign err", result.error);
          }
          if (result.result) {
            console.log("success", result.result);
            setState("Success: " + result.result);
          }
        }
      );
    }
  }, [account, library?.provider]);

  const connectWalletConnect = async () => {
    activate(walletconnect, undefined, true).catch((error) => {
      if (error instanceof UnsupportedChainIdError) {
        activate(walletconnect);
      } else {
        console.info("Connection Error - ", error);
      }
    });
    // const bridge = "wss://wc-bridge-5qt5i.ondigitalocean.app:443";

    // // create new connector
    // const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });
    // await connector.createSession();
    // subscribeToEvents(connector);
  };

  const connectMetamask = async () => {
    activate(injected, undefined, true).catch((error) => {
      console.info("Connection Error - ", error);
      if (error instanceof UnsupportedChainIdError) {
        activate(injected);
      } else {
        console.info("Connection Error - ", error);
      }
    });
  };

  return (
    <Container>
      <Title>Welcome to our test app</Title>
      <ConnectButton onClick={connectMetamask}>Connect MetaMask</ConnectButton>
      <ConnectButton onClick={connectWalletConnect}>Connect WalletConnect</ConnectButton>
      <Text>{state}</Text>
    </Container>
  );
};

export default ConnectPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ConnectButton = styled.button`
  width: 300px;
  height: 50px;
  & + & {
    margin-top: 20px;
  }
`;

const Title = styled.h1`
  font-weight: 800;
`;

const Text = styled.span`
  margin-top: 30px;
`;