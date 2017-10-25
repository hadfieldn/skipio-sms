import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import _ from 'lodash';
import RelayEnvironment from './data/RelayEnvironment';
import SendSMS from './data/mutations/SendSMS';
import { Button } from 'semantic-ui-react';

const onClick = contact => {
  SendSMS(RelayEnvironment, [contact.id], 'This is a test message B')
    .then(console.log)
    .catch(console.error);
};

// Render this somewhere with React:
const Example = props => (
  <QueryRenderer
    environment={RelayEnvironment}
    query={graphql`
      query ExampleQuery {
        viewer {
          firstName
          lastName
          avatarImageUrl
          pagedContacts {
            meta {
              currentPage
              nextPage
              prevPage
              totalCount
              totalPages
            }
            data {
              id
              firstName
              avatarImageUrl
            }
          }
        }
      }
    `}
    render={({ error, props }) => {
      if (error) {
        return <div>{error.message}</div>;
      } else if (props) {
        console.log({ viewer: props.viewer });
        return (
          <div>
            <Button>Click here</Button>
            <div>{_.get(props, 'viewer.firstName')} is great!</div>
            <img alt="Avatar" src={_.get(props, 'viewer.avatarImageUrl')} />
            {_.map(_.get(props, 'viewer.pagedContacts.data'), contact => (
              <div key={contact.id}>
                <div>{contact.firstName}</div>
                <div onClick={() => onClick(contact)}>
                  <img alt="Avatar" src={contact.avatarImageUrl} />
                </div>
              </div>
            ))}
          </div>
        );
      }
      return <div>Loading</div>;
    }}
  />
);

export default Example;
