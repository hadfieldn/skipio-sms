// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import RelayEnvironment from './../../data/RelayEnvironment';
import { ContactListRefetchContainer } from './ContactList';
import { Loader } from 'semantic-ui-react';

type Props = {

};

const ContactListContainer = (propsx: Props) => {
  return (
  <QueryRenderer
    environment={RelayEnvironment}
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
        console.log({ viewer: props.viewer });
        return (
          <ContactListRefetchContainer viewer={props.viewer} />
        );
      }
      return <Loader active size="medium">Loading</Loader>;
    }}
  />
  );
};

export default ContactListContainer;
