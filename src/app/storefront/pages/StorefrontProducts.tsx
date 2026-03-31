import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Search, RotateCcw, Loader2, ArrowUp } from 'lucide-react';
import { storefrontApi } from '../../services/storefrontApi';
import { StorefrontHomePublic, StorefrontProduct, StorefrontPage } from '../../types/storefront';
import { CatalogHeader } from '../components/CatalogHeader';
import { FilterSystem } from '../components/FilterSystem';
import { ProductCard } from '../components/ProductCard';
import { StorefrontLayout } from '../components/StorefrontLayout';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';

export default function StorefrontProducts() {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [store, setStore] = useState<StorefrontHomePublic | null>(null);
    const [pages, setPages] = useState<StorefrontPage[]>([]);
    const [products, setProducts] = useState<StorefrontProduct[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // Filter State (Sync with URL)
    const category = searchParams.get('category') || 'الكل';
    const sortBy = (searchParams.get('sort') as any) || 'newest';
    const minPrice = searchParams.get('min') || '';
    const maxPrice = searchParams.get('max') || '';

    const isArabic = true;
    const primaryColor = store?.primary_color || '#000000';

    // 1. Initial Load (Store Data)
    useEffect(() => {
        if (!slug) return;
        const fetchStore = async () => {
            try {
                const [storeData, pagesData] = await Promise.all([
                    storefrontApi.getStoreHome(slug),
                    storefrontApi.getStorePages(slug)
                ]);
                setStore(storeData);
                setPages(pagesData);
            } catch (error) {
                console.error("Failed to load store data", error);
            }
        };
        fetchStore();
    }, [slug]);

    // 2. Products Load (With Filters)
    useEffect(() => {
        if (!slug) return;
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { products, count } = await storefrontApi.getAllProducts(slug, {
                    category: category === 'الكل' ? undefined : category,
                    minPrice: minPrice ? parseInt(minPrice) : undefined,
                    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
                    sortBy,
                    page: 1,
                    pageSize: 12
                });
                setProducts(products);
                setTotalCount(count);
                setPage(1);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [slug, category, sortBy, minPrice, maxPrice]);

    // 3. Load More
    const handleLoadMore = async () => {
        if (!slug) return;
        setLoadMoreLoading(true);
        const nextPage = page + 1;
        try {
            const { products: newProducts } = await storefrontApi.getAllProducts(slug, {
                category: category === 'الكل' ? undefined : category,
                minPrice: minPrice ? parseInt(minPrice) : undefined,
                maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
                sortBy,
                page: nextPage,
                pageSize: 12
            });
            setProducts(prev => [...prev, ...newProducts]);
            setPage(nextPage);
        } catch (error) {
            console.error("Failed to load more products", error);
        } finally {
            setLoadMoreLoading(false);
        }
    };

    const categories = [isArabic ? 'الكل' : 'All', 'الأثواب', 'العطور', 'المجوهرات', 'الإكسسوارات'];

    const updateFilter = (params: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(params).forEach(([key, value]) => {
            if (value) newParams.set(key, value);
            else newParams.delete(key);
        });
        setSearchParams(newParams);
    };

    if (loading && !products.length) {
        return (
            <div className="min-h-screen bg-card flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-gray-200" />
            </div>
        );
    }

    if (!store) return <div className="min-h-screen flex items-center justify-center font-black text-muted-foreground">STORE NOT FOUND</div>;

    return (
        <StorefrontLayout
            store={store}
            pages={pages}
            isArabic={isArabic}
            selectedCategory={category}
            categories={categories}
        >
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Filters Sidebar (Desktop) */}
                    <FilterSystem
                        categories={categories}
                        selectedCategory={category}
                        onCategoryChange={(cat) => updateFilter({ category: cat })}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onPriceChange={(min, max) => updateFilter({ min, max })}
                        isArabic={isArabic}
                        primaryColor={primaryColor}
                        isOpen={isFilterDrawerOpen}
                        onToggle={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                    />

                    {/* Product Grid Area */}
                    <div className="flex-1 space-y-12">
                        <CatalogHeader
                            title={category === 'الكل' ? (isArabic ? 'كل المنتجات' : 'All Products') : category}
                            productCount={totalCount}
                            isArabic={isArabic}
                            onSortChange={(val) => updateFilter({ sort: val })}
                        />

                        {loading && !products.length ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-16">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
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

                                {/* Load More */}
                                {products.length < totalCount && (
                                    <div className="pt-16 flex justify-center">
                                        <Button
                                            onClick={handleLoadMore}
                                            disabled={loadMoreLoading}
                                            variant="ghost"
                                            className="h-14 px-10 rounded-xl font-black text-xs gap-3 transition-all hover:bg-muted uppercase tracking-widest border border-border"
                                        >
                                            {loadMoreLoading ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                                            {isArabic ? 'عرض المزيد' : 'LOAD MORE'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-24 flex flex-col items-center text-center space-y-6">
                                <Search className="size-16 text-gray-50" />
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-foreground">{isArabic ? 'لا توجد نتائج' : 'No results found'}</h3>
                                    <p className="text-sm text-muted-foreground font-medium">{isArabic ? 'جرب تغيير خيارات البحث أو تصفية السعر' : 'Try different filters or price range'}</p>
                                </div>
                                <Button
                                    onClick={() => updateFilter({ category: 'الكل', min: '', max: '' })}
                                    variant="outline"
                                    className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-2"
                                >
                                    {isArabic ? 'إعادة ضبط' : 'RESET FILTERS'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden fixed bottom-6 inset-x-6 z-[100] flex justify-center">
                <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="h-14 px-8 bg-gray-900 text-white rounded-full flex items-center gap-3 font-black text-xs tracking-widest shadow-2xl transition-all active:scale-95 border border-white/10"
                >
                    <Search className="size-4" />
                    {isArabic ? 'تصفية المنتجات' : 'FILTER PRODUCTS'}
                </button>
            </div>

            {/* Scroll to Top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 z-[100] size-14 bg-card border border-border shadow-xl rounded-full flex items-center justify-center text-foreground hover:bg-muted transition-all hidden md:flex"
            >
                <ArrowUp className="size-5" />
            </button>
        </StorefrontLayout>
    );
}
