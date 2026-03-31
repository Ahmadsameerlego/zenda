import { StorefrontHomePublic } from '../../types/storefront';

interface FooterProps {
    store: StorefrontHomePublic;
    isArabic: boolean;
}

export function Footer({ store, isArabic }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-card py-12 md:py-20 border-t border-gray-50" dir={isArabic ? "rtl" : "ltr"}>
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-12">

                    {/* Store Title / Logo */}
                    <div className="flex flex-col items-center gap-3">
                        <span className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase">
                            {store.store_name}
                        </span>
                        <div className="w-10 h-1 bg-gray-900 rounded-full" />
                    </div>

                    {/* Simple Links */}
                    <nav className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                        <button className="text-[10px] font-black text-muted-foreground hover:text-foreground tracking-[0.2em] uppercase transition-colors">{isArabic ? 'سياسة الخصوصية' : 'PRIVACY'}</button>
                        <button className="text-[10px] font-black text-muted-foreground hover:text-foreground tracking-[0.2em] uppercase transition-colors">{isArabic ? 'الشروط والأحكام' : 'TERMS'}</button>
                        <button className="text-[10px] font-black text-muted-foreground hover:text-foreground tracking-[0.2em] uppercase transition-colors">{isArabic ? 'الشحن والتوصيل' : 'SHIPPING'}</button>
                    </nav>

                    {/* Bottom Info */}
                    <div className="flex flex-col items-center gap-6 pt-12 border-t border-gray-50 w-full">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                            © {currentYear} {store.store_name}. {isArabic ? 'جميع الحقوق محفوظة.' : 'ALL RIGHTS RESERVED.'}
                        </p>

                        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full border border-border group hover:bg-black hover:border-black cursor-pointer transition-all">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-white/40">{isArabic ? 'بدعم من' : 'POWERED BY'}</span>
                            <span className="text-[10px] font-black text-foreground group-hover:text-white tracking-tighter">ZENDA</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
