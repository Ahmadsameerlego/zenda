import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, X, Search, Truck, User, Package, Save, AlertCircle } from 'lucide-react';
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

import { mockProducts, mockCustomers, governorates } from '../../../lib/mockData';
import { OrderItem } from '../../types';

interface CreateOrderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (orderData: any) => void;
}

interface FormValues {
    phone: string;
    customerName: string;
    governorate: string;
    city: string;
    address: string;
    isExistingCustomer: boolean;
    items: {
        id: string; // temp id for UI
        productId: string;
        variantId: string;
        productName: string;
        variantName: string;
        quantity: number;
        unitPrice: number;
    }[];
    shippingCost: number;
    shippingCompany: string;
    waybill: string;
}

export function CreateOrderModal({ open, onOpenChange, onSubmit }: CreateOrderModalProps) {
    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            phone: '',
            customerName: '',
            governorate: '',
            city: '',
            address: '',
            isExistingCustomer: false,
            items: [],
            shippingCost: 0,
            shippingCompany: '',
            waybill: '',
        },
        mode: 'onChange',
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'items',
    });

    const watchedItems = watch('items');
    const watchedShippingCost = watch('shippingCost');
    const watchedPhone = watch('phone');
    const isExistingCustomer = watch('isExistingCustomer');

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            reset({
                phone: '',
                customerName: '',
                governorate: '',
                city: '',
                address: '',
                isExistingCustomer: false,
                items: [],
                shippingCost: 0,
                shippingCompany: '',
                waybill: '',
            });
        }
    }, [open, reset]);

    // Customer Lookup
    useEffect(() => {
        if (watchedPhone && watchedPhone.length >= 10) {
            const found = mockCustomers.find(c => c.phone === watchedPhone);
            if (found) {
                setValue('customerName', found.name);
                setValue('governorate', found.governorate);
                setValue('city', found.city);
                setValue('address', found.address);
                setValue('isExistingCustomer', true);
            } else {
                setValue('isExistingCustomer', false);
            }
        }
    }, [watchedPhone, setValue]);

    // Calculations
    const productsTotal = useMemo(() => {
        return watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }, [watchedItems]);

    const finalTotal = productsTotal + (watchedShippingCost || 0);

    const handleAddItem = () => {
        append({
            id: Math.random().toString(36).substr(2, 9),
            productId: '',
            variantId: '',
            productName: '',
            variantName: '',
            quantity: 1,
            unitPrice: 0,
        });
    };

    const handleProductChange = (index: number, productId: string) => {
        const product = mockProducts.find(p => p.id === productId);
        if (product) {
            const currentItem = watchedItems[index]; // Get current values
            update(index, {
                ...currentItem,
                productId: productId,
                productName: product.name,
                variantId: '', // Reset variant
                variantName: '',
                unitPrice: 0, // Reset price until variant selected
            });
        }
    };

    const handleVariantChange = (index: number, variantId: string) => {
        const item = watchedItems[index];
        const product = mockProducts.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === variantId);

        if (variant && product) {
            update(index, {
                ...item,
                variantId: variantId,
                variantName: `${variant.size} - ${variant.color}`,
                unitPrice: product.costPrice * 1.5, // Mock markup
            });
        }
    };

    const onFormSubmit = (data: FormValues) => {
        const payload = {
            customer: {
                name: data.customerName,
                phone: data.phone,
                governorate: data.governorate,
                city: data.city,
                address: data.address,
                isExisting: data.isExistingCustomer
            },
            items: data.items,
            shipping: {
                cost: data.shippingCost,
                company: data.shippingCompany,
                waybill: data.waybill
            },
            totals: {
                products: productsTotal,
                shipping: data.shippingCost,
                final: finalTotal
            }
        };
        onSubmit(payload);
        onOpenChange(false);
    };

    const onError = () => {
        const firstError = document.querySelector('[aria-invalid="true"]');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (firstError as HTMLElement).focus();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-5xl h-[90vh] sm:h-[85vh] p-0 flex flex-col gap-0 overflow-hidden"
                aria-describedby="create-order-description"
            >
                <div id="create-order-description" className="sr-only">
                    نموذج لإنشاء طلب جديد، يتضمن بيانات العميل، المنتجات، والشحن.
                </div>
                <DialogHeader className="p-6 border-b shrink-0 text-right space-y-0" dir="rtl">
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="bg-green-50 p-2 rounded-lg text-green-700">
                            <Package className="w-5 h-5" />
                        </div>
                        إضافة طلب جديد
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col sm:flex-row" dir="rtl">
                    {/* Main Scrollable Content */}
                    <ScrollArea className="flex-1 h-full">
                        <form id="create-order-form" onSubmit={handleSubmit(onFormSubmit, onError)} className="p-6 space-y-8 text-right">

                            {/* Section A: Customer */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-start gap-2 text-primary font-semibold border-b pb-2">
                                    <div className="bg-green-50 p-2 rounded-lg text-green-700">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg">بيانات العميل</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                className={`pr-10 h-10 text-right ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                                                aria-invalid={!!errors.phone}
                                                aria-describedby={errors.phone ? "phone-error" : undefined}
                                            />
                                            <Search className="w-4 h-4 absolute top-3 right-3 text-gray-400 pointer-events-none" />
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

                                    <div className="space-y-2">
                                        <Label htmlFor="customerName" className="text-gray-700">اسم العميل <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="customerName"
                                            {...register('customerName', { required: 'اسم العميل مطلوب', minLength: { value: 2, message: 'الاسم قصير جداً' } })}
                                            placeholder="الاسم ثلاثي"
                                            className={`h-10 ${errors.customerName ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
                                            aria-invalid={!!errors.customerName}
                                        />
                                        {errors.customerName && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.customerName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700">المحافظة</Label>
                                        <Controller
                                            control={control}
                                            name="governorate"
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                                                    <SelectTrigger className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500">
                                                        <SelectValue placeholder="اختر المحافظة" />
                                                    </SelectTrigger>
                                                    <SelectContent align="end">
                                                        {governorates.map(g => (
                                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-gray-700">المدينة / المنطقة</Label>
                                        <Input
                                            id="city"
                                            {...register('city')}
                                            className="h-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label htmlFor="address" className="text-gray-700">العنوان بالتفصيل</Label>
                                        <Textarea
                                            id="address"
                                            {...register('address')}
                                            placeholder="اسم الشارع، رقم العمارة..."
                                            className="resize-none h-20 border-gray-300 focus:border-green-500 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* Section B: Items */}
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
                                        className="gap-2 border-dashed border-gray-300 hover:border-green-500 hover:text-green-600 hover:bg-green-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        إضافة منتج
                                    </Button>
                                </div>

                                {errors.items && !Array.isArray(errors.items) && (
                                    <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded">
                                        <AlertCircle className="w-4 h-4" />
                                        {(errors.items as any)?.message || 'يجب إضافة منتج واحد على الأقل'}
                                    </p>
                                )}

                                <div className="space-y-4">
                                    {fields.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                            <p className="text-gray-500">لم يتم إضافة منتجات بعد</p>
                                        </div>
                                    ) : (
                                        fields.map((field, index) => {
                                            const item = watchedItems[index];
                                            const product = mockProducts.find(p => p.id === item.productId);
                                            const variants = product?.variants || [];
                                            const itemError = errors.items?.[index];

                                            return (
                                                <div key={field.id} className={`bg-white p-4 rounded-xl border shadow-sm space-y-4 relative group transition-all ${itemError ? 'border-red-300 bg-red-50/10' : 'border-gray-200 hover:border-green-200'}`}>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-2 left-2 text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                                        onClick={() => remove(index)}
                                                        aria-label="حذف المنتج"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500">المنتج <span className="text-red-500">*</span></Label>
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
                                                                        <SelectTrigger className={`h-10 border-gray-200 bg-gray-50/50 ${itemError?.productId ? 'border-red-300' : ''}`}>
                                                                            <SelectValue placeholder="اختر المنتج" />
                                                                        </SelectTrigger>
                                                                        <SelectContent align="end">
                                                                            {mockProducts.map(p => (
                                                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs text-gray-500">الموديل (Variant) <span className="text-red-500">*</span></Label>
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
                                                                        disabled={!item.productId}
                                                                        dir="rtl"
                                                                    >
                                                                        <SelectTrigger className={`h-10 border-gray-200 bg-gray-50/50 ${itemError?.variantId ? 'border-red-300' : ''}`}>
                                                                            <SelectValue placeholder="اختر المقاس واللون" />
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
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <div className="w-24 space-y-1.5">
                                                            <Label className="text-xs text-gray-500">الكمية <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                {...register(`items.${index}.quantity`, { valueAsNumber: true, min: { value: 1, message: 'min 1' } })}
                                                                className="h-10 text-center"
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-1.5">
                                                            <Label className="text-xs text-gray-500">السعر (للقطعة) <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                {...register(`items.${index}.unitPrice`, { valueAsNumber: true, min: 0 })}
                                                                className="h-10"
                                                            />
                                                        </div>
                                                        <div className="w-32 space-y-1.5">
                                                            <Label className="text-xs text-gray-500">الإجمالي</Label>
                                                            <div className="h-10 flex items-center justify-end px-3 bg-gray-100 rounded-md font-medium text-gray-900 border border-gray-200">
                                                                {(item?.quantity && item?.unitPrice ? item.quantity * item.unitPrice : 0).toLocaleString()}
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

                            {/* Section C: Shipping */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
                                    <div className="bg-green-50 p-2 rounded-lg text-green-700">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg">الشحن والتوصيل</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="shippingCost" className="text-gray-700">تكلفة الشحن</Label>
                                        <Input
                                            id="shippingCost"
                                            type="number"
                                            min="0"
                                            {...register('shippingCost', { valueAsNumber: true, min: 0 })}
                                            className="h-10 border-gray-300"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shippingCompany" className="text-gray-700">شركة الشحن</Label>
                                        <Input
                                            id="shippingCompany"
                                            {...register('shippingCompany')}
                                            placeholder="اختياري"
                                            className="h-10 border-gray-300"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <Label htmlFor="waybill" className="text-gray-700">رقم البوليصة (Waybill)</Label>
                                        <Input
                                            id="waybill"
                                            {...register('waybill')}
                                            placeholder="اختياري"
                                            className="h-10 border-gray-300"
                                        />
                                    </div>
                                </div>
                            </section>
                        </form>
                    </ScrollArea>

                    {/* Sticky Summary (Desktop Sidebar / Mobile Bottom) */}
                    <div className="bg-gray-50 border-t sm:border-t-0 sm:border-r w-full sm:w-80 shrink-0 flex flex-col">
                        <div className="p-6 space-y-6 flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">ملخص الطلب</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>إجمالي المنتجات ({watchedItems.reduce((s, i) => s + (i.quantity || 0), 0)})</span>
                                    <span>{productsTotal.toLocaleString()} ج.م</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>الشحن</span>
                                    <span>{(watchedShippingCost || 0).toLocaleString()} ج.م</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-xl text-gray-900">
                                    <span>الإجمالي النهائي</span>
                                    <span>{finalTotal.toLocaleString()} ج.م</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t space-y-3">
                            <Button
                                type="submit"
                                form="create-order-form"
                                disabled={watchedItems.length === 0} // Using watchedItems for validation
                                className="w-full h-11 text-base bg-green-600 hover:bg-green-700 shadow-md gap-2"
                            >
                                <Save className="w-5 h-5" />
                                حفظ الطلب
                            </Button>
                            <DialogClose asChild>
                                <Button variant="outline" className="w-full h-11 text-base border-gray-300 text-gray-700 hover:bg-gray-50">
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
