const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

class Compiler {
  constructor() {
    this.buildPath = path.resolve(__dirname, 'build');
    this.contractPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
  }

  async compile() {
    await this.emptyBuildDirectory();
    const contracts = await this.readAndCompileContracts();
    await this.writeContracts(contracts);
  }

  async emptyBuildDirectory() {
    await fs.remove(this.buildPath);
    await fs.ensureDir(this.buildPath);
  }

  async readAndCompileContracts() {
    const contractSource = await fs.readFile(this.contractPath, 'utf8');
    
    return solc.compile(contractSource, 1).contracts;
  }

  async writeContracts(contracts) {
    for (const contract in contracts) {
      const fileName = contract.slice(1, contract.length) + '.json';

      await fs.outputJson(
        path.resolve(this.buildPath, fileName),
        contracts[contract]
      );
    }
  }
}

new Compiler().compile();