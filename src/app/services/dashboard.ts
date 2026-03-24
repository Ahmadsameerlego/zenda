import { supabase } from '../../lib/supabaseClient';

export interface DeltaInfo {
    prev: number;
    delta: number;
    delta_pct: number | null;
}

export interface DashboardMetrics {
    range: { from: string; to: string };
    previous_range: { from: string; to: string };
    revenue: number;
    delivered_orders_count: number;
    aov: number;
    returning_customers_count: number;
    at_risk_customers_count: number;
    cancellation_rate: number;
    top20_customers_contribution: number;
    deltas: {
        revenue: DeltaInfo;
        delivered_orders_count: DeltaInfo;
        aov: DeltaInfo;
        cancellation_rate: DeltaInfo;
    };
    latest_orders: {
        id: string;
        order_number: string;
        customer_name: string;
        customer_phone: string;
        status: string;
        subtotal: number;
        discount: number;
        created_at: string;
        items_count: number;
    }[];
    top_customers: {
        customer_id: string;
        name: string;
        phone: string;
        revenue: number;
        delivered_orders_count: number;
        last_delivered_at: string;
        contribution_pct: number;
    }[];
}

export const DashboardService = {
    async getDashboardMetrics(from?: string, to?: string): Promise<DashboardMetrics> {
        const params: any = {};
        if (from) params.p_from = from;
        if (to) params.p_to = to;

        const { data, error } = await supabase.rpc('get_dashboard_metrics', params);
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        return data as DashboardMetrics;
    },
};
