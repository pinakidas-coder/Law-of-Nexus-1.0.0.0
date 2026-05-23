import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTranslation } from 'react-i18next';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, Case } from '../types';
import { Calendar, Clock, Briefcase, FileText, CheckCircle, Clock4, XCircle, Upload, User, MessageCircle, ArrowRight, Phone, Mail, X } from 'lucide-react';
import { format } from 'date-fns';
import CaseDetails from '../components/CaseDetails';

const ClientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      if (file.size > 512000) {
        throw new Error('File size should not exceed 500KB');
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileDataUrl = e.target?.result as string;

          await addDoc(collection(db, 'client_documents'), {
            userId: user.uid,
            userName: profile?.name || user.email || 'Unknown Client',
            fileName: file.name,
            fileUrl: fileDataUrl,
            uploadedAt: new Date().toISOString(),
            caseId: '', // Can be linked later
          });

          setIsUploading(false);
          setUploadSuccess(true);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          setTimeout(() => {
            setUploadSuccess(false);
          }, 3000);
        } catch (err: any) {
          console.error("Upload to DB failed", err);
          alert("Upload failed: " + (err.message || String(err)));
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        throw new Error('Could not read file');
      };
      
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Upload failed", err);
      alert("Upload failed: " + (err.message || String(err)));
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const qApp = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeApp = onSnapshot(
      qApp, 
      (snapshot) => {
        const appData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        setAppointments(appData);
      },
      (error) => {
        console.error("Client appointments snapshot error:", error);
      }
    );

    const qCase = query(
      collection(db, 'cases'),
      where('clientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeCase = onSnapshot(
      qCase, 
      (snapshot) => {
        const caseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Case));
        setCases(caseData);
        
        // Sync selectedCase if it exists
        if (selectedCase) {
          const updatedCase = caseData.find(c => c.id === selectedCase.id);
          if (updatedCase) {
            setSelectedCase(updatedCase);
          }
        }
        
        setLoading(false);
      },
      (error) => {
        console.error("Client cases snapshot error:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeApp();
      unsubscribeCase();
    };
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default: return <Clock4 className="h-5 w-5 text-gold-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold text-neutral-900">{t('dashboard.welcome')}, {profile?.name}</h1>
            <p className="text-neutral-600">{t('dashboard.client_subtitle')}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
            <div className="bg-gold-100 p-2 rounded-full">
              <User className="h-6 w-6 text-gold-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">{profile?.email}</p>
              <p className="text-xs text-neutral-500 uppercase tracking-widest">{t('dashboard.client_account')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Appointments Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gold-600" />
                  <span>{t('dashboard.my_appointments')}</span>
                </h2>
              </div>
              <div className="p-6">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
                    <p className="text-neutral-500">{t('dashboard.no_appointments')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-gold-300 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <Briefcase className="h-6 w-6 text-gold-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-neutral-900">{t(`services.${app.caseType.toLowerCase()}`)} {t('dashboard.consultation')}</h3>
                            <div className="flex items-center space-x-3 text-sm text-neutral-500 mt-1">
                              <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {app.date}</span>
                              <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {app.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`flex items-center space-x-1 text-sm font-medium capitalize`}>
                            {getStatusIcon(app.status)}
                            <span>{t(`status.${app.status}`)}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cases Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-6 border-b border-neutral-100">
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gold-600" />
                  <span>{t('dashboard.my_cases')}</span>
                </h2>
              </div>
              <div className="p-6">
                {cases.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
                    <p className="text-neutral-500">{t('dashboard.no_cases')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cases.map((c) => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedCase(c)}
                        className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-gold-400 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">{t('dashboard.case_id')}: {c.caseId}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-700'}`}>
                            {t(`case.${c.status}`)}
                          </span>
                        </div>
                        <h3 className="font-bold text-neutral-900 mb-2 truncate group-hover:text-gold-700 transition-colors">{c.details}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-neutral-500">{t('dashboard.assigned_on')}: {format(new Date(c.createdAt), 'MMM dd, yyyy')}</p>
                          <span className="text-[10px] font-bold text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase">{t('dashboard.view_details')} →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Actions */}
          <div className="space-y-8">
            <div className="bg-neutral-950 text-white p-8 rounded-2xl shadow-xl border border-gold-900/30">
              <h3 className="text-xl font-serif font-bold mb-6 gold-text">{t('dashboard.quick_actions')}</h3>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <button 
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="w-full flex items-center justify-between p-4 bg-neutral-900 rounded-xl border border-neutral-800 hover:border-gold-600 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <Upload className={`h-5 w-5 text-gold-500 ${isUploading ? 'animate-bounce' : ''}`} />
                      <span className="font-medium">
                        {isUploading ? t('dashboard.uploading') : t('dashboard.upload')}
                      </span>
                    </div>
                    {uploadSuccess ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-neutral-700 group-hover:text-gold-500" />
                    )}
                  </button>
                  {uploadSuccess && (
                     <div className="absolute -bottom-8 left-0 right-0 text-center text-xs text-green-400 animate-fade-in font-medium">
                       {t('dashboard.upload_success')}
                     </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold mb-4 text-neutral-900">{t('dashboard.need_help')}</h3>
              <p className="text-neutral-600 text-sm mb-6">
                {t('dashboard.help_desc')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-neutral-700">
                  <Phone className="h-4 w-4 text-gold-600" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-neutral-700">
                  <Mail className="h-4 w-4 text-gold-600" />
                  <span>support@lawofnexus.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <CaseDetails 
              caseData={selectedCase} 
              onClose={() => setSelectedCase(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
