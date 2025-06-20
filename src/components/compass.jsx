import logo from '../../public/icons/compass.svg';

const CompassSVG = () => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '2%',
      left: '3%',
      aspectRatio: '1',
      maxWidth: '5rem',
      maxHeight: '5rem',
      zIndex: 1000,
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      <img src={logo} alt="Logo" width={80} height={80} />
    </div>
  );
};

export default CompassSVG;
