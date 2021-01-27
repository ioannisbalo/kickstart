import React from 'react';
import { Card, Grid, Button } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import web3 from '../../ethereum/web3';
import Campaign from '../../ethereum/build/Campaign';
import ContributionForm from '../../components/ContributionForm';
import { Link } from '../../routes';

export default class ShowCampaign extends React.Component {
  static async getInitialProps({ query }) {
    const address = query.address;
    const contract = new web3.eth.Contract(JSON.parse(Campaign.interface), address);
    const summary = ShowCampaign.formatSummary(
      await contract.methods.getSummary().call()
    );

    return { contract, summary, address };
  }

  static formatSummary(summary) {
    return {
      balance: summary[0],
      minimum: summary[1],
      contributors: summary[2],
      requests: summary[3],
      manager: summary[4]
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      contract: props.contract,
      summary: props.summary
    };
  }

  render() {
    const content = (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10} floated='left'>
              <h3>Campaign Details</h3>
              {this.renderDetails()}
            </Grid.Column>
            <Grid.Column width={6} floated='right'>
              <ContributionForm onSubmit={this.onSubmit} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Link route={`/campaigns/${this.props.address}/requests`}>
                <a>
                  <Button
                    content='View Requests'
                    primary
                    />
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );

    return (
      <Layout>{content}</Layout>
    );
  }

  renderDetails() {
    const items = [
      {
        header: this.state.summary.balance,
        meta: 'Campaign Balance',
        description: 'The total amount of Wei contributed to this Campaign.'
      },
      {
        header: this.state.summary.minimum,
        meta: 'Minimum Contribution',
        description: 'The minimum amount of Wei required to become a contributor to this Campaign.'
      },
      {
        header: this.state.summary.requests,
        meta: 'Requests',
        description: 'The total number of payment requests.'
      },
      {
        header: this.state.summary.contributors,
        meta: 'Contributors',
        description: 'The total number of contributors for this Campaign.'
      }
    ];


    return <Card.Group items={items}/>;
  }

  onSubmit = async (value) => {
    const accounts = await web3.eth.getAccounts();
    await this.state.contract.methods
      .contribute()
      .send({ from: accounts[0], value });

    this.setState({ summary: await this.getSummary() });
  }

  getSummary = async () => {
    return ShowCampaign.formatSummary(
      await this.state.contract.methods.getSummary().call()
    );
  }
}
