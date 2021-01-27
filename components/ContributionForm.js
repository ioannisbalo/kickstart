import React from 'react';
import { Form, Input, Button, Message } from 'semantic-ui-react';

export default class ContributionForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMessage: '',
      success: false,
      value: '0',
      loading: false
    };
  }

  render() {
    return (
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage} success={this.state.success} floated='right'>
        <Form.Field>
          <label>Contribute to this Campaign!</label>
          <Input
            label='Wei'
            labelPosition='right'
            value={this.state.value}
            onChange={(event) => this.setState({ value: event.target.value })}
          />
        </Form.Field>
        <Button
          type='submit'
          loading={this.state.loading}
          primary
        >Contribute
        </Button>
        <Message
          error
          header='We were unable to process your request...'
          content={this.state.errorMessage}
        />
        <Message
          success
          header='Success!'
          content='You are now a contributor for this Campaign!'
        />
      </Form>
    );
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ success: false, loading: true, errorMessage: '' });

    try {
      await this.props.onSubmit(this.state.value);

      this.setState({ success: true, loading: false, value: '' });
    } catch (error) {
      this.setState({ errorMessage: error.message, loading: false });
    }
  }
}
