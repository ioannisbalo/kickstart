import React from 'react';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import Layout from '../../components/Layout'
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';
import { Router } from '../../routes';

export default class NewCampaign extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      minimum: '0',
      errorMessage: '',
      loading: false
    };
  }

  render() {
    const content = (
      <div>
        <h3>Create a new Campaign</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>Minimum Contribution</label>
            <Input
              label='Wei'
              labelPosition='right'
              value={this.state.minimum}
              onChange={(event) => this.setState({ minimum: event.target.value })}
            />
          </Form.Field>
          <Button
            type='submit'
            loading={this.state.loading}
            primary
          >Submit</Button>
          <Message
            error
            header='We were unable to process your request...'
            content={this.state.errorMessage}
          />
        </Form>
      </div>
    );

    return <Layout>{content}</Layout>
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: '' });

    try {
      const accounts = await web3.eth.getAccounts();
      await factory.methods.createCampaign(this.state.minimum).send({ from: accounts[0] });
      this.setState({ loading: false });
      
      Router.pushRoute('/');
    } catch (error) {
      this.setState({ errorMessage: error.message, loading: false });
    }
  }
}
