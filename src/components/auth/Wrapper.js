// @flow
import React from 'react';
import { Button, Container, Image, Header } from 'semantic-ui-react';
import styled from 'styled-components';

const LogoWrapper = styled.div`
  display: inline-block;
`;

const PageWrapper = styled.div`
  margin: 24px 0;
`;

type Props = {
  onLogout: Function,
  children: any,
};

const Wrapper = (props: Props) => {
  const { children, onLogout } = props;
  return (
    <PageWrapper>
      <Container>
        <LogoWrapper><Image src="logo-dark2.png" width={92} /></LogoWrapper>
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
    </PageWrapper>
  );
};

export default Wrapper;
