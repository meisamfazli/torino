
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white text-[#282828]" dir="rtl">
      <div className="mx-auto w-full max-w-[1200px] px-5 pt-8 md:px-6">
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 border-t border-[#E5E5E5] pt-7 md:grid-cols-[1fr_1fr_2fr] md:gap-12">
          <section>
            <h2 className="mb-4 text-base font-bold md:text-lg">
              تورینو
            </h2>

            <ul className="space-y-3 text-sm md:text-base">
              <li>
                <Link href="/#about">درباره ما</Link>
              </li>
              <li>
                <Link href="/#contact">تماس با ما</Link>
              </li>
              <li>
                <Link href="/#about">چرا تورینو</Link>
              </li>
              <li>
                <Link href="/#services">بیمه مسافرتی</Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-base font-bold md:text-lg">
              خدمات مشتریان
            </h2>

            <ul className="space-y-3 text-sm md:text-base">
              <li>
                <Link href="/#contact">پشتیبانی آنلاین</Link>
              </li>
              <li>
                <Link href="/#contact">راهنمای خرید</Link>
              </li>
              <li>
                <Link href="/#contact">راهنمای استرداد</Link>
              </li>
              <li>
                <Link href="/#contact">پرسش و پاسخ</Link>
              </li>
            </ul>
          </section>

          <section className="col-span-2 flex min-w-0 flex-col items-end gap-5 md:col-span-1">
            <Image
              src="/images/torino-logo.svg"
              alt="لوگوی تورینو"
              width={146}
              height={44}
            />

            <p className="text-sm">
              تلفن پشتیبانی: ۰۲۱-۸۵۷۴
            </p>

            <div
              className="grid w-full grid-cols-5 items-center gap-2 md:flex md:flex-wrap md:justify-end md:gap-3"
              dir="ltr"
            >
              {[1, 2, 3, 4, 5].map((number) => (
                <Image
                  key={number}
                  src={`/images/footer-badge-${number}.png`}
                  alt={`نماد فوتر ${number}`}
                  width={65}
                  height={65}
                  className="h-auto w-full min-w-0 object-contain md:h-[65px] md:w-[65px]"
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-8 border-t border-[#E5E5E5] px-4 py-4 text-center">
        <p className="text-xs text-[#555] md:text-sm">
          کلیه حقوق این وب سایت متعلق به تورینو می‌باشد.
        </p>
      </div>
    </footer>
  );
}
