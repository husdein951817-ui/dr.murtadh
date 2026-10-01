import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Printer, 
  Clock, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Edit3, 
  Trash2, 
  MoreVertical,
  UserCheck,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Patient, PatientStatus, ClinicSettings } from '../types';

interface DailyReceptionViewProps {
  patients: Patient[];
  settings: ClinicSettings;
  onOpenNewPatientModal: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onPrintInvoice: (patient: Patient) => void;
  onUpdateStatus: (patientId: string, newStatus: PatientStatus) => void;
}

export const DailyReceptionView: React.FC<DailyReceptionViewProps> = ({
  patients,
  settings,
  onOpenNewPatientModal,
  onEditPatient,
  onDeletePatient,
  onPrintInvoice,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    // Date filter
    if (dateFilter === 'today' && patient.visitDate !== todayStr) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && patient.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = patient.name.toLowerCase().includes(q);
      const matchPhone = patient.phone.includes(q);
      const matchComplaint = patient.complaint.toLowerCase().includes(q);
      const matchCode = patient.code.toLowerCase().includes(q);
      return matchName || matchPhone || matchComplaint || matchCode;
    }
    return true;
  });

  // Calculate today's key stats
  const todayPatients = patients.filter((p) => p.visitDate === todayStr);
  const waitingCount = todayPatients.filter((p) => p.status === 'waiting').length;
  const inConsultCount = todayPatients.filter((p) => p.status === 'in_consultation').length;
  const completedCount = todayPatients.filter((p) => p.status === 'completed').length;
  const todayTotalIncome = todayPatients.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

  const statusConfig: Record<PatientStatus, { label: string; bg: string; text: string; dot: string }> = {
    waiting: {
      label: 'في الانتظار',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    in_consultation: {
      label: 'داخل الكشف',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500 animate-pulse',
    },
    completed: {
      label: 'تم الكشف',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      label: 'ملغى',
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      text: 'text-slate-500 dark:text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  const paymentLabels: Record<string, string> = {
    card: 'بطاقة',
    cash: 'كاش',
    transfer: 'تحويل',
  };

  const handleWhatsApp = (patient: Patient) => {
    const cleanPhone = patient.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('966') 
      ? cleanPhone 
      : cleanPhone.startsWith('0') 
        ? '966' + cleanPhone.substring(1) 
        : cleanPhone;

    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله، عزيزنا المريض ${patient.name}، نرحب بكم في ${settings.clinicName}. نتمنى لكم دوام الصحة والعافية.`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Section: Daily Metric iOS Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Today Patients */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm ios-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">مرضى اليوم</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {todayPatients.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">مريض</span>
          </div>
        </div>

        {/* Metric 2: Waiting */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm ios-card">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold">في الانتظار</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
              {waitingCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">حالة</span>
          </div>
        </div>

        {/* Metric 3: In Consultation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm ios-card">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-xs font-semibold">داخل الكشف</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
              {inConsultCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">مع الطبيب</span>
          </div>
        </div>

        {/* Metric 4: Completed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm ios-card">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold">تم الكشف</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">مكتمل</span>
          </div>
        </div>

        {/* Metric 5: Today's Income */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 ios-card">
          <div className="flex items-center justify-between text-blue-100 mb-2">
            <span className="text-xs font-semibold">دخل اليوم المحصل</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tabular-nums">
              {settings.permissions.canViewFinancials ? todayTotalIncome : '••••'}
            </span>
            <span className="text-xs text-blue-200 font-medium">
              {settings.currency}
            </span>
          </div>
        </div>

      </div>

      {/* Control Bar: Search, Status Filters, & Date Toggle */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* iOS Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم المريض، رقم الهاتف، الكود، أو الشكوى..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs absolute left-3.5 top-3"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Date Switch: Today vs All */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateFilter === 'today'
                  ? 'bg-white dark:bg-[#2C2C2E] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              زيارات اليوم ({todayPatients.length})
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                dateFilter === 'all'
                  ? 'bg-white dark:bg-[#2C2C2E] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              جميع الزيارات ({patients.length})
            </button>
          </div>

        </div>

        {/* Status Filter Tabs (Segmented Control) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-400 dark:text-slate-500 text-xs font-medium ml-2 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            تصفية الحالة:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            الكل ({patients.length})
          </button>
          <button
            onClick={() => setStatusFilter('waiting')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              statusFilter === 'waiting'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            الانتظار ({patients.filter((p) => p.status === 'waiting').length})
          </button>
          <button
            onClick={() => setStatusFilter('in_consultation')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              statusFilter === 'in_consultation'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            داخل الكشف ({patients.filter((p) => p.status === 'in_consultation').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            مكتمل ({patients.filter((p) => p.status === 'completed').length})
          </button>
        </div>

      </div>

      {/* Main List: Patients Cards / Rows */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <UserCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            لا توجد سجلات مرضى مطابقة
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? `لم يتم العثور على نتائج للبحث عن "${searchQuery}"`
              : 'لم يتم تسجيل أي مريض في قائمة الاستقبال حتى الآن'}
          </p>
          <button
            onClick={onOpenNewPatientModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مريض جديد الآن</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          
          {/* Table Header on Desktop */}
          <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">1. اسم المريض والكود</div>
            <div className="col-span-1 text-center">2. العمر</div>
            <div className="col-span-2">3. رقم الهاتف والتواصل</div>
            <div className="col-span-3">4. الشكوى وسبب الزيارة</div>
            <div className="col-span-1 text-center">5. المبلغ</div>
            <div className="col-span-2 text-left">إجراءات السكرتير</div>
          </div>

          {/* Patient Cards / Rows */}
          {filteredPatients.map((patient) => {
            const currentStatus = statusConfig[patient.status] || statusConfig.waiting;

            return (
              <div
                key={patient.id}
                className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-4 sm:p-5 hover:border-blue-300 dark:hover:border-slate-700 transition-all ios-card"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
                  
                  {/* 1. اسم المريض والكود */}
                  <div className="lg:col-span-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0 text-sm shadow-inner">
                      {patient.gender === 'female' ? '👩' : '👨'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                          {patient.name}
                        </h4>
                        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {patient.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {patient.visitTime}
                        </span>
                        <span>·</span>
                        <span>{patient.visitDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. العمر والجنس */}
                  <div className="lg:col-span-1 flex items-center lg:justify-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                      {patient.age && patient.age > 0 ? (
                        <>
                          <span className="tabular-nums font-bold">{patient.age}</span>
                          <span className="text-[10px] text-slate-500">سنة</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400">غير محدد</span>
                      )}
                    </span>
                  </div>

                  {/* 3. رقم الهاتف وأزرار التواصل */}
                  <div className="lg:col-span-2">
                    {patient.phone ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${patient.phone}`}
                          className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1"
                          dir="ltr"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {patient.phone}
                        </a>
                        
                        {/* WhatsApp Quick Chat */}
                        <button
                          onClick={() => handleWhatsApp(patient)}
                          className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="محادثة واتساب سريعة"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 opacity-40" />
                        بدون هاتف
                      </span>
                    )}
                  </div>

                  {/* 4. الشكوى وسبب الزيارة */}
                  <div className="lg:col-span-3">
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-2 font-medium">
                      {patient.complaint}
                    </p>
                    {patient.followUpDate && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        <Calendar className="w-3 h-3" />
                        <span>مراجعة: {patient.followUpDate}</span>
                      </div>
                    )}
                  </div>

                  {/* 5. المبلغ المدفوع وطريقة السداد */}
                  <div className="lg:col-span-1 flex lg:flex-col items-center lg:items-center justify-between lg:justify-center gap-1">
                    <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {settings.permissions.canViewFinancials ? (
                        <>
                          {patient.paidAmount} <span className="text-[11px] font-normal text-slate-400">{settings.currency}</span>
                        </>
                      ) : (
                        '••••'
                      )}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {paymentLabels[patient.paymentMethod] || 'نقدي'}
                    </span>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="lg:col-span-2 flex flex-wrap items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    
                    {/* Status Toggle Button / Selector */}
                    <div className="relative">
                      <select
                        value={patient.status}
                        onChange={(e) => onUpdateStatus(patient.id, e.target.value as PatientStatus)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border appearance-none pr-6 cursor-pointer focus:outline-none ${currentStatus.bg} ${currentStatus.text}`}
                      >
                        <option value="waiting">🕒 الانتظار</option>
                        <option value="in_consultation">🩺 في الكشف</option>
                        <option value="completed">✅ تم الكشف</option>
                        <option value="cancelled">❌ ملغى</option>
                      </select>
                      <span className={`w-2 h-2 rounded-full absolute right-2.5 top-3 pointer-events-none ${currentStatus.dot}`} />
                    </div>

                    {/* Print Invoice Button (Directly requested by user) */}
                    <button
                      onClick={() => onPrintInvoice(patient)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="طباعة الفاتورة وسند القبض"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Edit Patient */}
                    <button
                      onClick={() => onEditPatient(patient)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="تعديل بيانات المريض"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Patient (Guarded by permission, In-App Modal) */}
                    {settings.permissions.canDeletePatients && (
                      <button
                        type="button"
                        onClick={() => setPatientToDelete(patient)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                        title="حذف السجل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>

                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* Delete Confirmation In-App Modal (Works 100% reliably in any iframe/device) */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                تأكيد حذف المريض
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                هل أنت متأكد من حذف سجل المريض <span className="font-bold text-slate-900 dark:text-white">"{patientToDelete.name}"</span>؟ سيتم مسح بيانات الزيارة فورياً من الاستقبال.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  const idToDelete = patientToDelete.id;
                  setPatientToDelete(null);
                  onDeletePatient(idToDelete);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-colors"
              >
                نعم، حذف السجل
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
