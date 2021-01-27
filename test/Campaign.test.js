const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const compiledFactory = require('../ethereum/build/CampaignFactory');
const compiledCampaign = require('../ethereum/build/Campaign');

const web3 = new Web3(ganache.provider());

describe('A Campaign', () => {
  const minimum = '1000000';
  let factory;
  let accounts;
  let txInfo;
  let campaignAddress;
  let campaign;

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    txInfo = { gas: '1000000', from: accounts[0] }

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
      .deploy({ data: compiledFactory.bytecode })
      .send(txInfo);

    await factory.methods.createCampaign(minimum).send(txInfo);
    [campaignAddress] = await factory.methods.getCampaigns().call();
    campaign = new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress);
  });

  describe('Factory', () => {
    it('should deploy', () => {
      assert.ok(factory.options.address);
    });
  
    it('should be able to create a Campaign', async () => {
      assert.equal(await campaign.methods.minimum().call(), minimum);
      assert.equal(await campaign.methods.manager().call(), accounts[0]);
    });
  });

  describe('Contract', () => {
    it('should deploy', () => {
      assert.ok(campaign.options.address);
    });

    describe('contribute method', () => {
      it('should be successful', async () => {
        const initialBalance = await web3.eth.getBalance(campaignAddress);
        await campaign.methods.contribute().send({ from: accounts[1], value: '2000000', gas: '1000000' });
        const newBalance = await web3.eth.getBalance(campaignAddress);
        const isContributor = await campaign.methods.contributors(accounts[1]).call();

        assert(newBalance > initialBalance);
        assert(isContributor);
        assert.equal(await campaign.methods.totalContributors().call(), 1);
      });

      it('should not increase the contributors count if already contributed', async () => {
        await campaign.methods.contribute().send({ from: accounts[1], value: '2000000', gas: '1000000' });
        await campaign.methods.contribute().send({ from: accounts[1], value: '2000000', gas: '1000000' });

        assert.equal(await campaign.methods.totalContributors().call(), 1);
      });

      it('should throw an error for a value less than the minimum', async () => {
        assert.rejects(campaign.methods.contribute().send({ from: accounts[1], value: '1000', gas: '1000000' }));
        assert.equal(await campaign.methods.totalContributors().call(), 0);
      });
    });

    describe('createRequest method', () => {
      const amount = 5000000;
      const description = 'description';

      it('should be successful', async () => {
        const receiver = accounts[3];
        await campaign.methods.createRequest(receiver, amount, description).send(txInfo);
        const request = await campaign.methods.requests(0).call();
        
        assert.equal(request.receiver, receiver);
        assert.equal(request.amount, String(amount));
        assert.equal(request.description, description);
        assert.equal(request.complete, false);
      });

      it('should throw an error for an unauthorized sender', async () => {
        const receiver = accounts[3];

        assert.rejects(
          campaign.methods
            .createRequest(receiver, amount, description)
            .send({ from: accounts[1], gas: '1000000' })
        );
      });
    });

    describe('approveRequest method', () => {
      let receiver;
      const amount = 5000000;
      const description = 'description';

      beforeEach(async () => {
        receiver = accounts[3];
        await campaign.methods.createRequest(receiver, amount, description).send(txInfo);
      });

      it('should be successful', async () => {
        await campaign.methods.contribute().send({ from: accounts[1], value: '2000000', gas: '1000000'});
        await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000'});
        const request = await campaign.methods.requests(0).call();

        assert.equal(request.approvals, 1);
      });

      it('should throw an error if the sender is not a contributor', async () => {
        assert.rejects(campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000'}));
      });

      it('should throw an error if the sender has already approved', async () => {
        await campaign.methods.contribute().send({ from: accounts[1], value: '2000000', gas: '1000000'});
        await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000'});

        assert.rejects(campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000'}));
      });

      it('should throw an error if the request is completed', async () => {
        await campaign.methods.contribute().send({ from: accounts[1], value: '7000000', gas: '1000000'});
        await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000'});
        await campaign.methods.finalizeRequest(0).send(txInfo);

        assert.rejects(campaign.methods.approveRequest(0).send({ from: accounts[2], gas: '1000000'}));
      });
    });

    describe('finalizeRequest method', () => {
      let receiver;
      const amount = 5000000;
      const description = 'description';

      beforeEach(async () => {
        receiver = accounts[3];
        await campaign.methods.createRequest(receiver, amount, description).send(txInfo);
        await campaign.methods.contribute().send({ from: accounts[1], value: '7000000', gas: '1000000'});
        await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: '1000000'});
      });

      it('should by successful', async () => {
        const initialBalance = await web3.eth.getBalance(receiver);
        await campaign.methods.finalizeRequest(0).send(txInfo);
        const request = await campaign.methods.requests(0).call();
        const newBalance = await web3.eth.getBalance(receiver);

        assert(request.complete);
        assert(newBalance > initialBalance);
      });

      it('should throw an error for an unauthorized sender', async () => {
        assert.rejects(campaign.methods.finalizeRequest(0).send({ from: accounts[1], gas: '1000000' }));
      });

      it('should throw an error if the request is completed', async () => {
        await campaign.methods.finalizeRequest(0).send(txInfo);

        assert.rejects(campaign.methods.finalizeRequest(0).send(txInfo));
      });

      it('should throw an error if the request is approved by less or equal than 50% of contributors', async () => {
        await campaign.methods.contribute().send({ from: accounts[2], value: '7000000', gas: '1000000'});
        await campaign.methods.contribute().send({ from: accounts[4], value: '7000000', gas: '1000000'});
        await campaign.methods.contribute().send({ from: accounts[5], value: '7000000', gas: '1000000'});

        assert.rejects(campaign.methods.finalizeRequest(0).send(txInfo));
        await campaign.methods.approveRequest(0).send({ from: accounts[2], gas: '1000000'});
        assert.rejects(campaign.methods.finalizeRequest(0).send(txInfo));
        
        await campaign.methods.approveRequest(0).send({ from: accounts[4], gas: '1000000'});
        const txResponse = await campaign.methods.finalizeRequest(0).send(txInfo);
        assert.ok(txResponse);
      });
    });

    describe('getSummary method', () => {
      it('should be successful', async () => {
        const summary = await campaign.methods.getSummary().call();
        const balance = summary[0];
        const minimumContribution = summary[1];
        const totalContributors = summary[2];
        const requests = summary[3];
        const manager = summary[4];
        
        assert.equal(balance, '0');
        assert.equal(minimumContribution, minimum);
        assert.equal(totalContributors, '0');
        assert.equal(requests, '0');
        assert.equal(manager, accounts[0]);
      });
    });

    describe('getRequestCount method', () => {
      it('should be successful', async () => {
        await campaign.methods.createRequest(accounts[3], '100', 'request').send(txInfo);

        assert.equal(await campaign.methods.getRequestCount().call(), '1');
      });
    });
  });
});
