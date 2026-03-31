import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { ShoppingBag, ChevronLeft, MapPin, User, Phone, Truck, CreditCard, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { storefrontApi } from '../../services/storefrontApi';
import { StorefrontHomePublic, StorefrontProduct, StorefrontPage } from '../../types/storefront';
import { StorefrontLayout } from '../components/StorefrontLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../components/ui/utils';

export default function CheckoutPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [store, setStore] = useState<StorefrontHomePublic | null>(null);
    const [pages, setPages] = useState<StorefrontPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'checkout' | 'success'>('checkout');
    const [orderId, setOrderId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        address: '',
        notes: ''
    });

    const isArabic = true;
    const primaryColor = store?.primary_color || '#000000';

    // Mock cart data from location state or fallback
    const cartItems = useMemo(() => {
        return location.state?.items || [];
    }, [location.state]);

    useEffect(() => {
        if (!slug) return;
        const loadStore = async () => {
            const [storeData, pagesData] = await Promise.all([
                storefrontApi.getStoreHome(slug),
                storefrontApi.getStorePages(slug)
            ]);
            setStore(storeData);
            setPages(pagesData);
            setLoading(false);
        };
        loadStore();
    }, [slug]);

    const totals = useMemo(() => {
        const subtotal = cartItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const shipping = 50; // Mock shipping
        return {
            subtotal,
            shipping,
            total: subtotal + shipping
        };
    }, [cartItems]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        setSubmitting(true);
        const result = await storefrontApi.createOrder({
            store_id: store!.store_id,
            customer_name: formData.name,
            customer_phone: formData.phone,
            address: formData.address,
            city: formData.city,
            items: cartItems.map((i: any) => ({
                product_id: i.id,
                quantity: i.quantity,
                price: i.price
            })),
            total_amount: totals.total
        });

        if (result.success) {
            setOrderId(result.order_id);
            setStep('success');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setSubmitting(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!store) return <div>Store not found</div>;

    return (
        <StorefrontLayout store={store} pages={pages} isArabic={isArabic}>
            {/* Minimal Sub-Header / Breadcrumb */}
            <div className="bg-card border-b border-border py-6">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground font-black hover:text-foreground uppercase tracking-widest text-xs">
                        <ChevronLeft className="size-4" />
                        {isArabic ? 'العودة للمتجر' : 'Back to Store'}
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{isArabic ? 'إتمام الطلب آمن' : 'SECURE CHECKOUT'}</p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
                {step === 'checkout' ? (
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                        {/* Left: Shipping Form */}
                        <div className="flex-[1.5] space-y-12">
                            <div className="space-y-10">
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-2xl">
                                        <Truck className="size-6" />
                                    </div>
                                    <h2 className="text-4xl font-[1000] text-foreground tracking-tighter">
                                        {isArabic ? 'معلومات الشحن' : 'Shipping Information'}
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} id="checkout-form" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3 md:col-span-2">
                                        <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</Label>
                                        <div className="relative group">
                                            <User className="absolute right-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                            <Input
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                                                placeholder={isArabic ? 'أدخل اسمك هنا...' : 'Enter your name...'}
                                                className="h-16 pr-14 rounded-[1.25rem] border-border bg-card font-bold focus:shadow-2xl focus:border-gray-900 transition-all text-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">{isArabic ? 'رقم الهاتف' : 'Phone Number'}</Label>
                                        <div className="relative group">
                                            <Phone className="absolute right-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                            <Input
                                                required
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                                                placeholder="01xxxxxxxxx"
                                                className="h-16 pr-14 rounded-[1.25rem] border-border bg-card font-bold focus:shadow-2xl focus:border-gray-900 transition-all text-lg"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">{isArabic ? 'المدينة' : 'City'}</Label>
                                        <Input
                                            required
                                            value={formData.city}
                                            onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                                            placeholder={isArabic ? 'مثال: القاهرة' : 'e.g. Cairo'}
                                            className="h-16 px-6 rounded-[1.25rem] border-border bg-card font-bold focus:shadow-2xl focus:border-gray-900 transition-all text-lg"
                                        />
                                    </div>

                                    <div className="space-y-3 md:col-span-2">
                                        <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest mr-1">{isArabic ? 'العنوان بالتفصيل' : 'Detailed Address'}</Label>
                                        <div className="relative group">
                                            <MapPin className="absolute right-5 top-6 size-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                            <textarea
                                                required
                                                value={formData.address}
                                                onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                                                placeholder={isArabic ? 'اسم الشارع، رقم المبنى، الشقة...' : 'Street name, bldg no, flat...'}
                                                className="w-full min-h-[140px] pr-14 pt-6 rounded-[1.25rem] border border-border bg-card font-bold focus:shadow-2xl focus:border-gray-900 transition-all outline-none p-6 text-lg"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="size-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-2xl">
                                        <CreditCard className="size-6" />
                                    </div>
                                    <h2 className="text-4xl font-[1000] text-foreground tracking-tighter">
                                        {isArabic ? 'طريقة الدفع' : 'Payment Method'}
                                    </h2>
                                </div>

                                <div className="p-8 rounded-[2.5rem] bg-gray-900 text-white flex items-center justify-between border border-white/10 shadow-2xl">
                                    <div className="flex items-center gap-6">
                                        <div className="size-16 rounded-2xl bg-card/10 flex items-center justify-center">
                                            <Truck className="size-8" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-xl font-black">{isArabic ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</p>
                                            <p className="text-sm font-bold text-white/40">{isArabic ? 'ادفع نقداً عند استلام طلبك' : 'Pay when you receive your order'}</p>
                                        </div>
                                    </div>
                                    <div className="size-8 rounded-full bg-primary flex items-center justify-center shadow-lg" style={{ backgroundColor: primaryColor }}>
                                        <CheckCircle2 className="size-5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Summary Sidebar */}
                        <div className="flex-1">
                            <div className="bg-card rounded-[3rem] border border-border shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-10 md:p-12 sticky top-36 space-y-10">
                                <h3 className="text-3xl font-[1000] text-foreground tracking-tighter border-b border-gray-50 pb-6">{isArabic ? 'ملخص الطلب' : 'Order Summary'}</h3>

                                <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                                    {cartItems.length > 0 ? cartItems.map((item: any) => (
                                        <div key={item.id} className="flex gap-6 items-center">
                                            <div className="size-20 rounded-[1.5rem] bg-muted border border-border overflow-hidden shrink-0 shadow-sm">
                                                <img src={item.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 space-y-1.5">
                                                <h4 className="font-black text-foreground leading-tight">{item.name}</h4>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{isArabic ? 'الكمية' : 'Qty'}: {item.quantity}</p>
                                                    <p className="font-black text-base" style={{ color: primaryColor }}>{(item.price || 0).toLocaleString()} ج.م</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center text-muted-foreground font-black">{isArabic ? 'سلتك فارغة' : 'YOUR CART IS EMPTY'}</div>
                                    )}
                                </div>

                                <div className="space-y-5 pt-8 border-t border-gray-50">
                                    <div className="flex justify-between text-muted-foreground font-black text-sm uppercase tracking-widest">
                                        <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                        <span className="text-foreground">{(totals.subtotal || 0).toLocaleString()} ج.م</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground font-black text-sm uppercase tracking-widest">
                                        <span>{isArabic ? 'تكلفة الشحن' : 'Shipping'}</span>
                                        <span className="text-foreground">{(totals.shipping || 0).toLocaleString()} ج.م</span>
                                    </div>
                                    <div className="flex justify-between pt-6 border-t border-border">
                                        <span className="text-2xl font-black text-foreground tracking-tight">{isArabic ? 'الإجمالي' : 'Total'}</span>
                                        <span className="text-3xl font-[1000]" style={{ color: primaryColor }}>{(totals.total || 0).toLocaleString()} ج.م</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={submitting || cartItems.length === 0}
                                    className="w-full h-20 text-xl font-[1000] gap-4 shadow-2xl group transition-all active:scale-[0.98]"
                                    style={{
                                        backgroundColor: primaryColor,
                                        borderRadius: store.button_radius === 'full' ? '9999px' : '1.5rem'
                                    }}
                                >
                                    {submitting ? <Loader2 className="size-6 animate-spin" /> : <ShieldCheck className="size-6" />}
                                    {isArabic ? 'تأكيد الطلب الآن' : 'PLACE ORDER NOW'}
                                </Button>

                                <div className="flex items-center justify-center gap-4 py-2 opacity-50">
                                    <ShieldCheck className="size-4 text-green-500" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{isArabic ? 'تشفير آمن للبيانات 100%' : '100% SECURE & ENCRYPTED'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto py-20 text-center space-y-12">
                        <div className="size-32 rounded-[2.5rem] bg-green-50 flex items-center justify-center text-green-500 mx-auto shadow-2xl shadow-green-100/50">
                            <CheckCircle2 className="size-16" />
                        </div>
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-7xl font-[1000] text-foreground tracking-tighter">
                                {isArabic ? 'شكراً لطلبك!' : 'Thank You!'}
                            </h1>
                            <p className="text-xl text-muted-foreground font-bold max-w-md mx-auto leading-relaxed">
                                {isArabic
                                    ? `تم تسجيل طلبك بنجاح بالرقم #${orderId}. سنقوم بالتواصل معك قريباً لتأكيد الشحن.`
                                    : `Your order #${orderId} has been placed. We'll contact you soon for confirmation.`}
                            </p>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-card border border-border shadow-2xl space-y-8">
                            <Button
                                onClick={() => navigate(`/store/${slug}`)}
                                className="w-full h-20 rounded-[1.5rem] font-black text-xl gap-4 shadow-xl"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {isArabic ? 'العودة للتسوق' : 'CONTINUE SHOPPING'}
                                <ArrowRight className="size-6" />
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </StorefrontLayout>
    );
}
