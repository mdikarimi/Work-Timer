import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function FinanceIndex({ workers }) {
    const { flash } = usePage().props as { flash?: { message?: string | null; success?: string | null; status?: string | null } };
    const [formData, setFormData] = useState({
        worker_id: '',
        description: '',
        price: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [shakePassword, setShakePassword] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (flash?.message || flash?.success) {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    useEffect(() => {
        if (flash?.success) {
            setFormData({
                worker_id: '',
                description: '',
                price: '',
                password: '',
            });
            setIsSubmitting(false);
        }
    }, [flash]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // clear related error when the user edits the field
        if (name && errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
        if (name === 'password') {
            setShakePassword(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.worker_id || !formData.price || !formData.description || !formData.password) {
            alert('لطفاً همه فیلدهای ضروری را پر کنید');
            return;
        }
        
        setIsSubmitting(true);
        
        // استفاده از router.post بدون تابع route()
        router.post('/finance', formData, {
            preserveScroll: true,
            onSuccess: () => {
                // فرم در useEffect ریست می‌شود
                setErrors({});
            },
            onError: (errors) => {
                console.log('خطا در ثبت:', errors);
                setErrors(errors || {});
                // If password was invalid, give a visual cue
                if (errors && errors.password) {
                    setShakePassword(true);
                    setTimeout(() => setShakePassword(false), 600);
                }
                setIsSubmitting(false);
            }
        });
    };

    const isFormValid = formData.worker_id && formData.price && formData.description && formData.password;

    return (
        <>
            <Head title="ثبت امور مالی - الف شاپ" />
            
            <div className="bg-gray-100 min-h-screen">
                <div className="max-w-4xl mx-auto p-4">
                    {/* Header */}
                    <div className="mb-8  flex justify-between">
                        <h1 className="mb-2 text-4xl font-black text-gray-900">
                            <span className="text-gray-700">مدیریت امور مالی</span>
                        </h1>
                        <a
                            href="/"
                            className="inline-flex items-center font-bold rounded-lg bg-blue-300 px-6 py-3 text-blue-900 shadow-md transition hover:bg-blue-200"
                        >
                            ورود و خروج
                        </a>
                    </div>

                    {/* Success Message */}
                    {showSuccessMessage && (flash?.message || flash?.success) && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg transition-opacity duration-500">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd" />
                                </svg>
                                {flash?.message || flash?.success}
                            </div>
                        </div>
                    )}

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="mb-4">
                            <label htmlFor="worker_id" className="block text-gray-700 font-medium mb-2 text-right">
                                انتخاب نام و نام خانوادگی *
                            </label>
                            <div className="relative">
                                <select 
                                    id="worker_id"
                                    name="worker_id"
                                    value={formData.worker_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white shadow-sm text-right text-gray-600"
                                    disabled={isSubmitting}
                                >
                                    <option value="">انتخاب نام</option>
                                    {workers.map((worker) => (
                                        <option key={worker.id} value={worker.id} className="text-right">
                                            {worker.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Price Input */}
                        <div className="mb-4">
                            <label htmlFor="price" className="block text-gray-700 font-medium mb-2 text-right">
                                مبلغ (تومان) *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="مبلغ را وارد کنید"
                                    className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-left font-medium text-gray-800 placeholder-gray-400"
                                    disabled={isSubmitting}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <span className="text-gray-500 font-medium">تومان</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Input */}
                        <div className="mb-6">
                            <label htmlFor="description" className="block text-gray-700 font-medium mb-2 text-right">
                                توضیحات *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="توضیحات عملیات مالی را وارد کنید (مانند: دریافتی حقوق، دریافت وام، هزینه درمان و...)"
                                rows="3"
                                className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-right text-gray-800 placeholder-gray-400 resize-none"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-gray-700 font-medium mb-2 text-right">
                                رمز پرسنل *
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="رمز پرسنل را وارد کنید"
                                    className={`w-full px-4 py-3.5 text-base border-2 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-right text-gray-800 placeholder-gray-400 ${
                                        errors.password ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200'
                                    } ${shakePassword ? 'animate-pulse' : ''}`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-2 text-right">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12A9 9 0 1112 3a9 9 0 019 9z" />
                                    </svg>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid || isSubmitting}
                                    className={`flex-1 font-bold shadow-md py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
                                        isFormValid && !isSubmitting
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            در حال ثبت...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            ثبت عملیات مالی
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}