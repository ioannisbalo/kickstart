import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { Link } from '../routes';

export default () => {
  return (
    <Menu style={{ marginTop: 0, borderRadius: 0 }}>
      <Link route='/'>
        <a className='item'>Kickstart</a>
      </Link>
      <Menu.Menu position='right'>
        <Link route='/'>
          <a className='item'>Campaigns</a>
        </Link>
        <Link route='/campaigns/new'>
          <a className='item'><Icon name='add circle'/></a>
        </Link>
      </Menu.Menu>
    </Menu>
  );
};
