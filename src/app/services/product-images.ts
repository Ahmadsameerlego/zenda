import { supabase } from '../../lib/supabaseClient';
import { ProductImage } from '../types';

export const ProductImagesService = {
    /**
     * Upload an image to Supabase Storage and create a DB record.
     */
    async uploadProductImage(file: File, productId: string, storeId: string): Promise<ProductImage> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
        const filePath = `store-${storeId}/product-${productId}/${fileName}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        // 3. Create DB Record
        // First check if this is the first image to make it primary
        const { count } = await supabase
            .from('product_images')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', productId);

        const isPrimary = (count || 0) === 0;

        const { data: dbImage, error: dbError } = await supabase
            .from('product_images')
            .insert({
                store_id: storeId,
                product_id: productId,
                image_url: publicUrl,
                alt_text: null,
                is_primary: isPrimary,
                sort_order: (count || 0) + 1
            })
            .select()
            .single();

        if (dbError) {
            // Cleanup storage if DB fails
            await supabase.storage.from('product-images').remove([filePath]);
            throw dbError;
        }

        return dbImage;
    },

    /**
     * Fetch images for a product.
     */
    async getProductImages(productId: string): Promise<ProductImage[]> {
        const { data, error } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', productId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Set an image as primary and unset others for the same product.
     */
    async setPrimaryImage(imageId: string, productId: string): Promise<void> {
        // Unset any existing primary
        await supabase
            .from('product_images')
            .update({ is_primary: false })
            .eq('product_id', productId);

        // Set the new primary
        const { error } = await supabase
            .from('product_images')
            .update({ is_primary: true })
            .eq('id', imageId);

        if (error) throw error;
    },

    /**
     * Delete an image from storage and DB.
     */
    async deleteProductImage(imageId: string): Promise<void> {
        // 1. Get the image details to find the storage path
        const { data: image, error: fetchError } = await supabase
            .from('product_images')
            .select('*')
            .eq('id', imageId)
            .single();

        if (fetchError) throw fetchError;

        // Extract path from public URL
        const urlParts = image.image_url.split('/product-images/');
        if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from('product-images').remove([filePath]);
        }

        // 2. Delete from DB
        const { error: dbError } = await supabase
            .from('product_images')
            .delete()
            .eq('id', imageId);

        if (dbError) throw dbError;
    },

    /**
     * Update sort_order for multiple images.
     */
    async updateImageOrder(images: { id: string, sort_order: number }[]): Promise<void> {
        const promises = images.map(img =>
            supabase
                .from('product_images')
                .update({ sort_order: img.sort_order })
                .eq('id', img.id)
        );

        const results = await Promise.all(promises);
        const error = results.find(r => r.error);
        if (error) throw error.error;
    }
};
