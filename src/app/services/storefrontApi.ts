import { supabase } from '../../lib/supabaseClient';
import { StorefrontHomePublic, StorefrontProduct, StorefrontPage } from '../types/storefront';

export const storefrontApi = {
    /**
     * Fetch basic store data and theme settings
     */
    async getStoreHome(slug: string): Promise<StorefrontHomePublic | null> {
        const { data, error } = await supabase
            .from('storefront_home_public_view')
            .select('*')
            .eq('store_slug', slug)
            .single();

        if (error) {
            console.error('Error fetching storefront home:', error);
            return null;
        }
        return data;
    },

    /**
     * Fetch featured products for the store
     */
    async getFeaturedProducts(slug: string): Promise<StorefrontProduct[]> {
        const { data, error } = await supabase
            .from('storefront_featured_products_public_view')
            .select('*')
            .eq('store_slug', slug)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching featured products:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Fetch all active products for the store with filtering and sorting
     */
    async getAllProducts(
        slug: string,
        options: {
            category?: string;
            minPrice?: number;
            maxPrice?: number;
            sortBy?: 'newest' | 'bestselling' | 'p-low' | 'p-high';
            page?: number;
            pageSize?: number;
        } = {}
    ): Promise<{ products: StorefrontProduct[], count: number }> {
        const { category, minPrice, maxPrice, sortBy = 'newest', page = 1, pageSize = 20 } = options;

        let query = supabase
            .from('storefront_products_public_view')
            .select('*', { count: 'exact' })
            .eq('store_slug', slug);

        // Filtering
        if (category && category !== 'الكل' && category !== 'All') {
            query = query.eq('category_name', category);
        }
        if (minPrice !== undefined) query = query.gte('sale_price', minPrice);
        if (maxPrice !== undefined) query = query.lte('sale_price', maxPrice);

        // Sorting
        switch (sortBy) {
            case 'newest':
                query = query.order('updated_at', { ascending: false });
                break;
            case 'bestselling':
                // Assuming we might have a sales_count or similar, fallback to updated_at
                query = query.order('updated_at', { ascending: false });
                break;
            case 'p-low':
                query = query.order('sale_price', { ascending: true });
                break;
            case 'p-high':
                query = query.order('sale_price', { ascending: false });
                break;
        }

        // Pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching all products:', error);
            return { products: [], count: 0 };
        }
        return { products: data || [], count: count || 0 };
    },

    /**
     * Fetch published pages for the store
     */
    async getStorePages(slug: string): Promise<StorefrontPage[]> {
        const { data, error } = await supabase
            .from('store_pages_public_view')
            .select('*')
            .eq('store_slug', slug)
        // .eq('is_published', true);

        if (error) {
            console.error('Error fetching store pages:', error);
            return [];
        }
        return data || [];
    },

    /**
     * Fetch a single product by its slug
     */
    async getProductBySlug(storeSlug: string, productSlug: string): Promise<StorefrontProduct | null> {
        const { data, error } = await supabase
            .from('storefront_products_public_view')
            .select('*')
            .eq('store_slug', storeSlug)
            .eq('slug', productSlug)
            .single();

        if (error) {
            console.error('Error fetching product by slug:', error);
            return null;
        }
        return data;
    },

    /**
     * Fetch unique categories for a store
     */
    async getCategories(slug: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('storefront_products_public_view')
            .select('category_name')
            .eq('store_slug', slug);

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
        const categories = Array.from(new Set(data.map(i => i.category_name).filter(Boolean)));
        return categories;
    },

    /**
     * Create a new order (Checkout)
     */
    async createOrder(orderData: {
        store_id: string;
        customer_name: string;
        customer_phone: string;
        address: string;
        city: string;
        items: Array<{
            product_id: string;
            quantity: number;
            price: number;
        }>;
        total_amount: number;
    }) {
        // This will eventually hit the 'orders' and 'order_items' tables
        // For now, we simulate success for the UI redesign phase
        console.log('Order creation requested:', orderData);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, order_id: 'ord_' + Math.random().toString(36).substr(2, 9) };
    }
};
