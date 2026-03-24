export type Status = 'Active' | 'Inactive';

export interface Profile {
    id: string;
    store_id: string;
    name: string;
    role: string;
    is_active: boolean;
}

export interface Category {
    id: string;
    store_id: string;
    name: string;
    slug: string;
    is_active: boolean;
    sort_order: number;
}

export interface Brand {
    id: string;
    store_id: string;
    name: string;
    slug: string;
    is_active: boolean;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    store_id: string;
    size: string | null;
    color: string | null;
    sku: string | null;
    sale_price: number;
    compare_at_price: number | null;
    cost_price: number | null;
    stock_quantity: number;
    low_stock_threshold: number | null;
    is_active: boolean;
    image_url: string | null;
    sort_order: number;
    option_1_name: string | null;
    option_1_value: string | null;
    option_2_name: string | null;
    option_2_value: string | null;
    option_3_name: string | null;
    option_3_value: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface ProductImage {
    id: string;
    store_id: string;
    product_id: string;
    image_url: string;
    alt_text: string | null;
    is_primary: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id: string;
    store_id: string;
    category_id?: string;
    brand_id?: string;
    name: string;
    description?: string;
    cost_price?: number;
    is_active: boolean;
    is_published: boolean;
    sort_order: number;
    created_at: string;
}

export interface ProductListItem extends Product {
    description?: string;
    short_description?: string;
    slug?: string;
    category_id?: string;
    category_name?: string;
    category_slug?: string;
    brand_id?: string;
    brand_name?: string;
    brand_slug?: string;
    currency?: string;
    status: string;
    is_featured: boolean;
    track_inventory: boolean;
    has_variants: boolean;
    total_stock: number;
    base_sale_price?: number;
    base_compare_at_price?: number;
    display_price: number;
    display_compare_at_price?: number;
    primary_image?: string | null;
    variants_count: number;
}

export interface ProductDetails extends Product {
    variants: ProductVariant[];
    images: ProductImage[];
    category?: Category;
    brand?: Brand;
}

export interface ProductFormPayload {
    product: Omit<Product, 'id' | 'store_id' | 'created_at'>;
    variants?: Omit<ProductVariant, 'id' | 'product_id' | 'store_id' | 'created_at' | 'updated_at'>[];
    images?: Omit<ProductImage, 'id' | 'product_id'>[];
}

export type OrderStatus = 'New' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';

export interface OrderItem {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    variantName: string; // e.g. "XL - Red"
    quantity: number;
    unitPrice: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    governorate: string;
    city: string;
    address: string;
}

export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    items: OrderItem[];
    status: OrderStatus;
    shippingCost: number;
    shippingCompany?: string;
    waybillNumber?: string;
    totalAmount: number;
    createdAt: string;
}
export interface StoreSettings {
    store_id: string;
    store_name: string;
    store_slug: string;
    tagline?: string;
    short_description?: string;
    full_description?: string;
    logo_url?: string;
    cover_url?: string;
    contact_phone?: string;
    whatsapp_phone?: string;
    contact_email?: string;
    address_line?: string;
    city?: string;
    state?: string;
    country?: string;
    facebook_url?: string;
    instagram_url?: string;
    tiktok_url?: string;
    website_url?: string;
    is_active: boolean;
    is_storefront_published: boolean;
    default_language: string;
    currency_code: string;
}

export interface StoreThemeSettings {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    button_radius: string;
    card_radius: string;
    show_logo: boolean;
    show_cover: boolean;
    show_whatsapp: boolean;
    show_phone: boolean;
    show_prices: boolean;
    show_stock: boolean;
    products_sort_by: string;
    featured_products_title: string;
    enable_dark_mode: boolean;
}

export interface StoreSettingsFull extends StoreSettings, StoreThemeSettings { }

export interface StorePage {
    id: string;
    store_id: string;
    page_key: string;
    title: string;
    content: string;
    is_published: boolean;
    seo_title?: string;
    seo_description?: string;
    updated_at: string;
}
