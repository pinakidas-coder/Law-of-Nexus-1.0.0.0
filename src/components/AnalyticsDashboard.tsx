import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { Appointment, Case, UserProfile } from '../types';
import { format, parseISO, startOfMonth } from 'date-fns';

interface AnalyticsDashboardProps {
  appointments: Appointment[];
  cases: Case[];
  clients: UserProfile[];
}

const COLORS = ['#d4af37', '#171717', '#737373', '#a3a3a3'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ appointments, cases, clients }) => {
  const { t } = useTranslation();

  const monthlyAppointmentsData = useMemo(() => {
    const months: Record<string, number> = {};
    appointments.forEach(app => {
      const month = format(parseISO(app.createdAt), 'MMM yyyy');
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).map(([name, count]) => ({ name, count })).slice(-6);
  }, [appointments]);

  const caseResolutionData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    cases.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name: t(`case.${name}`), value }));
  }, [cases, t]);

  const clientAcquisitionData = useMemo(() => {
    const months: Record<string, number> = {};
    clients.forEach(client => {
      if (client.createdAt) {
        const month = format(parseISO(client.createdAt), 'MMM yyyy');
        months[month] = (months[month] || 0) + 1;
      }
    });
    return Object.entries(months).map(([name, count]) => ({ name, count })).slice(-6);
  }, [clients]);

  return (
    <div className="space-y-8 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Appointments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <h3 className="text-lg font-serif font-bold text-neutral-900 mb-6">{t('admin.monthly_appointments')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAppointmentsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Resolution Rates */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <h3 className="text-lg font-serif font-bold text-neutral-900 mb-6">{t('admin.case_resolution')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caseResolutionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {caseResolutionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Acquisition Trends */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 lg:col-span-2">
          <h3 className="text-lg font-serif font-bold text-neutral-900 mb-6">{t('admin.client_acquisition')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientAcquisitionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#d4af37" strokeWidth={3} dot={{ r: 6, fill: '#d4af37' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
