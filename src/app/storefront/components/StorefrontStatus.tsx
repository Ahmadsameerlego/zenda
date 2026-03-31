export function StorefrontSkeleton() {
    return (
        <div className="min-h-screen bg-muted overflow-hidden" dir="rtl">
            {/* Hero Skeleton */}
            <div className="h-[40vh] bg-gray-200 relative">
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4">
                    <div className="size-32 rounded-3xl bg-card p-2 shadow-xl">
                        <div className="w-full h-full bg-accent text-accent-foreground rounded-2xl" />
                    </div>
                    <div className="h-10 w-64 bg-gray-200 rounded-xl" />
                    <div className="h-4 w-48 bg-gray-200 rounded-lg" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="max-w-7xl mx-auto px-6 mt-32 space-y-20">
                {/* Buttons Skeleton */}
                <div className="flex justify-center gap-6">
                    <div className="h-14 w-48 bg-gray-200 rounded-2xl" />
                    <div className="h-14 w-48 bg-gray-200 rounded-2xl" />
                </div>

                {/* Section Skeleton */}
                <div className="space-y-10">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="h-10 w-48 bg-gray-200 rounded-xl" />
                        <div className="h-1.5 w-20 bg-gray-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/5] bg-card rounded-3xl border border-border p-4 space-y-4 shadow-sm">
                                <div className="aspect-[4/4] bg-accent text-accent-foreground rounded-2xl" />
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-accent text-accent-foreground rounded" />
                                    <div className="h-6 w-1/2 bg-accent text-accent-foreground rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Storefront404() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-card p-6" dir="rtl">
            <div
                className="max-w-md w-full text-center space-y-8"
            >
                <div className="relative">
                    <div className="size-48 bg-green-50 rounded-full mx-auto flex items-center justify-center">
                        <span className="text-8xl font-black text-green-300">404</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-foreground">المتجر غير موجود</h1>
                    <p className="text-muted-foreground font-medium leading-relaxed px-10">
                        عذراً، يبدو أنك وصلت لرابط غير صحيح أو أن المتجر لم يعد متاحاً حالياً.
                    </p>
                </div>
                <div className="pt-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-gray-900 text-white px-10 h-14 rounded-2xl font-bold hover:bg-gray-800 shadow-xl shadow-gray-200"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        </div>
    );
}
