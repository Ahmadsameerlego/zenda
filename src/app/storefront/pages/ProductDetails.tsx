import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ShoppingBag, MessageSquare, ChevronLeft, Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check } from 'lucide-react';
import { storefrontApi } from '../../services/storefrontApi';
import { StorefrontHomePublic, StorefrontProduct, StorefrontPage } from '../../types/storefront';
import { ProductCard } from '../components/ProductCard';
import { StorefrontLayout } from '../components/StorefrontLayout';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';

export default function ProductDetails() {
    const { slug, productSlug } = useParams<{ slug: string, productSlug: string }>();
    const navigate = useNavigate();

    // State
    const [store, setStore] = useState<StorefrontHomePublic | null>(null);
    const [product, setProduct] = useState<StorefrontProduct | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<StorefrontProduct[]>([]);
    const [pages, setPages] = useState<StorefrontPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

    const isArabic = true;
    const primaryColor = store?.primary_color || '#000000';

    useEffect(() => {
        if (!slug || !productSlug) return;
        const loadData = async () => {
            setLoading(true);
            try {
                const [storeData, productData, pagesData] = await Promise.all([
                    storefrontApi.getStoreHome(slug),
                    storefrontApi.getProductBySlug(slug, productSlug),
                    storefrontApi.getStorePages(slug)
                ]);

                if (productData) {
                    const { products: related } = await storefrontApi.getAllProducts(slug, {
                        category: productData.category_name,
                        pageSize: 4
                    });
                    setRelatedProducts(related.filter(p => p.id !== productData.id));
                }

                setStore(storeData);
                setProduct(productData);
                setPages(pagesData);
            } catch (error) {
                console.error("Failed to load product details", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug, productSlug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-200" />
            </div>
        );
    }

    if (!product || !store) return <div className="min-h-screen flex items-center justify-center font-black text-gray-400 uppercase">PRODUCT NOT FOUND</div>;

    const images = [product.image_url, ...(product.images || [])].filter(Boolean);

    return (
        <StorefrontLayout store={store} pages={pages} isArabic={isArabic}>
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* 1. Image Gallery */}
                    <div className="flex-1 space-y-6 md:sticky md:top-24 h-fit">
                        <div className="relative aspect-[3/4] bg-gray-50/50 rounded-2xl md:rounded-[2.5rem] overflow-hidden group">
                            <img
                                key={activeImage}
                                src={images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />

                            {/* Sale Badge */}
                            {product.sale_price && (
                                <div className="absolute top-6 right-6 bg-gray-900 text-white px-4 py-2 rounded-full font-black text-[10px] tracking-widest shadow-xl uppercase">
                                    {isArabic ? 'تخفيض خاص' : 'SPECIAL OFFER'}
                                </div>
                            )}

                            {/* Mobile Image Indicator */}
                            {images.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                                    {images.map((_, i) => (
                                        <div key={i} className={cn("size-1.5 rounded-full transition-all", activeImage === i ? "bg-gray-900 w-4" : "bg-gray-200")} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails (Desktop) */}
                        {images.length > 1 && (
                            <div className="hidden md:flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={cn(
                                            "size-20 rounded-xl overflow-hidden shrink-0 transition-all duration-300 border-2",
                                            activeImage === i ? "border-gray-900 opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                                        )}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Product Info */}
                    <div className={`flex-1 space-y-10 ${isArabic ? 'text-right' : 'text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                    {product.category_name || (isArabic ? 'تشكيلة مختارة' : 'CURATED PIECE')}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-[10px] font-black text-gray-900">4.9/5</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-4">
                                <span className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
                                    {((product.sale_price !== null && product.sale_price !== undefined) ? product.sale_price : (product.base_price || 0)).toLocaleString()}
                                    <span className="text-xs font-black mr-2 text-gray-400 uppercase tracking-widest">
                                        {isArabic ? 'ج.م' : 'EGP'}
                                    </span>
                                </span>
                                {product.sale_price && product.base_price && product.sale_price < product.base_price && (
                                    <span className="text-xl text-gray-200 line-through font-bold">
                                        {product.base_price.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description (Short) */}
                        <p className="text-gray-500 font-medium leading-relaxed">
                            {product.short_description || product.description?.substring(0, 160) || (isArabic ? 'لا يوجد وصف متاح لهذا المنتج.' : 'No description available for this product.')}
                        </p>

                        {/* Variants Selector */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                    {isArabic ? 'المقاس / النوع' : 'SIZE / VARIANT'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant.id)}
                                            className={cn(
                                                "px-6 h-12 rounded-xl border font-bold text-sm transition-all flex items-center gap-2",
                                                selectedVariant === variant.id
                                                    ? "border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-200"
                                                    : "border-gray-100 bg-gray-50/50 hover:border-gray-300 text-gray-500"
                                            )}
                                        >
                                            {variant.name}
                                            {selectedVariant === variant.id && <Check className="size-3" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="space-y-4 pt-6">
                            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{isArabic ? 'الكمية' : 'QUANTITY'}</h4>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="size-10 rounded-lg flex items-center justify-center hover:bg-white transition-all text-gray-400 hover:text-gray-900"
                                    >
                                        <Minus className="size-3" />
                                    </button>
                                    <span className="w-10 text-center font-black text-sm">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="size-10 rounded-lg flex items-center justify-center hover:bg-white transition-all text-gray-400 hover:text-gray-900"
                                    >
                                        <Plus className="size-3" />
                                    </button>
                                </div>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", product.stock_status === 'in_stock' ? "text-green-500" : "text-amber-500")}>
                                    {product.stock_status === 'in_stock' ? (isArabic ? 'متوفر حالياً' : 'IN STOCK') : (isArabic ? 'كمية محدودة' : 'LIMITED')}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4">
                            <Button
                                className="sm:col-span-3 h-14 md:h-16 text-sm font-black gap-3 shadow-2xl shadow-gray-200 transition-all active:scale-95 rounded-xl uppercase tracking-widest"
                                style={{ backgroundColor: primaryColor }}
                                onClick={() => navigate(`/store/${slug}/checkout?product=${product.id}&v=${selectedVariant}&q=${quantity}`)}
                            >
                                <ShoppingBag className="size-4" />
                                {isArabic ? 'إتمام الطلب الآن' : 'ORDER NOW'}
                            </Button>
                            <Button
                                variant="outline"
                                className="sm:col-span-2 h-14 md:h-16 text-sm font-black gap-2 border-gray-100 hover:border-gray-900 rounded-xl transition-all"
                                onClick={() => window.open(`https://wa.me/${store.whatsapp_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`${isArabic ? 'أهلاً، أرغب في الاستفسار عن' : 'Hello, I want to ask about'} ${product.name}`)}`, '_blank')}
                            >
                                <MessageSquare className="size-4 text-[#25D366]" />
                                {isArabic ? 'واتساب' : 'WHATSAPP'}
                            </Button>
                        </div>

                        {/* Minimal Trust Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-10">
                            {[
                                { icon: Truck, label: isArabic ? 'شحن سريع' : 'Fast Shipping' },
                                { icon: ShieldCheck, label: isArabic ? 'ضمان الجودة' : 'Quality Guaranteed' },
                                { icon: RotateCcw, label: isArabic ? 'استبدال مرن' : 'Easy Returns' },
                                { icon: Star, label: isArabic ? 'منتج أصلي' : '100% Original' }
                            ].map((badge, bI) => (
                                <div key={bI} className="flex items-center gap-3 py-3 px-4 rounded-xl border border-gray-50 bg-gray-50/20">
                                    <badge.icon className="size-4 text-gray-300" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{badge.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Extended Details */}
                <div className="mt-24 md:mt-32 border-t border-gray-100 pt-16 space-y-20">
                    <div className="max-w-4xl space-y-8">
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
                            {isArabic ? 'تفاصيل المنتج' : 'Product Information'}
                        </h2>
                        <div className={`text-base md:text-lg text-gray-500 leading-loose font-medium whitespace-pre-line ${isArabic ? 'text-right' : 'text-left'}`}>
                            {product.description || (isArabic ? 'لا يوجد وصف متاح.' : 'No description available.')}
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="space-y-12 pt-12 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                    {isArabic ? 'قد يعجبك أيضاً' : 'Related Products'}
                                </h3>
                                <button
                                    onClick={() => navigate(`/store/${slug}/products?category=${product.category_name}`)}
                                    className="text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em]"
                                >
                                    {isArabic ? 'تصفح الكل' : 'VIEW ALL'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                                {relatedProducts.map(p => (
                                    <ProductCard
                                        key={p.id}
                                        product={p}
                                        isArabic={isArabic}
                                        showPrices={true}
                                        showStock={true}
                                        primaryColor={primaryColor}
                                        cardRadius={store.card_radius || 'xl'}
                                        buttonRadius={store.button_radius || 'xl'}
                                        slug={slug!}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </StorefrontLayout>
    );
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);
