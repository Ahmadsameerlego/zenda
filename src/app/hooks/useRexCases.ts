import { useState, useCallback } from 'react';
import { RexCase } from '../types/rex';
import { rexService } from '../services/rexService';

export function useRexCases(storeId: string | undefined) {
    const [cases, setCases] = useState<RexCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCases = useCallback(async () => {
        if (!storeId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await rexService.getCases(storeId);
            setCases(data);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch returns and exchanges');
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    return { cases, loading, error, fetchCases };
}
