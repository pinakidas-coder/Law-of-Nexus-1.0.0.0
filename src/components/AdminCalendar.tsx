import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Scale, Calendar as CalendarIcon, Clock, User, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { Appointment } from '../types';

interface AdminCalendarProps {
  appointments: Appointment[];
  onUpdateAppointmentStatus?: (id: string, status: string) => void;
  onUpdateAppointmentDetail?: (id: string, data: Partial<Appointment>) => void;
}

// Mock Holidays Data
const initialHolidays = [
  { id: '1', date: '2026-01-01', name: 'New Year', type: 'national' },
  { id: '2', date: '2026-01-26', name: 'Republic Day', type: 'national' },
  { id: '3', date: '2026-03-24', name: 'Holi', type: 'national' },
  { id: '4', date: '2026-05-01', name: 'May Day', type: 'national' },
  { id: '5', date: '2026-08-15', name: 'Independence Day', type: 'national' },
  { id: '6', date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national' },
  { id: '7', date: '2026-10-21', name: 'Durga Puja', type: 'national' },
  { id: '8', date: '2026-10-22', name: 'Dussehra', type: 'national' },
  { id: '9', date: '2026-11-10', name: 'Diwali', type: 'national' },
  { id: '10', date: '2026-12-25', name: 'Christmas', type: 'national' },
  
  // High Court specifics
  { id: '11', date: '2026-05-18', name: 'Summer Vacation Starts', type: 'court' },
  { id: '12', date: '2026-06-05', name: 'Summer Vacation Ends', type: 'court' },
  { id: '13', date: '2026-10-18', name: 'Puja Vacation Starts', type: 'court' },
  { id: '14', date: '2026-10-31', name: 'Puja Vacation Ends', type: 'court' },
];

const AdminCalendar: React.FC<AdminCalendarProps> = ({ appointments, onUpdateAppointmentStatus, onUpdateAppointmentDetail }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [holidays, setHolidays] = useState(initialHolidays);

  const [editingAppt, setEditingAppt] = useState<any>(null);
  const [editApptData, setEditApptData] = useState({ date: '', time: '', caseType: '', status: '' });

  const handleSaveAppointment = () => {
    if (editingAppt && onUpdateAppointmentDetail) {
      onUpdateAppointmentDetail(editingAppt.id, editApptData as Partial<Appointment>);
      setEditingAppt(null);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add empty days for the start of the month to align correctly with days of week
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getDayInfo = (date: Date) => {
    const formattedDateString = format(date, 'yyyy-MM-dd');
    const dayHolidays = holidays.filter(h => h.date === formattedDateString);
    const dayAppointments = appointments.filter(a => {
        try {
            return format(parseISO(a.date), 'yyyy-MM-dd') === formattedDateString;
        } catch(e) {
            return a.date === formattedDateString;
        }
    });
    
    return { dayHolidays, dayAppointments };
  };

  const selectedDayInfo = getDayInfo(selectedDate);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar View */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2 text-gold-600" />
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button onClick={prevMonth} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-neutral-100 rounded-md transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-neutral-400 uppercase py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map(_ => (
            <div key={`empty-${_}`} className="p-2 h-24 bg-neutral-50/50 rounded-lg"></div>
          ))}
          
          {daysInMonth.map((day, idx) => {
            const { dayHolidays, dayAppointments } = getDayInfo(day);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDate(day)}
                className={`p-2 h-24 rounded-lg flex flex-col border transition-all cursor-pointer ${
                  isSelected ? 'border-gold-500 ring-1 ring-gold-500 bg-gold-50/10' : 
                  isTodayDate ? 'border-blue-200 bg-blue-50/30' : 
                  'border-neutral-100 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className={`text-right text-sm font-medium mb-1 ${
                    isTodayDate ? 'text-blue-600 font-bold' : 
                    isSelected ? 'text-gold-700 font-bold' : 'text-neutral-700'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 hide-scrollbar">
                  {dayHolidays.map((holiday, i) => (
                    <div key={`hol-${i}`} className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                      holiday.type === 'court' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {holiday.name}
                    </div>
                  ))}
                  
                  {dayAppointments.length > 0 && (
                    <div className="text-[10px] truncate px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700">
                      {dayAppointments.length} Appt{dayAppointments.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200"></span>
                <span className="text-neutral-500">National Holiday</span>
            </div>
            <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-purple-100 border border-purple-200"></span>
                <span className="text-neutral-500">Court Holiday</span>
            </div>
            <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-200"></span>
                <span className="text-neutral-500">Appointments</span>
            </div>
        </div>
      </div>

      {/* Day Details View */}
      <div className="w-full lg:w-96 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col">
        <h3 className="text-lg font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-4">
          {format(selectedDate, 'EEEE, MMMM do yyyy')}
        </h3>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Holidays for Selected Date */}
          {selectedDayInfo.dayHolidays.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Holidays</h4>
              <div className="space-y-3">
                {selectedDayInfo.dayHolidays.map((holiday, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${
                    holiday.type === 'court' ? 'bg-purple-50/50 border-purple-100' : 'bg-red-50/50 border-red-100'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${holiday.type === 'court' ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                        {holiday.type === 'court' ? <Scale className="h-5 w-5" /> : <CalendarIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <h5 className="font-bold text-neutral-900">{holiday.name}</h5>
                        <p className={`text-xs mt-1 ${holiday.type === 'court' ? 'text-purple-600' : 'text-red-600'}`}>
                          {holiday.type === 'court' ? 'Kolkata High Court Holiday' : 'Indian National Holiday'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments for Selected Date */}
          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
              Appointments ({selectedDayInfo.dayAppointments.length})
            </h4>
            
            {selectedDayInfo.dayAppointments.length === 0 ? (
              <p className="text-sm text-neutral-500 italic py-4 text-center border-2 border-dashed border-neutral-100 rounded-xl">
                No appointments for this date.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDayInfo.dayAppointments.map(app => (
                  <div key={app.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 relative group">
                    {editingAppt?.id === app.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="date" value={editApptData.date} onChange={e => setEditApptData({...editApptData, date: e.target.value})} className="text-sm p-1.5 border rounded" />
                          <input type="time" value={editApptData.time} onChange={e => setEditApptData({...editApptData, time: e.target.value})} className="text-sm p-1.5 border rounded" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={editApptData.caseType} onChange={e => setEditApptData({...editApptData, caseType: e.target.value})} className="text-sm p-1.5 border rounded" placeholder="Case Type" />
                          <select value={editApptData.status} onChange={e => setEditApptData({...editApptData, status: e.target.value})} className="text-sm p-1.5 border rounded">
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div className="flex space-x-2 pt-2">
                           <button onClick={handleSaveAppointment} className="px-3 py-1 bg-gold-600 text-white rounded text-sm font-bold flex-1">Save Option</button>
                           <button onClick={() => setEditingAppt(null)} className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded text-sm font-bold flex-1">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2 pr-12">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-neutral-500" />
                            <h5 className="font-bold text-neutral-900">{app.name}</h5>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              app.status === 'approved' ? 'bg-green-100 text-green-700' : 
                              app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gold-100 text-gold-700'
                            }`}>
                              {app.status}
                            </span>
                            {onUpdateAppointmentStatus && (
                              <div className="flex space-x-1 ml-2 border-l pl-2 border-neutral-200">
                                <button 
                                  onClick={() => onUpdateAppointmentStatus(app.id!, 'approved')}
                                  className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors" title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => onUpdateAppointmentStatus(app.id!, 'rejected')}
                                  className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors" title="Reject"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="flex items-center space-x-1.5 text-xs text-neutral-600">
                            <Clock className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{app.time}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 text-xs text-neutral-600">
                            <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                            <span>{app.caseType}</span>
                            </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;
