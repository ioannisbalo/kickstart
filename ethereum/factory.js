import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const campaignFactory = new web3.eth.Contract(JSON.parse(CampaignFactory.interface), '0xBf9EA7Df999D8E4C765DCBF6ECf307D492f8ffa6');

export default campaignFactory;
