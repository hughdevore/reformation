import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Message from 'components/Form/Message';
import { Heading, FormWrap } from 'routes/Admin/styled';
import PodcastForm from './Form';

/* eslint-disable react/prop-types */

@compose(
  graphql(gql`
    mutation CreatePodcastMutation($input: CreatePodcastInput!) {
      createPodcast(input: $input) {
        id
      }
    }
  `)
)
class AddPodcast extends Component {
  state = {
    message: null,
  };

  onSubmit = (e, updates) => {
    e.preventDefault();

    this.props
      .mutate({
        variables: {
          input: updates,
        },
      })
      .then(({ data: { createPodcast } }) => {
        this.props.history.push({
          pathname: `/podcast/${createPodcast.id}`,
        });
      })
      .catch(() => this.setState({ message: 'error' }));
  };

  render() {
    return (
      <>
        <Heading>Add Podcast</Heading>
        {this.state.message === 'error' && <Message text="Error adding podcast." />}
        <FormWrap>
          <PodcastForm buttonLabel="Add Podcast" onSubmit={this.onSubmit} />
        </FormWrap>
      </>
    );
  }
}

export default AddPodcast;
