import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { Profile } from '../types';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';

interface AuthContextType {
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    profileError: Error | null;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileError, setProfileError] = useState<Error | null>(null);

    const mountedRef = useRef(true);
    const lastUserIdRef = useRef<string | null>(null);
    const fetchPromiseRef = useRef<Promise<Profile | null> | null>(null);
    const profileRef = useRef<Profile | null>(null);
    const isInitializingRef = useRef(true);
    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    const resetAuthState = () => {
        console.log('🧹 AuthProvider: Resetting auth state');
        setSession(null);
        setProfile(null);
        setProfileError(null);
        lastUserIdRef.current = null;
        fetchPromiseRef.current = null;
    };

    const fetchProfile = async (userId: string, force = false): Promise<Profile | null> => {
        if (!force && fetchPromiseRef.current && lastUserIdRef.current === userId) {
            console.log('⚡ AuthProvider: Using existing fetch promise for', userId);
            return fetchPromiseRef.current;
        }

        console.log('🔄 AuthProvider: Starting profile fetch for', userId);
        lastUserIdRef.current = userId;

        const fetcher = async (): Promise<Profile | null> => {
            // TIER 1: Internal network timeout (8s)
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('PROFILE_FETCH_TIMEOUT')), 8000)
            );

            const queryPromise = (async () => {
                setProfileError(null);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, store_id, name, role, is_active')
                    .eq('id', userId)
                    .maybeSingle();

                if (error) throw error;
                return data;
            })();

            try {
                const data = await Promise.race([queryPromise, timeoutPromise]);

                console.log('✅ AuthProvider: Profile fetch success:', data);
                if (mountedRef.current) {
                    setProfile(data ?? null);
                    if (!data) console.warn('⚠️ AuthProvider: No profile record found for user');
                }
                return data ?? null;
            } catch (err: any) {
                console.error('❌ AuthProvider: fetchProfile error or timeout:', err);
                if (mountedRef.current) {
                    setProfile(null);
                    setProfileError(err);
                }
                throw err;
            } finally {
                fetchPromiseRef.current = null;
            }
        };

        fetchPromiseRef.current = fetcher();
        return fetchPromiseRef.current;
    };

    const refreshProfile = async () => {
        const userId = session?.user?.id;
        if (!userId) return;

        console.log('🔁 AuthProvider: Forcing profile refresh for', userId);

        try {
            setLoading(true);
            await fetchProfile(userId, true);
        } catch (err) {
            console.error('❌ AuthProvider: refreshProfile failed:', err);
        } finally {
            if (mountedRef.current) {
                console.log('🏁 AuthProvider: refreshProfile end, setting loading=false');
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        mountedRef.current = true;

        // TIER 3: Absolute Component-Level Emergency Hatch (15s)
        // This guarantees that the loader WILL disappear even if everything else fails.
        const emergencyTimeoutId = setTimeout(() => {
            if (mountedRef.current && loading) {
                console.error('🚨 AuthProvider: CRITICAL - Emergency 15s timeout reached. Forcefully unlocking UI.');
                setLoading(false);
                isInitializingRef.current = false;
            }
        }, 15000);

        const initializeAuth = async () => {
            // TIER 2: Process-level safety timeout (10s)
            const bootstrapTimeoutId = setTimeout(() => {
                if (mountedRef.current && loading) {
                    console.warn('⚠️ AuthProvider: Bootstrap timeout reached (10s), forcing loading=false');
                    setLoading(false);
                }
            }, 10000);

            try {
                console.log('� AuthProvider: START bootstrap process');

                const {
                    data: { session: initialSession },
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (sessionError) console.error('❌ AuthProvider: getSession error:', sessionError);
                if (!mountedRef.current) return;

                setSession(initialSession);
                console.log('📊 AuthProvider: initialSession check:', initialSession ? `User: ${initialSession.user.id}` : 'No Session');

                if (initialSession?.user?.id) {
                    try {
                        console.log('👤 AuthProvider: Session exists, fetching profile...');
                        // No need to set loading=true here as it starts as true
                        await fetchProfile(initialSession.user.id);
                    } catch (err) {
                        console.error('❌ AuthProvider: Initial profile fetch failed', err);
                    }
                } else {
                    console.log('⚪ AuthProvider: No initial session');
                    resetAuthState();
                }

            } catch (error) {
                console.error('❌ AuthProvider: UNCAUGHT Auth initialization error:', error);
            } finally {
                clearTimeout(bootstrapTimeoutId);
                if (mountedRef.current) {
                    isInitializingRef.current = false;
                    console.log('🏁 AuthProvider: END bootstrap process, setting loading=false');
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!mountedRef.current) return;

            console.log(`🔔 AuthProvider: EVENT onAuthStateChange: ${event}`);

            if (event === 'INITIAL_SESSION' && isInitializingRef.current) {
                console.log('⏭️ AuthProvider: Skipping INITIAL_SESSION (Manual init in progress)');
                return;
            }

            const newUserId = newSession?.user?.id ?? null;
            setSession(newSession);

            if (!newUserId) {
                console.log('👋 AuthProvider: Session cleared');
                resetAuthState();
                setLoading(false);
                return;
            }

            const isSameUser = lastUserIdRef.current === newUserId;
            const hasProfileLoaded = !!profileRef.current;
            const alreadyFetching = !!fetchPromiseRef.current;

            console.log('🧠 AuthProvider: Event state check', { event, isSameUser, hasProfileLoaded, alreadyFetching });

            if (isSameUser && hasProfileLoaded && !alreadyFetching) {
                console.log('✅ AuthProvider: User and Profile already synced, skipping fetch');
                setLoading(false);
                return;
            }

            // TIER 2: Event-level safety timeout
            const eventTimeoutId = setTimeout(() => {
                if (mountedRef.current && loading) {
                    console.warn(`⚠️ AuthProvider: Event ${event} timeout reached (8s), forcing loading=false`);
                    setLoading(false);
                }
            }, 8000);

            try {
                if (!alreadyFetching) {
                    console.log('🔄 AuthProvider: Auth event triggered profile fetch...');
                    setLoading(true);
                    await fetchProfile(newUserId);
                } else {
                    console.log('⚡ AuthProvider: Joining existing fetch promise...');
                    await fetchPromiseRef.current;
                }
            } catch (err) {
                console.error('❌ AuthProvider: Auth event fetch failed', err);
            } finally {
                clearTimeout(eventTimeoutId);
                if (mountedRef.current) {
                    console.log(`🏁 AuthProvider: END processing ${event}, setting loading=false`);
                    setLoading(false);
                }
            }
        });

        return () => {
            mountedRef.current = false;
            clearTimeout(emergencyTimeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        resetAuthState();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        );
    }

    if (session && !profile && !loading && profileError) {
        return (
            <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center bg-muted p-4">
                <div className="bg-card p-8 rounded-lg shadow-md max-w-md w-full text-center space-y-6">
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                    </div>

                    <h2 className="text-xl font-bold text-foreground">
                        حدث خطأ أثناء تحميل الملف الشخصي
                    </h2>

                    <p className="text-muted-foreground">
                        عذرًا، لم نتمكن من تحميل بيانات حسابك. جرّب إعادة المحاولة أو تسجيل الخروج ثم الدخول مرة أخرى.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button onClick={refreshProfile} variant="outline" className="w-full">
                            إعادة تحميل الملف الشخصي
                        </Button>

                        <Button
                            onClick={handleSignOut}
                            variant="destructive"
                            className="w-full gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            تسجيل الخروج
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (session && !profile && !loading) {
        return (
            <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center bg-muted p-4">
                <div className="bg-card p-8 rounded-lg shadow-md max-w-md w-full text-center space-y-6">
                    <h2 className="text-xl font-bold text-foreground">
                        جاري إعداد حسابك...
                    </h2>

                    <p className="text-muted-foreground">
                        يبدو أن ملف التعريف الخاص بك غير جاهز بعد. جرّب إعادة التحميل.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button onClick={refreshProfile} variant="outline" className="w-full">
                            إعادة المحاولة
                        </Button>

                        <Button
                            onClick={handleSignOut}
                            variant="destructive"
                            className="w-full gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            تسجيل الخروج
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                session,
                profile,
                loading,
                profileError,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}