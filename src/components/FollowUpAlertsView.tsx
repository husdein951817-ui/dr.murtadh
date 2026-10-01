import React, { useState } from 'react';
import { 
  BellRing, 
  Calendar, 
  Clock, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Sparkles, 
  CalendarClock,
  ArrowRight,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { Patient, ClinicSettings } from '../types';

interface FollowUpAlertsViewProps {
  patients: Patient[];
  settings: ClinicSettings;
  onUpdateFollowUp: (patientId: string, newDate: string | null) => void;
  onRegisterTodayVisit: (patient: Patient) => void;
}

export const FollowUpAlertsView: React.FC<FollowUpAlertsViewProps> = ({
  patients,
  settings,
  onUpdateFollowUp,
  onRegisterTodayVisit,
}) => {
  const [filterTab, setFilterTab] = useState<'today' | 'upcoming' | 'overdue' | 'all'>('today');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // Patients who have a follow up date set
  const followUpPatients = patients.filter((p) => Boolean(p.followUpDate));

  // Partition into: Today, Upcoming (within 7 days), Overdue
  const categorized = followUpPatients.map((patient) => {
    const fDate = new Date(patient.followUpDate!);
    fDate.setHours(0, 0, 0, 0);
    const diffTime = fDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let category: 'today' | 'upcoming' | 'overdue';
    if (diffDays === 0) category = 'today';
    else if (diffDays > 0) category = 'upcoming';
    else category = 'overdue';

    return { patient, diffDays, category };
  });

  const todayAlerts = categorized.filter((c) => c.category === 'today');
  const upcomingAlerts = categorized.filter((c) => c.category === 'upcoming' && c.diffDays <= 7);
  const overdueAlerts = categorized.filter((c) => c.category === 'overdue');

  const displayedList = categorized.filter((item) => {
    if (filterTab === 'today') return item.category === 'today';
    if (filterTab === 'upcoming') return item.category === 'upcoming';
    if (filterTab === 'overdue') return item.category === 'overdue';
    return true;
  }).sort((a, b) => a.diffDays - b.diffDays);

  const sendWhatsAppReminder = (patient: Patient, dateStr: string) => {
    const cleanPhone = patient.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('966') 
      ? cleanPhone 
      : cleanPhone.startsWith('0') 
        ? '966' + cleanPhone.substring(1) 
        : cleanPhone;

    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله،\nعزيزنا المريض: ${patient.name} المحترم،\n\nنود تذكيركم بموعد مراجعتكم الطبية المجدول في ${settings.clinicName} لدى ${patient.doctorName || settings.doctorName}.\n\n📅 موعد المراجعة: ${dateStr}\n📍 المكان: ${settings.clinicAddress}\n📞 للاستفسار أو التأكيد: ${settings.clinicPhone}\n\nنتمنى لكم دوام الصحة والعافية.`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Info */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-500 animate-bounce" />
            <span>نظام تنبيهات مواعيد المراجعة التلقائي</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تنبيهات استباقية لمتابعة حالات المرضى وتذكيرهم عبر الواتساب بنقرة واحدة
          </p>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setFilterTab('today')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              filterTab === 'today'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>مراجعات اليوم</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
              {todayAlerts.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('upcoming')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              filterTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>القادمة (أسبوع)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
              {upcomingAlerts.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('overdue')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              filterTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>المتأخرة</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
              {overdueAlerts.length}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterTab === 'all'
                ? 'bg-slate-800 text-white shadow-sm dark:bg-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            الكل ({followUpPatients.length})
          </button>
        </div>
      </div>

      {/* Metric Cards for Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Today */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">مراجعات اليوم</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-100 tabular-nums">
            {todayAlerts.length} <span className="text-xs font-normal">مريض مطلوب اليوم</span>
          </div>
        </div>

        {/* Card 2: Upcoming */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300">مراجعات خلال 7 أيام</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 dark:text-blue-100 tabular-nums">
            {upcomingAlerts.length} <span className="text-xs font-normal">مريض قادم</span>
          </div>
        </div>

        {/* Card 3: Overdue */}
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">مراجعات متأخرة لم يحضروا</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 dark:text-rose-100 tabular-nums">
            {overdueAlerts.length} <span className="text-xs font-normal">حالة متأخرة</span>
          </div>
        </div>

      </div>

      {/* Alerts List */}
      {displayedList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            لا توجد تنبيهات مراجعة في هذا القسم
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            جميع مواعيد المراجعة منتظمة ولا توجد حالات معلقة حالياً
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedList.map(({ patient, diffDays, category }) => {
            const isToday = category === 'today';
            const isOverdue = category === 'overdue';

            return (
              <div
                key={patient.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border transition-all ios-card ${
                  isToday
                    ? 'border-amber-300 dark:border-amber-700/60 shadow-md shadow-amber-500/5'
                    : isOverdue
                      ? 'border-rose-200 dark:border-rose-800/50'
                      : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Patient Details & Reason */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {patient.name}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {patient.code}
                      </span>

                      {/* Urgency Badge */}
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                          ⚠️ موعده اليوم!
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          فات الموعد منذ {Math.abs(diffDays)} يوم
                        </span>
                      )}
                      {!isToday && !isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          متبقي {diffDays} أيام
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-2">
                      <span>الشكوى السابقة: {patient.complaint}</span>
                      <span>·</span>
                      <span>طبيب الكشف: {patient.doctorName || settings.doctorName}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono" dir="ltr">
                        {patient.phone}
                      </span>
                      <span>تاريخ الزيارة الأصلية: {patient.visitDate}</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        تاريخ المراجعة: {patient.followUpDate}
                      </span>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    
                    {/* WhatsApp 1-Click Reminder */}
                    <button
                      onClick={() => sendWhatsAppReminder(patient, patient.followUpDate!)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all"
                      title="إرسال رسالة تذكير جاهزة عبر واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>إرسال تذكير واتساب</span>
                    </button>

                    {/* Direct Call */}
                    <a
                      href={`tel:${patient.phone}`}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                      title="اتصال هاتفي"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    {/* Register Today's Visit */}
                    <button
                      onClick={() => onRegisterTodayVisit(patient)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                      title="تسجيل حضور المريض اليوم ونقله إلى صالة الانتظار"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>تسجيل حضور اليوم</span>
                    </button>

                    {/* Dismiss / Mark completed */}
                    <button
                      type="button"
                      onClick={() => onUpdateFollowUp(patient.id, null)}
                      className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="إغلاق التنبيه"
                    >
                      إغلاق
                    </button>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
