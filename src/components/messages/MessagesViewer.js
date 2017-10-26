// @flow
import React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import MessageListContainer from './MessageListContainer';

type Props = {
  onClose: Function,
  contact: Object,
};

class MessagesViewer extends React.PureComponent<Props, any> {
  render() {
    const { contact, onClose } = this.props;
    return (
      <Modal dimmer="inverted" open size="tiny" onClose={onClose} >
        <Modal.Header>
          Messages {!!contact && `with ${contact.firstName}`}
        </Modal.Header>
        <Modal.Content scrolling>
          <MessageListContainer contactId={contact.id} />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={onClose}>Close</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default MessagesViewer;
