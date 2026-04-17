export type AlertType = 'risk' | 'opportunity' | 'info';
export type AlertCategory = 'products' | 'customers' | 'orders';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AlertMeta {
  top_product_name?: string;
  top_city?: string;
  top_reason?: string;
  cancel_rate?: string | number;
  spike?: string | number;
}

export interface Alert {
  id: string;
  type: AlertType;
  category: AlertCategory;
  title: string;
  description: string;
  metric_value: string;
  meta: AlertMeta;
  is_read: boolean;
  triggered_at: string;
  priority: AlertPriority;
  why_text: string;
  action_text: string;
  target_url: string;
}

export interface AlertSummary {
  risk: number;
  opportunity: number;
  info: number;
}
