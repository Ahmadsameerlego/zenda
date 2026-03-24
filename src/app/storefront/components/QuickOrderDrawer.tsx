import { useState } from 'react';
import { ShoppingBag, X, CheckCircle2, User, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { StorefrontHomePublic, StorefrontProduct } from '../../types/storefront';
import { cn } from '../../components/ui/utils';

interface QuickOrderDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    store: StorefrontHomePublic;
    product?: StorefrontProduct | null;
    isArabic: boolean;
}

export function QuickOrderDrawer({ isOpen, onClose, store, product, isArabic }: QuickOrderDrawerProps) {
    const primaryColor = store.primary_color || '#000000';
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setStep('success');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-all duration-500"
            />

            {/* Side Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 w-full md:w-[450px] bg-white shadow-2xl z-[101] flex flex-col transition-transform duration-500 ease-out",
                    isArabic ? "right-0" : "left-0",
                    isOpen ? "translate-x-0" : (isArabic ? "translate-x-full" : "-translate-x-full")
                )}
                dir={isArabic ? 'rtl' : 'ltr'}
            >
                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-50">
                    <div className="space-y-1">
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                            {isArabic ? 'طلب المنتج' : 'Complete Order'}
                        </h3>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            {isArabic ? 'خطوة واحدة بسيطة' : 'ONE SIMPLE STEP'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {step === 'form' ? (
                        <div className="space-y-10">
                            {/* Product Summary */}
                            {product && (
                                <div className="flex gap-5 p-5 rounded-2xl bg-gray-50/50 border border-gray-100 items-center">
                                    <div className="size-24 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0 shadow-sm">
                                        <img src={product.main_image_url} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-900 leading-tight line-clamp-2">{product.name}</h4>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-black text-gray-900">
                                                {(product.sale_price || product.base_price)?.toLocaleString()}
                                                <span className="text-[10px] mr-1 text-gray-400 uppercase tracking-widest">{isArabic ? 'ج.م' : 'EGP'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                            {isArabic ? 'الاسم بالكامل' : 'FULL NAME'}
                                        </Label>
                                        <div className="relative">
                                            <User className={cn("absolute top-1/2 -translate-y-1/2 size-4 text-gray-300", isArabic ? "right-4" : "left-4")} />
                                            <Input
                                                required
                                                placeholder={isArabic ? 'الاسم...' : 'Your name...'}
                                                className={cn("h-14 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-0 font-bold transition-all", isArabic ? "pr-12" : "pl-12")}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                            {isArabic ? 'رقم الموبايل' : 'PHONE NUMBER'}
                                        </Label>
                                        <div className="relative">
                                            <Phone className={cn("absolute top-1/2 -translate-y-1/2 size-4 text-gray-300", isArabic ? "right-4" : "left-4")} />
                                            <Input
                                                required
                                                placeholder="01xxxxxxxxx"
                                                className={cn("h-14 rounded-xl border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-0 font-bold transition-all", isArabic ? "pr-12" : "pl-12")}
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
                                            {isArabic ? 'العنوان بالتفصيل' : 'SHIPPING ADDRESS'}
                                        </Label>
                                        <div className="relative">
                                            <MapPin className={cn("absolute top-4 size-4 text-gray-300", isArabic ? "right-4" : "left-4")} />
                                            <textarea
                                                required
                                                placeholder={isArabic ? 'المدينة، المنطقة، الشارع...' : 'City, Area, Street...'}
                                                className={cn("w-full min-h-[120px] pt-4 rounded-xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-0 font-bold transition-all outline-none p-4", isArabic ? "pr-12" : "pl-12")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 text-sm font-black gap-3 shadow-2xl transition-all active:scale-95 rounded-xl uppercase tracking-widest"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {loading ? <Loader2 className="size-5 animate-spin" /> : <ShoppingBag className="size-4" />}
                                        {isArabic ? 'تأكيد الطلب' : 'CONFIRM ORDER'}
                                    </Button>
                                    <p className="mt-4 text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                        {isArabic ? 'الدفع عند الاستلام متاح لجميع الطلبات' : 'Cash on delivery available for all orders'}
                                    </p>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
                            <div className="size-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 shadow-inner">
                                <CheckCircle2 className="size-12" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                    {isArabic ? 'تم بنجاح!' : 'Order Placed!'}
                                </h2>
                                <p className="text-sm text-gray-400 font-medium max-w-[280px] leading-loose">
                                    {isArabic
                                        ? 'شكراً لتسوقك معنا. سنتواصل معك لتأكيد موعد التسليم.'
                                        : 'Thank you for shopping. We will contact you to confirm delivery.'}
                                </p>
                            </div>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="h-14 px-10 rounded-xl font-black border-gray-100 hover:border-gray-900 gap-3 group"
                            >
                                {isArabic ? 'متابعة التسوق' : 'CONTINUE SHOPPING'}
                                {isArabic ? <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> : <ArrowLeft className="size-4 rotate-180 group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);
