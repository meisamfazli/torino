import Providers from '../providers/Providers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './globals.css';

export const metadata = {
  title: 'تورینو | رزرو آنلاین تور',
  description: 'رزرو آنلاین تورهای گردشگری با تورینو',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          <Header />

          <div className="flex-1 flex flex-col">{children}</div>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
