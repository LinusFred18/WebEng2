import logo from '../../public/icons/compass.svg';

// Compass Component
const CompassSVG = () => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '2.0rem',
      left: '3%',
      aspectRatio: '1',
      width: '3.5rem',
      height: '3.5rem',
      zIndex: 1000,
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      <img src={logo} alt="Logo" width={80} height={80} />
    </div>
  );
};

export default CompassSVG;
