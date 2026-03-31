import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Loader2, ChevronLeft, Calendar, User } from 'lucide-react';
import { storefrontApi } from '../../services/storefrontApi';
import { StorefrontHomePublic, StorefrontPage } from '../../types/storefront';
import { StorefrontLayout } from '../components/StorefrontLayout';
import { cn } from '../../components/ui/utils';

export default function InfoPage() {
    const { slug, pageKey } = useParams<{ slug: string, pageKey: string }>();
    const navigate = useNavigate();
    const [store, setStore] = useState<StorefrontHomePublic | null>(null);
    const [page, setPage] = useState<StorefrontPage | null>(null);
    const [allPages, setAllPages] = useState<StorefrontPage[]>([]);
    const [loading, setLoading] = useState(true);

    const isArabic = true;
    const primaryColor = store?.primary_color || '#000000';

    useEffect(() => {
        if (!slug || !pageKey) return;
        const load = async () => {
            setLoading(true);
            const [storeData, pagesData] = await Promise.all([
                storefrontApi.getStoreHome(slug),
                storefrontApi.getStorePages(slug)
            ]);

            const currentPage = pagesData.find(p => p.page_key === pageKey);

            setStore(storeData);
            setAllPages(pagesData);
            setPage(currentPage || null);
            setLoading(false);
        };
        load();
    }, [slug, pageKey]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!store || !page) return <div>Page not found</div>;

    return (
        <StorefrontLayout store={store} pages={allPages} isArabic={isArabic}>
            {/* Header / Banner */}
            <section className="bg-muted border-b border-border py-24 md:py-32">
                <div className="max-w-4xl mx-auto px-6 space-y-6">
                    <button
                        onClick={() => navigate(`/store/${slug}`)}
                        className="flex items-center gap-2 text-muted-foreground font-black hover:text-foreground transition-colors uppercase tracking-widest text-xs"
                    >
                        <ChevronLeft className="size-4" />
                        {isArabic ? 'العودة للرئيسية' : 'Back Home'}
                    </button>
                    <h1 className="text-4xl md:text-7xl font-[1000] text-foreground tracking-tighter">
                        {page.title}
                    </h1>
                    <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            {isArabic ? 'آخر تحديث: ٢٠ مارس ٢٠٢٤' : 'Last update: March 20, 2024'}
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="size-4" />
                            {store.store_name}
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-6 py-20 md:py-32">
                <article className="prose prose-2xl prose-gray max-w-none">
                    <div
                        className="text-xl md:text-2xl text-muted-foreground leading-[1.8] font-medium whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </article>

                {/* Sidebar-like Footer Navigation */}
                {allPages.length > 1 && (
                    <div className="mt-32 pt-20 border-t border-border space-y-8">
                        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">
                            {isArabic ? 'روابط هامة أخرى' : 'OTHER IMPORTANT LINKS'}
                        </h4>
                        <div className="flex flex-wrap gap-4">
                            {allPages.filter(p => p.page_key !== pageKey).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => navigate(`/store/${slug}/page/${p.page_key}`)}
                                    className="px-8 h-14 rounded-2xl bg-muted text-foreground font-black hover:bg-gray-900 hover:text-white transition-all border border-border"
                                >
                                    {p.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </StorefrontLayout>
    );
}
