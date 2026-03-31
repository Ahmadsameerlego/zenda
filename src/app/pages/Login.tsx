import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabaseClient';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { AlertCircle, Lock, Mail, Loader2 } from 'lucide-react';

export function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    // Redirect if already logged in
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/', { replace: true });
        });
    }, [navigate]);

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        let isValid = true;

        if (!email) {
            newErrors.email = 'البريد الإلكتروني مطلوب';
            isValid = false;
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            newErrors.email = 'بريد إلكتروني غير صحيح';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'كلمة المرور مطلوبة';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        console.log('Form Submitted. Mode:', mode);
        console.log('Email:', email);
        console.log('Password length:', password.length);

        if (!validate()) {
            console.log('Validation failed', errors);
            return;
        }

        setIsLoading(true);
        setAuthError(null);

        console.log('Sending request to Supabase', email);

        try {
            if (mode === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });
                console.log('Supabase SignUp Response:', { data, error });

                if (error) throw error;

                setAuthError("تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني للتفعيل إذا لزم الأمر، أو تسجيل الدخول.");
                setMode('signin');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                console.log('Supabase SignIn Response:', { data, error });

                if (error) throw error;
                navigate('/', { replace: true });
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            // Translate common errors
            let message = 'حدث خطأ غير متوقع';
            if (error.message?.includes('Invalid login credentials')) message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
            if (error.message?.includes('Email not confirmed')) message = 'البريد الإلكتروني غير مفعل';
            if (error.message?.includes('User already registered')) message = 'هذا البريد الإلكتروني مسجل بالفعل';

            setAuthError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4" dir="rtl">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">
                            {mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {mode === 'signin'
                                ? 'مرحباً بك مجدداً! أدخل بياناتك للمتابعة.'
                                : 'أدخل بياناتك لإنشاء حساب جديد والبدء.'}
                        </p>
                    </div>

                    {authError && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 text-sm ${authError.includes('بنجاح') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{authError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className={`pr-10 ${errors.email ? 'border-red-500' : ''}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-invalid={!!errors.email}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-invalid={!!errors.password}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 h-10 text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري المعالجة...
                                </>
                            ) : (
                                mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'
                            )}
                        </Button>
                    </form>

                    <div className="pt-4 border-t border-border flex flex-col gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setMode(mode === 'signin' ? 'signup' : 'signin');
                                setAuthError(null);
                                setErrors({});
                            }}
                            className="w-full text-muted-foreground hover:bg-muted hover:text-green-700"
                        >
                            {mode === 'signin'
                                ? 'ليس لديك حساب؟ أنشئ حساب جديد'
                                : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
