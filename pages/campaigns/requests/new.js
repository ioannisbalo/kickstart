import React from 'react';
import { Form, Input, Button, Message, Grid } from 'semantic-ui-react';
import Layout from '../../../components/Layout';
import web3 from '../../../ethereum/web3';
import Campaign from '../../../ethereum/build/Campaign';
import { Link } from '../../../routes';

export default class NewRequest extends React.Component {
  static async getInitialProps({ query }) {
    const address = query.address;
    const contract = new web3.eth.Contract(JSON.parse(Campaign.interface), address);

    return { contract, address };
  }

  constructor(props) {
    super(props);

    this.state = {
      amount: '',
      description: '',
      receiver: '',
      loading: false,
      success: false,
      errorMessage: ''
    }
  }

  render() {
    const content = (
      <div>
        <Grid>
          <Grid.Column width={5}>
            <h3>Create a new payment request</h3>
            {this.renderForm()}
          </Grid.Column>
          <Grid.Column width={3} floated='right'>
            <Link route={`/campaigns/${this.props.address}/requests/`}>
              <a>
                <Button
                  content='Back to Request list'
                  primary
                />
              </a>
            </Link>
          </Grid.Column>
        </Grid>
      </div>
    );

    return <Layout>{content}</Layout>;
  }

  renderForm() {
    return (
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage} success={this.state.success}>
        <Form.Field>
          <label>The receiver address of the payment</label>
          <Input
            value={this.state.receiver}
            onChange={(event) => this.setState({ receiver: event.target.value })}
          />
        </Form.Field>
        <Form.Field>
          <label>Payment Request amount in Wei</label>
          <Input
            label='Wei'
            labelPosition='right'
            value={this.state.amount}
            onChange={(event) => this.setState({ amount: event.target.value })}
          />
        </Form.Field>
        <Form.Field>
          <label>What is this payment for?</label>
          <Input
            value={this.state.description}
            onChange={(event) => this.setState({ description: event.target.value })}
          />
        </Form.Field>
        <Button
          type='submit'
          loading={this.state.loading}
          primary
        >Create Request
        </Button>
        <Message
          error
          header='We were unable to process your request...'
          content={this.state.errorMessage}
        />
        <Message
          success
          header='Success!'
          content='A new payment request has been created.'
        />
      </Form>
    );
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ success: false, loading: true, errorMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      await this.props.contract.methods.createRequest(
        this.state.receiver, this.state.amount, this.state.description
      ).send({ from: accounts[0] });

      this.setState({ success: true, loading: false, amount: '', description: '', receiver: '' });
    } catch (error) {
      this.setState({ errorMessage: error.message, loading: false });
    }
  }
}
