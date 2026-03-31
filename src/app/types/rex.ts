export type RexType = 'return' | 'exchange';
export type RexStatus = 'new' | 'pending' | 'processing' | 'completed' | 'cancelled';
export type RexRefundStatus = 'pending' | 'processed' | 'not_applicable';

export interface RexItem {
    id: string;
    rex_id: string;
    store_id: string;
    old_variant_id: string;
    new_variant_id: string | null;
    quantity: number;
    created_at: string;
    
    // joined from product_variants -> products
    old_variant?: {
        id: string;
        size: string | null;
        color: string | null;
        sku: string | null;
        product: {
            name: string;
        };
    };
    new_variant?: {
        id: string;
        size: string | null;
        color: string | null;
        sku: string | null;
        product: {
            name: string;
        };
    };
}

export interface RexCase {
    id: string;
    store_id: string;
    order_id: string;
    type: RexType;
    status: RexStatus;
    refund_status: RexRefundStatus;
    reason: string | null;
    difference_amount: number;
    return_shipping_cost: number;
    exchange_shipping_cost: number;
    notes: string | null;
    created_at: string;

    // joined from order_rex_items
    items?: RexItem[];

    // joined from orders table
    order?: {
        customer_name: string;
        customer_phone: string;
        customer_address: string;
    };
}

export interface CreateRexPayload {
    store_id: string;
    order_id: string;
    type: RexType;
    reason: string | null;
    notes: string | null;
    difference_amount: number;
    items: {
        store_id: string;
        old_variant_id: string;
        new_variant_id?: string | null;
        quantity: number;
    }[];
}

export interface RexFilters {
    search: string;
    type: RexType | 'all';
    status: RexStatus | 'all';
    refund_status: RexRefundStatus | 'all';
    date_range: 'all' | 'today' | 'last_7_days' | 'this_month';
}
