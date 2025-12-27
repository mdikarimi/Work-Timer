import { Head, Link } from '@inertiajs/react';

type Attendance = {
    id: number;
    status: string;
    created_at: string;
};

type Finance = {
    id: number;
    description: string;
    price: number;
    created_at: string;
};

type PageProps = {
    worker: { id: number; name: string; code?: string };
    attendance: { data: Attendance[] };
    finances: { data: Finance[] };
    total_paid: number;
};

export default function WorkerReport({ worker, attendance, finances, total_paid }: PageProps) {
    
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fa-IR');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    };

    return (
        <>
            <Head title={`گزارش ${worker.name}`} />

            <div className="bg-gray-100 min-h-screen pb-10">
                <div className="max-w-6xl mx-auto p-4 md:p-6">
                    
                    {/* Header & Back Button */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin"
                                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l7-7-7-7" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900">{worker.name}</h1>
                                <p className="text-gray-500 text-sm">مشاهده سوابق و عملکرد</p>
                            </div>
                        </div>
                        
                        {/* Summary Card */}
                        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg w-full md:w-auto text-center">
                            <span className="text-blue-100 text-xs block mb-1">مجموع دریافتی</span>
                            <span className="text-xl font-bold">{formatPrice(total_paid)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Attendance Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    حضور و غیاب اخیر
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {attendance.data.length > 0 ? (
                                    attendance.data.map((item) => (
                                        <div key={item.id} className="p-4 flex justify-between items-center">
                                            <span className="text-gray-600 text-sm font-medium">{formatDate(item.created_at)}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                item.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {item.status === 'present' ? 'حاضر' : 'غایب'}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-10 text-center text-gray-400 text-sm">دیتایی ثبت نشده است</p>
                                )}
                            </div>
                        </div>

                        {/* Finance Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    تراکنش‌های مالی
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {finances.data.length > 0 ? (
                                    finances.data.map((item) => (
                                        <div key={item.id} className="p-4 flex flex-col gap-2">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-gray-800 text-sm">{item.description}</span>
                                                <span className="text-purple-700 font-black text-sm">{formatPrice(item.price)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-gray-400">{formatDate(item.created_at)}</span>
                                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">نقدی / مساعده</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-10 text-center text-gray-400 text-sm">تراکنشی یافت نشد</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-xs">
                            این گزارش بر اساس اطلاعات ثبت شده در سیستم «الف شاپ» استخراج شده است.
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}