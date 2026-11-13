'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Globe2, CalendarDays } from 'lucide-react';
import { Calendar, CalendarProvider } from 'zaman';
import api from '@/lib/axios';

const cities = [
  { id: '1', name: 'تهران' },
  { id: '2', name: 'سنندج' },
  { id: '3', name: 'مادرید' },
  { id: '4', name: 'اصفهان' },
  { id: '5', name: 'سلیمانیه' },
  { id: '6', name: 'هولر' },
  { id: '7', name: 'مازندران' },
  { id: '8', name: 'گیلان' },
  { id: '9', name: 'ایتالیا' },
];

const tourImages = {
  'd4e5f678-90ab-cdef-1234-567890abcdef': '/images/hewler.png',
  'b2c3d4e5-f678-90ab-cdef-234567890abc': '/images/madrid.png',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': '/images/kurdistan.png',
  'c3d4e5f6-7890-abcd-ef12-34567890abcd': '/images/solimaniyeh.png',
  '67890abc-def1-2345-6789-0abcdef12345': '/images/italy.jpg',
  'f67890ab-cdef-1234-5678-90abcdef1234': '/images/offroad.jpg',
  'e5f67890-abcd-ef12-3456-7890abcdef12': '/images/mazandaran.jpg',
};

const vehicleNames = {
  bus: 'اتوبوس',
  airplane: 'هواپیما',
  train: 'قطار',
  ship: 'کشتی',
  SUV: 'خودروی آفرود',
};

function getTourList(result) {
  if (Array.isArray(result)) {
    return result;
  } else if (Array.isArray(result?.tours)) {
    return result.tours;
  } else if (Array.isArray(result?.data)) {
    return result.data;
  } else {
    return [];
  }
}

export default function TourSearch() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserveMessage, setReserveMessage] = useState('');

  const searchRef = useRef(null);

  useEffect(() => {
    function closeMenus(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpenMenu(null);
        setCalendarOpen(false);
      }
    }

    document.addEventListener('mousedown', closeMenus);

    return () => {
      document.removeEventListener('mousedown', closeMenus);
    };
  }, []);

  useEffect(() => {
    async function loadTours() {
      try {
        const response = await api.get('/tour');
        setTours(getTourList(response.data));
      } catch (error) {
        setError('دریافت تورها با مشکل مواجه شد.');
      } finally {
        setLoading(false);
      }
    }

    loadTours();
  }, []);

  function selectCity(type, id) {
    if (type === 'origin') {
      setOrigin(id);
    } else {
      setDestination(id);
    }
    setOpenMenu(null);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  function formatApiDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  let dateText = 'تاریخ';
  if (startDate && endDate) {
    dateText = `${formatDate(startDate)} تا ${formatDate(endDate)}`;
  } else if (startDate) {
    dateText = formatDate(startDate);
  }

  async function handleSearch() {
    setLoading(true);
    setError('');
    setReserveMessage('');

    try {
      const params = {};

      if (origin) params.originId = origin;
      if (destination) params.destinationId = destination;
      if (startDate) params.startDate = formatApiDate(startDate);
      if (endDate) params.endDate = formatApiDate(endDate);

      const response = await api.get('/tour', { params });
      const result = response.data;

      setTours(getTourList(result));
    } catch {
      setError('دریافت تورها با مشکل مواجه شد.');
      setTours([]);
    } finally {
      setLoading(false);
    }
  }

  function handleReserve(tourId) {
    if (!tourId) {
      setReserveMessage('اطلاعات رزرو این تور در دسترس نیست.');
      return;
    }

    setReserveMessage('');
    router.push(`/tour/${tourId}`);
  }

  function getDescription(tour) {
    const start = new Date(tour.startDate);
    const end = new Date(tour.endDate);
    const days = Math.round((end - start) / 86400000);
    const month = Number.isNaN(start.getTime())
      ? ''
      : new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' }).format(start);
    const duration = Number.isFinite(days) && days >= 0 ? `${days} روزه` : '';
    return [month, duration, vehicleNames[tour.fleetVehicle] || tour.fleetVehicle]
      .filter(Boolean)
      .join(' - ');
  }

  return (
    <div className="tour-search" dir="rtl" ref={searchRef}>
      <div className="search-fields">
        <div className="search-field">
          <button
            type="button"
            className="field-button"
            onClick={() => {
              setOpenMenu(openMenu === 'origin' ? null : 'origin');
              setCalendarOpen(false);
            }}
          >
            <MapPin size={18} strokeWidth={1.8} />
            {cities.find((city) => city.id === origin)?.name || 'مبدأ'}
          </button>

          {openMenu === 'origin' && (
            <div className="city-menu">
              {cities.map((city) => (
                <button type="button" key={city.id} onClick={() => selectCity('origin', city.id)}>
                  <MapPin size={16} strokeWidth={1.8} />
                  {city.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="search-field">
          <button
            type="button"
            className="field-button"
            onClick={() => {
              setOpenMenu(openMenu === 'destination' ? null : 'destination');
              setCalendarOpen(false);
            }}
          >
            <Globe2 size={18} strokeWidth={1.8} />
            {cities.find((city) => city.id === destination)?.name || 'مقصد'}
          </button>

          {openMenu === 'destination' && (
            <div className="city-menu">
              {cities.map((city) => (
                <button
                  type="button"
                  key={city.id}
                  onClick={() => selectCity('destination', city.id)}
                >
                  <MapPin size={16} strokeWidth={1.8} />
                  {city.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="search-field date-field">
          <button
            type="button"
            className="field-button date-button"
            onClick={() => {
              setCalendarOpen(!calendarOpen);
              setOpenMenu(null);
            }}
          >
            <CalendarDays size={18} strokeWidth={1.8} />
            <span>{dateText}</span>
          </button>

          {calendarOpen && (
            <div className="calendar-popup">
              <CalendarProvider locale="fa" direction="rtl" accentColor="#28a745" round="x2">
                <Calendar
                  range
                  onChange={(value) => {
                    const from = value.from ? new Date(value.from) : null;
                    const to = value.to ? new Date(value.to) : null;

                    setStartDate(from);
                    setEndDate(to);

                    if (from && to) {
                      setCalendarOpen(false);
                    }
                  }}
                />
              </CalendarProvider>
            </div>
          )}
        </div>

        <button type="button" className="search-submit" onClick={handleSearch} disabled={loading}>
          {loading ? 'در حال جستجو...' : 'جستجو'}
        </button>
      </div>

      <section className="all-tours">
        <h2>همه تورها</h2>

        {reserveMessage && <p className="reserve-message">{reserveMessage}</p>}

        {error && <p className="search-message">{error}</p>}

        {loading && <p className="search-message">در حال دریافت تورها...</p>}

        {!loading && !error && tours.length === 0 && (
          <p className="search-message">توری پیدا نشد.</p>
        )}

        {!loading && tours.length > 0 && (
          <div className="tour-list">
            {tours.map((tour) => (
              <article className="tour-card" key={tour.id}>
                <img
                  src={tourImages[tour.id] || tour.image}
                  alt={tour.title}
                  className="tour-image"
                />

                <div className="tour-info">
                  <h3>{tour.title}</h3>
                  <p className="tour-description">{getDescription(tour)}</p>
                </div>

                <div className="tour-bottom">
                  <button
                    type="button"
                    className="reserve-button"
                    onClick={() => handleReserve(tour.id)}
                  >
                    رزرو
                  </button>

                  <div className="tour-price">
                    <strong>{Number(tour.price).toLocaleString('fa-IR')}</strong>
                    <span>تومان</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .tour-search {
          width: 100%;
          max-width: 875px;
          margin: 24px auto 0;
        }

        .search-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .search-field {
          position: relative;
          min-width: 0;
        }

        .field-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 38px;
          padding: 0 8px;
          border: 1px solid #e5e5e5;
          border-radius: 9px;
          background: white;
          color: #555;
          font: inherit;
          font-size: 14px;
          cursor: pointer;
        }

        .date-field {
          grid-column: 1 / -1;
          z-index: 30;
        }

        .date-button {
          justify-content: flex-start;
          padding-right: 16px;
        }

        .date-button span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .calendar-popup {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          z-index: 50;
          width: 100%;
          min-width: 0;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          background: white;
          box-shadow: 0 6px 20px #00000015;
          overflow: hidden;
        }

        .calendar-popup :global(*) {
          box-sizing: border-box;
        }

        .city-menu {
          position: absolute;
          z-index: 40;
          top: calc(100% + 4px);
          right: 0;
          width: 100%;
          max-height: 230px;
          overflow-y: auto;
          border: 1px solid #e5e5e5;
          border-radius: 9px;
          background: white;
          box-shadow: 0 5px 16px #00000014;
        }

        .city-menu button {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border: 0;
          border-bottom: 1px solid #f1f1f1;
          background: white;
          color: #444;
          font: inherit;
          text-align: right;
          cursor: pointer;
        }

        .city-menu button:hover {
          background: #f4f9f5;
        }

        .search-submit {
          grid-column: 1 / -1;
          height: 38px;
          border: 0;
          border-radius: 9px;
          background: #28a745;
          color: white;
          font: inherit;
          font-size: 16px;
          cursor: pointer;
        }

        .search-submit:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .all-tours {
          margin-top: 65px;
          text-align: right;
        }

        .all-tours h2 {
          margin: 0 0 20px;
          color: #222;
          font-size: 24px;
          font-weight: 600;
        }

        .search-message {
          margin: 20px 0;
          color: #666;
          text-align: center;
        }

        .reserve-message {
          padding: 12px;
          border: 1px solid #f0d5a5;
          border-radius: 8px;
          background: #fff8ed;
          color: #885b16;
          font-size: 13px;
        }

        .tour-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .tour-card {
          overflow: hidden;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          background: white;
        }

        .tour-image {
          display: block;
          width: 100%;
          height: 160px;
          object-fit: cover;
        }

        .tour-info {
          padding: 12px 14px;
        }

        .tour-info h3 {
          margin: 0 0 8px;
          color: #222;
          font-size: 17px;
          font-weight: 600;
        }

        .tour-description {
          margin: 0;
          color: #666;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tour-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 14px;
          border-top: 1px solid #eee;
        }

        .reserve-button {
          border: 0;
          border-radius: 5px;
          padding: 7px 22px;
          background: #28a745;
          color: white;
          font: inherit;
          font-size: 14px;
          cursor: pointer;
        }

        .tour-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          white-space: nowrap;
        }

        .tour-price strong {
          color: #009eca;
          font-size: 17px;
          font-weight: 700;
        }

        .tour-price span {
          color: #777;
          font-size: 11px;
        }

        @media (min-width: 769px) {
          .search-fields {
            grid-template-columns: 1fr 1fr 1fr 140px;
            gap: 0;
            padding: 6px;
            border: 1px solid #e5e5e5;
            border-radius: 16px;
          }

          .field-button {
            height: 40px;
            border: 0;
            border-radius: 0;
          }

          .date-field {
            grid-column: auto;
          }

          .calendar-popup {
            right: auto;
            left: 0;
            width: 330px;
          }

          .search-field:not(.date-field) {
            border-left: 1px solid #e5e5e5;
          }

          .search-submit {
            grid-column: auto;
            height: 40px;
          }

          .city-menu {
            min-width: 180px;
          }

          .tour-list {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .tour-image {
            height: 125px;
          }
        }
      `}</style>
    </div>
  );
}
