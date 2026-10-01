export type PatientStatus = 'waiting' | 'in_consultation' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type RoleType = 'head_secretary' | 'receptionist' | 'doctor' | 'admin';

export interface Patient {
  id: string;
  code: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  complaint: string;
  paidAmount: number;
  totalAmount: number;
  discount?: number;
  paymentMethod: PaymentMethod;
  status: PatientStatus;
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // HH:mm
  doctorName: string;
  followUpDate: string | null; // YYYY-MM-DD or null
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicPermissions {
  canViewFinancials: boolean; // عرض تقارير الدخل والمبالغ
  canDeletePatients: boolean; // إمكانية حذف سجل مريض
  canExportReports: boolean; // تصدير البيانات والتقارير
  canEditSettings: boolean; // تعديل إعدادات العيادة
  canChangeFollowUp: boolean; // تعديل مواعيد المراجعة
}

export interface ClinicSettings {
  clinicName: string;
  clinicSpecialty: string;
  clinicPhone: string;
  clinicAddress: string;
  doctorName: string;
  secretaryName: string; // اسم السكرتير الظاهر أعلى القائمة
  secretaryRole: RoleType;
  secretaryAvatar: string;
  currency: string;
  defaultFee: number; // المبلغ الثابت الافتراضي للكشف (مثال: 25000 دينار عراقي)
  darkMode: boolean;
  permissions: ClinicPermissions;
  receiptTemplate: 'thermal' | 'a5';
  autoAlertDays: number; // أيام التنبيه قبل المراجعة
}

export interface SyncPayload {
  type: 'PATIENT_CREATED' | 'PATIENT_UPDATED' | 'PATIENT_DELETED' | 'SETTINGS_UPDATED' | 'FULL_SYNC';
  data: any;
  timestamp: number;
  sourceId: string;
}
