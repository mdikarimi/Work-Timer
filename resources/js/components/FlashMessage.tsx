type FlashBag = {
    message?: string | null;
    success?: string | null;
    status?: string | null;
};

type Props = {
    flash?: FlashBag;
};

export default function FlashMessage({ flash }: Props) {
    const text = flash?.message || flash?.success || flash?.status;

    if (!text) {
        return null;
    }

    return (
        <div className="mb-4 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-teal-300 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
            <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {text}
            </div>
        </div>
    );
}
