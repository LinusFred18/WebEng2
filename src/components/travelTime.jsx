import { Card, CardContent } from 'framework7-react';
import { FaCar, FaWalking, FaBicycle } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

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
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);

  const modes = [
    { key: 'car', label: 'Auto', icon: <FaCar /> },
    { key: 'walk', label: 'Zu Fuß', icon: <FaWalking /> },
    { key: 'bike', label: 'Fahrrad', icon: <FaBicycle /> },
  ];

  // update the infobox when the route distance changes, so the text is not cut off
  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.style.maxHeight = '0px';
      contentRef.current.style.maxHeight = contentRef.current.scrollHeight + 'px';
    }
  }, [open, routeDistance, straightLineDistance]);

  return (
    <Card
      className="travel-card"
      style={{
        position: 'relative',
        width: '20%',
        zIndex: 1100,
        margin: '0rem 0.5rem 0rem 0rem',
        height: 'fit-content',
        borderRadius: '8px',
        padding: '0.2rem 0.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        transition: 'all 0.3s ease',
      }}
    >

      {/* Header with button to expand/collapse */}
      <div 
        onClick={() => setOpen((prev) => !prev)} 
        style={{
          width: '100%',
          cursor:'pointer',
          padding:'0.5rem 0rem',
          fontWeight:'bold',
          color:'#1a73e8',
          pointerEvents: 'auto',
          userSelect: 'auto',
          transform: open
          ? 'rotate(180deg)'
          : 'rotate(0deg)',
          transition: 'all 0.3s ease',
        }}
      >
        <i className={`f7-icons`}>
          {'chevron_up'}
        </i>
      </div>

      {/* expands when open is true */}
        <div ref={contentRef} style={{
          maxHeight: open ? `${contentRef.current?.scrollHeight}px` : '0px',
          overflow: 'hidden',
          transition:'max-height 0.2s ease',
        }}>
          <CardContent
            className="travel-card-content"
            style={{
              width: '100%',
              display: 'flex',
              gap: '0.2rem',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flexWrap:'wrap',
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
                    padding: '0.2rem 0.2rem',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
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
              margin: '0.3rem auto 0.3rem auto',
            }}
          />

          {/* distance information */}
          <div
            className="distance-info"
            style={{
              width: '90%',
              fontSize: '0.8rem',
              color: '#555',
              textAlign: 'left',
              padding: '0rem 0rem 0.5rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <span className="distance-line" style={{ color: 'blue' }}>
              <b className="distance-label">Route:</b> <span className="distance-value">{routeDistance?.toFixed(2) ?? '-'}</span> km
            </span>
            <span className="distance-line" style={{ color: 'red' }}>
              <b className="distance-label">Luftlinie:</b> <span className="distance-value">{straightLineDistance?.toFixed(2) ?? '-'}</span> km
            </span>
          </div>
        </div>
      

      <style >{`
        @media (max-width: 800px) {
          .travel-card {
            width: 55%;
            max-width: 220px;
            padding: 0.2rem 0.2rem !important;
            margin: '0rem 1rem 0rem 0rem';
          }

          .travel-card-content {
            flex-direction: column;
            align-items: center !important;
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
            font-size: 0.5rem !important;
          }
        }
        @media (max-width: 800px) {
        .distance-label {
          display: block;
          margin-bottom: 0.1rem;
        }
      }
        @media (max-width: 800px) {
        .distance-info {
          align-items: flex-start !important;
          text-align: left !important;
        }
      }
      `}</style>
    </Card>
  );
};

export default TravelTime;


