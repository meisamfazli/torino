'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserRound, Wallet, List, MapPin, Plane } from 'lucide-react';
import api from '@/lib/axios';
import { toast, ToastContainer } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';

function dateText(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.tours)) return data.tours;
  if (Array.isArray(data?.data?.tours)) return data.data.tours;
  return [];
}

function displayTourNumber(item, tour) {
  const actualNumber = item.tourNumber ?? tour.tourNumber ?? item.code ?? tour.code;
  if (actualNumber != null && /^\d+$/.test(String(actualNumber))) {
    return String(actualNumber);
  }

  const id = String(item.tourId || tour.id || item.id || '');
  if (!id) return '—';

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return String(100000000 + (hash % 900000000));
}

function TourCard({ item, now }) {
  const tour = item.tour && typeof item.tour === 'object' ? item.tour : item;
  const title = tour.title || tour.name || 'تور گردشگری';
  const origin = tour.origin?.name || tour.origin?.persianName || tour.origin || '—';
  const destination =
    tour.destination?.name || tour.destination?.persianName || tour.destination || '—';
  const start = tour.startDate || item.startDate;
  const end = tour.endDate || item.endDate;
  const price = item.amount ?? item.price ?? tour.price;
  const endTime = end ? new Date(end).getTime() : NaN;
  const startTime = start ? new Date(start).getTime() : NaN;
  const finished = Number.isFinite(endTime) && endTime < now;
  const ongoing =
    Number.isFinite(startTime) && Number.isFinite(endTime) && startTime <= now && now <= endTime;
  const status = finished ? 'به اتمام رسیده' : ongoing ? 'در حال برگزاری' : 'در انتظار برگزاری';
  const amount = Number(price);

  return (
    <article className="tour-card">
      <div className="tour-card-top">
        <div className="tour-names">
          <span>
            <MapPin size={16} />
            {title}
          </span>
          <span>
            <Plane size={16} />
            {typeof destination === 'string' ? destination : '—'}
          </span>
        </div>
        <span className={`tour-status ${finished ? 'finished' : 'upcoming'}`}>{status}</span>
      </div>
      <div className="tour-dates">
        <span>
          <strong>رفت:</strong> {dateText(start)}
        </span>
        <span>
          <strong>برگشت:</strong> {dateText(end)}
        </span>
        <span>مبدأ: {typeof origin === 'string' ? origin : '—'}</span>
      </div>
      <div className="tour-card-bottom">
        <span className="tour-bottom-group">
          <span>شماره تور:</span>
          <b dir="ltr">
            {displayTourNumber(item, tour).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])}
          </b>
        </span>
        <span className="tour-bottom-group tour-paid">
          <span>مبلغ پرداخت‌شده:</span>
          <strong>
            {Number.isFinite(amount) ? `${amount.toLocaleString('fa-IR')} تومان` : '—'}
          </strong>
        </span>
      </div>
    </article>
  );
}

export default function MyToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(0);

  async function loadTours() {
    try {
      const response = await api.get('/user/tours');
      setTours(getList(response.data));
      setNow(Date.now());
    } catch (err) {
      const message =
        err.response?.status === 401 ||
        (err.response?.status === 403 && err.response?.data?.message === 'Invalid token')
          ? 'برای مشاهده تورهای خود ابتدا وارد حساب کاربری شوید.'
          : 'دریافت تورهای شما انجام نشد. لطفاً دوباره تلاش کنید.';
      setError(message);
      toast.error(message, { toastId: 'my-tours-error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function getInitialTours() {
      try {
        const response = await api.get('/user/tours');
        setTours(getList(response.data));
        setNow(Date.now());
      } catch (err) {
        const message =
          err.response?.status === 401 ||
          (err.response?.status === 403 && err.response?.data?.message === 'Invalid token')
            ? 'برای مشاهده تورهای خود ابتدا وارد حساب کاربری شوید.'
            : 'دریافت تورهای شما انجام نشد. لطفاً دوباره تلاش کنید.';
        setError(message);
        toast.error(message, { toastId: 'my-tours-error' });
      } finally {
        setLoading(false);
      }
    }

    getInitialTours();
  }, []);

  function retry() {
    setLoading(true);
    setError('');
    loadTours();
  }

  return (
    <main className="my-tours-page" dir="rtl">
      <ToastContainer position="top-center" autoClose={3000} rtl />
      <div className="my-tours-layout">
        <aside className="my-tours-menu">
          <Link href="/profile" className="my-tours-menu-item">
            <UserRound size={18} />
            پروفایل
          </Link>
          <Link href="/profile/tours" className="my-tours-menu-item selected" aria-current="page">
            <Wallet size={18} />
            تورهای من
          </Link>
          <Link href="/profile/transactions" className="my-tours-menu-item">
            <List size={18} />
            تراکنش‌ها
          </Link>
        </aside>
        <section className="my-tours-content" aria-label="تورهای من">
          {loading ? (
            <div className="tours-message" role="status">
              <TailSpin height="40" width="40" color="#28a745" ariaLabel="در حال بارگذاری" />
              <p>در حال دریافت تورهای شما...</p>
            </div>
          ) : error ? (
            <div className="tours-message">
              <p>{error}</p>
              <button onClick={retry} type="button">
                تلاش دوباره
              </button>
            </div>
          ) : tours.length === 0 ? (
            <p className="tours-message">هنوز توری برای این حساب ثبت نشده است.</p>
          ) : (
            tours.map((item, index) => (
              <TourCard
                key={`${item.id || item.tourId || 'tour'}-${index}`}
                item={item}
                now={now}
              />
            ))
          )}
        </section>
      </div>
      <style jsx global>{`
        .my-tours-page {
          min-height: 65vh;
          padding: 32px 20px 80px;
          background: white;
          color: #282828;
        }
        .my-tours-layout {
          max-width: 1188px;
          margin: auto;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        .my-tours-menu {
          border: 1px solid #ddd;
          border-radius: 10px;
          overflow: hidden;
        }
        .my-tours-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 17px 20px;
          border-bottom: 1px solid #e7e7e7;
          font-size: 14px;
          color: #444;
          text-decoration: none;
        }
        .my-tours-menu-item:last-child {
          border-bottom: 0;
        }
        .my-tours-menu-item.selected {
          background: #d0ebd7;
          color: #28a745;
          font-weight: 600;
        }
        .my-tours-content {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
        }
        .tour-card {
          border: 1px solid #dedede;
          border-radius: 9px;
          overflow: hidden;
          font-size: 13px;
        }
        .tour-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 17px 18px 12px;
        }
        .tour-names {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
        }
        .tour-names span {
          display: flex;
          align-items: center;
          gap: 7px;
          font-weight: 600;
        }
        .tour-status {
          border-radius: 20px;
          padding: 5px 10px;
          white-space: nowrap;
          font-size: 11px;
        }
        .tour-status.finished {
          background: #d9f4df;
          color: #258c45;
        }
        .tour-status.upcoming {
          background: #fff1bd;
          color: #a98700;
        }
        .tour-dates {
          display: flex;
          flex-wrap: wrap;
          gap: 14px 28px;
          padding: 10px 18px 18px;
          color: #777;
        }
        .tour-dates strong {
          color: #333;
        }
        .tour-card-bottom {
          border-top: 1px solid #e5e5e5;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 0;
          color: #777;
        }
        .tour-bottom-group {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .tour-paid {
          border-right: 1px solid #e5e5e5;
          margin-right: 18px;
          padding-right: 18px;
        }
        .tour-card-bottom strong {
          color: #333;
        }
        .tour-card-bottom b {
          font-weight: 800;
          color: #111111;
        }
        .tours-message {
          padding: 36px 15px;
          text-align: center;
          color: #777;
        }
        .tours-message button {
          background: #28a745;
          color: white;
          border: 0;
          border-radius: 6px;
          padding: 9px 18px;
          cursor: pointer;
        }
        @media (max-width: 850px) {
          .my-tours-layout {
            grid-template-columns: 1fr;
          }
          .my-tours-menu {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }
          .my-tours-menu-item {
            justify-content: center;
            padding: 14px 6px;
            border-bottom: 0;
            font-size: 12px;
          }
        }
        @media (max-width: 600px) {
          .my-tours-page {
            padding: 16px 12px 40px;
          }
          .my-tours-layout {
            gap: 14px;
          }
          .my-tours-menu-item {
            gap: 5px;
            font-size: 11px;
          }
          .my-tours-content {
            padding: 8px;
          }
          .tour-card-top {
            align-items: flex-start;
          }
          .tour-names {
            gap: 10px;
          }
          .tour-card {
            font-size: 11px;
          }
          .tour-dates {
            gap: 9px;
          }
          .tour-card-bottom {
            align-items: flex-start;
            gap: 10px;
          }
          .tour-paid {
            margin-right: 0;
            padding-right: 10px;
          }
        }
      `}</style>
    </main>
  );
}
