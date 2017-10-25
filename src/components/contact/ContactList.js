// @flow
import React from 'react';
import _ from 'lodash';
import { createRefetchContainer, graphql } from 'react-relay';
import { Button, Icon, Item, Header, Divider, Label } from 'semantic-ui-react';

import styled from 'styled-components';
import PaginationMenu from '../PaginationMenu';

const ItemLine = styled.div``;

const PhoneItem = styled.div`
  padding-right: 8px;
  display: inline-block;
  vertical-align: middle;
`;

const Wrapper = styled.div`
  margin: 32px 0;
`;

type Props = {
  viewer: Object,
  relay: Object,
};

class ContactList extends React.Component<Props, any> {
  render() {
    const { viewer, relay } = this.props;
    if (!viewer) {
      return null;
    }
    const { pagedContacts } = viewer;
    console.log({ pagedContacts });
    const { meta, data } = pagedContacts;

    console.log({ meta, data });
    return (
      <Wrapper>
        <Header as="h1" color="blue">
          Contacts
        </Header>
        <PaginationMenu
          meta={meta}
          relay={relay}
          onUpdate={() => {
            console.log('udpate');
            this.forceUpdate();
          }}
        />
        <Divider hidden />
        <Item.Group divided>
          {_.map(data, contact => {
            return (
              <Item key={contact.id}>
                <Item.Image size="tiny" src={contact.avatarImageUrl} />
                <Item.Content>
                  <Item.Header>{contact.fullName}</Item.Header>
                  <Item.Meta>
                    <PhoneItem>{contact.phoneMobileNational}</PhoneItem>
                    {!!contact.inboundMessageCount && (
                      <Label color="green" size="mini">
                        <Icon name="mail" /> {contact.inboundMessageCount}
                      </Label>
                    )}
                    {!!contact.deliveredOutboundMessageCount && (
                      <Label size="mini">
                        {contact.deliveredOutboundMessageCount} Sent
                      </Label>
                    )}
                  </Item.Meta>
                  <Item.Description>
                    <ItemLine>{contact.streetAddress}</ItemLine>
                    <ItemLine>
                      {contact.city} {contact.state} {contact.zipCode}
                    </ItemLine>
                  </Item.Description>
                  <Item.Extra>
                    <Button size="small" floated="right">Send Message</Button>
                  </Item.Extra>
                </Item.Content>
              </Item>
            );
          })}
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
          page: { type: "Int", defaultValue: 0 }
          per: { type: "Int", defaultValue: 5 }
        ) {
        pagedContacts(per: $per, page: $page) {
          meta {
            currentPage
            nextPage
            prevPage
            totalCount
            totalPages
          }
          data {
            id
            fullName
            avatarImageUrl
            phoneMobileNational
            email
            streetAddress
            city
            state
            zipCode
            inboundMessageCount
            deliveredOutboundMessageCount
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
