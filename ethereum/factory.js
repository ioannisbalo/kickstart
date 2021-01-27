import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const campaignFactory = new web3.eth.Contract(JSON.parse(CampaignFactory.interface), '0x0D6CF603b54780f23971C45cbcaD6C89a8D1b40C');

export default campaignFactory;
