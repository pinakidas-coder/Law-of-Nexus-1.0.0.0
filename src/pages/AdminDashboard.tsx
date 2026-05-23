import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, addDoc, getDocs, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { Appointment, Case, UserProfile } from '../types';
import { Calendar, Clock, Briefcase, Users, CheckCircle, XCircle, Plus, Search, Filter, MoreVertical, FileText, X, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import CaseDetails from '../components/CaseDetails';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AdminCalendar from '../components/AdminCalendar';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'calendar' | 'cases' | 'clients' | 'documents' | 'analytics'>('calendar');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // New Case Form State
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({
    caseId: '',
    clientId: '',
    details: '',
    status: 'active' as 'active' | 'closed' | 'pending',
  });

  useEffect(() => {
    const unsubscribeApp = onSnapshot(
      query(collection(db, 'appointments'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      },
      (error) => {
        console.error("Admin appointments snapshot error:", error);
      }
    );

    const unsubscribeCase = onSnapshot(
      query(collection(db, 'cases'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const casesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Case));
        setCases(casesData);
        
        // Sync selectedCase if it exists
        if (selectedCase) {
          const updatedCase = casesData.find(c => c.id === selectedCase.id);
          if (updatedCase) {
            setSelectedCase(updatedCase);
          }
        }
      },
      (error) => {
        console.error("Admin cases snapshot error:", error);
      }
    );

    const unsubscribeClients = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'client')),
      (snapshot) => {
        setClients(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
        setLoading(false);
      },
      (error) => {
        console.error("Admin clients snapshot error:", error);
        setLoading(false);
      }
    );

    const unsubscribeDocs = onSnapshot(
      query(collection(db, 'client_documents'), orderBy('uploadedAt', 'desc')),
      (snapshot) => {
        setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error("Admin documents snapshot error:", error);
      }
    );

    return () => {
      unsubscribeApp();
      unsubscribeCase();
      unsubscribeClients();
      unsubscribeDocs();
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'appointments', id), { status });
  };

  const downloadBase64File = (base64Data: string, fileName: string) => {
    try {
      if (!base64Data.startsWith('data:')) {
        // Fallback to direct link if it's not base64 (e.g. Firebase storage URL)
        window.open(base64Data, '_blank');
        return;
      }
      const arr = base64Data.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch(e) {
      console.error("Download failed", e);
      window.open(base64Data, '_blank');
    }
  };

  const handleAddCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.uid === newCase.clientId);
    await addDoc(collection(db, 'cases'), {
      ...newCase,
      clientName: client?.name || 'Unknown',
      createdAt: new Date().toISOString(),
    });
    setShowCaseModal(false);
    setNewCase({ caseId: '', clientId: '', details: '', status: 'active' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-serif font-bold text-neutral-900">{t('admin.title')}</h1>
            <p className="text-neutral-600">{t('admin.subtitle')}</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <button 
              onClick={() => setShowCaseModal(true)}
              className="btn-gold flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>{t('admin.add_case')}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gold-100 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-gold-600" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
            </div>
            <h3 className="text-neutral-500 text-sm font-medium uppercase tracking-wider">{t('admin.total_appointments')}</h3>
            <p className="text-3xl font-bold text-neutral-900">{appointments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{t('case.active')}</span>
            </div>
            <h3 className="text-neutral-500 text-sm font-medium uppercase tracking-wider">{t('admin.active_cases')}</h3>
            <p className="text-3xl font-bold text-neutral-900">{cases.filter(c => c.status === 'active').length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">{t('nav.clients')}</span>
            </div>
            <h3 className="text-neutral-500 text-sm font-medium uppercase tracking-wider">{t('admin.total_clients')}</h3>
            <p className="text-3xl font-bold text-neutral-900">{clients.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="flex border-b border-neutral-100 overflow-x-auto">
            {(['appointments', 'calendar', 'cases', 'clients', 'documents', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'border-b-2 border-gold-600 text-gold-600 bg-gold-50/30' 
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {t(`nav.${tab === 'appointments' ? 'appointment' : tab}`)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'calendar' && (
              <AdminCalendar 
                appointments={appointments} 
                onUpdateAppointmentStatus={handleUpdateStatus} 
                onUpdateAppointmentDetail={async (id, data) => {
                  try {
                    await updateDoc(doc(db, 'appointments', id), data);
                  } catch(e) {
                    console.error("Failed to update appointment", e);
                  }
                }}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard 
                appointments={appointments} 
                cases={cases} 
                clients={clients} 
              />
            )}
            {activeTab === 'appointments' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100">
                      <th className="pb-4 px-4">{t('admin.table_client')}</th>
                      <th className="pb-4 px-4">{t('admin.table_type')}</th>
                      <th className="pb-4 px-4">{t('admin.table_date')}</th>
                      <th className="pb-4 px-4">{t('admin.table_status')}</th>
                      <th className="pb-4 px-4">{t('admin.table_actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {appointments.map((app) => (
                      <tr key={app.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-neutral-900">{app.name}</div>
                          <div className="text-xs text-neutral-500">{app.phone}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-medium px-2 py-1 bg-neutral-100 rounded-md">{t(`services.${app.caseType.toLowerCase()}`)}</span>
                        </td>
                        <td className="py-4 px-4 text-sm text-neutral-600">
                          <div>{app.date}</div>
                          <div className="text-xs">{app.time}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            app.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gold-100 text-gold-700'
                          }`}>
                            {t(`status.${app.status}`)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            {app.documentUrl && (
                              <button 
                                onClick={() => downloadBase64File(app.documentUrl!, 'appointment_doc.pdf')}
                                className="p-1 hover:bg-blue-100 rounded text-blue-600" title="Download Document"
                              >
                                <FileText className="h-5 w-5" />
                              </button>
                            )}
                            <button 
                                onClick={() => handleUpdateStatus(app.id!, 'approved')}
                                className="p-1 hover:bg-green-100 rounded text-green-600" title={t('admin.approve')}
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(app.id!, 'rejected')}
                                className="p-1 hover:bg-red-100 rounded text-red-600" title={t('admin.reject')}
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'cases' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedCase(c)}
                    className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-gold-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">#{c.caseId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-700'}`}>
                        {t(`case.${c.status}`)}
                      </span>
                    </div>
                    <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-gold-700 transition-colors">{c.clientName}</h3>
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{c.details}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <span className="text-[10px] text-neutral-400 uppercase">{format(new Date(c.createdAt), 'MMM dd, yyyy')}</span>
                      <button className="text-gold-600 hover:text-gold-700 text-xs font-bold uppercase tracking-widest">{t('dashboard.view_details')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <div key={client.uid} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                      <Users className="h-6 w-6 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">{client.name}</h3>
                      <p className="text-xs text-neutral-500">{client.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 line-clamp-1" title={doc.fileName}>{doc.fileName}</h3>
                          <p className="text-xs text-neutral-500">{doc.userName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-auto">
                      <span className="text-[10px] text-neutral-400 uppercase">{format(new Date(doc.uploadedAt), 'MMM dd, yyyy HH:mm')}</span>
                      <button onClick={() => downloadBase64File(doc.fileUrl, doc.fileName)} className="text-gold-600 hover:text-gold-700 text-xs font-bold uppercase tracking-widest bg-gold-50 px-3 py-1 rounded-md cursor-pointer">Download File</button>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="col-span-full py-12 text-center text-neutral-500">
                    No documents uploaded yet.
                  </div>
                )}
              </div>
            )}
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

      {/* Add Case Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="legal-gradient p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold">{t('admin.add_case')}</h2>
              <button onClick={() => setShowCaseModal(false)}><XCircle className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleAddCase} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">{t('dashboard.case_id')}</label>
                <input
                  type="text"
                  required
                  value={newCase.caseId}
                  onChange={(e) => setNewCase({ ...newCase, caseId: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                  placeholder="e.g. HC/2024/102"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">{t('admin.choose_client')}</label>
                <select
                  required
                  value={newCase.clientId}
                  onChange={(e) => setNewCase({ ...newCase, clientId: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 bg-white"
                >
                  <option value="">{t('admin.choose_client')}</option>
                  {clients.map(c => <option key={c.uid} value={c.uid}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">{t('admin.case_details')}</label>
                <textarea
                  required
                  value={newCase.details}
                  onChange={(e) => setNewCase({ ...newCase, details: e.target.value })}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-gold-500 h-32"
                  placeholder={t('admin.case_placeholder')}
                />
              </div>
              <button type="submit" className="w-full btn-gold py-3 font-bold">{t('admin.create_case')}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
