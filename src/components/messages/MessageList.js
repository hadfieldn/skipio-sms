// @flow
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import { Feed, Header, Divider } from 'semantic-ui-react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';

const BodyText = styled.div`
  color: ${props => (props.inbound ? '#2185CD' : 'inherit')};
`;

type Props = {
  contact: Object,
};

type State = {};

class MessageList extends React.Component<Props, State> {
  state = {};

  render() {
    const { contact } = this.props;
    if (!contact) {
      return null;
    }
    const { pagedMessages } = contact;

    const messages = _.get(pagedMessages, 'data', []);

    return (
      <Feed>
        {_.map(messages, message => {
          const isInbound = message.direction === 'inbound';
          const headerColor = isInbound ? 'blue' : 'grey';
          const timeAgo = moment(message.time).fromNow();
          return (
            <Feed.Event key={message.id}>
              <Feed.Label image={message.authorAvatarUrl} />
              <Feed.Content>
                <Feed.Summary>
                  <Header as="span" color={headerColor}>
                    {message.authorName}
                  </Header>
                  <Feed.Date>{timeAgo}</Feed.Date>
                </Feed.Summary>
                <Feed.Extra text>
                  <BodyText inbound={isInbound}>{message.body}</BodyText>
                </Feed.Extra>
                <Divider hidden />
              </Feed.Content>
            </Feed.Event>
          );
        })}
      </Feed>
    );
  }
}

export default MessageList;

export const MessageListRefetchContainer = createRefetchContainer(
  MessageList,
  {
    contact: graphql`
      fragment MessageList_contact on Contact
        @argumentDefinitions(
          page: { type: "Int", defaultValue: 0 }
          per: { type: "Int", defaultValue: 100 }
        ) {
        pagedMessages(per: $per, page: $page) {
          meta {
            currentPage
            nextPage
            prevPage
            totalCount
            totalPages
          }
          data {
            id
            time
            messageType
            direction
            body
            authorName
            authorAvatarUrl
            isRead
            isStarred
            human
          }
        }
      }
    `,
  },
  graphql`
    query MessageListRefetchQuery($contactId: ID!, $per: Int, $page: Int) {
      node(id: $contactId) {
        ...MessageList_contact @arguments(per: $per, page: $page)
      }
    }
  `,
);
