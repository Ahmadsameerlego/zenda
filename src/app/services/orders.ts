import { supabase } from '../../lib/supabaseClient';
import { Product, ProductVariant } from '../types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
    customer_phone: string;
    customer_name: string;
    customer_address: string;
    notes?: string;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    status: string;
}

export interface CreateOrderItemPayload {
    variant_id: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

export interface OrderRow {
    id: string;
    store_id: string;
    customer_phone: string;
    customer_name: string;
    customer_address: string;
    notes: string | null;
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    status: string;
    created_at: string;
    order_items?: OrderItemRow[];
}

export interface OrderItemRow {
    id: string;
    order_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    line_total: number;
}

export interface CustomerLookupResult {
    name: string;
    address: string;
    phone: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const OrdersService = {
    /**
     * Fetch all orders for a store, newest first.
     */
    async getOrders(storeId: string): Promise<OrderRow[]> {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(*)
            `)
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Fetch active products with their active variants for the order form selects.
     */
    async getActiveProducts(storeId: string): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                variants:product_variants(*)
            `)
            .eq('store_id', storeId)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) throw error;

        return (data || []).map((p: any) => ({
            id: p.id,
            store_id: p.store_id,
            name: p.name,
            cost_price: p.cost_price,
            is_active: p.is_active,
            created_at: p.created_at,
            category_id: p.category_id,
            brand_id: p.brand_id,
            description: p.description,
            sort_order: p.sort_order,
            variants: (p.variants || [])
                .filter((v: any) => v.is_active)
                .map((v: any) => ({
                    id: v.id,
                    product_id: v.product_id,
                    store_id: v.store_id,
                    size: v.size,
                    color: v.color,
                    sku: v.sku,
                    is_active: v.is_active,
                    stock_quantity: v.stock_quantity,
                    sale_price: v.sale_price,
                    compare_at_price: v.compare_at_price,
                    cost_price: v.cost_price,
                })),
        }));
    },

    /**
     * Look up customer by phone scoped to store.
     * Tries `customers` table first. If it doesn't exist (Supabase 404/relation error),
     * falls back to searching existing orders by phone.
     */
    async customerLookupByPhone(phone: string, storeId: string): Promise<CustomerLookupResult | null> {
        // Try customers table
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('name, phone, address')
                .eq('phone', phone)
                .eq('store_id', storeId)
                .limit(1)
                .maybeSingle();

            if (!error && data) {
                return {
                    name: data.name,
                    address: data.address,
                    phone: data.phone,
                };
            }
        } catch {
            // Table may not exist — fall through to fallback
        }

        // Fallback: search orders by phone
        try {
            const { data } = await supabase
                .from('orders')
                .select('customer_name, customer_phone, customer_address')
                .eq('customer_phone', phone)
                .eq('store_id', storeId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                return {
                    name: data.customer_name,
                    address: data.customer_address,
                    phone: data.customer_phone,
                };
            }
        } catch {
            // Ignore fallback errors
        }

        return null;
    },

    /**
     * Create an order with items.
     * Pseudo-transaction: insert order → insert items → rollback order on item failure.
     */
    async createOrder(
        order: CreateOrderPayload,
        items: CreateOrderItemPayload[],
        storeId: string
    ): Promise<OrderRow> {
        // 1. Insert order
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert({
                store_id: storeId,
                customer_phone: order.customer_phone,
                customer_name: order.customer_name,
                customer_address: order.customer_address,
                notes: order.notes || null,
                subtotal: order.subtotal,
                discount: order.discount,
                shipping: order.shipping,
                total: order.total,
                status: order.status,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Bulk insert items
        const itemRows = items.map(item => ({
            order_id: newOrder.id,
            store_id: storeId,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.line_total,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemRows);

        if (itemsError) {
            // 3. Best-effort rollback: delete orphan order
            await supabase
                .from('orders')
                .delete()
                .eq('id', newOrder.id)
                .eq('store_id', storeId);

            throw itemsError;
        }

        // 4. Upsert customer (fire-and-forget, non-blocking)
        // TODO: Only runs if customers table exists; errors are silently ignored
        try {
            await supabase
                .from('customers')
                .upsert(
                    {
                        phone: order.customer_phone,
                        store_id: storeId,
                        name: order.customer_name,
                        address: order.customer_address,
                    },
                    { onConflict: 'phone,store_id' }
                );
        } catch {
            // Silently ignore — customers table may not exist
        }

        return newOrder;
    },

    /**
     * Fetch a single order by ID with items and product/variant details.
     */
    async getOrderById(orderId: string, storeId: string): Promise<any> {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(
                    *,
                    variant:product_variants(
                        id,
                        size,
                        color,
                        sku,
                        sale_price,
                        product:products(
                            id,
                            name
                        )
                    )
                )
            `)
            .eq('id', orderId)
            .eq('store_id', storeId)
            .single();

        if (error) throw error;
        if (!data) throw new Error('الطلب غير موجود');

        // Map order items to include product info
        const items = (data.order_items || []).map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.line_total,
            product_name: item.variant?.product?.name || '',
            variant_size: item.variant?.size || null,
            variant_color: item.variant?.color || null,
            variant_sku: item.variant?.sku || null,
        }));

        return {
            ...data,
            order_items: items,
        };
    },

    /**
     * Update order status.
     */
    async updateOrderStatus(orderId: string, status: string, storeId: string): Promise<void> {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .eq('store_id', storeId);

        if (error) throw error;
    },

    /**
     * Fetch Rex cases linked to a specific order.
     */
    async getLinkedRexCases(orderId: string, storeId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('order_rex')
            .select(`
                *,
                order:orders(customer_name, customer_phone, customer_address),
                items:order_rex_items(*)
            `)
            .eq('order_id', orderId)
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },
};
