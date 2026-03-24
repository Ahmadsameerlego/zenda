import { StoreSettingsFull } from './index';

export interface StorefrontHomePublic extends StoreSettingsFull {
    // Inherits all store settings and theme settings
}

export interface StorefrontProduct {
    id: string;
    store_id: string;
    store_slug: string;
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    image_url: string;
    images?: string[];
    base_price: number;
    sale_price?: number;
    category_name: string;
    is_featured: boolean;
    is_active: boolean;
    is_published: boolean;
    stock_status: 'in_stock' | 'out_of_stock' | 'limited';
    variants?: Array<{
        id: string;
        name: string;
        price_modifier?: number;
        stock_status?: string;
    }>;
    created_at: string;
}

export interface StorefrontPage {
    id: string;
    store_id: string;
    store_slug: string;
    page_key: string;
    title: string;
    content: string;
    is_published: boolean;
    seo_title?: string;
    seo_description?: string;
}
