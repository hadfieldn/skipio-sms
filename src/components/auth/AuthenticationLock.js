// @flow
import React from 'react';
import { Modal, Form, Button, Header, Loader } from 'semantic-ui-react';
import Wrapper from './Wrapper';
import { updateRelayEnvironment } from '../../data/RelayEnvironment';

const DefaultServer = 'https://stage.skipio.com';
const ServerVersion = 'v2';

type Props = {
  children: any,
};
type State = {
  isLocked: boolean,
  apiKey: string,
  server: string,
  isError: boolean,
  isLoading: boolean,
};

class AuthenticationLock extends React.PureComponent<Props, State> {
  state = {
    isLocked: true,
    apiKey: '',
    server: DefaultServer,
    isError: false,
    isLoading: false,
  };

  componentDidMount() {
    const apiKey = window.sessionStorage.getItem('apiKey');
    const server = window.sessionStorage.getItem('server');
    if (apiKey && server) {
      this.testAuthentication(server, apiKey)
        .then(() => {
          this.setState({ isLocked: false });
        })
        .catch(error => {
          this.setState({ isError: true });
        });
    }
    this.setState({ apiKey, server });
  }

  onFieldChange = (event: any, data: { name: string, value: string }) => {
    const { name, value } = data;
    this.setState({ [name]: value });
  };

  onSubmit = async () => {
    const { apiKey, server } = this.state;

    try {
      await this.testAuthentication(server, apiKey);
      window.sessionStorage.setItem('apiKey', apiKey);
      window.sessionStorage.setItem('server', server);
      this.setState({ isLocked: false, isError: false });
    } catch (error) {
      this.setState({ isError: true });
    }
  };

  onLogout = () => {
    window.sessionStorage.removeItem('apiKey');
    window.sessionStorage.removeItem('server');
    this.setState({
      isLocked: true,
      isError: false,
      apiKey: '',
      server: DefaultServer,
    });
  };

  testAuthentication = (server: string, apiKey: string): Promise<*> => {
    this.setState({ isLoading: true });
    return new Promise((resolve, reject) => {
      fetch(`${server}/api/${ServerVersion}/users/me?token=${apiKey}`)
        .then(res => {
          if (res.ok) {
            updateRelayEnvironment({ apiKey, server, apiVersion: ServerVersion });
            resolve();
          } else {
            reject();
          }
          this.setState({ isLoading: false });
        })
        .catch(error => {
          reject(error);
          this.setState({ isLoading: false });
        });
    });
  };

  render() {
    const { children } = this.props;
    const { isLocked, apiKey, server, isError, isLoading } = this.state;
    if (isLocked) {
      return (
        <Modal open dimmer="inverted" size="tiny">
          {isLoading && <Loader />}
          <Modal.Header><Header color="blue">Skipio</Header></Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.onSubmit} error={isError}>
              <Form.Input
                label="API Key"
                name="apiKey"
                type="password"
                value={apiKey}
                onChange={this.onFieldChange}
                error={isError}
              />
              <Form.Input
                label="Server"
                name="server"
                value={server}
                placeholder="https://stage.skipio.com"
                onChange={this.onFieldChange}
                error={isError}
              />
              <Form.Button primary control={Button}>
                Submit
              </Form.Button>
            </Form>
          </Modal.Content>
        </Modal>
      );
    }
    return <Wrapper onLogout={this.onLogout}>{children}</Wrapper>;
  }
}

export default AuthenticationLock;
