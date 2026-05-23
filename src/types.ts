export type UserRole = 'admin' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Appointment {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  caseType: 'Civil' | 'Criminal' | 'Tax';
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentStatus: 'pending' | 'paid';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  documentUrl?: string;
}

export interface Case {
  id?: string;
  caseId: string;
  clientId: string;
  clientName: string;
  details: string;
  status: 'active' | 'closed' | 'pending';
  createdAt: string;
}

export interface CaseHistory {
  id?: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Payment {
  id?: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  appointmentId: string;
  razorpayOrderId: string;
  createdAt: string;
}
