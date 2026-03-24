-- update_get_dashboard_metrics.sql
-- Enhanced to include deltas and comparisons

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics(
  p_from timestamptz DEFAULT (now() - interval '30 days'),
  p_to timestamptz DEFAULT now()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id uuid;
  v_duration interval;
  v_prev_from timestamptz;
  v_prev_to timestamptz;
  
  -- Current Metrics
  v_rev decimal;
  v_del_count int;
  v_total_count int;
  v_canc_count int;
  
  -- Previous Metrics
  v_prev_rev decimal;
  v_prev_del_count int;
  v_prev_total_count int;
  v_prev_canc_count int;
  
  -- Calculations
  v_aov decimal;
  v_prev_aov decimal;
  v_canc_rate decimal;
  v_prev_canc_rate decimal;
  
  v_returning_count int;
  v_at_risk_count int;
  v_top20_rev decimal;
  v_total_rev_all decimal;
  
  v_result json;
BEGIN
  -- 1. Get store_id
  SELECT store_id INTO v_store_id FROM profiles WHERE id = auth.uid();
  IF v_store_id IS NULL THEN RETURN json_build_object('error', 'Store not found'); END IF;

  -- 2. Setup Ranges
  v_duration := p_to - p_from;
  v_prev_to := p_from;
  v_prev_from := p_from - v_duration;

  -- 3. Current Period Metrics
  SELECT 
    COALESCE(SUM(total), 0),
    COUNT(*) FILTER (WHERE status = 'Delivered'),
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('Cancelled', 'Returned'))
  INTO v_rev, v_del_count, v_total_count, v_canc_count
  FROM orders WHERE store_id = v_store_id AND created_at >= p_from AND created_at <= p_to;

  v_aov := CASE WHEN v_del_count > 0 THEN v_rev / v_del_count ELSE 0 END;
  v_canc_rate := CASE WHEN (v_del_count + v_canc_count) > 0 THEN (v_canc_count::decimal / (v_del_count + v_canc_count)) * 100 ELSE 0 END;

  -- 4. Previous Period Metrics
  SELECT 
    COALESCE(SUM(total), 0),
    COUNT(*) FILTER (WHERE status = 'Delivered'),
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('Cancelled', 'Returned'))
  INTO v_prev_rev, v_prev_del_count, v_prev_total_count, v_prev_canc_count
  FROM orders WHERE store_id = v_store_id AND created_at >= v_prev_from AND created_at <= v_prev_to;

  v_prev_aov := CASE WHEN v_prev_del_count > 0 THEN v_prev_rev / v_prev_del_count ELSE 0 END;
  v_prev_canc_rate := CASE WHEN (v_prev_del_count + v_prev_canc_count) > 0 THEN (v_prev_canc_count::decimal / (v_prev_del_count + v_prev_canc_count)) * 100 ELSE 0 END;

  -- 5. Store-wide Metrics (Lifetime/Contextual)
  -- Returning: customers with 2+ delivered orders total
  SELECT COUNT(*) INTO v_returning_count FROM (
    SELECT customer_phone FROM orders WHERE store_id = v_store_id AND status = 'Delivered' GROUP BY customer_phone HAVING COUNT(*) >= 2
  ) c;

  -- At Risk: had delivered order before (p_from - 45d) but NONE since then
  -- User requested: 45 days or more without delivered order
  SELECT COUNT(DISTINCT customer_phone) INTO v_at_risk_count FROM orders
  WHERE store_id = v_store_id AND status = 'Delivered' AND created_at < (now() - interval '45 days')
    AND customer_phone NOT IN (SELECT customer_phone FROM orders WHERE store_id = v_store_id AND status = 'Delivered' AND created_at >= (now() - interval '45 days'));

  -- 6. Top 20 Contribution (Current range)
  WITH cust_rev AS (
    SELECT SUM(total) as r FROM orders WHERE store_id = v_store_id AND created_at >= p_from AND created_at <= p_to GROUP BY customer_phone ORDER BY r DESC LIMIT 20
  )
  SELECT COALESCE(SUM(r), 0) INTO v_top20_rev FROM cust_rev;

  -- 7. Build Result
  v_result := json_build_object(
    'range', json_build_object('from', p_from, 'to', p_to),
    'previous_range', json_build_object('from', v_prev_from, 'to', v_prev_to),
    'revenue', v_rev,
    'delivered_orders_count', v_del_count,
    'aov', v_aov,
    'returning_customers_count', v_returning_count,
    'at_risk_customers_count', v_at_risk_count,
    'cancellation_rate', v_canc_rate,
    'top20_customers_contribution', CASE WHEN v_rev > 0 THEN (v_top20_rev / v_rev) * 100 ELSE 0 END,
    'deltas', json_build_object(
      'revenue', json_build_object('prev', v_prev_rev, 'delta', v_rev - v_prev_rev, 'delta_pct', CASE WHEN v_prev_rev > 0 THEN ((v_rev - v_prev_rev) / v_prev_rev) * 100 ELSE NULL END),
      'delivered_orders_count', json_build_object('prev', v_prev_del_count, 'delta', v_del_count - v_prev_del_count, 'delta_pct', CASE WHEN v_prev_del_count > 0 THEN ((v_del_count - v_prev_del_count)::decimal / v_prev_del_count) * 100 ELSE NULL END),
      'aov', json_build_object('prev', v_prev_aov, 'delta', v_aov - v_prev_aov, 'delta_pct', CASE WHEN v_prev_aov > 0 THEN ((v_aov - v_prev_aov) / v_prev_aov) * 100 ELSE NULL END),
      'cancellation_rate', json_build_object('prev', v_prev_canc_rate, 'delta', v_canc_rate - v_prev_canc_rate, 'delta_pct', CASE WHEN v_prev_canc_rate > 0 THEN ((v_canc_rate - v_prev_canc_rate) / v_prev_canc_rate) * 100 ELSE NULL END)
    ),
    'latest_orders', (
      SELECT COALESCE(json_agg(l), '[]'::json) FROM (
        SELECT id, id as order_number, customer_name, customer_phone, status, subtotal, discount, created_at, (SELECT count(*) FROM order_items WHERE order_id = orders.id) as items_count
        FROM orders WHERE store_id = v_store_id ORDER BY created_at DESC LIMIT 5
      ) l
    ),
    'top_customers', (
      SELECT COALESCE(json_agg(tc), '[]'::json) FROM (
        SELECT 
          customer_phone as customer_id,
          customer_phone as phone, 
          MAX(customer_name) as name, 
          SUM(total) as revenue,
          COUNT(*) FILTER (WHERE status = 'Delivered') as delivered_orders_count,
          MAX(created_at) FILTER (WHERE status = 'Delivered') as last_delivered_at,
          CASE WHEN v_rev > 0 THEN (SUM(total) / v_rev) * 100 ELSE 0 END as contribution_pct
        FROM orders 
        WHERE store_id = v_store_id AND created_at >= p_from AND created_at <= p_to 
        GROUP BY customer_phone 
        ORDER BY revenue DESC 
        LIMIT 5
      ) tc
    )
  );

  RETURN v_result;
END;
$$;
