// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import RelayEnvironment from './../../data/RelayEnvironment';
import { ContactListRefetchContainer } from './ContactList';
import { Loader } from 'semantic-ui-react';

type Props = {};

const ContactListContainer = (propsx: Props) => {
  return (
    <QueryRenderer
      environment={RelayEnvironment.environment}
      query={graphql`
        query ContactListContainerQuery {
          viewer {
            ...ContactList_viewer
          }
        }
      `}
      render={({ error, props }) => {
        if (error) {
          return <div>{error.message}</div>;
        } else if (props) {
          return <ContactListRefetchContainer viewer={props.viewer} />;
        }
        return <Loader active size="medium" />;
      }}
    />
  );
};

export default ContactListContainer;
