import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import ConnectPage from "./Connect";

const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider, "any");
  library.pollingInterval = 15000;
  return library;
};

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div>
        <ConnectPage />
      </div>
    </Web3ReactProvider>
  );
}

export default App;
