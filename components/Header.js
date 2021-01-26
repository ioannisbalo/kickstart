import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';

export default () => {
  return (
    <Menu style={{ marginTop: 0, borderRadius: 0 }}>
      <Menu.Item>
        Kickstart
      </Menu.Item>
      <Menu.Menu position='right'>
        <Menu.Item>
          Campaigns
        </Menu.Item>
        <Menu.Item>
          <Icon name='add circle'/>
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  );
};
