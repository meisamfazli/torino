'use client';

import Image from 'next/image';

export default function ContactBanner() {
  return (
    <section className="contact-banner" dir="rtl">
      <div className="banner-green">
        <div className="banner-text">
          <h2>
            خرید تلفنی از <span>تورینو</span>
          </h2>
          <p>به هرکجا که می‌خواهید!</p>
        </div>

        <div className="banner-person">
          <Image
            src="/images/contact-man.png"
            alt="پشتیبانی تلفنی تورینو"
            fill
            sizes="(max-width: 768px) 155px, 245px"
            style={{ objectFit: 'contain', objectPosition: 'bottom' }}
          />
        </div>
      </div>

      <div className="banner-contact">
        <a href="tel:0211840" className="phone-number">
          ☎ ۰۲۱-۱۸۴۰
        </a>
        <a href="tel:0211840" className="contact-button">
          اطلاعات بیشتر
        </a>
      </div>

      <style jsx>{`
        .contact-banner {
          display: flex;
          width: 100%;
          max-width: 1188px;
          height: 251px;
          margin: 70px auto;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          font-family: inherit;
        }

        .banner-green {
          position: relative;
          width: 73%;
          height: 100%;
          background: #28a745;
          border-radius: 10px 0 0 10px;
          padding: 38px 45px;
        }

        .banner-text {
          position: relative;
          z-index: 1;
          color: #fff;
        }

        .banner-text h2 {
          margin: 0 0 12px;
          font-size: 36px;
          font-weight: 800;
          line-height: 1.5;
        }

        .banner-text h2 span {
          color: #111;
        }

        .banner-text p {
          margin: 0;
          font-size: 23px;
          font-weight: 400;
          line-height: 1.7;
        }

        .banner-person {
          position: absolute;
          bottom: 0;
          left: 35px;
          height: 245px;
          width: 245px;
          max-width: 45%;
        }

        .banner-contact {
          display: flex;
          width: 27%;
          height: 100%;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 20px;
        }

        .phone-number {
          color: #222;
          font-size: 24px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .contact-button {
          padding: 10px 35px;
          border-radius: 8px;
          background: #104b24;
          color: #fff;
          font-size: 14px;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .contact-banner {
            height: auto;
            flex-direction: column;
            margin: 40px auto;
          }

          .banner-green {
            width: 100%;
            height: 190px;
            padding: 25px 20px;
            border-radius: 10px 10px 0 0;
          }

          .banner-text h2 {
            font-size: 22px;
          }

          .banner-text p {
            font-size: 14px;
          }

          .banner-person {
            left: 5px;
            height: 155px;
            width: 155px;
          }

          .banner-contact {
            width: 100%;
            height: 110px;
            gap: 10px;
          }

          .phone-number {
            font-size: 20px;
          }
        }
      `}</style>
    </section>
  );
}
