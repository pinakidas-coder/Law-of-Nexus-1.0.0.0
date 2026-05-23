import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Scale, LogOut, User, LayoutDashboard, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.services'), path: '/#services' },
    { name: t('nav.appointment'), path: '/appointment' },
  ];

  return (
    <nav className="bg-neutral-950 text-white sticky top-0 z-50 shadow-xl border-b border-gold-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <Scale className="h-8 w-8 text-gold-500 group-hover:rotate-12 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold tracking-wider gold-text">{t('hero.title')}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">{t('hero.subtitle')}</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                link.path.startsWith('/#') ? (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={(e) => {
                      if (window.location.pathname === '/') {
                        e.preventDefault();
                        document.getElementById(link.path.split('#')[1])?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="hover:text-gold-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="hover:text-gold-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              
              <div className="relative flex items-center">
                <Globe className="h-4 w-4 text-neutral-400 mr-1 absolute left-0" style={{ pointerEvents: 'none' }} />
                <select
                  value={i18n.language || 'en'}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:text-gold-400 transition-colors pl-6 appearance-none"
                >
                  <option value="en" className="text-black">English</option>
                  <option value="bn" className="text-black">বাংলা</option>
                </select>
              </div>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    className="flex items-center space-x-1 bg-gold-600/20 text-gold-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-gold-600/30 transition-all border border-gold-600/30"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{isAdmin ? t('nav.admin') : t('nav.dashboard')}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-neutral-400 hover:text-white transition-colors"
                    title={t('nav.logout')}
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-gold">
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <div className="relative flex items-center">
              <select
                value={i18n.language || 'en'}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:text-gold-400 transition-colors appearance-none pr-2"
              >
                <option value="en" className="text-black">EN</option>
                <option value="bn" className="text-black">BN</option>
              </select>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gold-500 hover:text-white hover:bg-neutral-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-neutral-900 border-t border-gold-900/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              link.path.startsWith('/#') ? (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={(e) => {
                    if (window.location.pathname === '/') {
                      e.preventDefault();
                      document.getElementById(link.path.split('#')[1])?.scrollIntoView({ behavior: 'smooth' });
                    }
                    setIsOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-neutral-800 hover:text-gold-400"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-neutral-800 hover:text-gold-400"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              )
            ))}
            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gold-400 hover:bg-neutral-800"
                  onClick={() => setIsOpen(false)}
                >
                  {isAdmin ? t('nav.admin') : t('nav.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-neutral-800"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium bg-gold-600 text-white"
                onClick={() => setIsOpen(false)}
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
