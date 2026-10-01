import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle, 
  Clock, 
  CreditCard,
  User,
  Filter,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';
import { Patient, ClinicSettings } from '../types';

interface MonthlyArchiveViewProps {
  patients: Patient[];
  settings: ClinicSettings;
  onPrintInvoice: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
}

export const MonthlyArchiveView: React.FC<MonthlyArchiveViewProps> = ({
  patients,
  settings,
  onPrintInvoice,
  onEditPatient,
}) => {
  // Current month & year as default
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

  const [selectedMonth, setSelectedMonth] = useState<string>(`${currentYear}-${currentMonth}`);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'card' | 'cash' | 'transfer'>('all');
  const [sortField, setSortField] = useState<'date' | 'name' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Available months extracted from patients data
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(`${currentYear}-${currentMonth}`);
    patients.forEach((p) => {
      if (p.visitDate) {
        set.add(p.visitDate.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [patients, currentYear, currentMonth]);

  // Filtered visits
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // 1. Month filter (if no specific single date is set)
      if (searchDate) {
        if (patient.visitDate !== searchDate) return false;
      } else if (selectedMonth) {
        if (!patient.visitDate.startsWith(selectedMonth)) return false;
      }

      // 2. Payment filter
      if (paymentFilter !== 'all' && patient.paymentMethod !== paymentFilter) {
        return false;
      }

      // 3. Search query (name, phone, complaint, code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = patient.name.toLowerCase().includes(q);
        const matchPhone = patient.phone.includes(q);
        const matchComplaint = patient.complaint.toLowerCase().includes(q);
        const matchCode = patient.code.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchComplaint && !matchCode) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const dA = `${a.visitDate} ${a.visitTime}`;
        const dB = `${b.visitDate} ${b.visitTime}`;
        return sortOrder === 'desc' ? dB.localeCompare(dA) : dA.localeCompare(dB);
      }
      if (sortField === 'name') {
        return sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      if (sortField === 'amount') {
        return sortOrder === 'desc' ? b.paidAmount - a.paidAmount : a.paidAmount - b.paidAmount;
      }
      return 0;
    });
  }, [patients, selectedMonth, searchDate, paymentFilter, searchQuery, sortField, sortOrder]);

  // Financial calculations
  const totalRevenue = useMemo(() => {
    return filteredPatients.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  }, [filteredPatients]);

  const totalVisits = filteredPatients.length;
  const avgRevenuePerVisit = totalVisits > 0 ? Math.round(totalRevenue / totalVisits) : 0;

  // Breakdown by payment method
  const paymentBreakdown = useMemo(() => {
    let card = 0;
    let cash = 0;
    let transfer = 0;
    filteredPatients.forEach((p) => {
      if (p.paymentMethod === 'card') card += p.paidAmount;
      else if (p.paymentMethod === 'cash') cash += p.paidAmount;
      else if (p.paymentMethod === 'transfer') transfer += p.paidAmount;
    });
    return { card, cash, transfer };
  }, [filteredPatients]);

  // Daily distribution for the chart
  const dailyDistribution = useMemo(() => {
    const daysMap: Record<string, number> = {};
    filteredPatients.forEach((p) => {
      const day = p.visitDate.substring(8, 10);
      daysMap[day] = (daysMap[day] || 0) + p.paidAmount;
    });
    return Object.entries(daysMap)
      .map(([day, amount]) => ({ day, amount }))
      .sort((a, b) => Number(a.day) - Number(b.day));
  }, [filteredPatients]);

  const maxDailyAmount = Math.max(...dailyDistribution.map((d) => d.amount), 1);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['رقم الملف', 'اسم المريض', 'العمر', 'الجنس', 'رقم الهاتف', 'الشكوى', 'المبلغ المدفوع', 'طريقة الدفع', 'تاريخ الزيارة', 'الوقت', 'طبيب الكشف'];
    const rows = filteredPatients.map((p) => [
      p.code,
      `"${p.name}"`,
      p.age,
      p.gender === 'male' ? 'ذكر' : 'أنثى',
      p.phone,
      `"${p.complaint.replace(/"/g, '""')}"`,
      p.paidAmount,
      p.paymentMethod,
      p.visitDate,
      p.visitTime,
      `"${p.doctorName || settings.doctorName}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_زيارات_العيادة_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthNamesArabic: Record<string, string> = {
    '01': 'يناير',
    '02': 'فبراير',
    '03': 'مارس',
    '04': 'أبريل',
    '05': 'مايو',
    '06': 'يونيو',
    '07': 'يوليو',
    '08': 'أغسطس',
    '09': 'سبتمبر',
    '10': 'أكتوبر',
    '11': 'نوفمبر',
    '12': 'ديسمبر',
  };

  const formatMonthTitle = (mStr: string) => {
    const [y, m] = mStr.split('-');
    return `${monthNamesArabic[m] || m} ${y}`;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Filter and Controls Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Header Title */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>السجل الشهري وتقارير الدخل</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              متابعة الزيارات، الإحصائيات المالية، والبحث بالاسم أو التاريخ
            </p>
          </div>

          {/* Month Selector & Date Filter */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Month Dropdown */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSearchDate('');
                }}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    📅 {formatMonthTitle(m)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
            </div>

            {/* Specific Date Picker (Search by date as requested) */}
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                title="تصفية بتاريخ محدد"
                className="text-xs px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate('')}
                  className="text-xs text-rose-500 hover:underline px-1"
                >
                  إلغاء التاريخ
                </button>
              )}
            </div>

            {/* Export CSV Button (Guarded by permission) */}
            {settings.permissions.canExportReports && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="تصدير جدول الزيارات لملف إكسل"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel</span>
              </button>
            )}

            {/* Print Report */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
              title="طباعة التقرير المالي"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة التقرير</span>
            </button>

          </div>

        </div>

        {/* Search Bar & Payment Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          
          {/* Search by Name, Code, Phone */}
          <div className="md:col-span-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم أو رقم الهاتف أو الشكوى أو الكود..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Payment Method Filter */}
          <div className="md:col-span-4 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                paymentFilter === 'all'
                  ? 'bg-white dark:bg-[#2C2C2E] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setPaymentFilter('card')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                paymentFilter === 'card'
                  ? 'bg-white dark:bg-[#2C2C2E] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              بطاقة
            </button>
            <button
              onClick={() => setPaymentFilter('cash')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                paymentFilter === 'cash'
                  ? 'bg-white dark:bg-[#2C2C2E] text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              كاش
            </button>
            <button
              onClick={() => setPaymentFilter('transfer')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                paymentFilter === 'transfer'
                  ? 'bg-white dark:bg-[#2C2C2E] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              تحويل
            </button>
          </div>

        </div>

      </div>

      {/* Financial Income Cards (تقارير الدخل) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm ios-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">إجمالي دخل الفترة</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
              {settings.permissions.canViewFinancials ? totalRevenue.toLocaleString('ar-SA') : '••••'}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {settings.currency}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            مجموع مقبوضات {totalVisits} زيارة مسجلة
          </p>
        </div>

        {/* Total Visits */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm ios-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">عدد الزيارات الكلي</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {totalVisits}
            </span>
            <span className="text-xs font-semibold text-slate-400">مريض</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            في شهر {formatMonthTitle(selectedMonth)}
          </p>
        </div>

        {/* Average Fee */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm ios-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold">متوسط دخل الزيارة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {settings.permissions.canViewFinancials ? avgRevenuePerVisit : '••••'}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {settings.currency}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            متوسط قيمة الكشف للمريض الواحد
          </p>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            توزيع وسائل الدفع
          </span>
          {settings.permissions.canViewFinancials ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">💳 بطاقات/شبكة:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {paymentBreakdown.card} {settings.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">💵 كاش ونقدي:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {paymentBreakdown.cash} {settings.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">📲 تحويل بنكي:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {paymentBreakdown.transfer} {settings.currency}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-2">
              الصلاحية مقيدة من قبل الإدارة
            </div>
          )}
        </div>

      </div>

      {/* Visual Chart: Daily Income Flow (only if financials permitted) */}
      {settings.permissions.canViewFinancials && dailyDistribution.length > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>مخطط الدخل اليومي لشهر {formatMonthTitle(selectedMonth)}</span>
            </h3>
            <span className="text-xs text-slate-400">
              بالـ {settings.currency}
            </span>
          </div>

          {/* Simple Clean Bar Chart */}
          <div className="flex items-end gap-2 h-36 pt-4 px-2 overflow-x-auto">
            {dailyDistribution.map((item) => {
              const heightPercent = Math.max(10, Math.round((item.amount / maxDailyAmount) * 100));
              return (
                <div key={item.day} className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-1 group">
                  <span className="text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.amount}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all shadow-sm"
                  />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Visits Table */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              سجل الزيارات التفصيلي ({filteredPatients.length} زيارة)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يمكنك فرز الجدول أو استعراض وطباعة فواتير أي مريض
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">الترتيب حسب:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700"
            >
              <option value="date">تاريخ وساعة الزيارة</option>
              <option value="name">اسم المريض</option>
              <option value="amount">المبلغ المدفوع</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="عكس ترتيب الفرز"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            لا توجد زيارات مسجلة تطابق محددات البحث
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800/80">
                <tr>
                  <th className="py-3 px-4">رقم الملف</th>
                  <th className="py-3 px-4">اسم المريض</th>
                  <th className="py-3 px-4">العمر والجنس</th>
                  <th className="py-3 px-4">رقم الهاتف</th>
                  <th className="py-3 px-4">الشكوى / سبب الزيارة</th>
                  <th className="py-3 px-4">تاريخ الزيارة</th>
                  <th className="py-3 px-4">المبلغ</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                  <th className="py-3 px-4 text-center">الفاتورة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {patient.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {patient.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {patient.age && patient.age > 0 ? `${patient.age} سنة` : '—'} · {patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300" dir="ltr">
                      {patient.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {patient.complaint}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {patient.visitDate} <span className="text-[10px] text-slate-400">({patient.visitTime})</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {settings.permissions.canViewFinancials ? (
                        `${patient.paidAmount} ${settings.currency}`
                      ) : (
                        '••••'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {patient.paymentMethod === 'card' ? 'بطاقة' : patient.paymentMethod === 'cash' ? 'كاش' : 'تحويل'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onPrintInvoice(patient)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition-colors"
                        title="طباعة الفاتورة"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
