import { RexCase } from './rex';

// ─── Order Status ────────────────────────────────────────────────────────────
// Must match the Supabase enum `order_status` exactly (all lowercase):
// new, pending, confirmed, shipped, delivered, returned, exchanged, cancelled

export type OrderStatus =
    | 'new'
    | 'pending'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'returned'
    | 'exchanged'
    | 'cancelled';

export interface OrderStatusOption {
    value: OrderStatus;
    label: string;
    color: string;      // badge classes
    darkColor: string;   // dark mode badge classes
    icon?: string;       // optional emoji
}

export const ORDER_STATUSES: OrderStatusOption[] = [
    {
        value: 'new',
        label: 'جديد',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        darkColor: 'dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        icon: '🆕',
    },
    {
        value: 'pending',
        label: 'قيد الانتظار',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        darkColor: 'dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
        icon: '⏳',
    },
    {
        value: 'confirmed',
        label: 'تم التأكيد',
        color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        darkColor: 'dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800',
        icon: '✔️',
    },
    {
        value: 'shipped',
        label: 'تم الشحن',
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        darkColor: 'dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
        icon: '📦',
    },
    {
        value: 'delivered',
        label: 'تم التسليم',
        color: 'bg-green-50 text-green-700 border-green-200',
        darkColor: 'dark:bg-green-950/40 dark:text-green-400 dark:border-green-800',
        icon: '✅',
    },
    {
        value: 'returned',
        label: 'مرتجع',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        darkColor: 'dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700',
        icon: '↩️',
    },
    {
        value: 'exchanged',
        label: 'تم الاستبدال',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        darkColor: 'dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
        icon: '🔄',
    },
    {
        value: 'cancelled',
        label: 'ملغي',
        color: 'bg-red-50 text-red-700 border-red-200',
        darkColor: 'dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
        icon: '❌',
    },
];

// ─── Status Helpers ──────────────────────────────────────────────────────────

export function getOrderStatusOption(status: string): OrderStatusOption {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
}

export function getOrderStatusLabel(status: string): string {
    return getOrderStatusOption(status).label;
}

export function getOrderStatusBadgeClasses(status: string): string {
    const opt = getOrderStatusOption(status);
    return `${opt.color} ${opt.darkColor}`;
}

/** Convert a legacy capitalized status to the correct lowercase DB value */
export function normalizeOrderStatus(status: string): OrderStatus {
    const map: Record<string, OrderStatus> = {
        'New': 'new',
        'Processing': 'confirmed',
        'Shipped': 'shipped',
        'Delivered': 'delivered',
        'Cancelled': 'cancelled',
        'Returned': 'returned',
    };
    return map[status] || (status.toLowerCase() as OrderStatus);
}

// Status progression for the timeline stepper
export const STATUS_PROGRESSION: OrderStatus[] = [
    'new', 'confirmed', 'shipped', 'delivered',
];

// ─── Extended Order Types ────────────────────────────────────────────────────

export interface OrderItemWithProduct {
    id: string;
    order_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    // joined product/variant info
    product_name?: string;
    variant_size?: string;
    variant_color?: string;
    variant_sku?: string;
    product_image?: string;
}

export interface OrderDetails {
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
    order_items: OrderItemWithProduct[];
    rex_cases?: RexCase[];
}

// ─── Order Stats ─────────────────────────────────────────────────────────────

export interface OrderStats {
    total: number;
    new: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
}
