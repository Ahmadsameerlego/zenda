import { StorefrontProduct } from '../../types/storefront';
import { ProductCard } from './ProductCard';
import { useNavigate } from 'react-router';

interface ProductGridProps {
    id?: string;
    title: string;
    products: StorefrontProduct[];
    isArabic: boolean;
    showPrices: boolean;
    showStock: boolean;
    primaryColor: string;
    accentColor: string;
    cardRadius: string;
    buttonRadius: string;
    slug: string;
    onOrder?: (product: any) => void;
}

export function ProductGrid({
    id,
    title,
    products,
    isArabic,
    showPrices,
    showStock,
    primaryColor,
    accentColor,
    cardRadius,
    buttonRadius,
    slug,
    onOrder
}: ProductGridProps) {
    const navigate = useNavigate();

    return (
        <div id={id} className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
                <div className="text-center md:text-right space-y-4">
                    <span className="text-[10px] font-black tracking-[0.4em] text-muted-foreground uppercase block">
                        {isArabic ? "مختاراتنا لك" : "HANDPICKED FOR YOU"}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight">
                        {title}
                    </h2>
                </div>

                <button
                    className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] hover:text-muted-foreground transition-colors"
                    onClick={() => navigate(`/store/${slug}/products`)}
                >
                    {isArabic ? "عرض الكل" : "VIEW ALL"}
                    <div className="w-12 h-px bg-gray-900 group-hover:w-16 transition-all" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        isArabic={isArabic}
                        showPrices={showPrices}
                        showStock={showStock}
                        primaryColor={primaryColor}
                        cardRadius={cardRadius}
                        buttonRadius={buttonRadius}
                        slug={slug}
                        onOrder={onOrder}
                    />
                ))}
            </div>
        </div>
    );
}
