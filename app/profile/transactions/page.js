'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserRound, Wallet, List } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/lib/axios';

function getTransactions(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.data?.transactions)) return data.data.transactions;
  return [];
}

function persianNumber(value) {
  return String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
}

function displayOrderNumber(item) {
  const actualNumber = item.orderNumber ?? item.orderCode;
  if (actualNumber != null && /^\d+$/.test(String(actualNumber))) {
    return persianNumber(actualNumber);
  }

  const id = String(item.orderId ?? item.bookingId ?? item.id ?? '');
  if (!id) return '—';

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return persianNumber(10000000 + (hash % 90000000));
}

function dateText(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const day = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  const time = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return `${day} - ${time}`;
}

function moneyText(value) {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString('fa-IR') : '—';
}

function TransactionRow({ item }) {
  const date = item.createdAt ?? item.date ?? item.transactionDate;
  const amount = item.amount ?? item.price ?? item.totalPrice;
  const type =
    item.type === 'Purchase' || item.type === 'purchase'
      ? 'ثبت نام در تور گردشگری'
      : item.description || item.title || item.type || 'ثبت نام در تور گردشگری';
  const orderNumber = displayOrderNumber(item);

  return (
    <tr>
      <td>{dateText(date)}</td>
      <td>{moneyText(amount)}</td>
      <td>{type}</td>
      <td>
        <span className="order-number">سفارش {orderNumber}</span>
      </td>
    </tr>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTransactions() {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/user/transactions');
      setTransactions(getTransactions(response.data));
    } catch (err) {
      const message =
        err.response?.status === 401 ||
        (err.response?.status === 403 && err.response?.data?.message === 'Invalid token')
          ? 'برای مشاهده تراکنش‌ها ابتدا وارد حساب کاربری شوید.'
          : 'دریافت تراکنش‌ها انجام نشد. لطفاً دوباره تلاش کنید.';
      setError(message);
      toast.error(message, { toastId: 'transactions-load-error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function getData() {
      try {
        const response = await api.get('/user/transactions');
        setTransactions(getTransactions(response.data));
      } catch (err) {
        const message =
          err.response?.status === 401 ||
          (err.response?.status === 403 && err.response?.data?.message === 'Invalid token')
            ? 'برای مشاهده تراکنش‌ها ابتدا وارد حساب کاربری شوید.'
            : 'دریافت تراکنش‌ها انجام نشد. لطفاً دوباره تلاش کنید.';
        setError(message);
        toast.error(message, { toastId: 'transactions-load-error' });
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, []);

  return (
    <main className="transactions-page" dir="rtl">
      <ToastContainer position="top-center" autoClose={3000} rtl />
      <div className="transactions-layout">
        <aside className="transactions-menu">
          <Link href="/profile" className="transactions-menu-item">
            <UserRound size={18} />
            پروفایل
          </Link>
          <Link href="/profile/tours" className="transactions-menu-item">
            <Wallet size={18} />
            تورهای من
          </Link>
          <Link
            href="/profile/transactions"
            className="transactions-menu-item selected"
            aria-current="page"
          >
            <List size={18} />
            تراکنش‌ها
          </Link>
        </aside>

        <section className="transactions-content" aria-label="تراکنش‌های من">
          {loading ? (
            <div className="transactions-message">
              <ThreeDots
                visible={true}
                height="45"
                width="70"
                color="#28a745"
                ariaLabel="loading"
              />
              <p>در حال دریافت تراکنش‌ها...</p>
            </div>
          ) : error ? (
            <div className="transactions-message">
              <p>{error}</p>
              <button type="button" onClick={loadTransactions}>
                تلاش دوباره
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <p className="transactions-message">هنوز تراکنشی برای این حساب ثبت نشده است.</p>
          ) : (
            <div className="transactions-table-scroll">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>تاریخ و ساعت</th>
                    <th>مبلغ(تومان)</th>
                    <th>نوع تراکنش</th>
                    <th>شماره سفارش</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item, index) => (
                    <TransactionRow key={item.id ?? item._id ?? index} item={item} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        .transactions-page {
          min-height: 65vh;
          padding: 32px 20px 80px;
          background: #fff;
          color: #282828;
        }
        .transactions-layout {
          max-width: 1188px;
          margin: auto;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        .transactions-menu {
          border: 1px solid #ddd;
          border-radius: 10px;
          overflow: hidden;
        }
        .transactions-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 17px 20px;
          border-bottom: 1px solid #e7e7e7;
          font-size: 14px;
          color: #444;
          text-decoration: none;
        }
        .transactions-menu-item:last-child {
          border-bottom: 0;
        }
        .transactions-menu-item.selected {
          background: #d0ebd7;
          color: #28a745;
          font-weight: 600;
        }
        .transactions-content {
          min-width: 0;
        }
        .transactions-table-scroll {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #dedede;
          border-radius: 9px;
        }
        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
          font-size: 13px;
          white-space: nowrap;
        }
        .transactions-table thead {
          background: #f3f3f3;
        }
        .transactions-table th {
          padding: 15px 12px;
          font-weight: 600;
          color: #444;
        }
        .transactions-table td {
          padding: 14px 12px;
          color: #555;
        }
        .transactions-table .order-number {
          color: #111;
          font-weight: 800;
        }
        .transactions-table tbody tr + tr td {
          border-top: 1px solid #f5f5f5;
        }
        .transactions-message {
          padding: 36px 15px;
          text-align: center;
          color: #777;
          border: 1px solid #ddd;
          border-radius: 9px;
        }
        .transactions-message > div {
          margin: 0 auto;
          justify-content: center;
        }
        .transactions-message button {
          background: #28a745;
          color: #fff;
          border: 0;
          border-radius: 6px;
          padding: 9px 18px;
          cursor: pointer;
        }
        @media (max-width: 850px) {
          .transactions-layout {
            grid-template-columns: 1fr;
          }
          .transactions-menu {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }
          .transactions-menu-item {
            justify-content: center;
            padding: 14px 6px;
            border-bottom: 0;
            font-size: 12px;
          }
        }
        @media (max-width: 600px) {
          .transactions-page {
            padding: 16px 12px 40px;
          }
          .transactions-layout {
            gap: 14px;
          }
          .transactions-menu-item {
            gap: 5px;
            font-size: 11px;
          }
          .transactions-table {
            font-size: 11px;
          }
          .transactions-table th,
          .transactions-table td {
            padding: 12px 9px;
          }
        }
      `}</style>
    </main>
  );
}
