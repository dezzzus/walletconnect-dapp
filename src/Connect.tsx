import React from "react";
import styled from "styled-components";

import QRCodeModal from "@walletconnect/qrcode-modal";

import Web3 from "web3";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const bridge = process.env.REACT_APP_BRIDGE_SERVER || "https://bridge.walletconnect.org";

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97, 137, 80001],
});

const ConnectPage = () => {
  const { activate, account, library } = useWeb3React();
  const [state, setState] = React.useState<string>("");

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
    const walletconnect = new WalletConnectConnector({
      rpc: { 1: process.env.REACT_APP_INFURA_URL || "" },
      bridge,
      qrcodeModal: QRCodeModal,
    });
    
    activate(walletconnect, undefined, true).catch((error) => {
      if (error instanceof UnsupportedChainIdError) {
        activate(walletconnect);
      } else {
        console.info("Connection Error - ", error);
      }
    });
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
      <ConnectButton onClick={connectWalletConnect}>
        Connect WalletConnect
      </ConnectButton>
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
  text-align: center;
  font-weight: 800;
`;

const Text = styled.span`
  margin-top: 30px;
  word-break: break-word;
`;