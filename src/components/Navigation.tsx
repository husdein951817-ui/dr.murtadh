import React from 'react';
import { 
  Users, 
  CalendarRange, 
  BellRing, 
  Settings, 
  Receipt,
  CheckCircle2
} from 'lucide-react';

export type NavTab = 'reception' | 'monthly' | 'alerts' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  pendingAlertsCount: number;
  todayPatientsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  pendingAlertsCount,
  todayPatientsCount,
}) => {
  const tabs = [
    {
      id: 'reception' as NavTab,
      label: 'الاستقبال اليومي',
      shortLabel: 'الرئيسية',
      description: 'تسجيل وقائمة مرضى اليوم',
      icon: Users,
      badge: todayPatientsCount > 0 ? todayPatientsCount : null,
      badgeColor: 'bg-blue-600',
    },
    {
      id: 'monthly' as NavTab,
      label: 'السجل الشهري والتقارير',
      shortLabel: 'السجل الشهري',
      description: 'جميع الزيارات والدخل والبحث',
      icon: CalendarRange,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'alerts' as NavTab,
      label: 'تنبيهات المراجعة',
      shortLabel: 'المراجعات',
      description: 'متابعة المواعيد وتذكير واتساب',
      icon: BellRing,
      badge: pendingAlertsCount > 0 ? pendingAlertsCount : null,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'settings' as NavTab,
      label: 'الإعدادات والصلاحيات',
      shortLabel: 'الإعدادات',
      description: 'اسم السكرتير، المظهر، والصلاحيات',
      icon: Settings,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Segmented Navigation */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <nav className="inline-flex p-1.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl backdrop-blur-md border border-slate-300/40 dark:border-slate-700/40">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-sm ios-shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>نظام سكرتارية متكامل</span>
          </div>
        </div>
      </div>

      {/* Mobile Floating iOS Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 pb-safe">
        <div className="grid grid-cols-4 items-center h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`relative flex flex-col items-center justify-center h-full transition-colors min-h-[44px] ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {tab.badge !== null && (
                    <span className={`absolute -top-1 -right-2 px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold mt-1 truncate max-w-[70px] ${isActive ? 'font-bold' : ''}`}>
                  {tab.shortLabel}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
