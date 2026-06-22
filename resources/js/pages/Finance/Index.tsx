import { Head, router, usePage } from '@inertiajs/react';
import moment from 'jalali-moment';
import { useEffect, useState } from 'react';

type Worker = { id: number; name: string; weekly_salary_limit: number | null; monthly_salary_limit: number | null };
type SalaryRequest = {
    id: number;
    worker_id: number;
    type: 'weekly' | 'monthly';
    period: string;
    status: 'pending' | 'approved' | 'rejected';
    note: string | null;
    amount: number | null;
    created_at: string;
    worker: { id: number; name: string };
};

type PageProps = {
    workers: Worker[];
    weeklyRequests: SalaryRequest[];
    monthlyRequests: SalaryRequest[];
    weekPeriod: string;
    monthPeriod: string;
};

type FlashBag = { message?: string | null; success?: string | null };

const toPersian = (str: string) => str.replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
const toLatin = (str: string) => str.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
const numericPersian = (val: string) => toPersian(toLatin(val).replace(/[^0-9]/g, ''));

export default function FinanceIndex({ workers, weeklyRequests, monthlyRequests, weekPeriod, monthPeriod }: PageProps) {
    const { flash } = usePage().props as { flash?: FlashBag };

    // Finance form
    const [formData, setFormData] = useState({ worker_id: '', description: '', price: '', password: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [shakePassword, setShakePassword] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Salary request form
    const [activeTab, setActiveTab] = useState<'finance' | 'weekly' | 'monthly'>('weekly');
    const [salaryForm, setSalaryForm] = useState({ worker_id: '', note: '', amount: '', password: '' });
    const [salaryErrors, setSalaryErrors] = useState<Record<string, string>>({});
    const [isSalarySubmitting, setIsSalarySubmitting] = useState(false);

    useEffect(() => {
        if (flash?.message || flash?.success) {
            setShowSuccess(true);
            const t = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    useEffect(() => {
        if (flash?.success) {
            setFormData({ worker_id: '', description: '', price: '', password: '' });
            setSalaryForm({ worker_id: '', note: '', amount: '', password: '' });
            setIsSubmitting(false);
            setIsSalarySubmitting(false);
        }
    }, [flash]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const processed = name === 'price' ? numericPersian(value) : value;
        setFormData(prev => ({ ...prev, [name]: processed }));
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        if (name === 'password') setShakePassword(false);
    };

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const processed = name === 'amount' ? numericPersian(value) : value;
        setSalaryForm(prev => ({ ...prev, [name]: processed }));
        if (salaryErrors[name]) setSalaryErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const handleSubmitFinance = () => {
        if (!formData.worker_id || !formData.price || !formData.description || !formData.password) {
            alert('لطفاً همه فیلدهای ضروری را پر کنید');
            return;
        }
        setIsSubmitting(true);
        router.post('/finance', { ...formData, price: toLatin(formData.price) }, {
            preserveScroll: true,
            onSuccess: () => setErrors({}),
            onError: (errs) => {
                setErrors(errs || {});
                if (errs?.password) { setShakePassword(true); setTimeout(() => setShakePassword(false), 600); }
                setIsSubmitting(false);
            },
        });
    };

    const handleSubmitSalary = () => {
        if (!salaryForm.worker_id || !salaryForm.password) {
            setSalaryErrors({ general: 'لطفاً نام و رمز عبور را وارد کنید' });
            return;
        }
        setIsSalarySubmitting(true);
        const period = activeTab === 'weekly' ? weekPeriod : monthPeriod;
        router.post('/finance/salary-request', {
            worker_id: salaryForm.worker_id,
            type: activeTab,
            period,
            note: salaryForm.note,
            amount: toLatin(salaryForm.amount),
            password: salaryForm.password,
        }, {
            preserveScroll: true,
            onSuccess: () => setSalaryErrors({}),
            onError: (errs) => {
                setSalaryErrors(errs || {});
                setIsSalarySubmitting(false);
            },
        });
    };

    const handleStatusUpdate = (id: number, status: 'approved' | 'rejected') => {
        router.patch(`/finance/salary-request/${id}`, { status }, { preserveScroll: true });
    };

    const isFinanceValid = formData.worker_id && formData.price && formData.description && formData.password;
    const isSalaryValid = salaryForm.worker_id && salaryForm.amount && salaryForm.password;

    const selectedWorker = workers.find(w => String(w.id) === salaryForm.worker_id) ?? null;
    const currentLimit = activeTab === 'weekly' ? selectedWorker?.weekly_salary_limit : selectedWorker?.monthly_salary_limit;
    const amountNum = parseInt(toLatin(salaryForm.amount), 10);
    const isOverLimit = currentLimit != null && !isNaN(amountNum) && amountNum > currentLimit;

    const formatNumber = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

    const statusLabel = (s: string) => s === 'pending' ? 'در انتظار' : s === 'approved' ? 'تایید شده' : 'رد شده';
    const statusClass = (s: string) =>
        s === 'pending' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
        s === 'approved' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
        'border-rose-500/30 bg-rose-500/10 text-rose-400';

    const nowMoment = moment();
    const weekLabel = `هفته ${nowMoment.locale('fa').jWeek()} — ${nowMoment.locale('fa').format('jMMMM jYYYY')}`;
    const monthLabel = nowMoment.locale('fa').format('jMMMM jYYYY');

    const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-right text-base text-slate-200 placeholder-slate-600 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50';
    const selectClass = 'w-full appearance-none rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-right text-base text-slate-200 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50';

    const tabs = [
        { key: 'weekly', label: 'درخواست هفتگی' },
        { key: 'monthly', label: 'درخواست ماهانه' },
        { key: 'finance', label: 'ثبت تراکنش' },
    ] as const;

    const currentRequests = activeTab === 'weekly' ? weeklyRequests : activeTab === 'monthly' ? monthlyRequests : [];

    return (
        <>
            <Head title="امور مالی - الف شاپ" />

            <div className="min-h-screen" style={{ background: '#050a12' }}>
                <div className="max-w-4xl mx-auto p-4 md:p-6">

                    {/* Header */}
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-teal-400/70 mb-1">الف شاپ</p>
                            <h1 className="text-3xl font-black text-white">امور مالی</h1>
                            <p className="text-sm text-slate-400 mt-1">درخواست حقوق و ثبت تراکنش‌های مالی</p>
                        </div>
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 font-bold rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-blue-300 transition-all duration-200 hover:bg-blue-500/20"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            ورود و خروج
                        </a>
                    </div>

                    {/* Flash */}
                    {showSuccess && (flash?.message || flash?.success) && (
                        <div className="mb-6 animate-fadeIn rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-teal-300">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {flash?.message || flash?.success}
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="mb-6 flex gap-2 rounded-2xl border border-slate-700/50 bg-slate-900/80 p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                    activeTab === tab.key
                                        ? 'bg-teal-500 text-white shadow-[0_2px_10px_rgba(20,184,166,0.4)]'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Salary Request Form */}
                    {(activeTab === 'weekly' || activeTab === 'monthly') && (
                        <div className="space-y-6">
                            {/* Request Form */}
                            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-200">
                                            {activeTab === 'weekly' ? 'درخواست حقوق هفتگی' : 'درخواست حقوق ماهانه'}
                                        </h2>
                                        <p className="text-xs text-teal-400/80 mt-0.5">
                                            {activeTab === 'weekly' ? weekLabel : monthLabel}
                                        </p>
                                    </div>
                                    <div className={`rounded-xl border px-3 py-1.5 text-xs font-medium ${
                                        activeTab === 'weekly'
                                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                            : 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                                    }`}>
                                        {activeTab === 'weekly' ? 'هفتگی' : 'ماهانه'}
                                    </div>
                                </div>

                                {salaryErrors.general && (
                                    <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
                                        {salaryErrors.general}
                                    </div>
                                )}

                                {/* Worker Select */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        انتخاب نام <span className="text-teal-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="worker_id"
                                            value={salaryForm.worker_id}
                                            onChange={handleSalaryChange}
                                            className={selectClass}
                                            disabled={isSalarySubmitting}
                                        >
                                            <option value="" style={{ background: '#1e293b' }}>انتخاب نام</option>
                                            {workers.map(w => (
                                                <option key={w.id} value={w.id} style={{ background: '#1e293b' }}>{w.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-400">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        مبلغ درخواستی <span className="text-teal-400">*</span>
                                        {currentLimit != null && (
                                            <span className="mr-2 text-xs font-normal text-slate-500">
                                                (سقف: <span className="text-amber-400 font-semibold">{formatNumber(currentLimit)}</span> تومان)
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            dir="rtl"
                                            name="amount"
                                            value={salaryForm.amount}
                                            onChange={handleSalaryChange}
                                            placeholder="مبلغ مورد نظر را وارد کنید"
                                            className={`w-full rounded-xl border bg-slate-800/80 px-4 py-3.5 text-right text-base text-slate-100 placeholder-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                                                isOverLimit
                                                    ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
                                                    : 'border-slate-700 focus:border-teal-500 focus:ring-teal-500/20'
                                            }`}
                                            disabled={isSalarySubmitting}
                                        />
                                    </div>
                                    {isOverLimit && (
                                        <p className="mt-2 text-sm text-rose-400 flex items-center gap-1.5">
                                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z" />
                                            </svg>
                                            مبلغ از سقف مجاز ({formatNumber(currentLimit!)} تومان) بیشتر است
                                        </p>
                                    )}
                                    {salaryErrors.amount && (
                                        <p className="mt-2 text-sm text-rose-400 flex items-center gap-1.5">
                                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z" />
                                            </svg>
                                            {salaryErrors.amount}
                                        </p>
                                    )}
                                </div>

                                {/* Note */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">توضیحات (اختیاری)</label>
                                    <textarea
                                        name="note"
                                        value={salaryForm.note}
                                        onChange={handleSalaryChange}
                                        placeholder="در صورت نیاز توضیحی بنویسید..."
                                        rows={2}
                                        className={`${inputClass} resize-none`}
                                        disabled={isSalarySubmitting}
                                    />
                                </div>

                                {/* Password */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        رمز عبور <span className="text-teal-400">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={salaryForm.password}
                                        onChange={handleSalaryChange}
                                        placeholder="رمز عبور پرسنل را وارد کنید"
                                        className={`${inputClass} ${salaryErrors.password ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                                        disabled={isSalarySubmitting}
                                    />
                                    {salaryErrors.password && (
                                        <p className="mt-2 text-sm text-rose-400 flex items-center gap-1.5">
                                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z" />
                                            </svg>
                                            {salaryErrors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-700/50">
                                    <button
                                        type="button"
                                        onClick={handleSubmitSalary}
                                        disabled={!isSalaryValid || isSalarySubmitting || isOverLimit}
                                        className={`w-full rounded-xl py-3.5 px-4 font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                                            isSalaryValid && !isSalarySubmitting && !isOverLimit
                                                ? 'bg-teal-500 text-white shadow-[0_4px_15px_rgba(20,184,166,0.3)] hover:bg-teal-400'
                                                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                        }`}
                                    >
                                        {isSalarySubmitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                در حال ارسال...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                ارسال درخواست {activeTab === 'weekly' ? 'هفتگی' : 'ماهانه'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Requests List */}
                            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm overflow-hidden">
                                <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-base font-bold text-white">
                                        درخواست‌های {activeTab === 'weekly' ? 'هفته جاری' : 'ماه جاری'}
                                    </h2>
                                    <span className="rounded-full border border-slate-600/50 bg-slate-800/80 px-3 py-1 text-xs text-slate-400">
                                        {currentRequests.length} درخواست
                                    </span>
                                </div>

                                {currentRequests.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="mb-3 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5">
                                                <svg className="h-10 w-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <p className="text-slate-400 font-medium">هنوز درخواستی ثبت نشده</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-700/30">
                                        {currentRequests.map(req => (
                                            <div key={req.id} className="flex items-center justify-between px-6 py-4 hover:bg-teal-500/5 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-2.5">
                                                        <svg className="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-100">{req.worker.name}</p>
                                                        {req.amount != null && (
                                                            <p className="text-xs text-amber-400 font-semibold mt-0.5">
                                                                {new Intl.NumberFormat('fa-IR').format(req.amount)} تومان
                                                            </p>
                                                        )}
                                                        {req.note && <p className="text-xs text-slate-500 mt-0.5">{req.note}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusClass(req.status)}`}>
                                                        {statusLabel(req.status)}
                                                    </span>
                                                    {req.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'approved')}
                                                                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20"
                                                            >
                                                                تایید
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                                                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition-all hover:bg-rose-500/20"
                                                            >
                                                                رد
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Finance Transaction Form */}
                    {activeTab === 'finance' && (
                        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                            <h2 className="text-base font-bold text-slate-200 mb-6 pb-4 border-b border-slate-700/50">اطلاعات تراکنش</h2>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    انتخاب پرسنل <span className="text-teal-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="worker_id"
                                        value={formData.worker_id}
                                        onChange={handleChange}
                                        className={selectClass}
                                        disabled={isSubmitting}
                                    >
                                        <option value="" style={{ background: '#1e293b' }}>انتخاب نام</option>
                                        {workers.map(w => (
                                            <option key={w.id} value={w.id} style={{ background: '#1e293b' }}>{w.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-slate-400">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    مبلغ <span className="text-teal-400">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        dir="rtl"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="مبلغ را وارد کنید"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-right text-base text-slate-100 placeholder-slate-600 transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    توضیحات <span className="text-teal-400">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="توضیحات عملیات مالی..."
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    رمز پرسنل <span className="text-teal-400">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="رمز پرسنل را وارد کنید"
                                    className={`${inputClass} ${errors.password ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${shakePassword ? 'animate-pulse' : ''}`}
                                    disabled={isSubmitting}
                                />
                                {errors.password && (
                                    <p className="mt-2 text-sm text-rose-400 flex items-center gap-1.5">
                                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z" />
                                        </svg>
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-700/50">
                                <button
                                    type="button"
                                    onClick={handleSubmitFinance}
                                    disabled={!isFinanceValid || isSubmitting}
                                    className={`w-full rounded-xl py-3.5 px-4 font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                                        isFinanceValid && !isSubmitting
                                            ? 'bg-teal-500 text-white shadow-[0_4px_15px_rgba(20,184,166,0.3)] hover:bg-teal-400'
                                            : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            در حال ثبت...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            ثبت عملیات مالی
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Nav links */}
                    <div className="mt-6 flex gap-3">
                        <a href="/finance/list" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400">
                            لیست تراکنش‌ها
                        </a>
                        <a href="/attendance-list" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400">
                            گزارش حضور
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
