// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, Icon, Item, Label } from 'semantic-ui-react';

import styled from 'styled-components';

const ItemLine = styled.div``;

const PhoneItem = styled.div`
  padding-right: 8px;
  display: inline-block;
  vertical-align: middle;
`;

const ContactCard = (props: {
  contact: Object,
  onSendMessage: (contact: Object) => void,
  onViewMessages: (contact: Object) => void,
}) => {
  const { contact, onSendMessage, onViewMessages } = props;
  if (!contact) {
    return null;
  }

  return (
    <Item key={contact.id}>
      <Item.Image size="tiny" src={contact.avatarImageUrl} />
      <Item.Content>
        <Item.Header>
          {contact.fullName}{' '}
          {contact.isStarred && <Icon name="star" color="yellow" />}{' '}
        </Item.Header>
        <Item.Meta>
          <PhoneItem>{contact.phoneMobileNational}</PhoneItem>
          {!!contact.inboundMessageCount && (
            <Label
              as="a"
              color="green"
              onClick={() => onViewMessages(contact)}
            >
              <Icon name="mail" /> {contact.inboundMessageCount} / {contact.deliveredOutboundMessageCount}
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
          <Button
            primary
            size="small"
            floated="right"
            onClick={() => onSendMessage(contact)}
          >
            Send Message
          </Button>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

export default ContactCard;

export const ContactCardFragmentContainer = createFragmentContainer(
  ContactCard,
  graphql`
    fragment ContactCard_contact on Contact {
      id
      firstName
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
      isStarred
    }
  `,
);
