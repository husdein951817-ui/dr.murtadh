import React, { useRef } from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  Stethoscope, 
  Calendar, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Phone, 
  User, 
  FileText,
  QrCode,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Patient, ClinicSettings } from '../types';

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  settings: ClinicSettings;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  onClose,
  patient,
  settings,
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !patient) return null;

  const handlePrint = () => {
    window.print();
  };

  // Convert numbers to Arabic words for medical fees and Iraqi Dinars
  const amountToArabicWords = (num: number, curr: string): string => {
    const map: Record<number, string> = {
      10000: 'عشرة آلاف',
      15000: 'خمسة عشر ألف',
      20000: 'عشرون ألف',
      25000: 'خمسة وعشرون ألف',
      30000: 'ثلاثون ألف',
      35000: 'خمسة وثلاثون ألف',
      40000: 'أربعون ألف',
      50000: 'خمسون ألف',
      60000: 'ستون ألف',
      75000: 'خمسة وسبعون ألف',
      100000: 'مائة ألف',
      50: 'خمسون',
      100: 'مائة',
      150: 'مائة وخمسون',
      200: 'مائتان',
      250: 'مائتان وخمسون',
      300: 'ثلاثمائة',
      350: 'ثلاثمائة وخمسون',
    };
    const words = map[num] || `${num.toLocaleString('ar-IQ')}`;
    const currencyName = curr === 'د.ع' ? 'دينار عراقي' : curr;
    return `${words} ${currencyName} فقط لا غير`;
  };

  const paymentLabels: Record<string, string> = {
    card: 'بطاقة مدى / شبكة إلكترونية',
    cash: 'دفع نقدي (كاش)',
    transfer: 'تحويل بنكي مباشر',
  };

  const formattedDate = new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'full',
  }).format(new Date(patient.visitDate));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (Hidden during print) */}
        <div className="no-print px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              طباعة إيصال سداد وفاتورة المريض
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          <div 
            id="printable-receipt"
            ref={printContentRef}
            className="mx-auto bg-white text-black p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm font-sans"
            style={{ minHeight: '480px' }}
          >
            {/* Header: Clinic Logo & Title */}
            <div className="text-center pb-5 border-b-2 border-dashed border-slate-300">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 border border-blue-200">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 mb-1">
                {settings.clinicName}
              </h1>
              <p className="text-xs text-slate-600 font-medium mb-1">
                {settings.clinicSpecialty}
              </p>
              <p className="text-[11px] text-slate-500">
                الهاتف: {settings.clinicPhone} · {settings.clinicAddress}
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-800">
                سند قبض وإيصال زيارة طبية
              </div>
            </div>

            {/* Receipt Meta & Patient Information */}
            <div className="py-4 border-b border-dashed border-slate-300 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">رقم الإيصال / الملف:</span>
                <span className="font-mono font-bold text-slate-900">{patient.code}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">تاريخ وساعة الزيارة:</span>
                <span className="font-semibold text-slate-800">{patient.visitDate} ({patient.visitTime})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">اسم المريض:</span>
                <span className="font-bold text-sm text-slate-900">{patient.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">العمر والجنس:</span>
                <span className="font-semibold text-slate-800">
                  {patient.age && patient.age > 0 ? `${patient.age} سنة` : 'غير محدد'} · {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">رقم الهاتف:</span>
                <span className="font-mono font-semibold text-slate-800" dir="ltr">{patient.phone || 'غير مسجل'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">طبيب الكشف:</span>
                <span className="font-semibold text-slate-800">{patient.doctorName || settings.doctorName}</span>
              </div>
            </div>

            {/* Medical Reason / Complaint */}
            <div className="py-3 border-b border-dashed border-slate-300 text-xs">
              <span className="text-slate-500 block mb-1 font-medium">الشكوى / سبب الزيارة:</span>
              <p className="bg-slate-50 p-2.5 rounded-lg text-slate-800 font-medium border border-slate-100">
                {patient.complaint}
              </p>
            </div>

            {/* Financial Summary */}
            <div className="py-4 border-b-2 border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">رسوم الكشف والخدمة:</span>
                <span className="font-semibold">{patient.totalAmount} {settings.currency}</span>
              </div>
              {patient.discount && patient.discount > 0 ? (
                <div className="flex justify-between items-center text-xs text-rose-600">
                  <span>الخصم الممنوح:</span>
                  <span>- {patient.discount} {settings.currency}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">طريقة الدفع:</span>
                <span className="font-semibold text-slate-800">{paymentLabels[patient.paymentMethod]}</span>
              </div>
              <div className="pt-2 flex justify-between items-center text-base font-extrabold text-slate-900 border-t border-slate-200">
                <span>المبلغ المدفوع الصافي:</span>
                <span className="text-lg text-blue-700 font-mono">
                  {patient.paidAmount} {settings.currency}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 text-center font-medium bg-slate-50 py-1 rounded">
                المبلغ كتابة: {amountToArabicWords(patient.paidAmount, settings.currency)}
              </div>
            </div>

            {/* Follow-up Note if exists */}
            {patient.followUpDate && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>موعد المراجعة القادمة:</span>
                </div>
                <p className="font-medium pr-5">
                  يوم: {patient.followUpDate} (يرجى إبراز هذا الإيصال عند الحضور)
                </p>
              </div>
            )}

            {/* Footer with Secretary Name, Verification QR & Stamp */}
            <div className="mt-6 pt-3 flex items-center justify-between text-[11px] text-slate-500">
              <div className="space-y-1">
                <p>
                  السكرتير المستلم: <span className="font-bold text-slate-800">{settings.secretaryName}</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  طُبعت بتاريخ: {new Date().toLocaleTimeString('ar-SA')}
                </p>
                <p className="text-[10px] text-slate-400">نتمنى لكم دوام الصحة والعافية</p>
              </div>

              {/* QR Code Graphic simulation */}
              <div className="text-center">
                <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center p-1">
                  <QrCode className="w-full h-full text-slate-800" />
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">التحقق الرقمي</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Actions (Hidden during print) */}
        <div className="no-print px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors"
          >
            إغلاق
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الإيصال الآن</span>
          </button>
        </div>

      </div>
    </div>
  );
};
