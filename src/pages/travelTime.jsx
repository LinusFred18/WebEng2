import { Card, CardContent } from 'framework7-react';
import { FaCar, FaWalking, FaBicycle } from 'react-icons/fa';

// format displayed time 
const formatTime = (minutes) => {
  if (!minutes) return '-';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins} min`;
  return `${hrs} h${mins > 0 ? ' ' + mins + ' min' : ''}`;
};

// displayed text and icon per means of transport
const TravelTime = ({ travelTimes, routeDistance, straightLineDistance, activeMode = null }) => {
  const modes = [
    { key: 'car', label: 'Auto', icon: <FaCar /> },
    { key: 'walk', label: 'Zu Fuß', icon: <FaWalking /> },
    { key: 'bike', label: 'Fahrrad', icon: <FaBicycle /> },
  ];

  return (
    <Card
      className="travel-card"
      style={{
        position: 'absolute',
        top: '5rem',
        left: '1.5rem',
        zIndex: 1000,
        width: 'auto',
        maxWidth: '360px',
        borderRadius: '12px',
        padding: '0.5rem 1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent
        className="travel-card-content"
        style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          padding: 0,
          transition: 'all 0.3s ease',
        }}
      >
        {modes.map(({key, icon}) => {
          const isActive = activeMode === key;
          const time = key === 'public' ? '-' : formatTime(travelTimes[key]);
          return (
            <div
              key={key}
              className="mode-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#1a73e8' : '#333',
                backgroundColor: isActive ? '#e8f0fe' : 'transparent',
                padding: '0.3rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                minWidth: '3rem',
                transition: 'all 0.3s ease',
              }}
            >
              <div className="icon" style={{fontSize: '1.2rem'}}>{icon}</div>
              <div className="time" style={{marginTop: '0.2rem'}}>{time}</div>
            </div>
          );
        })}
      </CardContent>

      {/* divider line */}
      <div
        style={{
          width: '90%',
          height: '1px',
          backgroundColor: '#ccc',
          margin: '0.6rem auto 0.6rem auto',
        }}
      />

      {/* distance information */}
      <div
          className="distance-info"
          style={{
            width: '100%',
            fontSize: '0.9rem',
            color: '#555',
            textAlign: 'left',
            marginTop: '0.5rem',
          }}
        >
          <span style={{ color: 'blue' }}>
          <div>Route: {routeDistance?.toFixed(2) ?? '-'} km</div>
          </span>
          <div>
            <span style={{ color: 'red' }}>
            Luftlinie: {straightLineDistance?.toFixed(2) ?? '-'} km
            </span>
          </div>
        </div>

      <style >{`
        @media (max-width: 400px) {
          .travel-card {
            width: 55%;
            max-width: 220px;
            padding: 0.3rem 0.6rem !important;
            left: 1.5rem;
          }

          .travel-card-content {
            flex-direction: column;
            align-items: center;
            gap: 0.01rem;
            padding-top: 0.1rem;
            padding-bottom: 0.1rem;
          }

          .mode-item {
            padding: 0.05rem 0.4rem !important;
            font-size: 0.7rem !important;
            min-width: auto !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .mode-item .icon {
            font-size: 1rem !important;
          }

          .mode-item .time {
            margin-top: 0.1rem !important;
            margin-bottom: 0 !important;
          }
        }
          @media (max-width: 400px) {
          .travel-card-content div {
            font-size: 0.7rem !important;
          }
        }
          @media (max-width: 400px) {
          .distance-info {
            font-size: 0.7rem !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default TravelTime;


