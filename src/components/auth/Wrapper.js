// @flow
import React from 'react';
import { Button, Container } from 'semantic-ui-react';

type Props = {
  onLogout: Function,
  children: any,
};

const Wrapper = (props: Props) => {
  const { children, onLogout } = props;
  return (
    <Container>
      <Button
        content="Sign Out"
        icon="log out"
        labelPosition="right"
        floated="right"
        onClick={onLogout}
        basic
      />
      {children}
    </Container>
  );
};

export default Wrapper;
