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
const TravelTime = ({ travelTimes, activeMode = null }) => {
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
        backgroundColor: 'white',
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

      <style jsx>{`
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
            gap: 0.8rem;
          }

          .mode-item {
            padding: 0.15rem 0.4rem !important;
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
          }
        }
      `}</style>
    </Card>
  );
};

export default TravelTime;


