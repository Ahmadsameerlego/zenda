export type RexType = 'return' | 'exchange';
export type RexStatus = 'new' | 'pending' | 'processing' | 'completed' | 'cancelled';
export type RexRefundStatus = 'pending' | 'processed' | 'not_applicable';

export interface RexItem {
    id: string;
    rex_id: string;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    original_price: number;
    reason: string | null;
    created_at: string;
}

export interface RexCase {
    id: string;
    store_id: string;
    order_id: string;
    customer_name: string;
    customer_phone: string;
    type: RexType;
    status: RexStatus;
    refund_status: RexRefundStatus;
    reason: string | null;
    refund_amount: number;
    exchange_diff: number;
    notes: string | null;
    created_at: string;
    updated_at: string;

    // joined from order_rex_items if fetched together, or separately
    items?: RexItem[];
}

export interface CreateRexPayload {
    store_id: string;
    order_id: string;
    customer_name: string;
    customer_phone: string;
    type: RexType;
    reason: string | null;
    notes: string | null;
    refund_amount?: number;
    exchange_diff?: number;
    items: {
        product_name: string;
        variant_name: string | null;
        quantity: number;
        original_price: number;
        reason: string | null;
    }[];
}

export interface RexFilters {
    search: string;
    type: RexType | 'all';
    status: RexStatus | 'all';
    refund_status: RexRefundStatus | 'all';
    date_range: 'all' | 'today' | 'last_7_days' | 'this_month';
}
