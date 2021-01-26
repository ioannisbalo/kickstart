import React from 'react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Card, Button } from 'semantic-ui-react';

export default class CampaignList extends React.Component {
  static async getInitialProps() {
    const campaigns = await factory.methods.getCampaigns().call();

    return { campaigns };
  }

  render() {
    const content = (
      <div>
        <h3>Open Campaigns</h3>
        <Button
          content='Create Campaign'
          icon='add circle'
          floated='right'
          primary
          />
        {this.renderCampaigns()}
      </div>
    );

    return <Layout>{content}</Layout>
  }

  renderCampaigns() {
    const items = this.props.campaigns.map(campaign => {
      return {
        header: campaign,
        description: <a>View Campaign</a>,
        fluid: true
      }
    });

    return <Card.Group items={items}></Card.Group>;
  }
}
