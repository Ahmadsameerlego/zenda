import { supabase } from '../../lib/supabaseClient';
import { ProductImagesService } from './product-images';
import {
    Product,
    ProductVariant,
    ProductImage,
    Category,
    Brand,
    ProductListItem,
    ProductDetails,
    ProductFormPayload
} from '../types';

export const ProductsService = {
    /**
     * Fetch products for the dashboard list view from `store_products_view`.
     */
    async getProductsList(storeId: string, filters?: {
        search?: string;
        status?: string;
        category_id?: string;
        brand_id?: string;
    }): Promise<ProductListItem[]> {
        let query = supabase
            .from('store_products_view')
            .select('*')
            .eq('store_id', storeId);

        if (filters?.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }
        if (filters?.status) {
            if (filters.status === 'Active') query = query.eq('is_active', true);
            else if (filters.status === 'Published') query = query.eq('is_published', true);
            else if (filters.status === 'Draft') query = query.eq('is_published', false);
        }
        if (filters?.category_id) {
            query = query.eq('category_id', filters.category_id);
        }
        if (filters?.brand_id) {
            query = query.eq('brand_id', filters.brand_id);
        }

        // Sort by sort_order asc, then id desc
        const { data, error } = await query
            .order('sort_order', { ascending: true })
            .order('id', { ascending: false });

        if (error) {
            console.error('Error fetching products list:', error);
            throw new Error(`Failed to fetch products: ${error.message}`);
        }

        return data || [];
    },

    /**
     * Fetch a single product with variants and images.
     */
    async getProductById(id: string, storeId: string): Promise<ProductDetails> {
        // Fetch product
        const { data: product, error: productError } = await supabase
            .from('products')
            .select(`
                *,
                category:categories(*),
                brand:brands(*)
            `)
            .eq('id', id)
            .eq('store_id', storeId)
            .single();

        if (productError) {
            console.error('Error fetching product details:', productError);
            throw new Error(`Failed to fetch product: ${productError.message}`);
        }

        // Fetch variants
        const { data: variants, error: variantsError } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', id)
            .order('id', { ascending: true });

        if (variantsError) throw variantsError;

        // Fetch images
        const images = await ProductImagesService.getProductImages(id);

        return {
            ...product,
            variants: variants || [],
            images: images || []
        };
    },

    /**
     * Create a product with variants and images.
     */
    async createProduct(payload: ProductFormPayload, storeId: string): Promise<Product> {
        // 1. Insert Product
        const { data: newProduct, error: productError } = await supabase
            .from('products')
            .insert({
                ...payload.product,
                is_published: false, // Always default to false for new products
                store_id: storeId
            })
            .select()
            .single();

        if (productError) throw productError;

        // 2. Insert Variants (only if provided)
        if (payload.variants && payload.variants.length > 0) {
            const { error: variantsError } = await supabase
                .from('product_variants')
                .insert(
                    payload.variants.map((v) => ({
                        ...v,
                        product_id: newProduct.id,
                        store_id: storeId
                    }))
                );

            if (variantsError) {
                // Cleanup product on failure
                await supabase.from('products').delete().eq('id', newProduct.id);
                throw variantsError;
            }
        }

        // 3. Insert Images (only if provided)
        if (payload.images && payload.images.length > 0) {
            const { error: imagesError } = await supabase
                .from('product_images')
                .insert(
                    payload.images.map((img) => ({
                        ...img,
                        product_id: newProduct.id
                    }))
                );

            if (imagesError) {
                // This is bad, but at least we have the product and variants.
                // In a real transactional environment this would be atomic.
                console.error('Error inserting images after product creation:', imagesError);
            }
        }

        return newProduct;
    },

    /**
     * Update a product and its related data using a replace strategy for variants/images.
     */
    async updateProduct(id: string, payload: ProductFormPayload, storeId: string): Promise<Product> {
        // 1. Update Product main fields
        const { data: updatedProduct, error: productError } = await supabase
            .from('products')
            .update(payload.product)
            .eq('id', id)
            .eq('store_id', storeId)
            .select()
            .single();

        if (productError) throw productError;

        // 2. Replace Variants: Delete all then Insert new (only if variants provided)
        if (payload.variants) {
            const { error: deleteVariantsError } = await supabase
                .from('product_variants')
                .delete()
                .eq('product_id', id);

            if (deleteVariantsError) throw deleteVariantsError;

            if (payload.variants.length > 0) {
                const { error: insertVariantsError } = await supabase
                    .from('product_variants')
                    .insert(
                        payload.variants.map((v) => ({
                            ...v,
                            product_id: id,
                            store_id: storeId
                        }))
                    );
                if (insertVariantsError) throw insertVariantsError;
            }
        }

        // 3. Replace Images: Delete all then Insert new (only if images provided)
        if (payload.images && payload.images.length > 0) {
            const { error: deleteImagesError } = await supabase
                .from('product_images')
                .delete()
                .eq('product_id', id);

            if (deleteImagesError) throw deleteImagesError;

            const { error: insertImagesError } = await supabase
                .from('product_images')
                .insert(
                    payload.images.map((img) => ({
                        ...img,
                        product_id: id
                    }))
                );
            if (insertImagesError) throw insertImagesError;
        }

        return updatedProduct;
    },

    /**
     * Delete a product (cascading should handle variants and images).
     */
    async deleteProduct(id: string, storeId: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .eq('store_id', storeId);

        if (error) {
            console.error('Error deleting product:', error);
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    },

    /**
     * Fetch all categories for the store.
     */
    async getCategories(storeId: string): Promise<Category[]> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('store_id', storeId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Fetch all brands for the store.
     */
    async getBrands(storeId: string): Promise<Brand[]> {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .eq('store_id', storeId)
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Create a category.
     */
    async createCategory(data: Omit<Category, 'id' | 'store_id'>, storeId: string): Promise<Category> {
        const { data: newCategory, error } = await supabase
            .from('categories')
            .insert({
                ...data,
                store_id: storeId
            })
            .select()
            .single();

        if (error) throw error;
        return newCategory;
    },

    /**
     * Update a category.
     */
    async updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'store_id'>>, storeId: string): Promise<Category> {
        const { data: updatedCategory, error } = await supabase
            .from('categories')
            .update(data)
            .eq('id', id)
            .eq('store_id', storeId)
            .select()
            .single();

        if (error) throw error;
        return updatedCategory;
    },

    /**
     * Update category status.
     */
    async updateCategoryStatus(id: string, is_active: boolean, storeId: string): Promise<void> {
        const { error } = await supabase
            .from('categories')
            .update({ is_active })
            .eq('id', id)
            .eq('store_id', storeId);

        if (error) throw error;
    },

    /**
     * Delete a category.
     */
    async deleteCategory(id: string, storeId: string): Promise<void> {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('store_id', storeId);

        if (error) throw error;
    },

    /**
     * Create a brand.
     */
    async createBrand(data: Omit<Brand, 'id' | 'store_id'>, storeId: string): Promise<Brand> {
        const { data: newBrand, error } = await supabase
            .from('brands')
            .insert({
                ...data,
                store_id: storeId
            })
            .select()
            .single();

        if (error) throw error;
        return newBrand;
    },

    /**
     * Update a brand.
     */
    async updateBrand(id: string, data: Partial<Omit<Brand, 'id' | 'store_id'>>, storeId: string): Promise<Brand> {
        const { data: updatedBrand, error } = await supabase
            .from('brands')
            .update(data)
            .eq('id', id)
            .eq('store_id', storeId)
            .select()
            .single();

        if (error) throw error;
        return updatedBrand;
    },

    /**
     * Update brand status.
     */
    async updateBrandStatus(id: string, is_active: boolean, storeId: string): Promise<void> {
        const { error } = await supabase
            .from('brands')
            .update({ is_active })
            .eq('id', id)
            .eq('store_id', storeId);

        if (error) throw error;
    },

    /**
     * Delete a brand.
     */
    async deleteBrand(id: string, storeId: string): Promise<void> {
        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id)
            .eq('store_id', storeId);

        if (error) throw error;
    },

    /**
     * Update product status.
     */
    async updateProductStatus(id: string, is_active: boolean, storeId: string): Promise<void> {
        const { data, error } = await supabase
            .from('products')
            .update({ is_active })
            .eq('id', id)
            .eq('store_id', storeId)
            .select();

        if (error) {
            console.error('Error updating product status:', error);
            throw new Error(`Failed to update status: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('فشل تحديث الحالة. قد لا تملك الصلاحيات الكافية أو المنتج غير موجود.');
        }
    },

    /**
     * Toggle product featured status.
     */
    async toggleProductFeatured(id: string, is_featured: boolean, storeId: string): Promise<void> {
        const { data, error } = await supabase
            .from('products')
            .update({ is_featured })
            .eq('id', id)
            .eq('store_id', storeId)
            .select();

        if (error) {
            console.error('Error toggling featured:', error);
            throw new Error(`Failed to toggle featured: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('فشل تحديث التمييز.');
        }
    },

    /**
     * Update product published status.
     */
    async updateProductPublished(id: string, is_published: boolean, storeId: string): Promise<void> {
        const { data, error } = await supabase
            .from('products')
            .update({ is_published })
            .eq('id', id)
            .eq('store_id', storeId)
            .select();

        if (error) {
            console.error('Error updating product published status:', error);
            throw new Error(`Failed to update visibility: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('فشل تحديث حالة النشر.');
        }
    }
};
