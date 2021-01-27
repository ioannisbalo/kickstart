const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const fs = require('fs');
const compiledFactory = require('./build/CampaignFactory');

class Deployer {
  constructor() {
    const mnemonic = fs.readFileSync('./mnemonic', 'utf8');
    const rinkebyUrl = 'https://rinkeby.infura.io/v3/e9f53e136c9a4844a59b4a291913cec2';
    const provider = new HDWalletProvider(mnemonic, rinkebyUrl);
    this.web3 = new Web3(provider);
  }

  async deploy() {
    try {
      const accounts = await this.web3.eth.getAccounts();
  
      console.log(`Attempting to deploy CampaignFactory with ${accounts[0]} to Rinkby Test Network.`);
  
      const result = await new this.web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000' });
  
      console.log(`CampaignFactory deployed to Rinkby Test Network at ${result.options.address}`);
    } catch (error) {
      console.log(error);
    }
  }
}

new Deployer().deploy();
