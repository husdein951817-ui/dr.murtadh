import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Building2, 
  Lock, 
  Save, 
  Check, 
  Wifi, 
  Smartphone, 
  Laptop, 
  RefreshCw, 
  CheckCircle2,
  DollarSign,
  Trash2,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { ClinicSettings, RoleType } from '../types';

interface SettingsViewProps {
  settings: ClinicSettings;
  onSaveSettings: (newSettings: ClinicSettings) => void;
  isSyncConnected: boolean;
  connectedDevicesCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  isSyncConnected,
  connectedDevicesCount,
}) => {
  const [formData, setFormData] = useState<ClinicSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleTogglePermission = (key: keyof ClinicSettings['permissions']) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>لوحة الإعدادات وصلاحيات النظام</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            التحكم باسم السكرتير، المظهر، صلاحيات الوصول للبيانات، ومعلومات العيادة
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>تم حفظ التعديلات بنجاح!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Secretary Profile (المطلوب في الشروط: التحكم باسم السكرتير الظاهر اعلا القائمة على اليسار) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                حساب السكرتير (يظهر في أعلى القائمة على اليسار)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يظهر هذا الاسم في ترويسة البرنامج وعلى فواتير المرضى المسجلة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* اسم السكرتير */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                اسم السكرتير / السكرتيرة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.secretaryName}
                onChange={(e) => setFormData({ ...formData, secretaryName: e.target.value })}
                placeholder="مثال: سارة المنصور"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                سيتم تحديث الاسم فورياً في أعلى شاشة البرنامج
              </p>
            </div>

            {/* الدور الوظيفي */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                المسمى الوظيفي
              </label>
              <select
                value={formData.secretaryRole}
                onChange={(e) => setFormData({ ...formData, secretaryRole: e.target.value as RoleType })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="head_secretary">سكرتير أول (رئيس الاستقبال)</option>
                <option value="receptionist">موظف استقبال</option>
                <option value="admin">مدير العيادة (إدارة كاملة)</option>
                <option value="doctor">طبيب العيادة</option>
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Dark Mode & Appearance (المطلوب: امكانية تغير الوضع من الفاتح الى الداكن) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                مظهر البرنامج (الوضع الفاتح / الداكن)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تصميم مستوحى من نظام Apple iOS مع دعم الراحة البصرية
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, darkMode: false })}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col justify-between ${
                !formData.darkMode
                  ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <Sun className="w-6 h-6 text-amber-500" />
                {!formData.darkMode && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  الوضع الفاتح (Light Mode)
                </span>
                <span className="text-xs text-slate-500">
                  خلفيات بيضاء نقية ومريحة لغرف الاستقبال المضاءة
                </span>
              </div>
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, darkMode: true })}
              className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col justify-between ${
                formData.darkMode
                  ? 'border-blue-500 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <Moon className="w-6 h-6 text-indigo-400" />
                {formData.darkMode && (
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  الوضع الداكن (Dark Mode)
                </span>
                <span className="text-xs text-slate-400">
                  خلفية سوداء عميقة توفر الطاقة وتريح العين في الفترات الليلية
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* Section 3: Data Access Permissions (المطلوب: وتعديل صلاحيات الوصول للبيانات) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                صلاحيات الوصول للبيانات (Role & Permissions)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تحكم بما يستطيع موظف الاستقبال أو السكرتير رؤيته وتعديله
              </p>
            </div>
          </div>

          <div className="space-y-3">
            
            {/* Permission 1: View Financials */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    عرض تقارير الدخل والمبالغ المالية
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    السماح للسكرتير برؤية مجموع الدخل اليومي والشهري وإحصائيات الإيراد
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.canViewFinancials}
                  onChange={() => handleTogglePermission('canViewFinancials')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Permission 2: Delete Patients */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    صلاحية حذف سجلات المرضى
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    السماح لموظف الاستقبال بحذف سجلات الزيارات أو المرضى نهائياً
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.canDeletePatients}
                  onChange={() => handleTogglePermission('canDeletePatients')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Permission 3: Export Reports */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    تصدير البيانات والتقارير الشهرية (Excel / CSV)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    إمكانية تحميل وتنزيل سجلات المرضى والبيانات المالية كملف خارجي
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.canExportReports}
                  onChange={() => handleTogglePermission('canExportReports')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Permission 4: Edit Follow-Up Appointments */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    تعديل مواعيد المراجعة والتنبيهات
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    السماح بتحديث موعد مراجعة المريض وإرسال تنبيهات الواتساب
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.canChangeFollowUp}
                  onChange={() => handleTogglePermission('canChangeFollowUp')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

          </div>
        </div>

        {/* Section 4: Clinic Info & Receipts */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                بيانات العيادة والفواتير المطبوعة
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                هذه المعلومات تطبع تلقائياً في ترويسة سندات القبض والفواتير
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                اسم العيادة
              </label>
              <input
                type="text"
                value={formData.clinicName}
                onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                التخصص الطبي
              </label>
              <input
                type="text"
                value={formData.clinicSpecialty}
                onChange={(e) => setFormData({ ...formData, clinicSpecialty: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                هاتف العيادة (للفواتير والتواصل)
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.clinicPhone}
                onChange={(e) => setFormData({ ...formData, clinicPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-right text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                العملة المعتمدة
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="د.ع، ر.س، ج.م، $"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* رسوم الكشف الافتراضية الثابتة (المطلوب في الطلب) */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-100 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>رسوم الكشف الافتراضية الثابتة للمريض</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    يتم إدراج هذا المبلغ تلقائياً عند تسجيل أي مريض جديد ويمكنك تغييره هنا في أي وقت
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {[20000, 25000, 30000, 35000, 50000].map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setFormData({ ...formData, defaultFee: fee })}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        (formData.defaultFee || 25000) === fee
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {fee.toLocaleString('ar-IQ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative max-w-xs">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.defaultFee || 25000}
                  onChange={(e) => setFormData({ ...formData, defaultFee: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 text-slate-900 dark:text-white font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">
                  {formData.currency}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                عنوان العيادة
              </label>
              <input
                type="text"
                value={formData.clinicAddress}
                onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>

          </div>
        </div>

        {/* Section 5: Real-Time Multi-Device Sync Status (المطلوب: المزامنة اللحظية بين جميع الاجهزة) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                حالة المزامنة اللحظية بين الأجهزة (Real-Time Sync)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يدعم فتح البرنامج والعمل المشترك بين شاشة الكمبيوتر والتابلت والهواتف
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  كمبيوتر الاستقبال
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  متصل ومزامن
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  التابلت والهاتف
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  دعم كامل لشاشات اللمس
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  خادم المزامنة اللحظي
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {connectedDevicesCount} أجهزة متصلة الآن
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>حفظ جميع الإعدادات</span>
          </button>
        </div>

      </form>

    </div>
  );
};
