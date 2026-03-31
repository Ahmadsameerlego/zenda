import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { StorefrontHomePublic, StorefrontPage } from '../../types/storefront';
import { QuickOrderDrawer } from './QuickOrderDrawer';

interface StorefrontLayoutProps {
    children: ReactNode;
    store: StorefrontHomePublic;
    pages: StorefrontPage[];
    isArabic: boolean;
    categories?: string[];
    selectedCategory?: string;
}

export function StorefrontLayout({
    children,
    store,
    pages,
    isArabic,
}: StorefrontLayoutProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <div className="min-h-screen bg-card" dir={isArabic ? 'rtl' : 'ltr'}>
            <Header
                store={store}
                pages={pages}
                isArabic={isArabic}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main className="min-h-[calc(100vh-80px)]">
                {children}
            </main>

            <Footer store={store} isArabic={isArabic} />

            <QuickOrderDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                store={store}
                isArabic={isArabic}
            />
        </div>
    );
}
