
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import LoginForm from './LoginForm';
import { getAccessToken } from '../lib/auth';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobile, setMobile] = useState('');
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateAuthStatus() {
      const token = getAccessToken();
      const savedMobile = localStorage.getItem('torinoMobile');

      setIsLoggedIn(Boolean(token));
      setMobile(token ? savedMobile || '' : '');

      if (token) {
        setLoginOpen(false);
      } else {
        setAccountOpen(false);
      }
    }

    updateAuthStatus();

    window.addEventListener('torino-auth-change', updateAuthStatus);
    window.addEventListener('storage', updateAuthStatus);

    return () => {
      window.removeEventListener('torino-auth-change', updateAuthStatus);
      window.removeEventListener('storage', updateAuthStatus);
    };
  }, []);

  useEffect(() => {
    if (!loginOpen && !accountOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLoginOpen(false);
        setAccountOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [loginOpen, accountOpen]);

  useEffect(() => {
    if (!accountOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [accountOpen]);

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('torinoMobile');

    setIsLoggedIn(false);
    setMobile('');
    setAccountOpen(false);
    setMenuOpen(false);

    window.dispatchEvent(new Event('torino-auth-change'));
  }

  function handleAccountClick() {
    setMenuOpen(false);

    if (isLoggedIn) {
      setAccountOpen((previous) => !previous);
    } else {
      setLoginOpen(true);
    }
  }

  return (
    <>
      <header className="torino-header">
        <div className="header-container">
          <Link href="/" className="torino-logo">
            <img
              src="/images/torino-logo.svg"
              alt="Torino"
              width={146}
              height={44}
            />
          </Link>

          <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
            <Link
              href="/"
              className="active"
              onClick={() => setMenuOpen(false)}
            >
              صفحه اصلی
            </Link>

            <Link
              href="/#services"
              onClick={() => setMenuOpen(false)}
            >
              خدمات گردشگری
            </Link>

            <Link
              href="/#about"
              onClick={() => setMenuOpen(false)}
            >
              درباره ما
            </Link>

            <Link
              href="/#contact"
              onClick={() => setMenuOpen(false)}
            >
              تماس با ما
            </Link>
          </nav>

          <div className="account-wrapper" ref={accountRef}>
            <button
              type="button"
              className={`login-button ${isLoggedIn ? 'logged-in' : ''}`}
              onClick={handleAccountClick}
              aria-expanded={isLoggedIn ? accountOpen : undefined}
              aria-haspopup={isLoggedIn ? 'menu' : undefined}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
              </svg>

              <span>
                {isLoggedIn
                  ? mobile || 'حساب کاربری'
                  : 'ورود | ثبت نام'}
              </span>

              {isLoggedIn && (
                <svg
                  className={`account-chevron ${accountOpen ? 'expanded' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>

            {isLoggedIn && accountOpen && (
              <div className="account-dropdown" role="menu">
                <div className="account-dropdown-user">
                  <span className="account-user-icon">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                    </svg>
                  </span>
                  <span>{mobile || 'حساب کاربری'}</span>
                </div>

                <div className="account-dropdown-info">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                  </svg>
                  <span>اطلاعات حساب کاربری</span>
                </div>

                <button
                  type="button"
                  className="account-dropdown-logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
                  </svg>
                  <span>خروج از حساب کاربری</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="menu-button"
            aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {loginOpen && (
        <div
          className="login-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLoginOpen(false);
            }
          }}
        >
          <div
            className="login-modal"
            role="dialog"
            aria-modal="true"
            aria-label="ورود و ثبت نام تورینو"
          >
            <button
              type="button"
              className="login-modal-close"
              aria-label="بستن پنجره ورود"
              onClick={() => setLoginOpen(false)}
            >
              ×
            </button>

            <LoginForm />
          </div>
        </div>
      )}

      <style jsx global>{`
        .torino-header {
          width: 100%;
          background: #fff;
          border-bottom: 1px solid #eaeaea;
          position: relative;
          z-index: 20;
          direction: rtl;
        }

        .header-container {
          max-width: 1200px;
          min-height: 74px;
          margin: 0 auto;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .torino-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .torino-logo img {
          width: 146px;
          height: 44px;
          object-fit: contain;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .header-nav a {
          color: #444;
          text-decoration: none;
          font-size: 16px;
          white-space: nowrap;
        }

        .header-nav a.active {
          color: #28a745;
        }

        .account-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #28a745;
          border-radius: 8px;
          padding: 9px 15px;
          color: #28a745;
          background: #fff;
          white-space: nowrap;
          font-size: 16px;
          direction: ltr;
          cursor: pointer;
          font-family: inherit;
        }

        .login-button span {
          direction: rtl;
        }

        .login-button.logged-in {
          border-color: transparent;
          padding: 9px 0;
        }

        .account-chevron {
          transition: transform 0.2s ease;
        }

        .account-chevron.expanded {
          transform: rotate(180deg);
        }

        .account-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 205px;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14);
          z-index: 30;
          direction: rtl;
          font-size: 14px;
        }

        .account-dropdown-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 13px 12px;
          background: #f3f3f3;
          color: #28a745;
        }

        .account-user-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dcdcdc;
          color: #666;
        }

        .account-dropdown-info {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 15px 13px;
          color: #333;
        }

        .account-dropdown-logout {
          display: flex;
          align-items: center;
          gap: 9px;
          width: calc(100% - 20px);
          margin: 0 10px;
          padding: 13px 3px;
          border: 0;
          border-top: 1px solid #e5e5e5;
          background: #fff;
          color: #e53935;
          font-family: inherit;
          font-size: 14px;
          text-align: right;
          cursor: pointer;
        }

        .menu-button {
          display: none;
          background: transparent;
          border: 0;
          font-size: 26px;
          cursor: pointer;
        }

        .login-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, 0.45);
        }

        .login-modal {
          position: relative;
          width: 100%;
          max-width: 561px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          background: #fff;
          padding: 48px 32px 32px;
          direction: rtl;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        .login-modal-close {
          position: absolute;
          top: 12px;
          left: 16px;
          border: 0;
          background: transparent;
          color: #555;
          font-size: 30px;
          line-height: 1;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .header-container {
            min-height: 64px;
            padding: 10px 20px;
          }

          .torino-logo {
            margin: 0 auto;
          }

          .torino-logo img {
            width: 110px;
            height: auto;
          }

          .menu-button {
            display: block;
            order: 1;
          }

          .header-nav {
            display: none;
            position: absolute;
            top: 64px;
            right: 0;
            left: 0;
            background: #fff;
            padding: 20px;
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
          }

          .header-nav.open {
            display: flex;
          }

          .account-wrapper {
            order: -1;
          }

          .login-button {
            padding: 8px;
          }

          .login-button.logged-in {
            padding: 8px;
            border: 1px solid #28a745;
          }

          .login-button span,
          .account-chevron {
            display: none;
          }

          .account-dropdown {
            left: auto;
            right: 0;
            width: 205px;
             max-width: calc(100vw - 32px);
}

          .login-modal {
            width: 100%;
            max-width: 358px;
            min-height: 362px;
            padding: 48px 34px 32px;
            border-radius: 16px;
          }
        }

        @media (max-width: 360px) {
          .login-modal {
            padding-right: 20px;
            padding-left: 20px;
          }
        }
      `}</style>
    </>
  );
}
