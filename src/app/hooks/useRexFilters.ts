import { useState, useMemo } from 'react';
import { RexFilters, RexType, RexStatus, RexRefundStatus } from '../types/rex';

export function useRexFilters() {
    const [filters, setFilters] = useState<RexFilters>({
        search: '',
        type: 'all',
        status: 'all',
        refund_status: 'all',
        date_range: 'all',
    });

    const updateFilter = <K extends keyof RexFilters>(key: K, value: RexFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            type: 'all',
            status: 'all',
            refund_status: 'all',
            date_range: 'all',
        });
    };

    return { filters, updateFilter, resetFilters };
}
