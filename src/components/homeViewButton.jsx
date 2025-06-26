import React from 'react';
import { Button, Icon } from 'framework7-react';


// A floating button component that navigates to the Home view when clicked
const HomeViewButton = ({ onClick }) => {
  return (
    <Button
      round
      fill
      style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '3.5rem',
        height: '3.5rem',
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
      }}
      onClick={onClick}
      aria-label="Home View"
    >
      <Icon f7="house_fill" style={{ fontSize: '1.8rem', color: 'white' }} />
    </Button>
  );
};

export default HomeViewButton;
