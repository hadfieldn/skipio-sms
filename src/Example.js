import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import _ from 'lodash';
import RelayEnvironment from './data/RelayEnvironment';
import SendSMS from './data/mutations/SendSMS';
import keysToCamelCase from './data/schema/keysToCamelCase';

console.log({
  camelCaseKeys: keysToCamelCase({ ids: ['0000', '0001', '00002'] }),
});

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
          contacts {
            id
            firstName
            avatarImageUrl
            campaigns {
              id
              name
              description
              contactsCount
              contactIds
              contacts {
                firstName
              }
            }
          }
          sentMessageList: messageLists(scope: SENT) {
            id
            contact {
              firstName
              lastName
              avatarImageUrl
            }
            inboundMessageCount
            deliveredOutboundMessageCount
            mostRecentMessage {
              authorName
              body
              deliveredAt
              human
              isRead
              isStarred
              author {
                firstName
                lastName
                avatarImageUrl
              }
            }
          }
          inboxMessageList: messageLists(scope: INBOX) {
            id
            contact {
              firstName
              lastName
              avatarImageUrl
            }
            inboundMessageCount
            deliveredOutboundMessageCount
            mostRecentMessage {
              authorName
              body
              deliveredAt
              human
              isRead
              isStarred
              author {
                firstName
                lastName
                avatarImageUrl
              }
            }
          }
        }
      }
    `}
    render={({ error, props }) => {
      console.log({ props });
      if (error) {
        return <div>{error.message}</div>;
      } else if (props) {
        console.log({ viewer: props.viewer });
        return (
          <div>
            <div>{_.get(props, 'viewer.firstName')} is great!</div>
            <img alt="Avatar" src={_.get(props, 'viewer.avatarImageUrl')} />
            {_.map(_.get(props, 'viewer.contacts'), contact => (
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
