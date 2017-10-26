// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, Icon, Item, Label } from 'semantic-ui-react';

import styled from 'styled-components';

const ItemLines = styled.div`
  display: inline-block;
  margin-top: 8px;
`;
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
          {contact.isStarred && <Icon name="star" color="yellow" />}
        </Item.Header>
        <Item.Meta>
          <PhoneItem>{contact.phoneMobileNational}</PhoneItem>
          <Button
            primary
            floated="right"
            onClick={() => onSendMessage(contact)}
          >
            Send Message
          </Button>
        </Item.Meta>
        <Item.Description>
          <ItemLines>
            <ItemLine>{contact.streetAddress}</ItemLine>
            <ItemLine>
              {contact.city} {contact.state} {contact.zipCode}
            </ItemLine>
          </ItemLines>
        </Item.Description>
        <Item.Extra>
          <Label
            size="tiny"
            as="a"
            icon="mail"
            content={`${contact.inboundMessageCount} / ${contact.deliveredOutboundMessageCount}`}
            onClick={() => onViewMessages(contact)}
          />
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
