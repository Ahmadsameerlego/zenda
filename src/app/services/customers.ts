import { supabase } from '../../lib/supabaseClient';
import { NormalizedCustomer, CustomerListItem, CustomerProfile, CustomerOrder } from '../types';

// ─── Adapter Layer ──────────────────────────────────────────────────────────

export function normalizeCustomer(row: any): NormalizedCustomer {
    return {
        id: row.id || row.customer_id,
        store_id: row.store_id,
        name: row.name || 'عميل غير معروف',
        phone: row.phone || '—',
        city: row.city || null,
        address: row.address || null,
        notes: row.notes || null,
        created_at: row.created_at || new Date().toISOString(),
        first_order_date: row.first_order_date || null,

        // Core metrics
        total_orders_count: row.total_orders_count ?? row.total_orders ?? 0,
        delivered_orders_count: row.delivered_orders_count ?? row.delivered_orders ?? 0,
        cancelled_orders_count: row.cancelled_orders_count ?? row.cancelled_orders ?? 0,
        returned_orders_count: row.returned_orders_count ?? row.returned_orders ?? 0,
        bad_orders_count: row.bad_orders_count ?? 0,

        // Value metrics
        total_spent: row.total_spent ?? 0,
        avg_order_value: row.avg_order_value ?? row.average_order_value ?? 0,

        // Recency
        last_order_at: row.last_order_at ?? row.last_order_date ?? null,
        days_since_last_delivered: row.days_since_last_delivered ?? row.days_since_last_order ?? null,

        // Intelligence
        score: row.score ?? 0,
        segment: row.segment ?? row.customer_segment ?? 'new',
        risk_level: row.risk_level ?? 'low',
    };
}

// ─── Customers Service ──────────────────────────────────────────────────────

export const CustomersService = {
    /**
     * Fetch all customers for a store, merged with customer_metrics_view.
     */
    async getCustomersList(storeId: string): Promise<NormalizedCustomer[]> {
        const [listRes, metricsRes] = await Promise.all([
            supabase
                .from('customers_list_view')
                .select('*')
                .eq('store_id', storeId)
                .order('total_spent', { ascending: false }),
            supabase
                .from('customer_metrics_view')
                .select('*')
                .eq('store_id', storeId)
        ]);

        if (listRes.error) throw listRes.error;
        if (metricsRes.error) console.error('Error fetching metrics view:', metricsRes.error);

        const metricsData = metricsRes.data || [];
        const metricsMap = new Map(metricsData.map(m => [m.customer_id || m.id, m]));

        const merged = (listRes.data || []).map(row => {
            const metrics = metricsMap.get(row.customer_id || row.id) || {};
            return { ...row, ...metrics };
        });

        const normalized = merged.map(normalizeCustomer);

        if (normalized.length > 0) {
            console.log('Normalized Customer Data Example (List):', normalized[0]);
        }

        return normalized;
    },

    /**
     * Fetch a single customer profile, merged with customer_metrics_view.
     */
    async getCustomerProfile(customerId: string, storeId: string): Promise<NormalizedCustomer | null> {
        const profileRes = await supabase
            .from('customer_profile_view')
            .select('*')
            .eq('id', customerId)
            .eq('store_id', storeId)
            .maybeSingle();

        if (profileRes.error) throw profileRes.error;
        if (!profileRes.data) return null;

        // Safely fetch metrics (different views might use customer_id or id)
        let metricsData = null;
        const metricsRes1 = await supabase
            .from('customer_metrics_view')
            .select('*')
            .eq('customer_id', customerId)
            .eq('store_id', storeId)
            .maybeSingle();

        if (!metricsRes1.error && metricsRes1.data) {
            metricsData = metricsRes1.data;
        } else {
            const metricsRes2 = await supabase
                .from('customer_metrics_view')
                .select('*')
                .eq('id', customerId)
                .eq('store_id', storeId)
                .maybeSingle();
            if (!metricsRes2.error && metricsRes2.data) {
                metricsData = metricsRes2.data;
            } else {
                console.error('Customer metrics not found for profile:', customerId);
            }
        }

        const mergedRow = { ...profileRes.data, ...(metricsData || {}) };
        const normalized = normalizeCustomer(mergedRow);

        console.log('Normalized Customer Data Example (Profile):', normalized);

        return normalized;
    },

    /**
     * Fetch all orders for a specific customer from customer_orders_view.
     */
    async getCustomerOrders(customerId: string, storeId: string): Promise<CustomerOrder[]> {
        const { data, error } = await supabase
            .from('customer_orders_view')
            .select('*')
            .eq('customer_id', customerId)
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },
};
