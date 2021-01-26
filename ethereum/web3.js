import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && !!window.web3) {
  web3 = new Web3(window.web3.currentProvider);
} else {
  const provider = new Web3.providers.HttpProvider(
    'https://rinkeby.infura.io/v3/e9f53e136c9a4844a59b4a291913cec2'
  );

  web3 = new Web3(provider);
}

export default web3;
