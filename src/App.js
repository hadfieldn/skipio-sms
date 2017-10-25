import React, { Component } from 'react';
import './App.css';
import ContactListContainer from './components/contact/ContactListContainer';
import { Container, Header } from 'semantic-ui-react';
import styled from 'styled-components';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Container>
          <ContactListContainer />
        </Container>
      </div>
    );
  }
}

export default App;
