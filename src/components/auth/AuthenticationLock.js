// @flow
import React from 'react';
import { Modal, Form, Button, Loader, Image } from 'semantic-ui-react';
import Wrapper from './Wrapper';
import { updateRelayEnvironment } from '../../data/RelayEnvironment';

const DefaultServer = 'https://stage.skipio.com';
const ServerVersion = 'v2';

type Props = {
  children: any,
};
type State = {
  isLocked: boolean,
  apiToken: string,
  server: string,
  isError: boolean,
  isLoading: boolean,
};

class AuthenticationLock extends React.PureComponent<Props, State> {
  state = {
    isLocked: true,
    apiToken: '',
    server: DefaultServer,
    isError: false,
    isLoading: false,
  };

  componentDidMount() {
    const apiToken = window.sessionStorage.getItem('apiToken') || '';
    let server = window.sessionStorage.getItem('server') || '';
    if (apiToken && server) {
      this.testAuthentication(server, apiToken)
        .then(() => {
          this.setState({ isLocked: false });
        })
        .catch(error => {
          this.setState({ isError: true });
        });
    } else if (!server) {
      server = DefaultServer;
    }
    this.setState({ apiToken, server });
  }

  onFieldChange = (event: any, data: { name: string, value: string }) => {
    const { name, value } = data;
    this.setState({ [name]: value });
  };

  onSubmit = async () => {
    const { apiToken, server } = this.state;

    try {
      await this.testAuthentication(server, apiToken);
      window.sessionStorage.setItem('apiToken', apiToken);
      window.sessionStorage.setItem('server', server);
      this.setState({ isLocked: false, isError: false });
    } catch (error) {
      this.setState({ isError: true });
    }
  };

  onLogout = () => {
    window.sessionStorage.removeItem('apiToken');
    window.sessionStorage.removeItem('server');
    this.setState({
      isLocked: true,
      isError: false,
      apiToken: '',
      server: DefaultServer,
    });
  };

  testAuthentication = (server: string, apiToken: string): Promise<*> => {
    this.setState({ isLoading: true });
    return new Promise((resolve, reject) => {
      if (!server || !apiToken) {
        reject();
      }
      fetch(`${server}/api/${ServerVersion}/users/me?token=${apiToken}`)
        .then(res => {
          if (res.ok) {
            updateRelayEnvironment({
              apiToken,
              server,
              apiVersion: ServerVersion,
            });
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
    const { isLocked, apiToken, server, isError, isLoading } = this.state;
    if (isLocked) {
      return (
        <Modal open dimmer="inverted" size="tiny">
          {isLoading && <Loader />}
          <Modal.Header>
            <Image src="logo-dark2.png" width={92} centered />
          </Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.onSubmit} error={isError}>
              <Form.Input
                label="API Token"
                name="apiToken"
                type="password"
                value={apiToken}
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
