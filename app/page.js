import TourSearch from '@/components/TourSearch';
import ContactBanner from '@/components/ContactBanner';
import WhyTorino from '@/components/WhyTorino';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <main>
        <section className="home-banner" aria-label="بنر تورینو">
          <Image
            src="/images/home-banner.png"
            alt="سفر با تورینو"
            width={1440}
            height={350}
            className="banner-image"
            priority
          />
        </section>

        <section className="home-search">
          <h1>
            <span>تورینو</span> برگزار کننده بهترین تورهای داخلی و خارجی
          </h1>

          <TourSearch />
        </section>

        <section className="home-contact">
          <ContactBanner />
        </section>

        <WhyTorino />
      </main>

      <style>{`
        .home-banner {
          width: 100%;
          overflow: hidden;
        }

        .banner-image {
          display: block;
          width: 100%;
          height: auto;
        }

        .home-search {
          padding: 20px 24px 40px;
          text-align: center;
        }

        .home-search h1 {
          margin: 0;
          color: #595959;
          font-size: 28px;
          font-weight: 600;
          line-height: 1.8;
        }

        .home-search h1 span {
          color: #28a745;
        }

        .home-contact {
          padding: 0 24px;
        }

        @media (max-width: 768px) {
          .home-search {
            padding: 16px 12px 32px;
          }

          .home-search h1 {
            font-size: 18px;
          }

          .home-contact {
            padding: 0 12px;
          }
        }
      `}</style>
    </>
  );
}
