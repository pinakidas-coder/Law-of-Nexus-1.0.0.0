import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Case, CaseHistory } from '../types';
import { FileText, Calendar, User, Info, CheckCircle, Clock, AlertCircle, X, Save, RefreshCw, History } from 'lucide-react';
import { format } from 'date-fns';
import { doc, updateDoc, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface CaseDetailsProps {
  caseData: Case;
  onClose?: () => void;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ caseData, onClose }) => {
  const { t } = useTranslation();
  const { isAdmin, user } = useAuth();
  const [newStatus, setNewStatus] = useState(caseData.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [history, setHistory] = useState<CaseHistory[]>([]);

  useEffect(() => {
    setNewStatus(caseData.status);
  }, [caseData.status]);

  useEffect(() => {
    if (!caseData.id) return;

    const q = query(
      collection(db, 'cases', caseData.id, 'caseHistory'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CaseHistory)));
      },
      (error) => {
        console.error("CaseHistory snapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, [caseData.id]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      case 'pending':
        return 'bg-gold-100 text-gold-700 border-gold-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5" />;
      case 'closed':
        return <X className="h-5 w-5" />;
      case 'pending':
        return <Clock className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const handleStatusUpdate = async () => {
    if (!caseData.id || !user) return;
    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      const oldStatus = caseData.status;
      
      // Update the case document
      await updateDoc(doc(db, 'cases', caseData.id), {
        status: newStatus
      });

      // Add to history subcollection
      await addDoc(collection(db, 'cases', caseData.id, 'caseHistory'), {
        oldStatus,
        newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email || user.uid
      });

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating case status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 max-w-2xl w-full mx-auto">
      {/* Header */}
      <div className="legal-gradient p-6 text-white flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-gold-500" />
          <h2 className="text-xl font-serif font-bold tracking-wide">{t('case.file')}: {caseData.caseId}</h2>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Status and Date */}
        <div className="flex flex-wrap gap-4 items-center justify-between pb-6 border-b border-neutral-100">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t('case.status')}</label>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border font-bold text-sm uppercase tracking-widest ${getStatusStyles(caseData.status)}`}>
              {getStatusIcon(caseData.status)}
              <span>{t(`case.${caseData.status}`)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-neutral-500">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{t('case.opened_on')} {format(new Date(caseData.createdAt), 'MMMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Admin Status Update Section */}
        {isAdmin && (
          <div className="bg-gold-50 p-6 rounded-xl border border-gold-200 space-y-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-gold-600" />
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">{t('case.update_status')}</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
              <div className="flex-grow grid grid-cols-3 gap-2 w-full">
                {(['active', 'pending', 'closed'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setNewStatus(status)}
                    className={`px-3 py-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      newStatus === status
                        ? 'bg-gold-600 text-white border-gold-600 shadow-lg scale-105'
                        : 'bg-white text-neutral-400 border-neutral-200 hover:border-gold-300'
                    }`}
                  >
                    {t(`case.${status}`)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || newStatus === caseData.status}
                className="btn-gold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-8 w-full sm:w-auto"
              >
                {isUpdating ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{t('case.save')}</span>
                  </>
                )}
              </button>
            </div>
            {updateSuccess && (
              <p className="text-xs text-green-600 font-bold flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('case.success')}
              </p>
            )}
          </div>
        )}

        {/* Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{t('case.client_name')}</span>
            </label>
            <p className="text-lg font-bold text-neutral-900">{caseData.clientName}</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center space-x-1">
              <Info className="h-3 w-3" />
              <span>{t('case.ref_id')}</span>
            </label>
            <p className="text-lg font-mono text-gold-700">{caseData.caseId}</p>
          </div>
        </div>

        {/* Case Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>{t('case.description')}</span>
            </label>
          </div>
          <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100 leading-relaxed text-neutral-700 whitespace-pre-wrap">
            {caseData.details}
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center space-x-1">
            <History className="h-3 w-3" />
            <span>{t('case.history')}</span>
          </label>
          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-xs">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-gold-500"></div>
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-neutral-900">
                        {t(`case.${item.oldStatus}`)} → {t(`case.${item.newStatus}`)}
                      </span>
                      <span className="text-neutral-400">{format(new Date(item.updatedAt), 'MMM dd, HH:mm')}</span>
                    </div>
                    <p className="text-neutral-500">{t('case.updated_by')}: {item.updatedBy}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-400 italic">{t('case.no_history')}</p>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-6 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400 italic">
          <span>{t('case.footer')}</span>
          <span>{t('case.last_updated')}: {format(new Date(caseData.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
