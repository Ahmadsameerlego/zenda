import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !session) {
            navigate('/login', { replace: true, state: { from: location } });
        }
    }, [loading, session, navigate, location]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return <>{children}</>;
}
