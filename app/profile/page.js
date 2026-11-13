'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Pencil, UserRound, Wallet, List } from 'lucide-react';
import { Calendar, CalendarProvider } from 'zaman';
import axios from 'axios';
import api from '@/lib/axios';
import { toast, ToastContainer } from 'react-toastify';
import { Oval } from 'react-loader-spinner';
import 'react-toastify/dist/ReactToastify.css';

const emptyProfile = {
  mobile: '',
  email: '',
  firstName: '',
  lastName: '',
  gender: '',
  birthDate: '',
  nationalCode: '',
  payment: { shaba_code: '', debitCard_code: '', accountIdentifier: '' },
};

function normalizeProfile(data) {
  const source = data?.data?.mobile ? data.data : data;
  return {
    ...emptyProfile,
    ...source,
    mobile: String(source?.mobile ?? ''),
    email: source?.email ?? '',
    firstName: source?.firstName ?? '',
    lastName: source?.lastName ?? '',
    gender: source?.gender ?? '',
    birthDate: source?.birthDate ?? '',
    nationalCode: String(source?.nationalCode ?? ''),
    payment: { ...emptyProfile.payment, ...(source?.payment ?? {}) },
  };
}

function display(value) {
  return value === '' || value == null ? '—' : String(value);
}

function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function Section({ title, action, children, editing, onEdit }) {
  return (
    <section className="profile-section">
      <div className="section-head">
        <h2>{title}</h2>
        {action && !editing && (
          <button className="edit-link" type="button" onClick={onEdit}>
            <Pencil size={14} />
            {action}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(emptyProfile);
  const [editing, setEditing] = useState('');
  const [birthCalendarOpen, setBirthCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadProfile() {
    setLoading(true);
    try {
      const response = await api.get('/user/profile');
      const next = normalizeProfile(response.data);
      setProfile(next);
      setDraft(next);
    } catch (err) {
      toast.error(
        axios.isAxiosError(err) && [401, 403].includes(err.response?.status)
          ? 'برای مشاهده پروفایل ابتدا وارد حساب کاربری شوید.'
          : 'دریافت اطلاعات پروفایل انجام نشد.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function getProfile() {
      try {
        const response = await api.get('/user/profile');
        const next = normalizeProfile(response.data);
        setProfile(next);
        setDraft(next);
      } catch (err) {
        toast.error(
          axios.isAxiosError(err) && [401, 403].includes(err.response?.status)
            ? 'برای مشاهده پروفایل ابتدا وارد حساب کاربری شوید.'
            : 'دریافت اطلاعات پروفایل انجام نشد.',
        );
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, []);

  function startEdit(section) {
    setBirthCalendarOpen(false);
    setDraft(normalizeProfile(profile));
    setEditing(section);
  }

  function cancelEdit() {
    setBirthCalendarOpen(false);
    setDraft(normalizeProfile(profile));
    setEditing('');
  }

  function change(field, value) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  function changePayment(field, value) {
    setDraft(function (previous) {
      return {
        ...previous,
        payment: { ...previous.payment, [field]: value },
      };
    });
  }

  function changeFullName(value) {
    const separator = value.lastIndexOf(' ');
    let firstName = value;
    let lastName = '';

    if (separator !== -1) {
      firstName = value.slice(0, separator);
      lastName = value.slice(separator + 1);
    }

    setDraft(function (previous) {
      return { ...previous, firstName, lastName };
    });
  }

  async function save(section) {
    if (saving || !profile) return;
    if (section === 'personal' && draft.nationalCode && !/^\d{10}$/.test(draft.nationalCode)) {
      toast.error('کد ملی باید ۱۰ رقم باشد.');
      return;
    }
    const payload = {
      mobile: profile.mobile,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender,
      birthDate: profile.birthDate,
      nationalCode: profile.nationalCode ? Number(profile.nationalCode) : null,
      payment: profile.payment,
    };

    if (section === 'account') {
      payload.email = draft.email.trim();
    } else if (section === 'personal') {
      payload.firstName = draft.firstName.trim();
      payload.lastName = draft.lastName.trim();
      payload.gender = draft.gender;
      payload.birthDate = draft.birthDate;
      payload.nationalCode = draft.nationalCode ? Number(draft.nationalCode) : null;
    } else if (section === 'bank') {
      payload.payment = draft.payment;
    }
    setSaving(true);
    try {
      await api.put('/user/profile', payload);
      const response = await api.get('/user/profile');
      const next = normalizeProfile(response.data);
      setProfile(next);
      setDraft(next);
      setEditing('');
      setBirthCalendarOpen(false);
      toast.success('اطلاعات با موفقیت ذخیره شد.');
    } catch (err) {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'ذخیره اطلاعات انجام نشد. لطفاً دوباره تلاش کنید.'
          : 'ارتباط با سرور برقرار نشد.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="profile-page" dir="rtl">
      <ToastContainer position="top-center" autoClose={3000} rtl />
      <div className="profile-layout">
        <aside className="profile-menu">
          <div className="menu-item selected">
            <UserRound size={18} />
            پروفایل
          </div>
          <Link href="/profile/tours" className="menu-item">
            <Wallet size={18} />
            تورهای من
          </Link>
          <Link href="/profile/transactions" className="menu-item">
            <List size={18} />
            تراکنش‌ها
          </Link>
        </aside>

        <div className="profile-content">
          {loading ? (
            <div className="status" role="status">
              <Oval
                height={40}
                width={40}
                color="#28a745"
                secondaryColor="#d0ebd7"
                ariaLabel="در حال بارگذاری"
              />
              <p>در حال دریافت اطلاعات حساب کاربری...</p>
            </div>
          ) : !profile ? (
            <div className="status">
              <p>اطلاعات حساب کاربری در دسترس نیست.</p>
              <button type="button" onClick={loadProfile}>
                تلاش دوباره
              </button>
            </div>
          ) : (
            <>
              <Section
                title="اطلاعات حساب کاربری"
                action="افزودن / ویرایش ایمیل"
                editing={editing === 'account'}
                onEdit={() => startEdit('account')}
              >
                <div className={`account-info-layout ${editing === 'account' ? 'is-editing' : ''}`}>
                  <div className="info-pair account-mobile">
                    <span>شماره موبایل</span>
                    <strong>{display(profile.mobile)}</strong>
                  </div>
                  {editing === 'account' ? (
                    <div className="account-edit-controls">
                      <label className="field account-email-field">
                        <span>ایمیل</span>
                        <input
                          type="email"
                          placeholder="آدرس ایمیل"
                          value={draft.email}
                          onChange={(e) => change('email', e.target.value)}
                        />
                      </label>
                      <div className="account-edit-buttons">
                        <button
                          type="button"
                          className="primary"
                          disabled={saving}
                          onClick={() => save('account')}
                        >
                          {saving ? 'در حال ذخیره...' : 'تأیید'}
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          disabled={saving}
                          onClick={cancelEdit}
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="info-pair">
                      <span>ایمیل</span>
                      <strong>{display(profile.email)}</strong>
                    </div>
                  )}
                </div>
              </Section>

              <Section
                title="اطلاعات شخصی"
                action="ویرایش اطلاعات"
                editing={editing === 'personal'}
                onEdit={() => startEdit('personal')}
              >
                {editing === 'personal' ? (
                  <>
                    <div className="form-grid personal-form-grid">
                      <label className="field">
                        <span>نام و نام خانوادگی</span>
                        <input
                          value={[draft.firstName, draft.lastName].filter(Boolean).join(' ')}
                          onChange={(e) => changeFullName(e.target.value)}
                          placeholder="نام و نام خانوادگی"
                        />
                      </label>
                      <label className="field">
                        <span>کد ملی</span>
                        <input
                          inputMode="numeric"
                          maxLength={10}
                          value={draft.nationalCode}
                          onChange={(e) =>
                            change('nationalCode', e.target.value.replace(/\D/g, ''))
                          }
                          placeholder="کد ملی"
                        />
                      </label>
                      <div className="field birth-date-field">
                        <span>تاریخ تولد</span>
                        <button
                          type="button"
                          className="date-field"
                          aria-expanded={birthCalendarOpen}
                          onClick={() => setBirthCalendarOpen((open) => !open)}
                        >
                          <CalendarDays size={16} />
                          <span className="date-value">
                            {draft.birthDate ? dateLabel(draft.birthDate) : 'انتخاب تاریخ تولد'}
                          </span>
                        </button>
                        {birthCalendarOpen && (
                          <div className="birth-calendar" dir="rtl">
                            <CalendarProvider locale="fa" direction="rtl">
                              <Calendar
                                locale="fa"
                                direction="rtl"
                                key={draft.birthDate || 'no-date'}
                                defaultValue={
                                  draft.birthDate ? new Date(draft.birthDate) : new Date()
                                }
                                onChange={(event) => {
                                  const date = new Date(event.value);
                                  if (!Number.isNaN(date.getTime())) {
                                    change('birthDate', date.toISOString());
                                    setBirthCalendarOpen(false);
                                  }
                                }}
                              />
                            </CalendarProvider>
                          </div>
                        )}
                      </div>
                      <label className="field">
                        <span>جنسیت</span>
                        <select
                          value={draft.gender}
                          onChange={(e) => change('gender', e.target.value)}
                        >
                          <option value="">انتخاب جنسیت</option>
                          <option value="male">مرد</option>
                          <option value="female">زن</option>
                        </select>
                      </label>
                    </div>
                    <div className="actions personal-actions">
                      <button
                        type="button"
                        className="primary"
                        disabled={saving}
                        onClick={() => save('personal')}
                      >
                        {saving ? 'در حال ذخیره...' : 'تأیید'}
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        disabled={saving}
                        onClick={cancelEdit}
                      >
                        انصراف
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="info-grid">
                    <div className="info-pair">
                      <span>نام و نام خانوادگی</span>
                      <strong>
                        {display([profile.firstName, profile.lastName].filter(Boolean).join(' '))}
                      </strong>
                    </div>
                    <div className="info-pair">
                      <span>کد ملی</span>
                      <strong>{display(profile.nationalCode)}</strong>
                    </div>
                    <div className="info-pair">
                      <span>جنسیت</span>
                      <strong>
                        {profile.gender === 'male'
                          ? 'مرد'
                          : profile.gender === 'female'
                            ? 'زن'
                            : '—'}
                      </strong>
                    </div>
                    <div className="info-pair">
                      <span>تاریخ تولد</span>
                      <strong>{dateLabel(profile.birthDate)}</strong>
                    </div>
                  </div>
                )}
              </Section>

              <Section
                title="اطلاعات حساب بانکی"
                action="ویرایش اطلاعات"
                editing={editing === 'bank'}
                onEdit={() => startEdit('bank')}
              >
                {editing === 'bank' ? (
                  <>
                    <div className="form-grid bank-form-grid">
                      <label className="field">
                        <span>شماره کارت</span>
                        <input
                          inputMode="numeric"
                          maxLength={16}
                          value={draft.payment.debitCard_code}
                          onChange={(e) =>
                            changePayment('debitCard_code', e.target.value.replace(/\D/g, ''))
                          }
                          placeholder="شماره کارت"
                        />
                      </label>
                      <label className="field">
                        <span>شماره شبا</span>
                        <input
                          dir="ltr"
                          value={draft.payment.shaba_code}
                          onChange={(e) =>
                            changePayment(
                              'shaba_code',
                              e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                            )
                          }
                          placeholder="IR..."
                        />
                      </label>
                      <label className="field">
                        <span>شماره حساب</span>
                        <input
                          inputMode="numeric"
                          value={draft.payment.accountIdentifier}
                          onChange={(e) =>
                            changePayment('accountIdentifier', e.target.value.replace(/\D/g, ''))
                          }
                          placeholder="شماره حساب"
                        />
                      </label>
                    </div>
                    <div className="actions bank-actions">
                      <button
                        type="button"
                        className="primary"
                        disabled={saving}
                        onClick={() => save('bank')}
                      >
                        {saving ? 'در حال ذخیره...' : 'تأیید'}
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        disabled={saving}
                        onClick={cancelEdit}
                      >
                        انصراف
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="info-grid">
                    <div className="info-pair">
                      <span>شماره کارت</span>
                      <strong dir="ltr">{display(profile.payment.debitCard_code)}</strong>
                    </div>
                    <div className="info-pair">
                      <span>شماره شبا</span>
                      <strong dir="ltr">{display(profile.payment.shaba_code)}</strong>
                    </div>
                    <div className="info-pair">
                      <span>شماره حساب</span>
                      <strong dir="ltr">{display(profile.payment.accountIdentifier)}</strong>
                    </div>
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      </div>
      <style jsx global>
        {`
          .profile-page {
            min-height: 65vh;
            background: #fff;
            padding: 32px 20px 80px;
            color: #282828;
          }
          .profile-layout {
            max-width: 1188px;
            margin: auto;
            display: grid;
            grid-template-columns: 260px minmax(0, 1fr);
            gap: 24px;
            align-items: start;
          }
          .profile-menu {
            border: 1px solid #ddd;
            border-radius: 10px;
            overflow: hidden;
            background: #fff;
          }
          .menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 17px 20px;
            border: 0;
            border-bottom: 1px solid #e7e7e7;
            background: #fff;
            color: #444;
            font: inherit;
            font-size: 14px;
            text-align: right;
            cursor: pointer;
            text-decoration: none;
          }
          .menu-item:last-child {
            border-bottom: 0;
          }
          .menu-item.selected {
            background: #d0ebd7;
            color: #28a745;
            font-weight: 600;
            cursor: default;
          }
          .profile-content {
            display: flex;
            flex-direction: column;
            gap: 18px;
            min-width: 0;
          }
          .profile-section {
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 20px 22px;
            background: #fff;
          }
          .section-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 25px;
          }
          .section-head h2 {
            font-size: 16px;
            font-weight: 600;
            margin: 0;
          }
          .edit-link {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #009eca;
            border: 0;
            background: none;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 26px 20px;
          }
          .info-pair {
            display: flex;
            align-items: center;
            gap: 20px;
            min-width: 0;
            font-size: 13px;
          }
          .info-pair span {
            color: #777;
            white-space: nowrap;
          }
          .info-pair strong {
            font-size: 13px;
            font-weight: 500;
            overflow-wrap: anywhere;
          }
          .account-info-layout {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            align-items: center;
            gap: 20px;
          }
          .account-info-layout.is-editing {
            grid-template-columns: minmax(180px, 1fr) minmax(0, 1.5fr);
          }
          .account-edit-controls {
            display: flex;
            align-items: end;
            gap: 10px;
            min-width: 0;
          }
          .account-email-field {
            flex: 1;
            min-width: 0;
          }
          .account-email-field input {
            width: 100%;
          }
          .account-edit-buttons {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
          }
          .account-edit-buttons .primary,
          .account-edit-buttons .secondary {
            min-width: 72px;
            height: 42px;
            padding: 0 12px;
          }
          .profile-section:has(.account-info-layout.is-editing) .section-head {
            margin-bottom: 12px;
          }
          @media (max-width: 1000px) {
            .account-info-layout.is-editing {
              grid-template-columns: 1fr;
            }
          }
          @media (max-width: 600px) {
            .account-info-layout {
              grid-template-columns: 1fr;
            }
            .account-edit-controls {
              flex-wrap: wrap;
            }
            .account-email-field {
              flex-basis: 100%;
            }
            .account-edit-buttons {
              width: 100%;
            }
            .account-edit-buttons .primary,
            .account-edit-buttons .secondary {
              flex: 1;
            }
          }
          .personal-form-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px 18px;
          }
          .personal-actions {
            justify-content: flex-end;
          }
          .personal-actions .primary,
          .personal-actions .secondary {
            min-width: 90px;
          }
          .profile-section:has(.bank-form-grid) {
            padding: 16px 20px 12px;
          }
          .profile-section:has(.bank-form-grid) .section-head {
            margin-bottom: 12px;
          }
          .profile-section:has(.bank-form-grid) .section-head h2 {
            font-size: 14px;
          }
          .bank-form-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }
          .bank-form-grid .field {
            gap: 5px;
          }
          .bank-form-grid .field input {
            height: 38px;
            font-size: 12px;
          }
          .bank-actions {
            justify-content: flex-end;
            margin-top: 12px;
            padding-top: 10px;
          }
          .bank-actions .primary,
          .bank-actions .secondary {
            min-width: 90px;
            height: 34px;
            font-size: 12px;
          }
          .form-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
          }
          .field {
            display: flex;
            flex-direction: column;
            gap: 7px;
            color: #777;
            font-size: 12px;
            min-width: 0;
          }
          .field input,
          .field select,
          .date-field {
            height: 42px;
            width: 100%;
            border: 1px solid #bcbcbc;
            border-radius: 6px;
            padding: 0 12px;
            background: #fff;
            color: #282828;
            font: inherit;
            font-size: 13px;
            outline-color: #28a745;
          }
          .date-field {
            display: flex;
            align-items: center;
            gap: 8px;
            position: relative;
          }

          .profile-page .date-field {
            text-align: right;
            cursor: pointer;
          }
          .profile-page .date-value {
            color: #282828;
            font-size: 13px;
          }
          .profile-page .birth-date-field {
            position: relative;
            z-index: 2;
          }
          .profile-page .birth-calendar {
            width: max-content;
            max-width: min(340px, calc(100vw - 48px));
            padding: 8px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            align-self: flex-start;
          }
          .actions {
            display: flex;
            gap: 10px;
            margin-top: 24px;
            padding-top: 15px;
            border-top: 1px solid #eee;
          }
          .primary,
          .secondary {
            min-width: 112px;
            height: 38px;
            border-radius: 6px;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }
          .primary {
            background: #28a745;
            color: #fff;
            border: 1px solid #28a745;
          }
          .secondary {
            background: #fff;
            color: #28a745;
            border: 1px solid #28a745;
          }
          .primary:disabled,
          .secondary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          .notice {
            padding: 12px 16px;
            border-radius: 7px;
            font-size: 13px;
            margin: 0;
          }
          .notice-error {
            background: #fff1f0;
            color: #c12b26;
          }
          .notice-success {
            background: #effaf1;
            color: #25833b;
          }
          .status {
            padding: 30px;
            text-align: center;
            color: #777;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .status button {
            margin-top: 12px;
            padding: 8px 18px;
            cursor: pointer;
          }
          @media (max-width: 850px) {
            .profile-layout {
              grid-template-columns: 1fr;
            }
            .profile-menu {
              display: flex;
            }
            .menu-item {
              justify-content: center;
              border-bottom: 0;
              border-left: 1px solid #eee;
              padding: 14px 8px;
            }
            .menu-item:last-child {
              border-left: 0;
            }
          }
          @media (max-width: 600px) {
            .profile-page {
              padding: 16px 12px 40px;
            }
            .profile-layout {
              gap: 16px;
            }
            .profile-section {
              padding: 16px 12px;
            }
            .section-head {
              margin-bottom: 20px;
            }
            .section-head h2 {
              font-size: 14px;
            }
            .info-grid,
            .form-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            .info-pair {
              justify-content: space-between;
              gap: 12px;
            }
            .menu-item {
              font-size: 12px;
              gap: 6px;
            }
            .actions {
              justify-content: stretch;
            }
            .primary,
            .secondary {
              flex: 1;
              min-width: 0;
            }
          }
          @media (max-width: 600px) {
            .profile-page,
            .profile-page * {
              box-sizing: border-box;
            }
            .profile-page {
              width: 100%;
              max-width: 100%;
              min-width: 0;
              overflow-x: clip;
              padding: 12px 16px 32px;
            }
            .profile-layout {
              display: flex;
              flex-direction: column;
              width: 100%;
              max-width: 100%;
              min-width: 0;
              gap: 14px;
            }
            .profile-menu {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              width: 100%;
              min-width: 0;
              border: 0;
              border-bottom: 1px solid #e5e5e5;
              border-radius: 0;
              overflow: visible;
              background: #fff;
            }
            .profile-menu .menu-item {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              gap: 4px;
              min-width: 0;
              width: 100%;
              padding: 12px 2px;
              border: 0;
              border-bottom: 2px solid transparent;
              background: #fff;
              font-size: 11px;
              white-space: nowrap;
              text-align: center;
            }
            .profile-menu .menu-item svg {
              width: 14px;
              height: 14px;
              flex-shrink: 0;
            }
            .profile-menu .menu-item.selected {
              color: #28a745;
              border-bottom-color: #28a745;
              background: #fff;
            }
            .profile-content {
              width: 100%;
              min-width: 0;
              gap: 12px;
            }
            .profile-section,
            .profile-section:has(.bank-form-grid) {
              width: 100%;
              min-width: 0;
              padding: 13px 12px 15px;
              border-radius: 8px;
            }
            .section-head,
            .profile-section:has(.bank-form-grid) .section-head,
            .profile-section:has(.account-info-layout.is-editing) .section-head {
              align-items: center;
              margin-bottom: 14px;
              gap: 8px;
            }
            .section-head h2,
            .profile-section:has(.bank-form-grid) .section-head h2 {
              font-size: 12px;
              line-height: 1.7;
            }
            .edit-link {
              gap: 4px;
              padding: 0;
              font-size: 11px;
              white-space: nowrap;
            }
            .edit-link svg {
              width: 13px;
              height: 13px;
            }
            .info-grid,
            .account-info-layout,
            .account-info-layout.is-editing {
              display: grid;
              grid-template-columns: minmax(0, 1fr);
              gap: 13px;
            }
            .info-pair {
              display: grid;
              grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
              align-items: center;
              justify-content: initial;
              gap: 10px;
              width: 100%;
              min-width: 0;
              font-size: 11px;
            }
            .info-pair span {
              font-size: 11px;
              white-space: normal;
            }
            .info-pair strong {
              font-size: 11px;
              font-weight: 500;
              text-align: left;
              direction: auto;
              overflow-wrap: anywhere;
            }
            .account-edit-controls {
              display: flex;
              flex-direction: column;
              align-items: stretch;
              gap: 10px;
              min-width: 0;
            }
            .account-email-field {
              width: 100%;
              flex-basis: auto;
            }
            .account-edit-buttons {
              width: 100%;
              gap: 8px;
            }
            .form-grid,
            .personal-form-grid,
            .bank-form-grid {
              display: grid;
              grid-template-columns: minmax(0, 1fr);
              gap: 12px;
            }
            .field {
              width: 100%;
              min-width: 0;
              gap: 5px;
              font-size: 11px;
            }
            .field input,
            .field select,
            .date-field,
            .bank-form-grid .field input {
              width: 100%;
              min-width: 0;
              height: 40px;
              font-size: 12px;
            }
            .birth-calendar {
              width: 100%;
              max-width: 100%;
              overflow-x: auto;
              padding: 4px;
            }
            .actions,
            .personal-actions,
            .bank-actions {
              justify-content: flex-start;
              gap: 8px;
              margin-top: 14px;
              padding-top: 12px;
            }
            .actions .primary,
            .actions .secondary,
            .account-edit-buttons .primary,
            .account-edit-buttons .secondary {
              flex: 1;
              min-width: 0;
              height: 36px;
              font-size: 12px;
            }
            .notice {
              font-size: 12px;
              overflow-wrap: anywhere;
            }
          }
        `}
      </style>
    </main>
  );
}
