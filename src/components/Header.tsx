import React from 'react';
import { 
  Plus, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff, 
  Bell, 
  UserCheck, 
  Stethoscope, 
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ClinicSettings, Patient } from '../types';

interface HeaderProps {
  settings: ClinicSettings;
  patients: Patient[];
  onOpenNewPatientModal: () => void;
  onNavigateToAlerts: () => void;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  isSyncConnected: boolean;
  connectedDevicesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  patients,
  onOpenNewPatientModal,
  onNavigateToAlerts,
  onToggleDarkMode,
  onOpenSettings,
  isSyncConnected,
  connectedDevicesCount,
}) => {
  // Count today's follow-up alerts
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingAlertsCount = patients.filter((p) => {
    if (!p.followUpDate) return false;
    return p.followUpDate <= todayStr && p.status !== 'cancelled';
  }).length;

  const roleLabels: Record<string, string> = {
    head_secretary: 'سكرتير أول',
    receptionist: 'موظف استقبال',
    doctor: 'طبيب العيادة',
    admin: 'مدير النظام',
  };

  // Current Arabic date
  const formattedToday = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Right Zone: Clinic Brand & Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {settings.clinicName}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  <Sparkles className="w-3 h-3" />
                  عيادتي برو
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden md:block">
                {settings.clinicSpecialty} · {formattedToday}
              </p>
            </div>
          </div>

          {/* Center Zone: Quick Action Button & Live Sync Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Sync Indicator (Real-time indicator across all devices) */}
            <div 
              title={isSyncConnected ? `مزامنة لحظية نشطة مع السيرفر والأجهزة (${connectedDevicesCount} متصل)` : 'المزامنة تعمل في الوضع المحلي'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 cursor-default"
            >
              {isSyncConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden lg:inline text-[11px]">مزامنة فورية</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden lg:inline text-[11px]">محلي</span>
                </>
              )}
            </div>

            {/* Follow-Up Alerts Button with Badge */}
            <button
              onClick={onNavigateToAlerts}
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 active:scale-95"
              title="تنبيهات مواعيد المراجعة"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold hidden md:inline">المراجعات</span>
              {pendingAlertsCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-bold shadow-sm">
                  {pendingAlertsCount}
                </span>
              )}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
              title={settings.darkMode ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
              aria-label="Toggle Dark Mode"
            >
              {settings.darkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              )}
            </button>

            {/* Primary Action: New Patient Registration */}
            <button
              onClick={onOpenNewPatientModal}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
              <span className="hidden sm:inline">تسجيل مريض جديد</span>
              <span className="sm:hidden">تسجيل</span>
            </button>
          </div>

          {/* Left Zone: Secretary Profile (بدون صورة كما طُلب) */}
          <div 
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-all border border-slate-200/70 dark:border-slate-800 group active:scale-98"
            title="إعدادات الحساب وصلاحيات السكرتير"
          >
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {settings.secretaryName}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="متصل" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {roleLabels[settings.secretaryRole] || 'سكرتير العيادة'}
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-blue-500 hidden sm:block" />
          </div>

        </div>
      </div>
    </header>
  );
};
