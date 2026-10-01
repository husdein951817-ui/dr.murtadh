import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  CreditCard, 
  FileText, 
  Printer, 
  Check, 
  AlertCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Patient, PatientStatus, PaymentMethod } from '../types';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient, printNow?: boolean) => void;
  editingPatient?: Patient | null;
  currency: string;
  defaultFee: number;
  defaultDoctorName: string;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPatient,
  currency,
  defaultFee = 25000,
  defaultDoctorName,
}) => {
  // 5 Core Required Fields
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [complaint, setComplaint] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | ''>(defaultFee || 25000);

  // Additional Clinical Fields
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [status, setStatus] = useState<PatientStatus>('waiting');
  const [doctorName, setDoctorName] = useState(defaultDoctorName);
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Quick Orthopedic Complaint suggestions for Dr. Murtadha Mohammed Kurdi's clinic
  const [selectedOrthoCategory, setSelectedOrthoCategory] = useState<string>('الكل');

  const orthopedicCategories = [
    {
      name: 'الركبة والمفاصل',
      complaints: [
        'خشونة واحتكاك مفصل الركبة',
        'تمزق الغضروف الهلالي',
        'إصابة أربطة الركبة / الرباط الصليبي',
        'صعوبة ثني الركبة وتورم المفصل',
      ],
    },
    {
      name: 'الظهر والعمود الفقري',
      complaints: [
        'انزلاق غضروفي (دسك) قطني',
        'آلام عرق النسا وتنميل بالساق',
        'ألم وتيبس بالفقرات العنقية والرقبة',
        'تقلص وآلام حادة أسفل الظهر',
      ],
    },
    {
      name: 'الكسور والجبائر',
      complaints: [
        'اشتباه كسر / سقوط ورضوض حادة',
        'فحص ومتابعة جبيرة / رفع الجبس',
        'التواء وتمزق أربطة الكاحل',
        'متابعة تثبيت كسر جراحي',
      ],
    },
    {
      name: 'الكتف واليد',
      complaints: [
        'التهاب أوتار الكتف وتيبس الحركة',
        'متلازمة النفق الرسغي وتنميل الأصابع',
        'التهاب وتر المرفق (كوع التنس)',
        'خلع متكرر بمفصل الكتف',
      ],
    },
    {
      name: 'القدم والعظام العامة',
      complaints: [
        'شوكة عظمية وألم كعب القدم',
        'هشاشة العظام وفحص الكثافة',
        'متابعة تبديل مفصل صناعي',
        'التهاب وتر أخيل',
      ],
    },
  ];

  // Quick Amount presets in Iraqi Dinars (25000 is default)
  const amountPresets = [15000, 20000, 25000, 30000, 35000, 50000];

  useEffect(() => {
    if (editingPatient) {
      setName(editingPatient.name);
      setAge(editingPatient.age);
      setPhone(editingPatient.phone);
      setComplaint(editingPatient.complaint);
      setPaidAmount(editingPatient.paidAmount);
      setGender(editingPatient.gender);
      setPaymentMethod(editingPatient.paymentMethod);
      setStatus(editingPatient.status);
      setDoctorName(editingPatient.doctorName || defaultDoctorName);
      setFollowUpDate(editingPatient.followUpDate || '');
      setNotes(editingPatient.notes || '');
    } else {
      // Default new patient with fixed default clinic fee (25,000 د.ع)
      setName('');
      setAge('');
      setPhone('');
      setComplaint('');
      setPaidAmount(defaultFee || 25000);
      setGender('male');
      setPaymentMethod('cash');
      setStatus('waiting');
      setDoctorName(defaultDoctorName);
      setFollowUpDate('');
      setNotes('');
    }
    setErrors({});
  }, [editingPatient, isOpen, defaultDoctorName, defaultFee]);

  if (!isOpen) return null;

  const validate = () => {
    // إمكانية إدخال بيانات المريض بدون قيود كما طلب المستخدم
    // يمكن للمريض عدم ذكر هاتفه أو عمره أو شكواه
    return true;
  };

  const handleQuickFollowUp = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (printNow: boolean = false) => {
    if (!validate()) return;

    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5);
    const currentDate = now.toISOString().split('T')[0];

    const finalName = name.trim() || 'مراجع بدون اسم';
    const finalAge = age === '' || isNaN(Number(age)) ? 0 : Math.max(0, Number(age));
    const finalPhone = phone.trim() || '';
    const finalComplaint = complaint.trim() || 'كشف واستشارة عظام (خاص مع الطبيب)';
    const finalPaid = paidAmount === '' || isNaN(Number(paidAmount)) ? (defaultFee || 25000) : Number(paidAmount);

    const patientData: Patient = {
      id: editingPatient ? editingPatient.id : 'pat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      code: editingPatient ? editingPatient.code : `MRN-${Math.floor(100 + Math.random() * 900)}`,
      name: finalName,
      age: finalAge,
      gender,
      phone: finalPhone,
      complaint: finalComplaint,
      paidAmount: finalPaid,
      totalAmount: finalPaid,
      paymentMethod,
      status,
      visitDate: editingPatient ? editingPatient.visitDate : currentDate,
      visitTime: editingPatient ? editingPatient.visitTime : currentTime,
      doctorName: doctorName.trim() || defaultDoctorName,
      followUpDate: followUpDate || null,
      notes: notes.trim(),
      createdAt: editingPatient ? editingPatient.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(patientData, printNow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Sheet Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {editingPatient ? 'تعديل بيانات مريض' : 'تسجيل مريض جديد (الاستقبال)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أدخل البيانات الخمس الأساسية وتفاصيل الزيارة اليومية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Patient Main 5 Items */}
          <div className="space-y-4">
            
            {/* 1. اسم المريض */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                1. اسم المريض الكامل <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد محمود (أو اتركه فارغاً وسيُسجل كمراجع)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* 2 & 3: العمر ورقم الهاتف (اختياريان) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              
              {/* 2. العمر والجنس */}
              <div className="sm:col-span-5">
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  2. العمر <span className="text-[11px] font-normal text-slate-400">(اختياري)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="125"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="اختياري بالسنين"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {/* Gender Selector */}
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        gender === 'male' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      ذكر
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        gender === 'female' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      أنثى
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. رقم الهاتف */}
              <div className="sm:col-span-7">
                <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  3. رقم الهاتف <span className="text-[11px] font-normal text-slate-400">(اختياري)</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="اختياري - 07XXXXXXXX"
                    className="w-full px-4 py-2.5 text-right rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* 4. الشكوى الطبية / سبب الزيارة */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  4. الشكوى أو سبب الزيارة <span className="text-[11px] font-normal text-slate-400">(اختياري)</span>
                </label>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">اقتراحات العظام</span>
              </div>
              <textarea
                rows={2}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="اختياري - انقر من قائمة العظام بالأسفل أو اكتب الشكوى، أو اتركها فارغة للكشف الخاص..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
              {/* Orthopedic Categories & Quick complaint tags */}
              <div className="mt-2.5 space-y-2">
                {/* Category filters */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold ml-1 shrink-0">
                    عظام ومفاصل:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedOrthoCategory('الكل')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors shrink-0 ${
                      selectedOrthoCategory === 'الكل'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    الكل
                  </button>
                  {orthopedicCategories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedOrthoCategory(cat.name)}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors shrink-0 ${
                        selectedOrthoCategory === cat.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Clickable Orthopedic complaint tags */}
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 max-h-28 overflow-y-auto">
                  {(selectedOrthoCategory === 'الكل'
                    ? orthopedicCategories.flatMap((c) => c.complaints)
                    : orthopedicCategories.find((c) => c.name === selectedOrthoCategory)?.complaints || []
                  ).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setComplaint((prev) => (prev ? `${prev}، ${item}` : item))}
                      className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs text-right"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>
              {errors.complaint && <p className="text-xs text-rose-500 mt-1">{errors.complaint}</p>}
            </div>

            {/* 5. المبلغ المدفوع وطريقة الدفع */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  5. المبلغ المدفوع ({currency}) <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-1">
                  {amountPresets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPaidAmount(val)}
                      className={`px-2 py-0.5 rounded-md text-xs font-bold transition-colors ${
                        paidAmount === val
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {val.toLocaleString('ar-IQ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border ${
                      errors.paidAmount ? 'border-rose-500' : 'border-blue-200 dark:border-slate-700'
                    } text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                </div>

                {/* طريقة الدفع */}
                <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    بطاقة/شبكة
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      paymentMethod === 'cash' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    نقدي (كاش)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      paymentMethod === 'transfer' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    تحويل
                  </button>
                </div>
              </div>
              {errors.paidAmount && <p className="text-xs text-rose-500">{errors.paidAmount}</p>}
            </div>

            {/* Clinical Workflow: Status & Follow-Up Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* حالة المريض الحالية */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  حالة المريض في العيادة
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PatientStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="waiting">🕒 في صالة الانتظار</option>
                  <option value="in_consultation">🩺 داخل غرفة الكشف</option>
                  <option value="completed">✅ تم الكشف وخروج المريض</option>
                  <option value="cancelled">❌ ملغى</option>
                </select>
              </div>

              {/* موعد المراجعة القادمة والتنبيهات */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    موعد المراجعة القادمة
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickFollowUp(7)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50"
                    >
                      +7 أيام
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFollowUp(14)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50"
                    >
                      +14 يوم
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* ملاحظات السكرتير الإضافية */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ملاحظات إضافية للسكرتير (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: يفضل الدخول مبكراً، يحتاج كرسي متحرك، مرفق تحاليل خارجية..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors"
          >
            إلغاء
          </button>

          <div className="flex items-center gap-2">
            {/* Save and Print Button */}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              title="حفظ بيانات المريض وطباعة الفاتورة فوراً"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>حفظ وطباعة الفاتورة</span>
            </button>

            {/* Save Only Button */}
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-md shadow-blue-500/20"
            >
              <Check className="w-4 h-4" />
              <span>{editingPatient ? 'تحديث البيانات' : 'تسجيل المريض'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
