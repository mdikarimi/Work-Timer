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
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800 shadow-sm">
            {text}
        </div>
    );
}
