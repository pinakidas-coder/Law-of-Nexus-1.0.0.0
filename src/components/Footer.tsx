import React from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-8 border-t border-gold-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <Scale className="h-8 w-8 text-gold-500" />
              <span className="text-2xl font-serif font-bold gold-text">{t('hero.title')}</span>
            </div>
            <p className="text-neutral-400 max-w-md leading-relaxed mb-6">
              {t('footer.desc')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-neutral-900 rounded-full hover:bg-gold-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-neutral-900 rounded-full hover:bg-gold-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-neutral-900 rounded-full hover:bg-gold-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 gold-text">{t('footer.quick_links')}</h3>
            <ul className="space-y-4 text-neutral-400">
              <li><a href="/" className="hover:text-gold-400 transition-colors">{t('nav.home')}</a></li>
              <li><a href="/#services" className="hover:text-gold-400 transition-colors">{t('nav.services')}</a></li>
              <li><a href="/appointment" className="hover:text-gold-400 transition-colors">{t('nav.appointment')}</a></li>
              <li><a href="/login" className="hover:text-gold-400 transition-colors">{t('nav.login')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 gold-text">{t('footer.contact')}</h3>
            <ul className="space-y-4 text-neutral-400">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gold-500 mt-1 shrink-0" />
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold-500 shrink-0" />
                <span>contact@lawofnexus.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {t('hero.title')}. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
