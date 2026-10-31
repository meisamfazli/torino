
'use client';

import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import OtpInput from './OtpInput';
import {
  saveAccessToken,
  getAccessToken,
  removeAccessToken,
} from '../lib/auth';

const schema = yup.object({
  mobile: yup
    .string()
    .required('شماره موبایل الزامی است')
    .matches(
      /^09\d{9}$/,
      'شماره موبایل باید ۱۱ رقم و با 09 شروع شود'
    ),
});

type LoginFormData = yup.InferType<typeof schema>;

export default function LoginForm() {
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [mobile, setMobile] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = getAccessToken();

    if (token) {
      setIsLoggedIn(true);
      setMobile(localStorage.getItem('torinoMobile') || '');
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      setErrorMessage('');

      const response = await api.post('/auth/send-otp', {
        mobile: data.mobile,
      });

      setMobile(data.mobile);
      setOtp('');
      setMessage(response.data.message || 'کد تأیید ارسال شد');
    } catch (error) {
      console.error('خطا در ارسال کد تأیید:', error);
      setMessage('');
      setErrorMessage('ارسال کد تأیید ناموفق بود.');
    }
  }

  async function handleVerifyOtp() {
    try {
      setErrorMessage('');

      const response = await api.post('/auth/check-otp', {
        mobile,
        code: otp,
      });

      const accessToken = response.data.accessToken;

      if (!accessToken) {
        setErrorMessage('توکن ورود دریافت نشد.');
        return;
      }

      saveAccessToken(accessToken);
      localStorage.setItem('torinoMobile', mobile);

      setIsLoggedIn(true);
      window.dispatchEvent(new Event('torino-auth-change'));
    } catch (error) {
      console.error('خطا در تأیید کد:', error);
      setErrorMessage('کد تأیید اشتباه است یا اعتبار آن تمام شده.');
    }
  }

  function handleLogout() {
    removeAccessToken();
    localStorage.removeItem('torinoMobile');

    setIsLoggedIn(false);
    setMobile('');
    setMessage('');
    setOtp('');
    setErrorMessage('');

    window.dispatchEvent(new Event('torino-auth-change'));
  }

  if (isLoggedIn) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#282828]">
          خوش آمدید!
        </h2>

        <p className="mt-4 text-sm text-[#555]">
          شما با موفقیت وارد تورینو شدید.
        </p>

        {mobile && (
          <p className="mt-3 text-sm" dir="ltr">
            {mobile}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded-lg border border-[#28A745] px-6 py-3 text-[#28A745]"
        >
          خروج از حساب
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col"
      dir="rtl"
    >
      <h2 className="mb-9 text-center text-[24px] font-semibold text-[#282828]">
        {message ? 'تأیید کد ورود' : 'ورود به تورینو'}
      </h2>

      {!message ? (
        <>
          <label
            htmlFor="mobile"
            className="mb-2 text-right text-[16px] text-[#282828]"
          >
            شماره موبایل خود را وارد کنید
          </label>

          <input
            id="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="09123456789"
            dir="ltr"
            {...register('mobile')}
            className="h-[54px] w-full rounded-md border border-[#B8B8B8] bg-white px-4 text-right text-[16px] text-[#282828] outline-none focus:border-[#28A745]"
          />

          {errors.mobile && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {errors.mobile.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 h-[54px] w-full rounded-md bg-[#28A745] text-[18px] font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? 'در حال ارسال...' : 'ارسال کد تایید'}
          </button>
        </>
      ) : (
        <>
          <p className="mb-5 text-center text-sm text-[#555]">
            کد تأیید ارسال‌شده به شماره {mobile} را وارد کنید.
          </p>

          <div className="flex justify-center">
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6}
            className="mt-8 h-[54px] w-full rounded-md bg-[#28A745] text-[18px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            تأیید کد
          </button>
        </>
      )}

      {errorMessage && (
        <p role="alert" className="mt-4 text-center text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
