import { supabase } from '../../lib/supabaseClient';
import { RexCase, RexStatus, RexRefundStatus, CreateRexPayload } from '../types/rex';

export const rexService = {
    async getCases(storeId: string): Promise<RexCase[]> {
        const { data, error } = await supabase
            .from('order_rex')
            .select(`
                *,
                order:orders(customer_name, customer_phone, customer_address),
                items:order_rex_items(
                    *,
                    old_variant:product_variants!old_variant_id(id, size, color, sku, product:products(name)),
                    new_variant:product_variants!new_variant_id(id, size, color, sku, product:products(name))
                )
            `)
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching rex cases:', error);
            throw error;
        }

        return data || [];
    },

    async updateStatus(caseId: string, status: RexStatus): Promise<void> {
        const { error } = await supabase
            .from('order_rex')
            .update({ status })
            .eq('id', caseId);

        if (error) throw error;
    },

    async updateRefundStatus(caseId: string, refund_status: RexRefundStatus): Promise<void> {
        const { error } = await supabase
            .from('order_rex')
            .update({ refund_status })
            .eq('id', caseId);

        if (error) throw error;
    },

    async createCase(payload: CreateRexPayload): Promise<RexCase> {
        const { items, ...caseData } = payload;

        // 1. Insert parent case
        const { data: newCase, error: caseError } = await supabase
            .from('order_rex')
            .insert([{
                ...caseData,
            }])
            .select()
            .single();

        if (caseError) throw caseError;

        // 2. Insert items if any
        if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
                ...item,
                rex_id: newCase.id,
            }));

            const { error: itemsError } = await supabase
                .from('order_rex_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;
        }

        return newCase;
    }
};
