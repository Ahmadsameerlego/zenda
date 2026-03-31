import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, X, Search, User, Package, Save, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '../ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Product } from '../../types';
import { OrdersService } from '../../services/orders';
import { useAuth } from '../../context/AuthProvider';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreateOrderDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void; // Trigger refresh in parent
}

interface ItemFormValues {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
}

interface FormValues {
    phone: string;
    customerName: string;
    address: string;
    notes: string;
    items: ItemFormValues[];
    discount: number;
    shipping: number;
}

// ─── Existing statuses from codebase ─────────────────────────────────────────
// Using the OrderStatus type values already defined in types/index.ts:
// 'New' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'
const ALLOWED_STATUSES = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'New', label: 'جديد' },
    { value: 'Processing', label: 'قيد المعالجة' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateOrderDrawer({ open, onOpenChange, onSuccess }: CreateOrderDrawerProps) {
    const { profile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('pending');

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            phone: '',
            customerName: '',
            address: '',
            notes: '',
            items: [],
            discount: 0,
            shipping: 0,
        },
        mode: 'onChange',
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'items',
    });

    const watchedItems = watch('items');
    const watchedDiscount = watch('discount');
    const watchedShipping = watch('shipping');

    // ─── Load products when drawer opens ─────────────────────────────────────
    useEffect(() => {
        if (open && profile?.store_id) {
            setProductsLoading(true);
            OrdersService.getActiveProducts(profile.store_id)
                .then(setProducts)
                .catch((err) => {
                    console.error('Error loading products:', err);
                    toast.error('خطأ في تحميل المنتجات');
                })
                .finally(() => setProductsLoading(false));
        }
    }, [open, profile?.store_id]);

    // ─── Reset form when drawer opens ────────────────────────────────────────
    useEffect(() => {
        if (open) {
            reset({
                phone: '',
                customerName: '',
                address: '',
                notes: '',
                items: [],
                discount: 0,
                shipping: 0,
            });
            setIsExistingCustomer(false);
            setSelectedStatus('pending');
        }
    }, [open, reset]);

    // ─── Customer phone lookup ───────────────────────────────────────────────
    const handlePhoneLookup = useCallback(async () => {
        const phone = watch('phone');
        if (!phone || phone.length < 11 || !profile?.store_id) return;

        // Basic Egyptian phone validation
        if (!/^01[0125][0-9]{8}$/.test(phone)) return;

        setIsLookingUp(true);
        try {
            const result = await OrdersService.customerLookupByPhone(phone, profile.store_id);
            if (result) {
                setValue('customerName', result.name, { shouldValidate: true });
                setValue('address', result.address, { shouldValidate: true });
                setIsExistingCustomer(true);
            } else {
                setIsExistingCustomer(false);
            }
        } catch {
            // Silently ignore lookup errors
        } finally {
            setIsLookingUp(false);
        }
    }, [watch, setValue, profile?.store_id]);

    // ─── Calculations ────────────────────────────────────────────────────────
    const subtotal = useMemo(() => {
        return (watchedItems || []).reduce(
            (sum, item) => sum + ((item?.quantity || 0) * (item?.unitPrice || 0)),
            0
        );
    }, [watchedItems]);

    const discount = Number(watchedDiscount) || 0;
    const shipping = Number(watchedShipping) || 0;
    const total = Math.max(0, subtotal - discount + shipping);

    // ─── Item handlers ───────────────────────────────────────────────────────
    const handleAddItem = () => {
        append({
            id: `temp-${Math.random().toString(36).substr(2, 9)}`,
            productId: '',
            variantId: '',
            productName: '',
            variantName: '',
            quantity: 1,
            unitPrice: 0,
        });
    };

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const currentItem = watchedItems[index];
            update(index, {
                ...currentItem,
                productId,
                productName: product.name,
                variantId: '',
                variantName: '',
                unitPrice: product.costPrice || 0,
            });
            // Clear variant error when product changes
            clearErrors(`items.${index}.variantId`);
        }
    };

    const handleVariantChange = (index: number, variantId: string) => {
        const item = watchedItems[index];
        const product = products.find(p => p.id === item?.productId);
        const variant = product?.variants.find(v => v.id === variantId);

        if (variant && product) {
            // Check for duplicate variant
            const isDuplicate = watchedItems.some(
                (other, i) => i !== index && other.variantId === variantId
            );
            if (isDuplicate) {
                setError(`items.${index}.variantId`, {
                    type: 'manual',
                    message: 'هذا المتغير مضاف مسبقاً',
                });
                return;
            }

            clearErrors(`items.${index}.variantId`);
            update(index, {
                ...item,
                variantId,
                variantName: `${variant.size} - ${variant.color}`,
                unitPrice: product.costPrice || 0,
            });
        }
    };

    // ─── Submit ──────────────────────────────────────────────────────────────
    const onFormSubmit = async (data: FormValues) => {
        if (!profile?.store_id) {
            toast.error('بيانات المتجر غير متوفرة. يرجى تسجيل الدخول مرة أخرى.');
            return;
        }

        // Extra validations
        if (data.items.length === 0) {
            setError('items' as any, { type: 'manual', message: 'يجب إضافة منتج واحد على الأقل' });
            return;
        }

        // Check for missing variant selections
        let hasItemErrors = false;
        data.items.forEach((item, i) => {
            if (!item.productId) {
                setError(`items.${i}.productId`, { type: 'manual', message: 'مطلوب' });
                hasItemErrors = true;
            }
            if (!item.variantId) {
                setError(`items.${i}.variantId`, { type: 'manual', message: 'مطلوب' });
                hasItemErrors = true;
            }
        });

        // Check duplicate variants
        const variantIds = data.items.map(i => i.variantId).filter(Boolean);
        const duplicates = variantIds.filter((id, idx) => variantIds.indexOf(id) !== idx);
        if (duplicates.length > 0) {
            data.items.forEach((item, i) => {
                if (duplicates.includes(item.variantId)) {
                    setError(`items.${i}.variantId`, { type: 'manual', message: 'هذا المتغير مضاف مسبقاً' });
                    hasItemErrors = true;
                }
            });
        }

        if (hasItemErrors) {
            scrollToFirstError();
            return;
        }

        // Discount validation
        const calcSubtotal = data.items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0);
        const discountVal = Number(data.discount) || 0;
        if (discountVal > calcSubtotal) {
            setError('discount', { type: 'manual', message: 'الخصم لا يمكن أن يتجاوز إجمالي المنتجات' });
            scrollToFirstError();
            return;
        }

        const shippingVal = Number(data.shipping) || 0;
        const totalVal = Math.max(0, calcSubtotal - discountVal + shippingVal);

        try {
            setIsSubmitting(true);
            await OrdersService.createOrder(
                {
                    customer_phone: data.phone,
                    customer_name: data.customerName,
                    customer_address: data.address,
                    notes: data.notes || undefined,
                    subtotal: calcSubtotal,
                    discount: discountVal,
                    shipping: shippingVal,
                    total: totalVal,
                    status: selectedStatus,
                },
                data.items.map(item => ({
                    variant_id: item.variantId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    line_total: item.quantity * item.unitPrice,
                })),
                profile.store_id
            );

            toast.success('تم إنشاء الطلب بنجاح');
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Error creating order:', err);
            toast.error(err?.message || 'حدث خطأ أثناء إنشاء الطلب');
        } finally {
            setIsSubmitting(false);
        }
    };

    const scrollToFirstError = () => {
        setTimeout(() => {
            const firstError = document.querySelector('[aria-invalid="true"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                (firstError as HTMLElement).focus();
            }
        }, 100);
    };

    const onError = () => scrollToFirstError();

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-5xl h-[90vh] sm:h-[85vh] p-0 flex flex-col gap-0 overflow-hidden"
                aria-describedby="create-order-description"
            >
                <div id="create-order-description" className="sr-only">
                    نموذج لإنشاء طلب جديد، يتضمن بيانات العميل، المنتجات، والتسعير.
                </div>
                <DialogHeader className="p-6 border-b shrink-0 text-right space-y-0">
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <div className="bg-green-50 p-2 rounded-lg text-green-700">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        إنشاء طلب جديد
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
                    {/* ─── Main Scrollable Content ─── */}
                    <ScrollArea className="flex-1 h-full">
                        <form id="create-order-form" onSubmit={handleSubmit(onFormSubmit, onError)} className="p-6 space-y-8 text-right">

                            {/* ═══════ Section A: Customer ═══════ */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                                    <div className="bg-green-50 p-2 rounded-lg text-green-700">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg">بيانات العميل</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-gray-700">رقم الهاتف <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Input
                                                id="phone"
                                                {...register('phone', {
                                                    required: 'رقم الهاتف مطلوب',
                                                    pattern: {
                                                        value: /^01[0125][0-9]{8}$/,
                                                        message: 'رقم هاتف غير صحيح (يجب أن يبدأ بـ 01 ويتكون من 11 رقم)'
                                                    }
                                                })}
                                                placeholder="01xxxxxxxxx"
                                                dir="ltr"
                                                className={`pr-10 h-10 text-right ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'}`}
                                                aria-invalid={!!errors.phone}
                                                aria-describedby={errors.phone ? "phone-error" : undefined}
                                                onBlur={(e) => {
                                                    register('phone').onBlur(e);
                                                    handlePhoneLookup();
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handlePhoneLookup();
                                                    }
                                                }}
                                            />
                                            {isLookingUp ? (
                                                <Loader2 className="w-4 h-4 absolute top-3 right-3 text-green-500 animate-spin pointer-events-none" />
                                            ) : (
                                                <Search className="w-4 h-4 absolute top-3 right-3 text-muted-foreground pointer-events-none" />
                                            )}
                                        </div>
                                        {errors.phone && (
                                            <p id="phone-error" className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.phone.message}
                                            </p>
                                        )}
                                        {isExistingCustomer && (
                                            <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200 w-fit">
                                                عميل سابق
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="customerName" className="text-gray-700">اسم العميل <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="customerName"
                                            {...register('customerName', {
                                                required: 'اسم العميل مطلوب',
                                                minLength: { value: 2, message: 'الاسم يجب أن يكون حرفين على الأقل' }
                                            })}
                                            placeholder="الاسم الكامل"
                                            className={`h-10 ${errors.customerName ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'}`}
                                            aria-invalid={!!errors.customerName}
                                        />
                                        {errors.customerName && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.customerName.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label htmlFor="address" className="text-gray-700">العنوان <span className="text-red-500">*</span></Label>
                                        <Textarea
                                            id="address"
                                            {...register('address', {
                                                required: 'العنوان مطلوب',
                                                minLength: { value: 5, message: 'العنوان يجب أن يكون 5 أحرف على الأقل' }
                                            })}
                                            placeholder="العنوان بالتفصيل..."
                                            className={`h-20 ${errors.address ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'}`}
                                            aria-invalid={!!errors.address}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.address.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label htmlFor="notes" className="text-gray-700">ملاحظات</Label>
                                        <Textarea
                                            id="notes"
                                            {...register('notes')}
                                            placeholder="ملاحظات إضافية (اختياري)..."
                                            className="h-16 border-border"
                                        />
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* ═══════ Section B: Items ═══════ */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <div className="flex items-center gap-2 text-primary font-semibold">
                                        <div className="bg-green-50 p-2 rounded-lg text-green-700">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg">المنتجات <span className="text-red-500">*</span></h3>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleAddItem}
                                        variant="outline"
                                        disabled={productsLoading}
                                        className="gap-2 border-dashed border-border hover:border-green-500 hover:text-green-600 hover:bg-green-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        إضافة منتج
                                    </Button>
                                </div>

                                {/* Items-level error */}
                                {errors.items && !Array.isArray(errors.items) && (
                                    <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded">
                                        <AlertCircle className="w-4 h-4" />
                                        {(errors.items as any)?.message || 'يجب إضافة منتج واحد على الأقل'}
                                    </p>
                                )}

                                <div className="space-y-4">
                                    {fields.length === 0 ? (
                                        <div className="text-center py-12 bg-muted rounded-xl border-2 border-dashed border-border">
                                            <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-muted-foreground">لم يتم إضافة منتجات بعد</p>
                                            <p className="text-xs text-muted-foreground mt-1">اضغط "إضافة منتج" للبدء</p>
                                        </div>
                                    ) : (
                                        fields.map((field, index) => {
                                            const item = watchedItems?.[index];
                                            const product = products.find(p => p.id === item?.productId);
                                            const variants = product?.variants || [];
                                            const itemError = errors.items?.[index];
                                            const lineTotal = (item?.quantity || 0) * (item?.unitPrice || 0);

                                            return (
                                                <div
                                                    key={field.id}
                                                    className={`bg-card p-4 rounded-xl border shadow-sm space-y-4 relative group transition-all ${itemError ? 'border-red-300 bg-red-50/10' : 'border-border hover:border-green-200'}`}
                                                >
                                                    {/* Remove button */}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-2 left-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                                        onClick={() => remove(index)}
                                                        aria-label="حذف المنتج"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>

                                                    {/* Row 1: Product + Variant selects */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Product select */}
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-muted-foreground">المنتج <span className="text-red-500">*</span></Label>
                                                            <Controller
                                                                control={control}
                                                                name={`items.${index}.productId`}
                                                                rules={{ required: 'مطلوب' }}
                                                                render={({ field: selectField }) => (
                                                                    <Select
                                                                        value={selectField.value}
                                                                        onValueChange={(val) => {
                                                                            selectField.onChange(val);
                                                                            handleProductChange(index, val);
                                                                        }}
                                                                        dir="rtl"
                                                                    >
                                                                        <SelectTrigger
                                                                            className={`h-10 border-border bg-muted/50 ${itemError?.productId ? 'border-red-300' : ''}`}
                                                                            aria-invalid={!!itemError?.productId}
                                                                        >
                                                                            <SelectValue placeholder={productsLoading ? 'جاري التحميل...' : 'اختر المنتج'} />
                                                                        </SelectTrigger>
                                                                        <SelectContent align="end">
                                                                            {products.map(p => (
                                                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            />
                                                            {itemError?.productId && (
                                                                <p className="text-xs text-red-500">{itemError.productId.message}</p>
                                                            )}
                                                        </div>

                                                        {/* Variant select */}
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-muted-foreground">المتغير (المقاس/اللون) <span className="text-red-500">*</span></Label>
                                                            <Controller
                                                                control={control}
                                                                name={`items.${index}.variantId`}
                                                                rules={{ required: 'مطلوب' }}
                                                                render={({ field: selectField }) => (
                                                                    <Select
                                                                        value={selectField.value}
                                                                        onValueChange={(val) => {
                                                                            selectField.onChange(val);
                                                                            handleVariantChange(index, val);
                                                                        }}
                                                                        disabled={!item?.productId}
                                                                        dir="rtl"
                                                                    >
                                                                        <SelectTrigger
                                                                            className={`h-10 border-border bg-muted/50 ${itemError?.variantId ? 'border-red-300' : ''}`}
                                                                            aria-invalid={!!itemError?.variantId}
                                                                        >
                                                                            <SelectValue placeholder="اختر المتغير" />
                                                                        </SelectTrigger>
                                                                        <SelectContent align="end">
                                                                            {variants.map(v => (
                                                                                <SelectItem key={v.id} value={v.id}>
                                                                                    {v.size} - {v.color}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            />
                                                            {itemError?.variantId && (
                                                                <p className="text-xs text-red-500">{itemError.variantId.message}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Row 2: Qty, Price, Total */}
                                                    <div className="flex gap-4">
                                                        <div className="w-24 space-y-1.5">
                                                            <Label className="text-xs text-muted-foreground">الكمية <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                {...register(`items.${index}.quantity`, {
                                                                    valueAsNumber: true,
                                                                    required: 'مطلوب',
                                                                    min: { value: 1, message: 'الحد الأدنى 1' }
                                                                })}
                                                                className={`h-10 text-center ${itemError?.quantity ? 'border-red-300' : ''}`}
                                                                aria-invalid={!!itemError?.quantity}
                                                            />
                                                            {itemError?.quantity && (
                                                                <p className="text-xs text-red-500">{itemError.quantity.message}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 space-y-1.5">
                                                            <Label className="text-xs text-muted-foreground">سعر القطعة (ج.م) <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                {...register(`items.${index}.unitPrice`, {
                                                                    valueAsNumber: true,
                                                                    required: 'مطلوب',
                                                                    min: { value: 0, message: 'يجب أن يكون 0 أو أكثر' }
                                                                })}
                                                                className={`h-10 ${itemError?.unitPrice ? 'border-red-300' : ''}`}
                                                                aria-invalid={!!itemError?.unitPrice}
                                                            />
                                                            {itemError?.unitPrice && (
                                                                <p className="text-xs text-red-500">{itemError.unitPrice.message}</p>
                                                            )}
                                                        </div>
                                                        <div className="w-32 space-y-1.5">
                                                            <Label className="text-xs text-muted-foreground">الإجمالي</Label>
                                                            <div className="h-10 flex items-center justify-end px-3 bg-accent text-accent-foreground rounded-md font-medium text-foreground border border-border">
                                                                {lineTotal.toLocaleString('ar-EG')} ج.م
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>

                            <Separator />

                            {/* ═══════ Section C: Pricing ═══════ */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                                    <div className="bg-green-50 p-2 rounded-lg text-green-700">
                                        <ShoppingCart className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg">التسعير</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="discount" className="text-gray-700">الخصم (ج.م)</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...register('discount', {
                                                valueAsNumber: true,
                                                min: { value: 0, message: 'الخصم يجب أن يكون 0 أو أكثر' },
                                                validate: (val) => {
                                                    const v = Number(val) || 0;
                                                    if (v > subtotal) return 'الخصم لا يمكن أن يتجاوز إجمالي المنتجات';
                                                    return true;
                                                }
                                            })}
                                            className={`h-10 ${errors.discount ? 'border-red-500' : 'border-border'}`}
                                            aria-invalid={!!errors.discount}
                                        />
                                        {errors.discount && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.discount.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shipping" className="text-gray-700">الشحن (ج.م)</Label>
                                        <Input
                                            id="shipping"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...register('shipping', {
                                                valueAsNumber: true,
                                                min: { value: 0, message: 'تكلفة الشحن يجب أن تكون 0 أو أكثر' }
                                            })}
                                            className={`h-10 ${errors.shipping ? 'border-red-500' : 'border-border'}`}
                                            aria-invalid={!!errors.shipping}
                                        />
                                        {errors.shipping && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.shipping.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* ═══════ Section D: Status (uses existing codebase statuses) ═══════ */}
                            <section className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">حالة الطلب</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus} dir="rtl">
                                        <SelectTrigger className="h-10 border-border w-full md:w-64">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            {ALLOWED_STATUSES.map(s => (
                                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </section>
                        </form>
                    </ScrollArea>

                    {/* ─── Sticky Summary Panel ─── */}
                    <div className="bg-muted border-t sm:border-t-0 sm:border-r w-full sm:w-80 shrink-0 flex flex-col">
                        <div className="p-6 space-y-6 flex-1">
                            <h3 className="font-semibold text-lg text-foreground">ملخص الطلب</h3>

                            <div className="space-y-3">
                                {/* Items summary */}
                                {watchedItems && watchedItems.length > 0 && (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {watchedItems.map((item, i) => (
                                            item?.productName && (
                                                <div key={i} className="flex justify-between text-sm text-muted-foreground">
                                                    <span className="truncate flex-1">
                                                        {item.productName}
                                                        {item.variantName && <span className="text-muted-foreground text-xs"> ({item.variantName})</span>}
                                                        {item.quantity > 1 && <span className="text-muted-foreground text-xs"> ×{item.quantity}</span>}
                                                    </span>
                                                    <span className="mr-2 shrink-0">{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('ar-EG')} ج.م</span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}

                                <Separator className="my-2" />

                                <div className="flex justify-between text-muted-foreground">
                                    <span>إجمالي المنتجات</span>
                                    <span>{subtotal.toLocaleString('ar-EG')} ج.م</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>الخصم</span>
                                        <span>- {discount.toLocaleString('ar-EG')} ج.م</span>
                                    </div>
                                )}
                                {shipping > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>الشحن</span>
                                        <span>{shipping.toLocaleString('ar-EG')} ج.م</span>
                                    </div>
                                )}

                                <Separator className="my-2" />

                                <div className="flex justify-between font-bold text-xl text-foreground">
                                    <span>الإجمالي النهائي</span>
                                    <span>{total.toLocaleString('ar-EG')} ج.م</span>
                                </div>
                            </div>
                        </div>

                        {/* ─── Submit buttons ─── */}
                        <div className="p-6 bg-card border-t space-y-3">
                            <Button
                                type="submit"
                                form="create-order-form"
                                disabled={isSubmitting}
                                className="w-full h-11 text-base bg-green-600 hover:bg-green-700 shadow-md gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        إنشاء الطلب
                                    </>
                                )}
                            </Button>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    className="w-full h-11 text-base border-border text-gray-700 hover:bg-muted"
                                    disabled={isSubmitting}
                                >
                                    إلغاء
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
