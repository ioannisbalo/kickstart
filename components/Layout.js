import React from 'react';
import Header from './Header';
import { Container } from 'semantic-ui-react';

export default (props) => {
  return (
    <div>
      <link
        rel='stylesheet'
        href='//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css'
      />
      <Header />
      <Container>
        {props.children}
      </Container>
    </div>
  );
};
