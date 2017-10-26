import React, { Component } from 'react';
import { Container } from 'semantic-ui-react';
import { ToastContainer } from 'react-toastify';
import './App.css';
import ContactListContainer from './components/contacts/ContactListContainer';
import AuthenticationLock from './components/auth/AuthenticationLock';
import 'react-toastify/dist/ReactToastify.min.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Container>
          <ToastContainer
            position="top-right"
            type="default"
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            pauseOnHover
          />
          <AuthenticationLock>
            <ContactListContainer />
          </AuthenticationLock>
        </Container>
      </div>
    );
  }
}

export default App;
