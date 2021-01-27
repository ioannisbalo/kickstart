import React from 'react';
import { Button, Table } from 'semantic-ui-react';

export default class RequestRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const percentage = Math.floor(this.props.request.approvals / this.props.contributors * 100);

    return (
      <Table.Row>
        <Table.Cell>{this.props.id}</Table.Cell>
        <Table.Cell>{this.props.request.receiver}</Table.Cell>
        <Table.Cell>{this.props.request.amount}</Table.Cell>
        <Table.Cell>{this.props.request.description}</Table.Cell>
        <Table.Cell positive={!this.props.request.complete && percentage > 50}>{this.props.request.approvals}/{this.props.contributors} ({percentage}%)</Table.Cell>
        <Table.Cell positive={this.props.request.complete}>{this.props.request.complete ? 'Yes' : 'No'}</Table.Cell>
        <Table.Cell>
          <Button
            color='green'
            basic
            loading={this.state.loading}
            disabled={this.props.request.complete}
            onClick={(event) => this.onAction(event, this.props.onApprove)}
          >
            Approve
          </Button>
        </Table.Cell>
        <Table.Cell>
          <Button
            color='teal'
            basic
            loading={this.state.loading}
            disabled={this.props.request.complete}
            onClick={(event) => this.onAction(event, this.props.onFinalize)}
          >
            Finalize
          </Button>
        </Table.Cell>
      </Table.Row>
    );
  }

  onAction = async (event, action) => {
    event.preventDefault();
    this.setState({ loading: true });

    try {
      await action(this.props.id);

      this.setState({ loading: false, value: '' });
    } catch (error) {
      this.setState({ loading: false });
    }
  }
}
