import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ShoppingBag, Search, Menu, X, MessageSquare } from 'lucide-react';
import { StorefrontHomePublic, StorefrontPage } from '../../types/storefront';
import { cn } from '../../components/ui/utils';

interface HeaderProps {
    store: StorefrontHomePublic;
    pages: StorefrontPage[];
    isArabic: boolean;
    onCartClick: () => void;
}

export function Header({ store, pages, isArabic, onCartClick }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { slug } = useParams<{ slug: string }>();
    const primaryColor = store.primary_color || '#000000';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: isArabic ? 'الرئيسية' : 'Home', path: `/store/${slug}` },
        { name: isArabic ? 'المنتجات' : 'Shop', path: `/store/${slug}/products` },
    ];

    return (
        <header
            className={cn(
                "sticky top-0 z-[100] w-full transition-all duration-300",
                isScrolled ? "bg-card/80 backdrop-blur-xl border-b border-gray-50 py-2" : "bg-transparent py-4"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between gap-8">

                    {/* 1. Left: Mobile Menu & Desktop Nav */}
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden size-10 flex items-center justify-center text-foreground"
                        >
                            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>

                        <nav className="hidden lg:flex items-center gap-10">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="text-[10px] font-black text-muted-foreground hover:text-foreground tracking-[0.2em] uppercase transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* 2. Center: Logo */}
                    <Link to={`/store/${slug}`} className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                        {store.logo_url && store.show_logo ? (
                            <img src={store.logo_url} alt={store.store_name} className="h-7 md:h-9 w-auto" />
                        ) : (
                            <span className="text-xl md:text-2xl font-black text-foreground tracking-tighter uppercase">
                                {store.store_name}
                            </span>
                        )}
                    </Link>

                    {/* 3. Right: Actions */}
                    <div className="flex items-center gap-1 md:gap-3">
                        <button className="size-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                            <Search className="size-4" />
                        </button>

                        <button
                            onClick={onCartClick}
                            className="group relative size-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                        >
                            <ShoppingBag className="size-4 group-hover:scale-110" />
                            <span
                                className="absolute top-2 right-2 size-1.5 rounded-full"
                                style={{ backgroundColor: primaryColor }}
                            />
                        </button>

                        <div className="hidden md:block w-px h-4 bg-accent text-accent-foreground mx-2" />

                        <button
                            className="hidden md:flex size-10 items-center justify-center bg-gray-900 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-200"
                            onClick={() => window.open(`https://wa.me/${store.whatsapp_phone}`, '_blank')}
                        >
                            <MessageSquare className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            <div className={cn(
                "lg:hidden fixed inset-x-0 top-[72px] bg-card border-b border-gray-50 transition-all duration-500 overflow-hidden",
                isMenuOpen ? "max-h-screen py-10 opacity-100" : "max-h-0 py-0 opacity-0"
            )}>
                <nav className="flex flex-col items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-2xl font-black text-foreground tracking-tighter uppercase"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex items-center gap-8 pt-6">
                        <button className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">{isArabic ? 'حسابي' : 'ACCOUNT'}</button>
                        <button className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">{isArabic ? 'المساعدة' : 'HELP'}</button>
                    </div>
                </nav>
            </div>
        </header>
    );
}
