
export default function Home() {
  return (
    <>
      <main>
        <section className="home-banner" aria-label="بنر تورینو">
          <img
            src="/images/home-banner.png"
            alt="سفر با تورینو"
            className="banner-image"
          />
        </section>

        <section className="home-search">
          <h1>
            <span>تورینو</span> برگزار کننده بهترین تورهای داخلی و خارجی
          </h1>
        </section>
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

        @media (max-width: 768px) {
          .home-search {
            padding: 16px 12px 32px;
          }

          .home-search h1 {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  );
}
