import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { storefrontApi } from '../../services/storefrontApi';
import { StorefrontHomePublic, StorefrontProduct, StorefrontPage } from '../../types/storefront';
import { Hero } from '../components/Hero';
import { ProductGrid } from '../components/ProductGrid';
import { CategorySection } from '../components/CategorySection';
import { Testimonials } from '../components/Testimonials';
import { CTASection } from '../components/CTASection';
import { BrandSection } from '../components/BrandSection';
import { TrustSection } from '../components/TrustSection';
import { StorefrontLayout } from '../components/StorefrontLayout';
import { StorefrontSkeleton, Storefront404 } from '../components/StorefrontStatus';

export default function StorefrontHome() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<StorefrontHomePublic | null>(null);
    const [featuredProducts, setFeaturedProducts] = useState<StorefrontProduct[]>([]);
    const [pages, setPages] = useState<StorefrontPage[]>([]);

    useEffect(() => {
        async function loadStorefront() {
            if (!slug) return;

            setLoading(true);
            try {
                const [storeData, featuredData, pagesData] = await Promise.all([
                    storefrontApi.getStoreHome(slug),
                    storefrontApi.getFeaturedProducts(slug),
                    storefrontApi.getStorePages(slug)
                ]);

                setStore(storeData);
                setFeaturedProducts(featuredData);
                setPages(pagesData);
            } catch (error) {
                console.error('Failed to load storefront:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStorefront();
    }, [slug]);

    if (loading) return <StorefrontSkeleton />;
    if (!store) return <Storefront404 />;

    const isArabic = store.default_language === 'ar';
    const primaryColor = store.primary_color || '#000000';

    const categories = [
        { name: isArabic ? 'الأثواب الفاخرة' : 'Luxury Abayas', image: 'https://images.unsplash.com/photo-1583394060263-f309526bdead?auto=format&fit=crop&q=80', count: 12 },
        { name: isArabic ? 'العطور الشرقية' : 'Oriental Perfumes', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80', count: 8 },
        { name: isArabic ? 'المجوهرات' : 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80', count: 24 }
    ];

    const testimonials = [
        { id: '1', name: 'أحمد محمود', content: 'تجربة تسوق رائعة، المنتجات فاخرة جداً والتوصيل كان أسرع مما توقعت.', rating: 5, role: 'عميل مميز' },
        { id: '2', name: 'سارة خالد', content: 'الجودة لا تعلى عليها، أطلب دائماً من هذا المتجر وأنا واثقة جداً.', rating: 5, role: 'عميلة دائمة' },
        { id: '3', name: 'ياسين علي', content: 'خدمة عملاء ممتازة واستجابة سريعة. المتجر يشعرك بالرقي والاحترافية.', rating: 5, role: 'عميل مميز' }
    ];

    return (
        <StorefrontLayout
            store={store}
            pages={pages}
            isArabic={isArabic}
            categories={categories.map(c => c.name)}
        >
            {/* 1. Hero Section */}
            <Hero store={store} />

            {/* 2. Categories Section */}
            <CategorySection
                categories={categories}
                isArabic={isArabic}
                primaryColor={primaryColor}
                cardRadius={store.card_radius || 'xl'}
                onCategoryClick={(cat) => navigate(`/store/${slug}/products?category=${cat}`)}
            />

            {/* 3. Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="py-24 md:py-32 bg-white relative overflow-hidden">
                    <ProductGrid
                        id="featured-products"
                        title={store.featured_products_title || (isArabic ? 'منتجاتنا المختارة' : 'Featured Products')}
                        products={featuredProducts}
                        isArabic={isArabic}
                        showPrices={store.show_prices}
                        showStock={store.show_stock}
                        primaryColor={store.primary_color}
                        accentColor={store.accent_color}
                        cardRadius={store.card_radius}
                        buttonRadius={store.button_radius}
                        slug={slug!}
                    />
                </section>
            )}

            {/* 4. Brand Section (Story) */}
            <BrandSection isArabic={isArabic} primaryColor={primaryColor} />

            {/* 5. Trust Section */}
            <TrustSection isArabic={isArabic} />

            {/* 6. Testimonials */}
            <Testimonials
                testimonials={testimonials}
                isArabic={isArabic}
                primaryColor={primaryColor}
            />

            {/* 7. Final CTA Section */}
            <CTASection
                isArabic={isArabic}
                primaryColor={store.primary_color}
            />
        </StorefrontLayout>
    );
}
