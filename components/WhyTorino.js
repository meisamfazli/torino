'use client';

import { useState } from 'react';

const photos = [
  '/images/whytorino-1.png',
  '/images/whytorino-2.png',
  '/images/whytorino-3.png',
  '/images/whytorino-4.png',
];

const advantages = [
  {
    title: 'به صرفه ترین قیمت',
    description: 'به‌صرفه‌ترین و ارزان‌ترین قیمت تور را از ما بخواهید.',
    image: '/images/why-price.png',
  },
  {
    title: 'پشتیبانی',
    description: 'پشتیبانی و همراهی ۲۴ ساعته در تمامی مراحل سفر شما.',
    image: '/images/why-support.png',
  },
  {
    title: 'رضایت کاربران',
    description: 'رضایت بیش از ۱۰ هزار کاربر از تورهای ما.',
    image: '/images/why-satisfaction.png',
  },
];

export default function WhyTorino() {
  const [active, setActive] = useState(0);

  function nextPhoto() {
    if (active === photos.length - 1) {
      setActive(0);
    } else {
      setActive(active + 1);
    }
  }

  function previousPhoto() {
    if (active === 0) {
      setActive(photos.length - 1);
    } else {
      setActive(active - 1);
    }
  }

  return (
    <section className="why-torino" id="why-torino" dir="rtl">
      <div className="why-content">
        <div className="why-description">
          <div className="why-heading">
            <div className="question-icon" aria-hidden="true">
              <img src="/images/why-1.png" alt="" className="question-part one" />
              <img src="/images/why-2.png" alt="" className="question-part two" />
            </div>
            <h2>
              چرا <span>تورینو</span> ؟
            </h2>
          </div>
          <h3>تور طبیعت گردی و تاریخی</h3>
          <p>
            اگر دوست داشته باشید که یک جاذبه طبیعی را از نزدیک ببینید و در دل طبیعت چادر بزنید یا در
            یک اقامتگاه بوم گردی اتاق بگیرید، باید تورهای طبیعت‌گردی را خریداری کنید. اما اگر
            بخواهید از جاذبه‌های گردشگری و آثار تاریخی یک مقصد خاص بازدید کنید، می‌توانید تورهای
            فرهنگی و تاریخی را خریداری کنید.
          </p>
        </div>

        <div className="why-gallery">
          <div className="photo-stack">
            {photos.map((photo, index) => {
              const position = (index - active + photos.length) % photos.length;
              return (
                <img
                  key={photo}
                  src={photo}
                  alt={`تصویر گردشگری ${index + 1}`}
                  className={`stack-photo position-${position}`}
                />
              );
            })}
          </div>
          <div className="gallery-controls">
            <button type="button" onClick={previousPhoto} aria-label="تصویر قبلی">
              ←
            </button>
            <span>{(active + 1).toLocaleString('fa-IR')} / ۴</span>
            <button type="button" onClick={nextPhoto} aria-label="تصویر بعدی">
              →
            </button>
          </div>
        </div>
      </div>

      <div className="why-advantages">
        {advantages.map((item) => (
          <div className="advantage" key={item.title}>
            <img src={item.image} alt="" />
            <div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .why-torino {
          width: 100%;
          margin: 80px auto 0;
          color: #282828;
        }
        .why-content {
          max-width: 1182px;
          margin: 0 auto;
          padding: 0 24px 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 45px;
        }
        .why-description {
          max-width: 430px;
          justify-self: start;
        }
        .why-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .question-icon {
          position: relative;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
        }
        .question-part {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .question-part.one {
          z-index: 2;
          width: 80%;
          height: 80%;
          inset: 10%;
        }
        .question-part.two {
          z-index: 1;
        }
        .why-heading h2 {
          margin: 0;
          font-size: 23px;
          font-weight: 700;
        }
        .why-heading h2 span {
          color: #28a745;
        }
        .why-description h3 {
          margin: 0 0 14px;
          font-size: 15px;
          font-weight: 700;
        }
        .why-description p {
          margin: 0;
          font-size: 13px;
          font-weight: 400;
          line-height: 2.1;
          text-align: justify;
        }
        .why-gallery {
          width: 100%;
          max-width: 440px;
          justify-self: center;
        }
        .photo-stack {
          height: 315px;
          position: relative;
          overflow: visible;
        }
        .stack-photo {
          position: absolute;
          width: 235px;
          height: 300px;
          border-radius: 20px;
          object-fit: cover;
          transition:
            left 0.3s ease,
            transform 0.3s ease;
        }
        .position-0 {
          left: 88px;
          top: 0;
          z-index: 4;
        }
        .position-1 {
          left: 57px;
          top: 18px;
          z-index: 3;
          transform: scale(0.91);
        }
        .position-2 {
          left: 29px;
          top: 33px;
          z-index: 2;
          transform: scale(0.82);
        }
        .position-3 {
          left: 4px;
          top: 48px;
          z-index: 1;
          transform: scale(0.73);
        }
        .gallery-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 22px;
          margin-top: 6px;
        }
        .gallery-controls button {
          border: 0;
          background: transparent;
          color: #56836b;
          font-size: 25px;
          cursor: pointer;
          padding: 0 4px;
        }
        .gallery-controls span {
          font-size: 15px;
          font-weight: 600;
          color: #777;
        }
        .why-advantages {
          border-top: 1px solid #e5e5e5;
          border-bottom: 1px solid #e5e5e5;
          max-width: 1182px;
          margin: 0 auto;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .advantage {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
        }
        .advantage img {
          width: 70px;
          height: 70px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .advantage h4 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 5px;
        }
        .advantage p {
          font-size: 11px;
          line-height: 1.8;
          color: #666;
          margin: 0;
          max-width: 190px;
        }
        @media (max-width: 768px) {
          .why-torino {
            margin-top: 50px;
          }
          .why-content {
            grid-template-columns: 1fr;
            gap: 30px;
            padding: 0 16px 30px;
          }
          .why-description {
            max-width: none;
          }
          .why-heading {
            margin-bottom: 18px;
          }
          .why-heading h2 {
            font-size: 22px;
          }
          .why-description h3 {
            font-size: 15px;
          }
          .why-description p {
            font-size: 13px;
            line-height: 2;
          }
          .why-gallery {
            max-width: 350px;
          }
          .photo-stack {
            height: 270px;
          }
          .stack-photo {
            width: 205px;
            height: 255px;
          }
          .position-0 {
            left: 85px;
          }
          .position-1 {
            left: 55px;
          }
          .position-2 {
            left: 27px;
          }
          .position-3 {
            left: 0;
          }
          .why-advantages {
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 22px 16px;
          }
          .advantage {
            justify-content: flex-start;
          }
        }
        @media (max-width: 390px) {
          .why-gallery {
            max-width: 310px;
          }
          .stack-photo {
            width: 205px;
            height: 235px;
          }
          .photo-stack {
            height: 250px;
          }
          .position-0 {
            left: 75px;
          }
          .position-1 {
            left: 48px;
          }
          .position-2 {
            left: 22px;
          }
          .position-3 {
            left: 0;
          }
        }
      `}</style>
    </section>
  );
}
