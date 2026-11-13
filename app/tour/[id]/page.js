'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CalendarDays, BusFront, ShieldCheck, Users, UserRound, Map, Award } from 'lucide-react';
import api from '@/lib/axios';
import { getAccessToken } from '@/lib/auth';

const tourImages = {
  'd4e5f678-90ab-cdef-1234-567890abcdef': '/images/hewler.png',
  'b2c3d4e5-f678-90ab-cdef-234567890abc': '/images/madrid.png',
  '67890abc-def1-2345-6789-0abcdef12345': '/images/italy.jpg',
  'f67890ab-cdef-1234-5678-90abcdef1234': '/images/offroad.jpg',
  'e5f67890-abcd-ef12-3456-7890abcdef12': '/images/mazandaran.jpg',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': '/images/kurdistan.png',
  'c3d4e5f6-7890-abcd-ef12-34567890abcd': '/images/solimaniyeh.png',
};

const cityNames = {
  Tehran: 'تهران',
  Sananndaj: 'سنندج',
  Madrid: 'مادرید',
  Isfahan: 'اصفهان',
  Sulaymaniyah: 'سلیمانیه',
  Hewler: 'هولر',
  Mazandaran: 'مازندران',
  Gilan: 'گیلان',
  Italy: 'ایتالیا',
};

const vehicleNames = {
  bus: 'اتوبوس',
  airplane: 'هواپیما',
  train: 'قطار',
  ship: 'کشتی',
  SUV: 'خودروی آفرود',
};

export default function TourDetails() {
  return (
    <Suspense fallback={<main className="p-10 text-center">در حال دریافت اطلاعات تور...</main>}>
      <TourDetailsContent />
    </Suspense>
  );
}

function TourDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTour() {
      try {
        const response = await api.get(`/tour/${id}`);
        setTour(response.data);
      } catch {
        setError('اطلاعات تور دریافت نشد.');
      } finally {
        setLoading(false);
      }
    }

    loadTour();
  }, [id]);

  function handleReservation() {
    if (getAccessToken()) {
      router.push(`/checkout?tourId=${encodeURIComponent(id)}`);
    } else {
      window.dispatchEvent(
        new CustomEvent('torino-reservation-login', {
          detail: id,
        }),
      );
    }
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  }

  function getDuration(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.round((endDate - startDate) / 86400000);
    const nights = Math.max(days - 1, 0);
    return `${days} روز و ${nights} شب`;
  }

  if (loading) {
    return <main className="p-10 text-center">در حال دریافت اطلاعات تور...</main>;
  }

  if (error || !tour) {
    return <main className="p-10 text-center">{error || 'تور پیدا نشد.'}</main>;
  }

  const image = tourImages[id] || tour.image || '/images/torino-logo.svg';
  const title = tour.title;
  const price = Number(tour.price).toLocaleString('fa-IR');

  return (
    <main className="details-page" dir="rtl">
      <section className="details-card">
        <div className="details-top">
          <img src={image} alt={title} className="details-image" />

          <div className="details-content">
            <h1>{title}</h1>
            <p className="duration">{getDuration(tour.startDate, tour.endDate)}</p>

            <div className="features">
              <span>
                <UserRound size={17} />
                تورلیدر از مبدا
              </span>
              <span>
                <Map size={17} />
                برنامه سفر
              </span>
              <span>
                <Award size={17} />
                تضمین کیفیت
              </span>
            </div>

            <div className="purchase-row">
              <div className="price">
                <strong>{price}</strong>
                <span>تومان</span>
              </div>

              <button type="button" onClick={handleReservation}>
                رزرو و خرید
              </button>
            </div>
          </div>
        </div>

        <div className="details-bottom">
          <div className="detail-item">
            <span>
              <Map size={17} />
              مبدا
            </span>
            <strong>{cityNames[tour.origin.name] || tour.origin.name}</strong>
          </div>

          <div className="detail-item">
            <span>
              <CalendarDays size={17} />
              تاریخ رفت
            </span>
            <strong>{formatDate(tour.startDate)}</strong>
          </div>

          <div className="detail-item">
            <span>
              <CalendarDays size={17} />
              تاریخ برگشت
            </span>
            <strong>{formatDate(tour.endDate)}</strong>
          </div>

          <div className="detail-item">
            <span>
              <BusFront size={17} />
              حمل و نقل
            </span>
            <strong>{vehicleNames[tour.fleetVehicle] || tour.fleetVehicle}</strong>
          </div>

          <div className="detail-item">
            <span>
              <Users size={17} />
              ظرفیت
            </span>
            <strong>{tour.availableSeats.toLocaleString('fa-IR')} نفر باقی‌مانده</strong>
          </div>

          <div className="detail-item">
            <span>
              <ShieldCheck size={17} />
              بیمه
            </span>
            <strong>{tour.insurance ? 'دارد' : 'ندارد'}</strong>
          </div>
        </div>
      </section>

      <style jsx>{`
        .details-page {
          min-height: 65vh;
          padding: 24px;
          background: #f5f5f5;
        }

        .details-card {
          max-width: 1188px;
          margin: 0 auto;
          padding: 22px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background: white;
        }

        .details-top {
          display: flex;
          gap: 24px;
        }

        .details-image {
          width: 34%;
          height: 198px;
          object-fit: cover;
          border-radius: 10px;
        }

        .details-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .details-content h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .duration {
          margin: 12px 0 28px;
          font-size: 17px;
        }

        .features {
          display: flex;
          flex-wrap: wrap;
          gap: 28px;
          color: #888;
          font-size: 14px;
        }

        .features span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .purchase-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 24px;
        }

        .price {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .price strong {
          color: #009eca;
          font-size: 23px;
        }

        .price span {
          color: #777;
          font-size: 12px;
        }

        .purchase-row button {
          padding: 11px 30px;
          border: 0;
          border-radius: 8px;
          background: #28a745;
          color: white;
          font: inherit;
          font-size: 16px;
          cursor: pointer;
        }

        .details-bottom {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 0 8px;
          border-left: 1px solid #ddd;
          text-align: center;
        }

        .detail-item:last-child {
          border-left: 0;
        }

        .detail-item span {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #666;
          font-size: 13px;
        }

        .detail-item strong {
          font-size: 12px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .details-page {
            padding: 12px;
          }

          .details-card {
            padding: 12px;
          }

          .details-top {
            flex-direction: column;
          }

          .details-image {
            width: 100%;
            height: 220px;
          }

          .details-content h1 {
            font-size: 20px;
          }

          .duration {
            margin-bottom: 18px;
          }

          .features {
            gap: 12px;
            font-size: 12px;
          }

          .purchase-row {
            margin-top: 20px;
          }

          .details-bottom {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px 0;
          }

          .detail-item:nth-child(2n) {
            border-left: 0;
          }
        }
      `}</style>
    </main>
  );
}
