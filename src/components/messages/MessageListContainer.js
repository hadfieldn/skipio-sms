// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import RelayEnvironment from './../../data/RelayEnvironment';
import { MessageListRefetchContainer } from './MessageList';
import { Loader } from 'semantic-ui-react';
import styled from 'styled-components';

const Spacer = styled.div`
  height: 64px;
`;

type Props = {
  contactId: string,
};

const MessageListContainer = (propsx: Props) => {
  return (
    <QueryRenderer
      environment={RelayEnvironment.environment}
      query={graphql`
        query MessageListContainerQuery($contactId: ID!) {
          node(id: $contactId) {
            ...MessageList_contact
          }
        }
      `}
      variables={{ contactId: propsx.contactId }}
      render={({ error, props }) => {
        if (error) {
          return <div>{error.message}</div>;
        } else if (props) {
          return <MessageListRefetchContainer contact={props.node} />;
        }
        return (
          <Spacer>
            <Loader active size="medium" />
          </Spacer>
        );
      }}
    />
  );
};

export default MessageListContainer;
