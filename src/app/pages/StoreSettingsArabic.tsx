import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../../lib/supabaseClient';
import { StoreSettings, StoreSettingsFull, StorePage } from '../types';
import {
    Loader2,
    Save,
    Globe,
    Phone,
    Mail,
    MapPin,
    Share2,
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    MessageSquare,
    Facebook,
    Instagram,
    GlobeIcon,
    Palette,
    Layers,
    Eye,
    Settings2,
    Layout,
    ShoppingCart,
    Type,
    Upload,
    X,
    ImageIcon,
    ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../components/ui/select';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';

const RADIUS_OPTIONS = [
    { value: 'none', label: 'بدون (None)' },
    { value: 'sm', label: 'صغير (Small)' },
    { value: 'md', label: 'متوسط (Medium)' },
    { value: 'lg', label: 'كبير (Large)' },
    { value: 'xl', label: 'كبير جداً (XL)' },
    { value: 'full', label: 'دائري (Full)' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'الأحدث أولاً' },
    { value: 'oldest', label: 'الأقدم أولاً' },
    { value: 'price_asc', label: 'السعر: من الأقل للأعلى' },
    { value: 'price_desc', label: 'السعر: من الأعلى للأقل' },
    { value: 'name_asc', label: 'الاسم: أ-ي' },
    { value: 'name_desc', label: 'الاسم: ي-أ' },
];

const PAGE_LABELS: Record<string, string> = {
    'return_policy': 'سياسة الاسترجاع والاستبدال',
    'terms': 'الشروط والأحكام',
    'privacy': 'سياسة الخصوصية',
    'shipping': 'سياسة الشحن والتوصيل',
    'about': 'من نحن',
};

const getRadiusClass = (radius: string | undefined, type: 'button' | 'card') => {
    if (!radius) return type === 'button' ? 'rounded-md' : 'rounded-xl';
    switch (radius) {
        case 'none': return 'rounded-none';
        case 'sm': return 'rounded-sm';
        case 'md': return 'rounded-md';
        case 'lg': return 'rounded-lg';
        case 'xl': return 'rounded-xl';
        case 'full': return type === 'button' ? 'rounded-full' : 'rounded-3xl';
        default: return type === 'button' ? 'rounded-md' : 'rounded-xl';
    }
};

export function StoreSettingsArabic({ language }: { language: 'ar' | 'en' }) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Partial<StoreSettingsFull>>({});
    const [themeSettings, setThemeSettings] = useState<Partial<StoreSettingsFull>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [themeErrors, setThemeErrors] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState('basic');

    // Branding State
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [brandingSaving, setBrandingSaving] = useState(false);
    const [brandingErrors, setBrandingErrors] = useState<Record<string, string>>({});

    // Pages State
    const [pages, setPages] = useState<StorePage[]>([]);
    const [originalPages, setOriginalPages] = useState<StorePage[]>([]);
    const [selectedPageKey, setSelectedPageKey] = useState<string>('return_policy');
    const [pagesLoading, setPagesLoading] = useState(false);
    const [pagesSaving, setPagesSaving] = useState(false);
    const [pageErrors, setPageErrors] = useState<Record<string, string>>({});

    // Force RTL layout for this page as Zenda is Arabic-first
    const isArabic = language === 'ar';

    const fetchSettings = useCallback(async () => {
        if (!profile?.store_id) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('store_settings_full')
                .select('*')
                .eq('store_id', profile.store_id)
                .single();

            if (error) throw error;
            setSettings(data || {});
            setThemeSettings(data || {});
            setLogoPreview(data?.logo_url || null);
            setCoverPreview(data?.cover_url || null);
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            toast.error(isArabic ? 'فشل في تحميل الإعدادات' : 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, [profile?.store_id, isArabic]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const fetchPages = useCallback(async () => {
        if (!profile?.store_id) return;

        setPagesLoading(true);
        try {
            const { data, error } = await supabase
                .from('store_pages')
                .select('*')
                .eq('store_id', profile.store_id);

            if (error) throw error;
            setPages(data || []);
            setOriginalPages(JSON.parse(JSON.stringify(data || [])));
        } catch (err: any) {
            console.error('Error fetching pages:', err);
            toast.error(isArabic ? 'فشل في تحميل الصفحات' : 'Failed to load pages');
        } finally {
            setPagesLoading(false);
        }
    }, [profile?.store_id, isArabic]);

    useEffect(() => {
        if (activeTab === 'pages') {
            fetchPages();
        }
    }, [activeTab, fetchPages]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!settings.store_name?.trim()) {
            newErrors.store_name = isArabic ? 'اسم المتجر مطلوب' : 'Store name is required';
        }

        if (!settings.store_slug?.trim()) {
            newErrors.store_slug = isArabic ? 'رابط المتجر مطلوب' : 'Store slug is required';
        } else if (!/^[a-z0-9-]+$/.test(settings.store_slug)) {
            newErrors.store_slug = isArabic
                ? 'الرابط يجب أن يحتوي على حروف إنجليزية صغيرة، أرقام، وشرطات فقط'
                : 'Slug must contain only lowercase English letters, numbers, and dashes';
        }

        if (settings.contact_email && !/\S+@\S+\.\S+/.test(settings.contact_email)) {
            newErrors.contact_email = isArabic ? 'بريد إلكتروني غير صالح' : 'Invalid email address';
        }

        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (settings.website_url && !urlPattern.test(settings.website_url)) {
            newErrors.website_url = isArabic ? 'رابط غير صالح' : 'Invalid URL';
        }
        if (settings.facebook_url && !urlPattern.test(settings.facebook_url)) {
            newErrors.facebook_url = isArabic ? 'رابط غير صالح' : 'Invalid URL';
        }
        if (settings.instagram_url && !urlPattern.test(settings.instagram_url)) {
            newErrors.instagram_url = isArabic ? 'رابط غير صالح' : 'Invalid URL';
        }
        if (settings.tiktok_url && !urlPattern.test(settings.tiktok_url)) {
            newErrors.tiktok_url = isArabic ? 'رابط غير صالح' : 'Invalid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateTheme = () => {
        const newErrors: Record<string, string> = {};
        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

        ['primary_color', 'secondary_color', 'accent_color', 'background_color', 'text_color'].forEach(field => {
            const val = (themeSettings as any)[field];
            if (val && !hexPattern.test(val)) {
                newErrors[field] = isArabic ? 'كود اللون غير صالح' : 'Invalid hex color';
            }
        });

        if (!themeSettings.featured_products_title?.trim()) {
            newErrors.featured_products_title = isArabic ? 'عنوان المنتوجات المميزة مطلوب' : 'Featured products title is required';
        }

        setThemeErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveBasic = async () => {
        if (!validate()) {
            toast.error(isArabic ? 'يرجى تصحيح الأخطاء قبل الحفظ' : 'Please fix errors before saving');
            return;
        }

        setSaving(true);
        try {
            const updateData: Partial<StoreSettings> = {
                store_name: settings.store_name,
                store_slug: settings.store_slug,
                tagline: settings.tagline,
                short_description: settings.short_description,
                full_description: settings.full_description,
                contact_phone: settings.contact_phone,
                whatsapp_phone: settings.whatsapp_phone,
                contact_email: settings.contact_email,
                address_line: settings.address_line,
                city: settings.city,
                state: settings.state,
                country: settings.country,
                facebook_url: settings.facebook_url,
                instagram_url: settings.instagram_url,
                tiktok_url: settings.tiktok_url,
                website_url: settings.website_url,
                is_active: settings.is_active,
                is_storefront_published: settings.is_storefront_published,
            };

            const { error } = await supabase
                .from('store_settings')
                .update(updateData)
                .eq('store_id', profile?.store_id);

            if (error) throw error;

            toast.success(isArabic ? 'تم حفظ التعديلات بنجاح' : 'Settings saved successfully');
        } catch (err: any) {
            console.error('Error saving settings:', err);
            toast.error(isArabic ? 'فشل في حفظ التعديلات' : 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveTheme = async () => {
        if (!validateTheme()) {
            toast.error(isArabic ? 'يرجى تصحيح الأخطاء قبل الحفظ' : 'Please fix errors before saving');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('store_theme_settings')
                .update({
                    primary_color: themeSettings.primary_color,
                    secondary_color: themeSettings.secondary_color,
                    accent_color: themeSettings.accent_color,
                    background_color: themeSettings.background_color,
                    text_color: themeSettings.text_color,
                    button_radius: themeSettings.button_radius,
                    card_radius: themeSettings.card_radius,
                    show_logo: themeSettings.show_logo,
                    show_cover: themeSettings.show_cover,
                    show_whatsapp: themeSettings.show_whatsapp,
                    show_phone: themeSettings.show_phone,
                    show_prices: themeSettings.show_prices,
                    show_stock: themeSettings.show_stock,
                    products_sort_by: themeSettings.products_sort_by,
                    featured_products_title: themeSettings.featured_products_title,
                    enable_dark_mode: themeSettings.enable_dark_mode,
                })
                .eq('store_id', profile?.store_id);

            if (error) throw error;

            toast.success(isArabic ? 'تم حفظ إعدادات المظهر بنجاح' : 'Theme settings saved successfully');
        } catch (err: any) {
            console.error('Error saving theme settings:', err);
            toast.error(isArabic ? 'فشل في حفظ إعدادات المظهر' : 'Failed to save theme settings');
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const isImage = file.type.startsWith('image/');
        const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for logo, 5MB for cover

        const newErrors = { ...brandingErrors };
        if (!isImage) {
            newErrors[type] = isArabic ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file';
            setBrandingErrors(newErrors);
            return;
        }
        if (file.size > maxSize) {
            const sizeLabel = type === 'logo' ? '2MB' : '5MB';
            newErrors[type] = isArabic ? `حجم الملف كبير جداً (الأقصى ${sizeLabel})` : `File size too large (max ${sizeLabel})`;
            setBrandingErrors(newErrors);
            return;
        }

        delete newErrors[type];
        setBrandingErrors(newErrors);

        if (type === 'logo') {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = (type: 'logo' | 'cover') => {
        if (type === 'logo') {
            setLogoFile(null);
            setLogoPreview(null);
            setSettings({ ...settings, logo_url: null as any });
        } else {
            setCoverFile(null);
            setCoverPreview(null);
            setSettings({ ...settings, cover_url: null as any });
        }
    };

    const uploadFile = async (file: File, type: 'logo' | 'cover'): Promise<string> => {
        if (!profile?.store_id) throw new Error('Store ID missing');

        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const path = `${profile.store_id}/${type}/${timestamp}.${extension}`;

        const { data, error } = await supabase.storage
            .from('store-assets')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) throw error;

        const { data: publicData } = supabase.storage
            .from('store-assets')
            .getPublicUrl(data.path);

        return publicData.publicUrl;
    };

    const handleSaveBranding = async () => {
        if (!profile?.store_id) return;
        setBrandingSaving(true);

        try {
            let finalLogoUrl = settings.logo_url;
            let finalCoverUrl = settings.cover_url;

            if (logoFile) {
                finalLogoUrl = await uploadFile(logoFile, 'logo');
            }
            if (coverFile) {
                finalCoverUrl = await uploadFile(coverFile, 'cover');
            }

            const { error } = await supabase
                .from('store_settings')
                .update({
                    logo_url: finalLogoUrl,
                    cover_url: finalCoverUrl
                })
                .eq('store_id', profile.store_id);

            if (error) throw error;

            setLogoFile(null);
            setCoverFile(null);
            toast.success(isArabic ? 'تم حفظ الهوية بنجاح' : 'Branding saved successfully');
        } catch (err: any) {
            console.error('Error saving branding:', err);
            toast.error(isArabic ? 'فشل في حفظ الهوية' : 'Failed to save branding');
        } finally {
            setBrandingSaving(false);
        }
    };

    const handleSavePage = async () => {
        const currentPage = pages.find(p => p.page_key === selectedPageKey);
        if (!currentPage || !profile?.store_id) return;

        if (!currentPage.title?.trim()) {
            setPageErrors({ title: isArabic ? 'العنوان مطلوب' : 'Title is required' });
            toast.error(isArabic ? 'يرجى كتابة عنوان الصفحة' : 'Please enter page title');
            return;
        }

        setPagesSaving(true);
        setPageErrors({});

        try {
            const { error } = await supabase
                .from('store_pages')
                .update({
                    title: currentPage.title,
                    content: currentPage.content,
                    is_published: currentPage.is_published,
                    seo_title: currentPage.seo_title,
                    seo_description: currentPage.seo_description,
                    updated_at: new Date().toISOString()
                })
                .eq('store_id', profile.store_id)
                .eq('page_key', selectedPageKey);

            if (error) throw error;
            toast.success(isArabic ? 'تم حفظ الصفحة بنجاح' : 'Page saved successfully');
            fetchPages();
        } catch (err: any) {
            console.error('Error saving page:', err);
            toast.error(isArabic ? 'فشل في حفظ الصفحة' : 'Failed to save page');
        } finally {
            setPagesSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 text-gray-500" dir="rtl">
                <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
                <p className="text-lg text-right">{isArabic ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full text-right" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
                <div className="text-right flex-1">
                    <h1 className="text-2xl font-semibold text-gray-900 text-right">{isArabic ? 'إعدادات المتجر' : 'Store Settings'}</h1>
                    <p className="text-gray-500 mt-1 text-right">{isArabic ? 'إدارة معلومات متجرك وهويته' : 'Manage your store information and identity'}</p>
                </div>

                <div className="flex justify-end group">
                    <Button
                        onClick={
                            activeTab === 'basic' ? handleSaveBasic :
                                activeTab === 'theme' ? handleSaveTheme :
                                    activeTab === 'branding' ? handleSaveBranding :
                                        handleSavePage
                        }
                        disabled={saving || brandingSaving || pagesSaving}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8"
                    >
                        {(saving || brandingSaving || pagesSaving) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isArabic ? (activeTab === 'pages' ? 'حفظ الصفحة' : 'حفظ التعديلات') : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full text-right" dir="rtl">
                <TabsList className="bg-white border border-gray-200 p-1 rounded-xl h-auto flex flex-wrap gap-1 mb-6 justify-start">
                    <TabsTrigger
                        value="basic"
                        className="rounded-lg py-2 px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-none text-right"
                    >
                        {isArabic ? 'الإعدادات الأساسية' : 'Basic Settings'}
                    </TabsTrigger>
                    <TabsTrigger
                        value="theme"
                        className="rounded-lg py-2 px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-none text-right"
                    >
                        {isArabic ? 'المظهر' : 'Theme'}
                    </TabsTrigger>
                    <TabsTrigger
                        value="branding"
                        className="rounded-lg py-2 px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-none text-right"
                    >
                        {isArabic ? 'هوية المتجر' : 'Branding'}
                    </TabsTrigger>
                    <TabsTrigger
                        value="pages"
                        className="rounded-lg py-2 px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-none text-right"
                    >
                        {isArabic ? 'صفحات المتجر' : 'Pages'}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 text-right">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right">
                        <div className="lg:col-span-2 space-y-6 text-right">
                            {/* Store Identity */}
                            <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Globe className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg text-right">{isArabic ? 'هوية المتجر' : 'Store Identity'}</CardTitle>
                                    </div>
                                    <CardDescription className="text-right">
                                        {isArabic ? 'المعلومات الأساسية التي تظهر لعملائك' : 'General information about your store'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4 text-right">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
                                        <div className="space-y-2 text-right">
                                            <Label htmlFor="store_name" className={cn("inline-block w-full text-right", errors.store_name && "text-red-500")}>
                                                {isArabic ? 'اسم المتجر' : 'Store Name'} <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="store_name"
                                                value={settings.store_name || ''}
                                                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                                                className={cn("text-right placeholder:text-right px-3", errors.store_name && "border-red-500")}
                                                placeholder={isArabic ? 'مثال: متجر زيندا' : 'e.g. Zenda Store'}
                                                dir="rtl"
                                            />
                                            {errors.store_name && <p className="text-xs text-red-500 text-right">{errors.store_name}</p>}
                                        </div>

                                        <div className="space-y-2 text-right">
                                            <Label htmlFor="store_slug" className={cn("inline-block w-full text-right", errors.store_slug && "text-red-500")}>
                                                {isArabic ? 'رابط المتجر (Slug)' : 'Store Slug'} <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="store_slug"
                                                    value={settings.store_slug || ''}
                                                    onChange={(e) => setSettings({ ...settings, store_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                    className={cn("text-left font-mono placeholder:text-left px-3", errors.store_slug && "border-red-500")}
                                                    dir="ltr"
                                                    placeholder="zenda-store"
                                                />
                                            </div>
                                            {errors.store_slug && <p className="text-xs text-red-500 text-right">{errors.store_slug}</p>}
                                            <p className="text-[11px] text-gray-500 text-right">
                                                {isArabic ? 'سيتم استخدام هذا الرابط للوصول لمتجرك مباشرة.' : 'This slug will be used for your store link.'}
                                            </p>
                                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex items-center gap-2 overflow-hidden" dir="rtl">
                                                <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                                                <span className="text-xs text-gray-600 truncate flex-1 text-left" dir="ltr">
                                                    /store/{settings.store_slug || '...'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-right">
                                        <Label htmlFor="tagline" className="inline-block w-full text-right">{isArabic ? 'وصف قصير (Tagline)' : 'Tagline'}</Label>
                                        <Input
                                            id="tagline"
                                            value={settings.tagline || ''}
                                            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                                            className="text-right placeholder:text-right px-3"
                                            placeholder={isArabic ? 'مثال: أفضل المنتجات العصرية' : 'e.g. Best trendy products'}
                                            dir="rtl"
                                        />
                                    </div>

                                    <div className="space-y-2 text-right">
                                        <Label htmlFor="short_description" className="inline-block w-full text-right">{isArabic ? 'نبذة مختصرة' : 'Short Description'}</Label>
                                        <Textarea
                                            id="short_description"
                                            value={settings.short_description || ''}
                                            onChange={(e) => setSettings({ ...settings, short_description: e.target.value })}
                                            className="text-right placeholder:text-right px-3 min-h-[80px]"
                                            placeholder={isArabic ? 'وصف سريع يظهر في صفحات النتائج' : 'Quick description for search results'}
                                            maxLength={160}
                                            dir="rtl"
                                        />
                                        <div className="flex flex-row justify-between items-center px-1">
                                            <span className="text-[10px] font-mono text-gray-400">
                                                {(settings.short_description?.length || 0)} / 160
                                            </span>
                                            <p className="text-[10px] text-gray-400 text-right">{isArabic ? 'يظهر في محركات البحث ومواقع التواصل' : 'Shown in search engines and social media'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-right">
                                        <Label htmlFor="full_description" className="inline-block w-full text-right">{isArabic ? 'وصف المتجر الكامل' : 'Full Description'}</Label>
                                        <Textarea
                                            id="full_description"
                                            value={settings.full_description || ''}
                                            onChange={(e) => setSettings({ ...settings, full_description: e.target.value })}
                                            className="text-right placeholder:text-right px-3 min-h-[150px]"
                                            placeholder={isArabic ? 'تحدث عن قصة متجرك وما تقدمه لعملائك بالتفصيل' : 'Detailed description about your store and what you offer'}
                                            dir="rtl"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Phone className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg text-right">{isArabic ? 'معلومات التواصل' : 'Contact Information'}</CardTitle>
                                    </div>
                                    <CardDescription className="text-right">
                                        {isArabic ? 'كيف يمكن للعملاء الوصول إليك' : 'How customers can reach you'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 text-right">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-right">
                                        <div className="space-y-2 text-right">
                                            <Label htmlFor="contact_phone" className="inline-block w-full text-right">{isArabic ? 'رقم الهاتف' : 'Contact Phone'}</Label>
                                            <div className="relative">
                                                <Phone className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="contact_phone"
                                                    value={settings.contact_phone || ''}
                                                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                                    className="pr-10 text-right placeholder:text-right"
                                                    placeholder="01xxxxxxxxx"
                                                    dir="rtl"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-right">
                                            <Label htmlFor="whatsapp_phone" className="inline-block w-full text-right flex items-center gap-2 justify-start">
                                                {isArabic ? 'رقم الواتساب' : 'WhatsApp Phone'}
                                                <MessageSquare className="w-3 h-3 text-green-500" />
                                            </Label>
                                            <div className="relative">
                                                <MessageSquare className="absolute right-3 top-3 w-4 h-4 text-green-500" />
                                                <Input
                                                    id="whatsapp_phone"
                                                    value={settings.whatsapp_phone || ''}
                                                    onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value })}
                                                    className="pr-10 text-right placeholder:text-right"
                                                    placeholder="01xxxxxxxxx"
                                                    dir="rtl"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2 space-y-2 text-right">
                                            <Label htmlFor="contact_email" className={cn("inline-block w-full text-right", errors.contact_email && "text-red-500")}>
                                                {isArabic ? 'البريد الإلكتروني' : 'Contact Email'}
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                                <Input
                                                    id="contact_email"
                                                    type="email"
                                                    value={settings.contact_email || ''}
                                                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                                    className={cn("pr-10 text-right placeholder:text-right font-mono", errors.contact_email && "border-red-500")}
                                                    placeholder="info@yourstore.com"
                                                    dir="rtl"
                                                />
                                            </div>
                                            {errors.contact_email && <p className="text-xs text-red-500 text-right">{errors.contact_email}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Address */}
                            <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                    <div className="flex items-center gap-2 justify-start">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg text-right">{isArabic ? 'العنوان' : 'Address'}</CardTitle>
                                    </div>
                                    <CardDescription className="text-right">
                                        {isArabic ? 'مقر المتجر أو مكان الشحن الرئيسي' : 'Store location or main shipping origin'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4 text-right">
                                    <div className="space-y-2 text-right">
                                        <Label htmlFor="address_line" className="inline-block w-full text-right">{isArabic ? 'العنوان بالتفصيل' : 'Address Line'}</Label>
                                        <Input
                                            id="address_line"
                                            value={settings.address_line || ''}
                                            onChange={(e) => setSettings({ ...settings, address_line: e.target.value })}
                                            className="text-right placeholder:text-right"
                                            placeholder={isArabic ? 'مثال: شارع التسعين، التجمع الخامس' : 'e.g. 90th St, New Cairo'}
                                            dir="rtl"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
                                        <div className="space-y-2 text-right">
                                            <Label htmlFor="city" className="inline-block w-full text-right">{isArabic ? 'المدينة' : 'City'}</Label>
                                            <Input
                                                id="city"
                                                value={settings.city || ''}
                                                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                                                className="text-right placeholder:text-right"
                                                placeholder={isArabic ? 'القاهرة' : 'Cairo'}
                                                dir="rtl"
                                            />
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <Label htmlFor="state" className="inline-block w-full text-right">{isArabic ? 'المحافظة/الولاية' : 'State/Governorate'}</Label>
                                            <Input
                                                id="state"
                                                value={settings.state || ''}
                                                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                                                className="text-right placeholder:text-right"
                                                placeholder={isArabic ? 'القاهرة' : 'Cairo'}
                                                dir="rtl"
                                            />
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <Label htmlFor="country" className="inline-block w-full text-right">{isArabic ? 'الدولة' : 'Country'}</Label>
                                            <Input
                                                id="country"
                                                value={settings.country || ''}
                                                onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                                                className="text-right placeholder:text-right"
                                                placeholder={isArabic ? 'مصر' : 'Egypt'}
                                                dir="rtl"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6 text-right">
                            {/* Store Status */}
                            <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                    <div className="flex items-center gap-2 justify-start">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg text-right">{isArabic ? 'حالة المتجر' : 'Store Status'}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6 text-right" dir="rtl">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-0.5 text-right flex-1">
                                            <Label className="text-base inline-block w-full text-right">{isArabic ? 'تفعيل المتجر' : 'Store Active'}</Label>
                                            <p className="text-xs text-gray-500 text-right">
                                                {isArabic ? 'إيقاف هذا الخيار سيغلق وصول المشرفين أيضاً' : 'Disabling this will close access for admins too'}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            <Switch
                                                checked={settings.is_active || false}
                                                onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 border-t pt-6" dir="rtl">
                                        <div className="space-y-0.5 text-right flex-1">
                                            <Label className="text-base inline-block w-full text-right">{isArabic ? 'نشر المتجر' : 'Publish Storefront'}</Label>
                                            <p className="text-xs text-gray-500 text-right">
                                                {isArabic ? 'إتاحة المتجر للعملاء على الإنترنت' : 'Make store visible to customers online'}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            <Switch
                                                checked={settings.is_storefront_published || false}
                                                onCheckedChange={(checked) => setSettings({ ...settings, is_storefront_published: checked })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Social Links */}
                            <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Share2 className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg text-right">{isArabic ? 'روابط التواصل الاجتماعي' : 'Social Links'}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4 text-right">
                                    <div className="space-y-2 text-right">
                                        <Label htmlFor="facebook_url" className={cn("inline-block w-full text-right", errors.facebook_url && "text-red-500")}>Facebook</Label>
                                        <div className="relative">
                                            <Facebook className="absolute right-3 top-3 w-4 h-4 text-blue-600" />
                                            <Input
                                                id="facebook_url"
                                                value={settings.facebook_url || ''}
                                                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                                                className={cn("pr-10 text-left font-mono text-sm placeholder:text-left", errors.facebook_url && "border-red-500")}
                                                dir="ltr"
                                                placeholder="https://facebook.com/..."
                                            />
                                        </div>
                                        {errors.facebook_url && <p className="text-xs text-red-500 text-right">{errors.facebook_url}</p>}
                                    </div>

                                    <div className="space-y-2 text-right">
                                        <Label htmlFor="instagram_url" className={cn("inline-block w-full text-right", errors.instagram_url && "text-red-500")}>Instagram</Label>
                                        <div className="relative">
                                            <Instagram className="absolute right-3 top-3 w-4 h-4 text-pink-600" />
                                            <Input
                                                id="instagram_url"
                                                value={settings.instagram_url || ''}
                                                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                                                className={cn("pr-10 text-left font-mono text-sm placeholder:text-left", errors.instagram_url && "border-red-500")}
                                                dir="ltr"
                                                placeholder="https://instagram.com/..."
                                            />
                                        </div>
                                        {errors.instagram_url && <p className="text-xs text-red-500 text-right">{errors.instagram_url}</p>}
                                    </div>

                                    <div className="space-y-2 text-right">
                                        <Label htmlFor="tiktok_url" className={cn("inline-block w-full text-right", errors.tiktok_url && "text-red-500")}>TikTok</Label>
                                        <div className="relative">
                                            <div className="absolute right-3 top-3 w-4 h-4 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-black border border-black rounded-sm px-0.5">T</span>
                                            </div>
                                            <Input
                                                id="tiktok_url"
                                                value={settings.tiktok_url || ''}
                                                onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                                                className={cn("pr-10 text-left font-mono text-sm placeholder:text-left", errors.tiktok_url && "border-red-500")}
                                                dir="ltr"
                                                placeholder="https://tiktok.com/@..."
                                            />
                                        </div>
                                        {errors.tiktok_url && <p className="text-xs text-red-500 text-right">{errors.tiktok_url}</p>}
                                    </div>

                                    <div className="space-y-2 border-t pt-4 text-right">
                                        <Label htmlFor="website_url" className={cn("inline-block w-full text-right", errors.website_url && "text-red-500")}>{isArabic ? 'الموقع الإلكتروني' : 'Website URL'}</Label>
                                        <div className="relative">
                                            <GlobeIcon className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="website_url"
                                                value={settings.website_url || ''}
                                                onChange={(e) => setSettings({ ...settings, website_url: e.target.value })}
                                                className={cn("pr-10 text-left font-mono text-sm placeholder:text-left", errors.website_url && "border-red-500")}
                                                dir="ltr"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        {errors.website_url && <p className="text-xs text-red-500 text-right">{errors.website_url}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Helper Message */}
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-row-reverse gap-3" dir="rtl">
                                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 leading-relaxed text-right flex-1">
                                    {isArabic
                                        ? 'بيانات المتجر تظهر لعملائك في صفحة المتجر وفي بوليصة الشحن، تأكد من صحة البيانات لضمان وصول الشحنات وسهولة التواصل.'
                                        : 'Store data appears to your customers on the storefront and shipping labels. Ensure data is correct for smooth shipping and communication.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="theme" className="space-y-6 text-right">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right">
                        <div className="lg:col-span-2 space-y-6 text-right">
                            {/* Brand Colors */}
                            <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Palette className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg text-right">{isArabic ? 'ألوان العلامة التجارية' : 'Brand Colors'}</CardTitle>
                                    </div>
                                    <CardDescription className="text-right">
                                        {isArabic ? 'حدد الألوان التي تعبر عن هوية متجرك' : 'Define colors that represent your store identity'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6 text-right">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-right">
                                        {[
                                            { id: 'primary_color', label: isArabic ? 'اللون الأساسي' : 'Primary Color' },
                                            { id: 'secondary_color', label: isArabic ? 'اللون الثانوي' : 'Secondary Color' },
                                            { id: 'accent_color', label: isArabic ? 'لون التميز' : 'Accent Color' },
                                            { id: 'background_color', label: isArabic ? 'لون الخلفية' : 'Background Color' },
                                            { id: 'text_color', label: isArabic ? 'لون النص' : 'Text Color' },
                                        ].map((color) => (
                                            <div key={color.id} className="space-y-2 text-right">
                                                <Label htmlFor={color.id} className={cn("inline-block w-full text-right", themeErrors[color.id] && "text-red-500")}>
                                                    {color.label}
                                                </Label>
                                                <div className="flex gap-2 items-center">
                                                    <div className="relative flex-1">
                                                        <Input
                                                            id={color.id}
                                                            value={(themeSettings as any)[color.id] || '#000000'}
                                                            onChange={(e) => setThemeSettings({ ...themeSettings, [color.id]: e.target.value })}
                                                            className={cn("text-left font-mono pl-10 px-3", themeErrors[color.id] && "border-red-500")}
                                                            dir="ltr"
                                                        />
                                                        <div
                                                            className="absolute left-2 top-2 w-5 h-5 rounded border border-gray-200"
                                                            style={{ backgroundColor: (themeSettings as any)[color.id] || '#000000' }}
                                                        />
                                                    </div>
                                                    <input
                                                        type="color"
                                                        value={(themeSettings as any)[color.id] || '#000000'}
                                                        onChange={(e) => setThemeSettings({ ...themeSettings, [color.id]: e.target.value })}
                                                        className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer rounded overflow-hidden"
                                                    />
                                                </div>
                                                {themeErrors[color.id] && <p className="text-xs text-red-500 text-right">{themeErrors[color.id]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shape & Style */}
                            <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Layers className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg text-right">{isArabic ? 'الحواف والنمط' : 'Shape & Style'}</CardTitle>
                                    </div>
                                    <CardDescription className="text-right">
                                        {isArabic ? 'تحكم في انحناء حواف الأزرار والبطاقات' : 'Control the corner radius of buttons and cards'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6 text-right">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-right">
                                        <div className="space-y-2 text-right">
                                            <Label className="inline-block w-full text-right">{isArabic ? 'انحناء الأزرار' : 'Button Radius'}</Label>
                                            <Select
                                                value={themeSettings.button_radius || 'md'}
                                                onValueChange={(val) => setThemeSettings({ ...themeSettings, button_radius: val })}
                                            >
                                                <SelectTrigger className="text-right" dir="rtl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent dir="rtl">
                                                    {RADIUS_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value} className="text-right">{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <Label className="inline-block w-full text-right">{isArabic ? 'انحناء البطاقات' : 'Card Radius'}</Label>
                                            <Select
                                                value={themeSettings.card_radius || 'xl'}
                                                onValueChange={(val) => setThemeSettings({ ...themeSettings, card_radius: val })}
                                            >
                                                <SelectTrigger className="text-right" dir="rtl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent dir="rtl">
                                                    {RADIUS_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value} className="text-right">{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Products Section */}
                            <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Settings2 className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg text-right">{isArabic ? 'قسم المنتجات' : 'Products Section'}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6 text-right">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-right">
                                        <div className="space-y-2 text-right">
                                            <Label htmlFor="featured_products_title" className={cn("inline-block w-full text-right", themeErrors.featured_products_title && "text-red-500")}>
                                                {isArabic ? 'عنوان المنتجات المميزة' : 'Featured Products Title'}
                                            </Label>
                                            <Input
                                                id="featured_products_title"
                                                value={themeSettings.featured_products_title || ''}
                                                onChange={(e) => setThemeSettings({ ...themeSettings, featured_products_title: e.target.value })}
                                                className={cn("text-right px-3", themeErrors.featured_products_title && "border-red-500")}
                                                placeholder={isArabic ? 'مثل: منتجاتنا المختارة' : 'e.g. Our Selection'}
                                                dir="rtl"
                                            />
                                            {themeErrors.featured_products_title && <p className="text-xs text-red-500 text-right">{themeErrors.featured_products_title}</p>}
                                        </div>
                                        <div className="space-y-2 text-right">
                                            <Label className="inline-block w-full text-right">{isArabic ? 'ترتيب المنتجات الافتراضي' : 'Default Product Sorting'}</Label>
                                            <Select
                                                value={themeSettings.products_sort_by || 'newest'}
                                                onValueChange={(val) => setThemeSettings({ ...themeSettings, products_sort_by: val })}
                                            >
                                                <SelectTrigger className="text-right" dir="rtl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent dir="rtl">
                                                    {SORT_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value} className="text-right">{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[11px] text-gray-500 text-right">
                                                {isArabic ? 'سيتم ترتيب المنتجات بهذا النمط تلقائياً في المتجر.' : 'Products will be sorted by this style by default.'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6 text-right">
                            {/* Live Preview Card */}
                            <Card className="border-gray-300 shadow-md overflow-hidden sticky top-6 z-10 transition-all duration-300 ring-2 ring-green-100">
                                <CardHeader className="bg-white border-b border-gray-100 py-3">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Eye className="w-5 h-5 text-green-600 animate-pulse" />
                                        <CardTitle className="text-lg text-right font-bold text-green-700">{isArabic ? 'معاينة مباشرة' : 'Live Preview'}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 overflow-hidden" style={{ backgroundColor: themeSettings.background_color || '#ffffff' }}>
                                    {/* Mock Storefront */}
                                    <div className="min-h-[450px] flex flex-col" dir="rtl">
                                        {/* Mock Header */}
                                        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: `${themeSettings.text_color}15` }}>
                                            <div className="flex items-center gap-2">
                                                {themeSettings.show_logo ? (
                                                    <div className="size-8 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">LOGO</div>
                                                ) : (
                                                    <span className="font-bold text-sm" style={{ color: themeSettings.text_color || '#000000' }}>{settings.store_name || 'My Store'}</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Layout className="size-4 opacity-50" style={{ color: themeSettings.text_color }} />
                                                <ShoppingCart className="size-4 opacity-50" style={{ color: themeSettings.text_color }} />
                                            </div>
                                        </div>

                                        {/* Mock Cover */}
                                        {themeSettings.show_cover && (
                                            <div className="h-24 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                <div
                                                    className="w-full h-full opacity-50"
                                                    style={{
                                                        background: `linear-gradient(45deg, ${themeSettings.primary_color}22, ${themeSettings.accent_color}22)`
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Mock Content */}
                                        <div className="p-4 flex-1 space-y-4">
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-bold" style={{ color: themeSettings.text_color || '#000000' }}>
                                                    {themeSettings.featured_products_title || (isArabic ? 'منتجاتنا' : 'Our Products')}
                                                </h3>
                                                <div className="h-0.5 w-10" style={{ backgroundColor: themeSettings.accent_color || '#22c55e' }}></div>
                                            </div>

                                            {/* Mock Product Card */}
                                            <div
                                                className={cn("bg-white p-3 shadow-sm border space-y-3 transition-all", getRadiusClass(themeSettings.card_radius, 'card'))}
                                                style={{ borderColor: `${themeSettings.text_color}10` }}
                                            >
                                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                                                    <ShoppingCart className="size-8 text-gray-300" />
                                                    {themeSettings.show_stock && (
                                                        <span className="absolute top-2 right-2 text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                                                            {isArabic ? 'متوفر' : 'In Stock'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-medium" style={{ color: themeSettings.text_color || '#000000' }}>
                                                        {isArabic ? 'اسم المنتج التجريبي' : 'Sample Product Name'}
                                                    </p>
                                                    {themeSettings.show_prices && (
                                                        <p className="text-xs font-bold" style={{ color: themeSettings.primary_color || '#22c55e' }}>
                                                            149 {isArabic ? 'ج.م' : 'EGP'}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    className={cn("w-full h-8 text-[10px] font-bold text-white", getRadiusClass(themeSettings.button_radius, 'button'))}
                                                    style={{ backgroundColor: themeSettings.primary_color || '#22c55e' }}
                                                >
                                                    {isArabic ? 'أضف للسلة' : 'Add to Cart'}
                                                </Button>
                                            </div>

                                            {/* Mock Floating Contact */}
                                            <div className="flex justify-end gap-2 pt-2">
                                                {themeSettings.show_whatsapp && (
                                                    <div className="size-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                        <MessageSquare className="size-4" />
                                                    </div>
                                                )}
                                                {themeSettings.show_phone && (
                                                    <div className="size-8 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                        <Phone className="size-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    <p className="text-[10px] text-gray-400 text-center italic">
                                        {isArabic ? '* هذه المعاينة تقريبية لتوضيح الألوان والتنسيق فقط' : '* This preview is approximate for colors and layout only'}
                                    </p>
                                </div>
                            </Card>

                            {/* Visibility Toggles */}
                            <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                    <div className="flex items-center gap-2 justify-start">
                                        <Eye className="w-5 h-5 text-green-600" />
                                        <CardTitle className="text-lg text-right">{isArabic ? 'خيارات العرض' : 'Visibility Toggles'}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-0 divide-y divide-gray-100 text-right" dir="rtl">
                                    {[
                                        { id: 'show_logo', label: isArabic ? 'إظهار الشعار' : 'Show Logo', desc: isArabic ? 'عرض شعار المتجر في الهيدر' : 'Display store logo in header' },
                                        { id: 'show_cover', label: isArabic ? 'إظهار الغلاف' : 'Show Cover', desc: isArabic ? 'عرض صورة الغلاف في الصفحة الرئيسية' : 'Display cover image on homepage' },
                                        { id: 'show_prices', label: isArabic ? 'إظهار الأسعار' : 'Show Prices', desc: isArabic ? 'إخفاء الأسعار قد يقلل من التحويلات' : 'Hiding prices may reduce conversions' },
                                        { id: 'show_stock', label: isArabic ? 'إظهار حالة المخزون' : 'Show Stock Status', desc: isArabic ? 'توضيح توفر المنتج للعملاء' : 'Show product availability to customers' },
                                        { id: 'show_whatsapp', label: isArabic ? 'زر الواتساب' : 'WhatsApp Button', desc: isArabic ? 'إظهار زر التواصل العائم' : 'Display floating contact button' },
                                        { id: 'show_phone', label: isArabic ? 'زر الاتصال' : 'Phone Button', desc: isArabic ? 'إظهار زر الاتصال السريع' : 'Display quick call button' },
                                        { id: 'enable_dark_mode', label: isArabic ? 'تمكين الوضع الليلي' : 'Enable Dark Mode', desc: isArabic ? 'السماح للعملاء بالتبديل للوضع الليلي' : 'Allow customers to switch to dark mode' },
                                    ].map((toggle) => (
                                        <div key={toggle.id} className="flex items-center justify-between gap-4 py-4">
                                            <div className="space-y-0.5 text-right flex-1">
                                                <Label className="text-sm font-semibold inline-block w-full text-right">{toggle.label}</Label>
                                                <p className="text-[11px] text-gray-500 text-right">{toggle.desc}</p>
                                            </div>
                                            <div className="shrink-0">
                                                <Switch
                                                    checked={(themeSettings as any)[toggle.id] || false}
                                                    onCheckedChange={(checked) => setThemeSettings({ ...themeSettings, [toggle.id]: checked })}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="branding" className="space-y-6 text-right">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-right">
                        {/* Store Logo Card */}
                        <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                <div className="flex items-center gap-2 justify-start">
                                    <ShieldCheck className="w-5 h-5 text-green-600" />
                                    <CardTitle className="text-lg text-right">{isArabic ? 'شعار المتجر' : 'Store Logo'}</CardTitle>
                                </div>
                                <CardDescription className="text-right">
                                    {isArabic ? 'يظهر في الهيدر وبوليصة الشحن (يفضل خلفية شفافة)' : 'Appears in header and labels (transparent background preferred)'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4 text-right">
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/50 transition-all hover:bg-gray-50">
                                    {logoPreview ? (
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-2xl overflow-hidden border bg-white shadow-sm flex items-center justify-center p-2">
                                                <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveImage('logo')}
                                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full shadow-sm hover:bg-red-200 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border flex items-center justify-center mx-auto">
                                                <ImageIcon className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-sm text-gray-500">{isArabic ? 'لم يتم رفع شعار بعد' : 'No logo uploaded yet'}</p>
                                        </div>
                                    )}

                                    <div className="mt-6 w-full max-w-[200px]">
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'logo')}
                                        />
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                        >
                                            <Upload className="w-4 h-4" />
                                            {logoPreview ? (isArabic ? 'استبدال الشعار' : 'Replace Logo') : (isArabic ? 'رفع شعار' : 'Upload Logo')}
                                        </Button>
                                    </div>
                                    {brandingErrors.logo && <p className="mt-2 text-xs text-red-500">{brandingErrors.logo}</p>}
                                </div>
                                <p className="text-[11px] text-gray-400 text-center">
                                    {isArabic ? 'الحجم الأقصى 2MB • فضل صيغة PNG أو JPG' : 'Max size 2MB • PNG or JPG preferred'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Store Cover Card */}
                        <Card className="border-gray-200 shadow-sm overflow-hidden text-right">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 text-right">
                                <div className="flex items-center gap-2 justify-start">
                                    <Layout className="w-5 h-5 text-green-600" />
                                    <CardTitle className="text-lg text-right">{isArabic ? 'صورة الغلاف' : 'Cover Image'}</CardTitle>
                                </div>
                                <CardDescription className="text-right">
                                    {isArabic ? 'تظهر في الصفحة الرئيسية وكخلفية هيدر' : 'Appears on homepage and as header background'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4 text-right">
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 bg-gray-50/50 transition-all hover:bg-gray-50">
                                    {coverPreview ? (
                                        <div className="relative group w-full">
                                            <div className="w-full h-32 rounded-2xl overflow-hidden border bg-white shadow-sm">
                                                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveImage('cover')}
                                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full shadow-sm hover:bg-red-200 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <div className="w-full h-16 bg-white rounded-2xl shadow-sm border flex items-center justify-center px-8">
                                                <ImageIcon className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-sm text-gray-500">{isArabic ? 'لم يتم رفع غلاف بعد' : 'No cover uploaded yet'}</p>
                                        </div>
                                    )}

                                    <div className="mt-6 w-full max-w-[200px]">
                                        <input
                                            type="file"
                                            id="cover-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, 'cover')}
                                        />
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
                                            onClick={() => document.getElementById('cover-upload')?.click()}
                                        >
                                            <Upload className="w-4 h-4" />
                                            {coverPreview ? (isArabic ? 'استبدال الغلاف' : 'Replace Cover') : (isArabic ? 'رفع غلاف' : 'Upload Cover')}
                                        </Button>
                                    </div>
                                    {brandingErrors.cover && <p className="mt-2 text-xs text-red-500">{brandingErrors.cover}</p>}
                                </div>
                                <p className="text-[11px] text-gray-400 text-center">
                                    {isArabic ? 'الحجم الأقصى 5MB • يفضل الصور العريضة' : 'Max size 5MB • Wide images preferred'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Branding Save Instructions */}
                        <div className="lg:col-span-2 bg-green-50 border border-green-100 p-4 rounded-xl flex flex-row-reverse gap-3" dir="rtl">
                            <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div className="flex-1 text-right">
                                <p className="text-sm font-semibold text-green-800 mb-1">{isArabic ? 'تذكر حفظ التعديلات' : 'Remember to save changes'}</p>
                                <p className="text-xs text-green-700 leading-relaxed">
                                    {isArabic
                                        ? 'بعد اختيار الصور أو إزالتها، يجب النقر على زر "حفظ هوية المتجر" لتطبيق التغييرات نهائياً.'
                                        : 'After selecting or removing images, you must click "Save Branding" to apply changes permanently.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
                        <Button
                            onClick={handleSaveBranding}
                            disabled={brandingSaving}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2 px-12 h-12 text-lg shadow-lg shadow-green-100"
                        >
                            {brandingSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isArabic ? 'حفظ هوية المتجر' : 'Save Branding'}
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="pages" className="space-y-6 text-right">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-right" dir="rtl">
                        {/* Sidebar: Page Selection */}
                        <div className="lg:col-span-1 space-y-3">
                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900 text-sm">{isArabic ? 'قائمة الصفحات' : 'Pages List'}</h3>
                                </div>
                                <div className="p-2 space-y-1">
                                    {Object.entries(PAGE_LABELS).map(([key, label]) => {
                                        const pageData = pages.find(p => p.page_key === key);
                                        const originalData = originalPages.find(p => p.page_key === key);
                                        const isSelected = selectedPageKey === key;

                                        const isModified = JSON.stringify(pageData) !== JSON.stringify(originalData);

                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedPageKey(key)}
                                                className={cn(
                                                    "w-full text-right px-4 py-3 rounded-xl transition-all flex items-center justify-between group",
                                                    isSelected
                                                        ? "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100"
                                                        : "hover:bg-gray-50 text-gray-600"
                                                )}
                                            >
                                                <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <span className={cn("text-sm font-medium truncate", isSelected ? "text-green-700" : "text-gray-700")}>
                                                            {label}
                                                        </span>
                                                        {isModified && (
                                                            <span className="size-1.5 rounded-full bg-blue-500 shrink-0" title={isArabic ? 'تغييرات غير محفوظة' : 'Unsaved changes'} />
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] opacity-70">
                                                        {pageData?.is_published
                                                            ? (isArabic ? 'منشورة' : 'Published')
                                                            : (isArabic ? 'مسودة' : 'Draft')}
                                                    </span>
                                                </div>
                                                {pageData?.is_published && (
                                                    <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold">{isArabic ? 'تنبيه' : 'Notice'}</span>
                                </div>
                                <p className="text-[11px] text-blue-600 leading-relaxed">
                                    {isArabic
                                        ? 'الصفحات المنشورة فقط هي التي تظهر لعملائك في أسفل متجرك.'
                                        : 'Only published pages appear at the footer of your storefront.'}
                                </p>
                            </div>
                        </div>

                        {/* Main Editor Panel */}
                        <div className="lg:col-span-3 space-y-6">
                            {pagesLoading ? (
                                <Card className="border-gray-200 shadow-sm h-[600px] flex items-center justify-center">
                                    <div className="text-center space-y-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" />
                                        <p className="text-sm text-gray-500">{isArabic ? 'جاري تحميل محتوى الصفحة...' : 'Loading page content...'}</p>
                                    </div>
                                </Card>
                            ) : (() => {
                                const currentPage = pages.find(p => p.page_key === selectedPageKey);
                                if (!currentPage) return (
                                    <Card className="border-gray-200 shadow-sm h-[600px] flex items-center justify-center">
                                        <p className="text-gray-500 italic">{isArabic ? 'يرجى اختيار صفحة من القائمة للبدء' : 'Select a page to start editing'}</p>
                                    </Card>
                                );

                                return (
                                    <>
                                        {/* Status Header */}
                                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                                    <Settings2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900">{PAGE_LABELS[selectedPageKey]}</h2>
                                                    <p className="text-xs text-gray-500">
                                                        {isArabic ? 'آخر تحديث:' : 'Last updated:'} {currentPage.updated_at ? new Date(currentPage.updated_at).toLocaleDateString('ar-EG') : (isArabic ? 'لم يتم التحديث' : 'Never updated')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 bg-gray-50 px-6 py-2 rounded-xl border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <Label className="text-sm font-medium m-0 cursor-pointer" htmlFor="publish-toggle">
                                                        {currentPage.is_published ? (isArabic ? 'منشورة علنياً' : 'Publicly Published') : (isArabic ? 'محفوظة كمسودة' : 'Saved as Draft')}
                                                    </Label>
                                                    <Switch
                                                        id="publish-toggle"
                                                        checked={currentPage.is_published}
                                                        onCheckedChange={(checked) => {
                                                            const newPages = pages.map(p => p.page_key === selectedPageKey ? { ...p, is_published: checked } : p);
                                                            setPages(newPages);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Page Content Card */}
                                        <Card className="border-gray-200 shadow-sm overflow-hidden">
                                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                                                <CardTitle className="text-lg">{isArabic ? 'محتوى الصفحة' : 'Page Content'}</CardTitle>
                                                <CardDescription>
                                                    {isArabic ? 'اكتب المحتوى الذي ترغب في ظهوره للعملاء بالتفصيل' : 'Enter the detailed content for your customers'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-6">
                                                <div className="space-y-2">
                                                    <Label className={cn(pageErrors.title && "text-red-500")}>
                                                        {isArabic ? 'عنوان الصفحة' : 'Page Title'} <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        value={currentPage.title || ''}
                                                        onChange={(e) => {
                                                            const newPages = pages.map(p => p.page_key === selectedPageKey ? { ...p, title: e.target.value } : p);
                                                            setPages(newPages);
                                                        }}
                                                        className={cn(pageErrors.title && "border-red-500")}
                                                        placeholder={PAGE_LABELS[selectedPageKey]}
                                                    />
                                                    {pageErrors.title && <p className="text-xs text-red-500">{pageErrors.title}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>{isArabic ? 'المحتوى' : 'Content'}</Label>
                                                    <Textarea
                                                        value={currentPage.content || ''}
                                                        onChange={(e) => {
                                                            const newPages = pages.map(p => p.page_key === selectedPageKey ? { ...p, content: e.target.value } : p);
                                                            setPages(newPages);
                                                        }}
                                                        className="min-h-[300px] leading-relaxed text-right text-base border-gray-200 focus:border-green-300 focus:ring-green-100"
                                                        placeholder={isArabic ? 'اكتب هنا...' : 'Start typing here...'}
                                                        dir="rtl"
                                                    />
                                                    {currentPage.is_published && !currentPage.content?.trim() && (
                                                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1 font-medium">
                                                            <AlertCircle className="w-3 h-3" />
                                                            {isArabic ? 'تنبيه: محتوى الصفحة فارغ حالياً وهي منشورة للعملاء.' : 'Warning: Page content is empty but currently published.'}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* SEO Card */}
                                        <Card className="border-gray-200 shadow-sm overflow-hidden">
                                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                                                <CardTitle className="text-lg">{isArabic ? 'تحسين محركات البحث (SEO)' : 'SEO Settings'}</CardTitle>
                                                <CardDescription>
                                                    {isArabic ? 'تحكم في كيفية ظهور هذه الصفحة في نتائج جوجل' : 'Control how this page appears in Google search results'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="space-y-2">
                                                    <Label>{isArabic ? 'عنوان SEO' : 'SEO Title'}</Label>
                                                    <Input
                                                        value={currentPage.seo_title || ''}
                                                        onChange={(e) => {
                                                            const newPages = pages.map(p => p.page_key === selectedPageKey ? { ...p, seo_title: e.target.value } : p);
                                                            setPages(newPages);
                                                        }}
                                                        placeholder={currentPage.title}
                                                    />
                                                    <p className="text-[10px] text-gray-400">{isArabic ? 'يفضل أن يكون بين 50-60 حرفاً' : 'Recommended 50-60 characters'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{isArabic ? 'وصف SEO' : 'SEO Description'}</Label>
                                                    <Textarea
                                                        value={currentPage.seo_description || ''}
                                                        onChange={(e) => {
                                                            const newPages = pages.map(p => p.page_key === selectedPageKey ? { ...p, seo_description: e.target.value } : p);
                                                            setPages(newPages);
                                                        }}
                                                        className="min-h-[100px]"
                                                        placeholder={isArabic ? 'وصف مختصر للصفحة لمحركات البحث' : 'Brief description for search engines'}
                                                    />
                                                    <p className="text-[10px] text-gray-400">{isArabic ? 'يفضل أن يكون بين 120-160 حرفاً' : 'Recommended 120-160 characters'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Permalink Preview */}
                                        <div className="bg-gray-100 border border-gray-200 p-4 rounded-2xl flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <ExternalLink className="w-4 h-4" />
                                                <span className="text-xs font-bold">{isArabic ? 'رابط الصفحة المباشر' : 'Page Permalink'}</span>
                                            </div>
                                            <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg font-mono text-xs text-blue-600 truncate text-left" dir="ltr">
                                                {settings.store_slug
                                                    ? `https://zenda.com/store/${settings.store_slug}/pages/${currentPage.page_key}`
                                                    : (isArabic ? 'يجب تحديد رابط المتجر أولاً' : 'Set store slug first')}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex justify-start">
                                            <Button
                                                onClick={handleSavePage}
                                                disabled={pagesSaving}
                                                className="bg-green-600 hover:bg-green-700 text-white gap-2 px-10 h-11"
                                            >
                                                {pagesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                {isArabic ? 'حفظ الصفحة' : 'Save Page'}
                                            </Button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

