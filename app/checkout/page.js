'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, UserRound } from 'lucide-react';
import { DatePicker } from 'zaman';
import axios from 'axios';
import api from '@/lib/axios';
import { getAccessToken } from '@/lib/auth';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="p-10 text-center">در حال دریافت اطلاعات تور...</main>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const tourId = searchParams.get('tourId') || '';

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tourError, setTourError] = useState('');

  const [fullName, setFullName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTour() {
      if (!tourId) {
        setTourError('توری برای خرید انتخاب نشده است.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setTourError('');
        setTour(null);

        const response = await api.get(`/tour/${tourId}`);

        if (active) {
          setTour(response.data);
        }
      } catch {
        if (active) {
          setTourError('اطلاعات تور دریافت نشد.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTour();

    return () => {
      active = false;
    };
  }, [tourId]);

  function getDuration(start, end) {
    const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);

    if (!Number.isFinite(days) || days < 0) {
      return '';
    }

    return `${days} روز و ${Math.max(days - 1, 0)} شب`;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting || success) {
      return;
    }

    setMessage('');

    if (!tour) {
      setMessage('اطلاعات تور در دسترس نیست.');
      return;
    }

    if (!fullName.trim()) {
      setMessage('لطفاً نام و نام خانوادگی را وارد کنید.');
      return;
    }

    if (!/^\d{10}$/.test(nationalCode)) {
      setMessage('کد ملی باید ۱۰ رقم باشد.');
      return;
    }

    if (!birthDate) {
      setMessage('لطفاً تاریخ تولد را انتخاب کنید.');
      return;
    }

    if (!gender) {
      setMessage('لطفاً جنسیت را انتخاب کنید.');
      return;
    }

    if (!getAccessToken()) {
      setMessage('برای ثبت خرید ابتدا وارد حساب کاربری شوید.');
      return;
    }

    try {
      setSubmitting(true);

      await api.put(`/basket/${tour.id}`);

      const response = await api.post('/order', {
        fullName: fullName.trim(),
        nationalCode,
        gender,
        birthDate,
      });

      setSuccess(true);
      setMessage(response.data?.message || 'خرید شما با موفقیت ثبت شد.');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setMessage('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
        } else {
          setMessage(
            error.response?.data?.message || 'خطایی در ثبت خرید رخ داد. دوباره تلاش کنید.',
          );
        }
      } else {
        setMessage('ارتباط با سرور برقرار نشد.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const tourTitle = tour ? tour.title : '';
  const tourPrice = tour ? Number(tour.price) : 0;

  let buttonText = 'ثبت و خرید نهایی';
  if (success) {
    buttonText = 'خرید ثبت شد';
  } else if (submitting) {
    buttonText = 'در حال ثبت خرید...';
  }

  return (
    <main className="checkout-page" dir="rtl">
      <div className="checkout-container">
        <section className="passenger-card">
          <h1>
            <UserRound size={20} fill="currentColor" />
            مشخصات مسافر
          </h1>

          <form id="passenger-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <input
                className="full-name"
                type="text"
                placeholder="نام و نام خانوادگی"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={success || submitting}
                required
              />

              <input
                className="national-code"
                type="text"
                inputMode="numeric"
                placeholder="کدملی"
                maxLength={10}
                value={nationalCode}
                onChange={(event) => setNationalCode(event.target.value.replace(/\D/g, ''))}
                disabled={success || submitting}
                required
              />

              <div className="birth-date-field">
                <CalendarDays size={17} />
                <DatePicker
                  onChange={(event) => {
                    const date = new Date(event.value);

                    if (!Number.isNaN(date.getTime())) {
                      setBirthDate(date.toISOString());
                    }
                  }}
                  inputClass="birth-date-input"
                  inputAttributes={{
                    placeholder: 'تاریخ تولد',
                    readOnly: true,
                    disabled: success || submitting,
                  }}
                />
              </div>

              <select
                className="gender-field"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                disabled={success || submitting}
                required
              >
                <option value="">جنسیت</option>
                <option value="male">مرد</option>
                <option value="female">زن</option>
              </select>
            </div>
          </form>

          {message && (
            <p className={`message ${success ? 'success' : 'error'}`} role="status">
              {message}
            </p>
          )}
        </section>

        <aside className="summary-card">
          {loading ? (
            <p className="summary-status">در حال دریافت اطلاعات تور...</p>
          ) : tourError || !tour ? (
            <p className="summary-status">{tourError || 'تور پیدا نشد.'}</p>
          ) : (
            <>
              <div className="summary-top">
                <h2>{tourTitle}</h2>
                <span>{getDuration(tour.startDate, tour.endDate)}</span>
              </div>

              <div className="summary-bottom">
                <div className="price-row">
                  <span>قیمت نهایی</span>
                  <div className="price-value">
                    <strong>{tourPrice.toLocaleString('fa-IR')}</strong>
                    <span> تومان</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="passenger-form"
                  className="submit-button"
                  disabled={submitting || success}
                >
                  {buttonText}
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      <style jsx>{`
        .checkout-page {
          min-height: 60vh;
          padding: 32px 24px 90px;
          background: #f5f5f5;
        }

        .checkout-container {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
          gap: 12px;
          max-width: 1188px;
          margin: 0 auto;
          align-items: start;
        }

        .passenger-card,
        .summary-card {
          background: #fff;
          border-radius: 10px;
        }

        .passenger-card {
          min-height: 228px;
          padding: 18px 20px;
        }

        .passenger-card h1 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 22px;
          color: #282828;
          font-size: 18px;
          font-weight: 600;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .form-grid > input,
        .form-grid > select,
        .birth-date-field {
          width: 100%;
          min-width: 0;
          height: 40px;
          border: 1px solid #aaa;
          border-radius: 5px;
          background: #fff;
          color: #282828;
          font: inherit;
          font-size: 13px;
        }

        .form-grid > input,
        .form-grid > select {
          padding: 0 12px;
          outline-color: #28a745;
        }

        .form-grid > input::placeholder {
          color: #888;
        }

        .birth-date-field {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px;
          color: #777;
        }

        .birth-date-field :global(input) {
          width: 100%;
          min-width: 0;
          height: 38px;
          border: 0;
          outline: none;
          background: transparent;
          color: #282828;
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
        }

        .gender-field {
          grid-column: 1;
        }

        .summary-card {
          overflow: hidden;
        }

        .summary-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 76px;
          padding: 16px 12px;
          border-bottom: 1px dashed #ccc;
        }

        .summary-top h2 {
          margin: 0;
          color: #282828;
          font-size: 18px;
          font-weight: 600;
        }

        .summary-top > span {
          color: #888;
          font-size: 12px;
          white-space: nowrap;
        }

        .summary-bottom {
          padding: 14px 12px 10px;
        }

        .price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 14px;
          color: #282828;
          font-size: 12px;
        }

        .price-value {
          display: flex;
          align-items: baseline;
          gap: 4px;
          white-space: nowrap;
        }

        .price-value strong {
          color: #009eca;
          font-size: 20px;
          font-weight: 700;
        }

        .price-value span {
          color: #777;
          font-size: 11px;
        }

        .submit-button {
          width: 100%;
          height: 42px;
          border: 0;
          border-radius: 7px;
          background: #28a745;
          color: white;
          font: inherit;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .summary-status {
          padding: 20px;
          color: #666;
          font-size: 13px;
        }

        .message {
          margin-top: 16px;
          font-size: 13px;
        }

        .success {
          color: #28a745;
        }

        .error {
          color: #d93025;
        }

        @media (max-width: 768px) {
          .checkout-page {
            min-height: auto;
            padding: 20px 16px 40px;
          }

          .checkout-container {
            grid-template-columns: 1fr;
            gap: 16px;
            max-width: 390px;
          }

          .passenger-card,
          .summary-card {
            border: 1px solid #e1e1e1;
            border-radius: 10px;
          }

          .passenger-card {
            min-height: auto;
            padding: 16px 12px 18px;
          }

          .passenger-card h1 {
            margin-bottom: 20px;
            font-size: 17px;
          }

          .form-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .form-grid > input,
          .form-grid > select,
          .birth-date-field {
            height: 42px;
            font-size: 12px;
          }

          .full-name {
            order: 1;
          }

          .gender-field {
            order: 2;
          }

          .national-code {
            order: 3;
          }

          .birth-date-field {
            order: 4;
          }

          .birth-date-field :global(input) {
            height: 40px;
            font-size: 12px;
          }

          .summary-top {
            min-height: 65px;
            padding: 14px 12px;
          }

          .summary-top h2 {
            font-size: 17px;
          }

          .summary-bottom {
            padding: 14px 12px 12px;
          }

          .price-row {
            margin-bottom: 16px;
          }

          .price-value strong {
            font-size: 19px;
          }

          .submit-button {
            height: 42px;
            font-size: 16px;
          }
        }
      `}</style>
    </main>
  );
}
