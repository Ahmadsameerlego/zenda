import { StorefrontProduct } from '../../types/storefront';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '../../components/ui/utils';

interface ProductCardProps {
    product: StorefrontProduct;
    isArabic: boolean;
    showPrices: boolean;
    showStock: boolean;
    primaryColor: string;
    cardRadius: string;
    buttonRadius: string;
    slug: string;
    onOrder?: (product: any) => void;
}

export function ProductCard({
    product,
    isArabic,
    showPrices,
    slug,
    onOrder
}: ProductCardProps) {
    const navigate = useNavigate();
    const hasSale = !!product.sale_price && product.sale_price < product.base_price;
    const discount = hasSale ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100) : 0;

    const handleCardClick = () => {
        const productSlug = product.slug || product.id;
        navigate(`/store/${slug}/product/${productSlug}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative flex flex-col cursor-pointer transition-all duration-500 rounded-3xl overflow-hidden bg-card"
        >
            {/* Image Wrapper */}
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="size-12 text-gray-200" strokeWidth={1} />
                    </div>
                )}

                {/* Darker Overlay on Hover */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Discount Badge */}
                {hasSale && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gray-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest shadow-xl">
                            {isArabic ? `${discount}% خصم` : `-${discount}%`}
                        </div>
                    </div>
                )}

                {/* Quick Add - Reveal on Hover */}
                <div className="absolute inset-x-6 bottom-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <button
                        className="w-full h-14 bg-card text-foreground rounded-full flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-2xl border border-white/20 hover:bg-gray-900 hover:text-white transition-all duration-300"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onOrder) onOrder(product);
                            else handleCardClick();
                        }}
                    >
                        <ShoppingBag className="size-4" />
                        {isArabic ? 'أضف للسلة' : 'ADD TO CART'}
                    </button>
                </div>
            </div>

            {/* Product Details */}
            <div className={cn(
                "py-6 px-2 space-y-3",
                isArabic ? "text-right" : "text-left"
            )}>
                <div className="space-y-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.35em]">
                        {product.category_name || (isArabic ? 'تشكيلة جديدة' : 'NEW ARRIVAL')}
                    </span>
                    <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2">
                        {product.name}
                    </h3>
                </div>

                {showPrices && (
                    <div className="flex items-baseline gap-3">
                        <span className="text-lg font-black tracking-tight text-foreground">
                            {(product.sale_price !== null && product.sale_price !== undefined) ? (
                                <>
                                    {product.sale_price.toLocaleString()}
                                    <span className="text-[10px] font-black mr-1 text-muted-foreground uppercase tracking-widest leading-none">
                                        {isArabic ? 'ج.م' : 'EGP'}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                    {isArabic ? 'اسأل عن السعر' : 'INQUIRE'}
                                </span>
                            )}
                        </span>
                        {hasSale && product.base_price && (
                            <span className="text-xs text-gray-200 line-through font-bold">
                                {product.base_price.toLocaleString()}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
