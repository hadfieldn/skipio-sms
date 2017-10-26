// @flow
import React from 'react';
import { Button, Modal, Form, Header } from 'semantic-ui-react';
import styled from 'styled-components';
import _ from 'lodash';

const CharsRemainingWrapper = styled.div`
  margin: 4px 0;
`;

type Props = {
  onSend: (message: string) => void,
  onCancel: () => void,
  contact?: Object,
  maxChars?: number,
};
type State = {
  message: string,
};

class MessageEditor extends React.Component<Props, State> {
  state = {
    message: '',
  };

  onChange = (event: any, data: any) => {
    const value = data.value;
    this.setState({ message: value });
  };

  render() {
    const { onSend, onCancel, contact, maxChars = 160 } = this.props;
    const { message } = this.state;
    const charsRemaining = _.max([maxChars - _.size(message), 0]);
    return (
      <Modal dimmer="inverted" open size="tiny">
        <Modal.Header>
          Message {!!contact && `to ${contact.firstName}`}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.TextArea
              placeholder="Begin typing here..."
              maxLength={maxChars}
              autoHeight
              onChange={this.onChange}
              value={message}
            />
          </Form>
          <CharsRemainingWrapper>
            <Header
              sub
              floated="right"
              color={charsRemaining ? 'blue' : 'red'}
              as="div"
            >
              {_.size(message)}/{maxChars}
            </Header>
          </CharsRemainingWrapper>
        </Modal.Content>
        <Modal.Actions>
          <Button color="blue" onClick={() => onSend(message)}>
            Send
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default MessageEditor;
