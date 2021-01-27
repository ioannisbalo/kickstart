import React from 'react';
import { Button, Table } from 'semantic-ui-react';
import Layout from '../../../components/Layout';
import RequestRow from '../../../components/RequestRow';
import web3 from '../../../ethereum/web3';
import Campaign from '../../../ethereum/build/Campaign';
import { Link } from '../../../routes';

export default class ShowRequests extends React.Component {
  static async getInitialProps({ query }) {
    const address = query.address;
    const contract = new web3.eth.Contract(JSON.parse(Campaign.interface), address);
    const contributors = await contract.methods.totalContributors().call();
    const requests = await ShowRequests.getRequests(contract);

    return { contract, address, requests, contributors };
  }

  static async getRequests(contract) {
    const requestCount = await contract.methods.getRequestCount().call();
    const requestsPromises = [];

    for (let i = 0; i < parseInt(requestCount); i++) {
      requestsPromises.push(contract.methods.requests(i).call());
    }

    return await Promise.all(requestsPromises);
  }

  constructor(props) {
    super(props);

    this.state = {
      requests: props.requests,
      contributors: props.contributors
    };
  }

  render() {
    const content = (
      <div>
        {this.renderRequests()}
        <Link route={`/campaigns/${this.props.address}/requests/new`}>
          <a>
            <Button
              content='Create Request'
              primary
            />
          </a>
        </Link>
      </div>
    );

    return (
      <Layout>{content}</Layout>
    );
  }

  renderRequests() {
    const requests = this.state.requests.map((request, index) => {
      return (
        <RequestRow
          key={index}
          request={request}
          id={index}
          contributors={this.state.contributors}
          onApprove={this.onApprove}
          onFinalize={this.onFinalize}
        ></RequestRow>
      );
    });

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Receiver</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell>Approval Count</Table.HeaderCell>
            <Table.HeaderCell>Complete</Table.HeaderCell>
            <Table.HeaderCell>Approve</Table.HeaderCell>
            <Table.HeaderCell>Finalize</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {requests}
        </Table.Body>
      </Table>
    );
  }

  onApprove = async (index) => {
    const accounts = await web3.eth.getAccounts();
    await this.props.contract.methods
      .approveRequest(index)
      .send({ from: accounts[0] });

    this.setState({ requests: await ShowRequests.getRequests(this.props.contract) })
  }

  onFinalize = async (index) => {
    const accounts = await web3.eth.getAccounts();
    await this.props.contract.methods
      .finalizeRequest(index)
      .send({ from: accounts[0] });

    this.setState({ requests: await ShowRequests.getRequests(this.props.contract) })
  }
}
