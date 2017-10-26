// @flow
import React from 'react';
import _ from 'lodash';
import { createRefetchContainer, graphql } from 'react-relay';
import { Item, Header, Divider } from 'semantic-ui-react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import PaginationMenu from '../PaginationMenu';
import { ContactCardFragmentContainer } from './ContactCard';
import MessageEditor from '../messages/MessageEditor';
import MessagesViewer from '../messages/MessagesViewer';
import SendSMS from '../../data/mutations/SendSMS';

const Wrapper = styled.div`
  margin: 32px 0;
`;

type Props = {
  viewer: Object,
  relay: Object,
};

type State = {
  isMessageEditorOpen: boolean,
  isMessagesViewerOpen: boolean,
  activeContact: Object | null,
};

class ContactList extends React.Component<Props, State> {
  state = {
    isMessageEditorOpen: false,
    activeContact: null,
    isMessagesViewerOpen: false,
  };

  paginationMenu = null;

  onSendMessageClick = (contact: Object) => {
    this.setState({ isMessageEditorOpen: true, activeContact: contact });
  };

  onSendMessage = (message: string) => {
    const { relay } = this.props;
    const { activeContact } = this.state;
    const paginationMenu = this.paginationMenu;

    if (!activeContact || !relay) {
      return;
    }

    SendSMS(relay.environment, [activeContact.id], message)
      .then(() => {
        toast.success('Message sent successfully!');
        if (paginationMenu) {
          paginationMenu.refetch();
        }
      })
      .catch(error => {
        toast.error(error.message);
      });

    this.closeMessageEditor();
  };

  onViewMessagesClick = (contact: Object) => {
    this.setState({ isMessagesViewerOpen: true, activeContact: contact });
  };

  closeMessagesViewer = () => {
    this.setState({ isMessagesViewerOpen: false, activeContact: null });
  };

  closeMessageEditor = () => {
    this.setState({ isMessageEditorOpen: false, activeContact: null });
  };

  render() {
    const { viewer, relay } = this.props;
    const {
      isMessageEditorOpen,
      isMessagesViewerOpen,
      activeContact,
    } = this.state;

    if (!viewer) {
      return null;
    }

    const { pagedContacts } = viewer;
    const { meta, data } = pagedContacts;

    return (
      <Wrapper>
        {isMessageEditorOpen && activeContact && (
          <MessageEditor
            maxChars={viewer.maxCharacters}
            contact={activeContact}
            onCancel={this.closeMessageEditor}
            onSend={this.onSendMessage}
          />
        )}
        {isMessagesViewerOpen && activeContact && (
          <MessagesViewer
            contact={activeContact}
            onClose={this.closeMessagesViewer}
          />
        )}
        <Header as="h1" color="blue">
          My Contacts
        </Header>
        <PaginationMenu
          meta={meta}
          relay={relay}
          ref={c => {
            this.paginationMenu = c;
          }}
        />
        <Divider hidden />
        <Divider hidden />
        <Item.Group divided>
          {_.map(data, contact => (
            <ContactCardFragmentContainer
              key={contact.id}
              contact={contact}
              onSendMessage={this.onSendMessageClick}
              onViewMessages={this.onViewMessagesClick}
            />
          ))}
        </Item.Group>
      </Wrapper>
    );
  }
}

export default ContactList;

export const ContactListRefetchContainer = createRefetchContainer(
  ContactList,
  {
    viewer: graphql`
      fragment ContactList_viewer on User
        @argumentDefinitions(
          page: { type: "Int", defaultValue: 1 }
          per: { type: "Int", defaultValue: 5 }
        ) {
        maxCharacters
        pagedContacts(per: $per, page: $page) {
          meta {
            currentPage
            nextPage
            prevPage
            totalCount
            totalPages
          }
          data {
            ...ContactCard_contact
            id
          }
        }
      }
    `,
  },
  graphql`
    query ContactListRefetchQuery($page: Int, $per: Int) {
      viewer {
        ...ContactList_viewer @arguments(page: $page, per: $per)
      }
    }
  `,
);
