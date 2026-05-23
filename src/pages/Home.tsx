import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, ShieldCheck, Gavel, FileText, ArrowRight, MessageCircle } from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useTranslation();

  const services = [
    {
      title: t('services.civil'),
      icon: <ShieldCheck className="h-10 w-10 text-gold-500" />,
      desc: t('services.civil_desc'),
    },
    {
      title: t('services.criminal'),
      icon: <Gavel className="h-10 w-10 text-gold-500" />,
      desc: t('services.criminal_desc'),
    },
    {
      title: t('services.tax'),
      icon: <FileText className="h-10 w-10 text-gold-500" />,
      desc: t('services.tax_desc'),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-neutral-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000" 
            alt="Legal Background" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-600/10 border border-gold-600/30 text-gold-400 text-xs font-bold tracking-widest uppercase mb-6">
              <Scale className="h-4 w-4" />
              <span>{t('hero.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-neutral-300 mb-10 font-light italic">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/appointment" className="btn-gold text-lg py-4 px-10 flex items-center justify-center">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a 
                href="#services" 
                className="btn-outline-gold text-lg py-4 px-10 flex items-center justify-center"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {t('nav.services')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-neutral-900">{t('services.title')}</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="p-8 bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-6">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-neutral-900">{service.title}</h3>
                <p className="text-neutral-600 leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-neutral-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold-600/5 -skew-x-12 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8 gold-text">{t('about.title')}</h2>
              <p className="text-neutral-300 text-lg mb-6 leading-relaxed">
                {t('about.p1')}
              </p>
              <p className="text-neutral-300 text-lg mb-8 leading-relaxed">
                {t('about.p2')}
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold gold-text mb-2">{t('about.exp_num')}</div>
                  <div className="text-neutral-400 uppercase tracking-widest text-xs">{t('about.exp')}</div>
                </div>
                <div>
                  <div className="text-4xl font-bold gold-text mb-2">{t('about.cases_num')}</div>
                  <div className="text-neutral-400 uppercase tracking-widest text-xs">{t('about.cases')}</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border-2 border-gold-500/30">
                <img 
                  src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1000" 
                  alt="Advocate Portrait" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gold-600 p-8 rounded-xl shadow-2xl hidden md:block">
                <p className="text-white font-serif italic text-xl">{t('about.quote')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
