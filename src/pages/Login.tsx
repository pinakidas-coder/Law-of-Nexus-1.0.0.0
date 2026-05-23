import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Scale, Mail, Lock, AlertCircle, ArrowRight, Chrome } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleQuickLogin = async (role: 'client' | 'admin') => {
    setError('');
    setLoading(true);
    const demoEmail = role === 'admin' ? 'admin@lawofnexus.com' : 'client@lawofnexus.com';
    const demoPassword = 'password123';
    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.message?.includes('credential') || err.message?.includes('user')) {
        // Automatically register the demo user if not existing
        try {
          const credential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          await setDoc(doc(db, 'users', credential.user.uid), {
            uid: credential.user.uid,
            name: role === 'admin' ? 'Advocate Debdip' : 'Demo Client',
            email: demoEmail,
            role: role,
            createdAt: new Date().toISOString(),
          });
          navigate(from, { replace: true });
        } catch (regErr: any) {
          setError(regErr.message);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t('auth.error_login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-neutral-200">
        <div className="text-center">
          <Scale className="mx-auto h-12 w-12 text-gold-600" />
          <h2 className="mt-6 text-3xl font-serif font-bold text-neutral-900">{t('auth.welcome_back')}</h2>
          <p className="mt-2 text-sm text-neutral-600">{t('auth.login_subtitle')}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex flex-col space-y-3 shadow-sm">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 whitespace-pre-line leading-relaxed">{error}</div>
              </div>
              {(error.includes('iframe') || error.includes('popup') || error.includes('সাময়িকভাবে')) && (
                <div className="mt-2 pt-3 border-t border-red-200/50">
                  <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2 text-center">
                    Quick Sandbox Bypass (আইফ্রেম এর জন্য ডেমো লগইন):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('client')}
                      disabled={loading}
                      className="py-2 px-3 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800 hover:border-gold-500 transition-all text-center flex flex-col items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      <span className="text-gold-700 font-bold">Demo Client</span>
                      <span className="text-[10px] text-neutral-500 font-normal">ক্লায়েন্ট এন্ট্রি</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin')}
                      disabled={loading}
                      className="py-2 px-3 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800 hover:border-gold-500 transition-all text-center flex flex-col items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      <span className="text-gold-700 font-bold">Demo Attorney</span>
                      <span className="text-[10px] text-neutral-500 font-normal">আইনজীবী এন্ট্রি</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-neutral-950 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {t('auth.sign_in')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>




        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-neutral-600">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="font-bold text-gold-600 hover:text-gold-700">
              {t('auth.register_now')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
