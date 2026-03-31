import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2, Save, X, Package, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Switch } from '../ui/switch';
import {
    Product,
    ProductVariant,
    ProductDetails,
    ProductFormPayload,
    Category,
    Brand
} from '../../types';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../ui/tooltip';
import { ProductsService } from '../../services/products';
import { useAuth } from '../../context/AuthProvider';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { ImageUpload } from './ImageUpload';
import { ImageGallery } from './ImageGallery';
import { ProductImagesService } from '../../services/product-images';
import { ProductImage as ProductImageModel } from '../../types';

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: ProductDetails | null; // null = add mode
    onSubmit: () => void; // Trigger refresh in parent
}

interface ProductFormValues {
    name: string;
    description: string;
    category_id: string;
    brand_id: string;
    cost_price: number;
    is_active: boolean;
    is_published: boolean;
    sort_order: number;
    variants: {
        id: string;
        size: string | null;
        color: string | null;
        sku: string | null;
        sale_price: number;
        compare_at_price: number | null;
        cost_price: number | null;
        stock_quantity: number;
        is_active: boolean;
    }[];
}

export function ProductForm({ open, onOpenChange, product, onSubmit }: ProductFormProps) {
    const { profile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [productImages, setProductImages] = useState<ProductImageModel[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        getValues,
        watch,
        trigger,
        formState: { errors },
    } = useForm<ProductFormValues>({
        defaultValues: {
            name: '',
            description: '',
            category_id: '',
            brand_id: '',
            cost_price: 0,
            is_active: true,
            is_published: false,
            sort_order: 0,
            variants: [],
        },
        mode: 'all',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'variants',
    });

    // Fetch categories and brands
    useEffect(() => {
        if (open && profile?.store_id) {
            const fetchData = async () => {
                try {
                    const [cats, brs] = await Promise.all([
                        ProductsService.getCategories(profile.store_id),
                        ProductsService.getBrands(profile.store_id)
                    ]);
                    setCategories(cats || []);
                    setBrands(brs || []);
                } catch (err) {
                    console.error('Error fetching categories/brands:', err);
                }
            };
            fetchData();
        }
    }, [open, profile?.store_id]);

    // Fetch product images
    const fetchImages = async () => {
        if (product?.id) {
            try {
                setIsLoadingImages(true);
                const imgs = await ProductImagesService.getProductImages(product.id);
                setProductImages(imgs);
            } catch (err) {
                console.error('Error fetching images:', err);
            } finally {
                setIsLoadingImages(false);
            }
        } else {
            setProductImages([]);
        }
    };

    useEffect(() => {
        if (open && product?.id) {
            fetchImages();
        } else if (open) {
            setProductImages([]);
        }
    }, [open, product?.id]);

    // Reset or load data when opening
    useEffect(() => {
        if (open) {
            clearErrors();
            if (product) {
                reset({
                    name: product.name,
                    description: product.description || '',
                    category_id: product.category_id || '',
                    brand_id: product.brand_id || '',
                    cost_price: product.cost_price || 0,
                    is_active: product.is_active,
                    is_published: product.is_published,
                    sort_order: product.sort_order || 0,
                    variants: product.variants?.map(v => ({
                        id: v.id,
                        size: v.size,
                        color: v.color,
                        sku: v.sku,
                        sale_price: v.sale_price,
                        compare_at_price: v.compare_at_price,
                        cost_price: v.cost_price,
                        stock_quantity: v.stock_quantity,
                        is_active: v.is_active,
                    })) || [],
                });
            } else {
                reset({
                    name: '',
                    description: '',
                    category_id: '',
                    brand_id: '',
                    cost_price: 0,
                    is_active: true,
                    is_published: false,
                    sort_order: 0,
                    variants: [],
                });
            }
        }
    }, [open, product, reset, clearErrors]);

    // Validation function for variants to check for duplicates
    const checkVariantUniqueness = (index: number, currentValues: any) => {
        const variants = getValues('variants');
        if (!variants || variants.length === 0) return true;

        const currentVariant = variants[index];
        if (!currentVariant?.size || !currentVariant?.color) return true; // Don't flag duplicates if fields are empty (required check handles that)

        const isDuplicate = variants.some((v, i) =>
            i !== index &&
            v.size?.trim().toLowerCase() === currentVariant.size?.trim().toLowerCase() &&
            v.color?.trim().toLowerCase() === currentVariant.color?.trim().toLowerCase()
        );

        return !isDuplicate || 'يوجد متغير مكرر (نفس المقاس واللون)';
    };

    const handleAddVariant = () => {
        append({
            id: `temp-${Math.random().toString(36).substr(2, 9)}`,
            size: '',
            color: '',
            sku: '',
            sale_price: 0,
            compare_at_price: null,
            cost_price: null,
            stock_quantity: 0,
            is_active: true,
        });
    };

    const onFormSubmit = async (data: ProductFormValues) => {
        if (!profile?.store_id) {
            toast.error('بيانات المتجر غير متوفرة');
            return;
        }

        try {
            setIsSubmitting(true);

            const payload: ProductFormPayload = {
                product: {
                    name: data.name,
                    description: data.description,
                    category_id: data.category_id || undefined,
                    brand_id: data.brand_id || undefined,
                    cost_price: data.cost_price,
                    is_active: data.is_active,
                    is_published: data.is_published,
                    sort_order: data.sort_order
                },
                variants: data.variants.map(v => ({
                    size: v.size || null,
                    color: v.color || null,
                    sku: v.sku || null,
                    sale_price: v.sale_price,
                    compare_at_price: v.compare_at_price || null,
                    cost_price: v.cost_price || null,
                    stock_quantity: v.stock_quantity,
                    is_active: v.is_active,
                    sort_order: 0,
                    option_1_name: null,
                    option_1_value: null,
                    option_2_name: null,
                    option_2_value: null,
                    option_3_name: null,
                    option_3_value: null,
                    image_url: null,
                    low_stock_threshold: 0
                }))
                // images are NOT sent during update to avoid accidental deletion
                // as they are managed separately via specialized methods.
            };

            if (product) {
                await ProductsService.updateProduct(product.id, payload, profile.store_id);
            } else {
                // For creation, images are still empty initially in the UI
                payload.images = [];
                await ProductsService.createProduct(payload, profile.store_id);
            }

            toast.success(product ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
            onSubmit();
        } catch (err) {
            console.error('Error saving product:', err);
            toast.error('حدث خطأ أثناء حفظ المنتج');
            setError('root', {
                type: 'manual',
                message: 'فشل الحفظ. يرجى المحاولة مرة أخرى.'
            });
        } finally {
            setIsSubmitting(false);
        }
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
                className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
                aria-describedby="product-form-desc"
            >
                <div id="product-form-desc" className="sr-only">
                    نموذج لإضافة أو تعديل منتج وتفاصيله
                </div>
                <DialogHeader className="p-6 border-b shrink-0 text-right space-y-0">
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <div className="bg-green-50 p-2 rounded-lg text-green-700">
                            <Package className="w-5 h-5" />
                        </div>
                        {product ? 'تعديل منتج' : 'إضافة منتج جديد'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <form id="product-form" onSubmit={handleSubmit(onFormSubmit, onError)} className="space-y-8 text-right">
                        {/* Main Info */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">بيانات المنتج</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="product-name" className="text-gray-700 block text-right">
                                        اسم المنتج <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="product-name"
                                        {...register('name', {
                                            required: 'اسم المنتج مطلوب',
                                            minLength: { value: 2, message: 'الاسم يجب أن يكون حرفين على الأقل' }
                                        })}
                                        placeholder="مثال: تيشيرت قطن"
                                        className={`text-right h-11 border-border focus:border-green-500 focus:ring-green-500 ${errors.name ? 'border-red-500' : ''}`}
                                        aria-invalid={!!errors.name}
                                        aria-describedby={errors.name ? "name-error" : undefined}
                                    />
                                    {errors.name && (
                                        <p id="name-error" className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="product-description" className="text-gray-700 block text-right">الوصف</Label>
                                    <Textarea
                                        id="product-description"
                                        {...register('description')}
                                        placeholder="وصف المنتج..."
                                        className="text-right min-h-[100px] border-border focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 block text-right">التصنيف</Label>
                                    <Controller
                                        control={control}
                                        name="category_id"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="text-right bg-card border-border focus:border-green-500 focus:ring-green-500 h-11" dir="rtl">
                                                    <SelectValue placeholder="اختر التصنيف" />
                                                </SelectTrigger>
                                                <SelectContent dir="rtl">
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700 block text-right">العلامة التجارية</Label>
                                    <Controller
                                        control={control}
                                        name="brand_id"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="text-right bg-card border-border focus:border-green-500 focus:ring-green-500 h-11" dir="rtl">
                                                    <SelectValue placeholder="اختر العلامة التجارية" />
                                                </SelectTrigger>
                                                <SelectContent dir="rtl">
                                                    {brands.map((brand) => (
                                                        <SelectItem key={brand.id} value={brand.id}>
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cost-price" className="text-gray-700 block text-right">
                                        سعر التكلفة (ج.م) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="cost-price"
                                        type="number"
                                        min="0"
                                        {...register('cost_price', {
                                            valueAsNumber: true,
                                            required: 'سعر التكلفة مطلوب',
                                            min: { value: 0, message: 'السعر يجب أن يكون 0 أو أكثر' }
                                        })}
                                        className={`text-right h-11 border-border focus:border-green-500 focus:ring-green-500 ${errors.cost_price ? 'border-red-500' : ''}`}
                                        aria-invalid={!!errors.cost_price}
                                        aria-describedby={errors.cost_price ? "price-error" : undefined}
                                    />
                                    {errors.cost_price && (
                                        <p id="price-error" className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.cost_price.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-muted/50">
                                    <Label htmlFor="is_published" className="cursor-pointer flex-1 text-right">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="text-xs">لو مفعّلة، المنتج هيظهر للعملاء في المتجر</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <span className="block font-medium text-foreground">ظاهر في المتجر</span>
                                        </div>
                                        <span className="block text-xs text-muted-foreground">التحكم في ظهور المنتج للعملاء</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="is_published"
                                        render={({ field }) => (
                                            <Switch
                                                id="is_published"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-green-600"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-muted/50">
                                    <Label htmlFor="is_active" className="cursor-pointer flex-1 text-right">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="text-xs">لو مفعّلة، العميل يقدر يطلب المنتج</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <span className="block font-medium text-foreground">متاح للطلب</span>
                                        </div>
                                        <span className="block text-xs text-muted-foreground">التحكم في إمكانية شراء المنتج</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="is_active"
                                        render={({ field }) => (
                                            <Switch
                                                id="is_active"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-green-600"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="border-t border-border" />

                        {/* Variants Manager */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">المتغيرات</h3>
                                    <p className="text-xs text-muted-foreground mt-1">أضف المقاسات والألوان المتاحة لهذا المنتج</p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleAddVariant}
                                    variant="outline"
                                    className="gap-2 border-dashed border-border hover:border-green-500 hover:text-green-600 hover:bg-green-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    إضافة متغير
                                </Button>
                            </div>

                            {errors.root && (
                                <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 p-2 rounded justify-center font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.root.message}
                                </p>
                            )}

                            <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                            <TableHead className="font-semibold text-gray-700 text-right">المقاس <span className="text-red-500">*</span></TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-right">اللون <span className="text-red-500">*</span></TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-right">السعر <span className="text-red-500">*</span></TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-right">المخزون <span className="text-red-500">*</span></TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-right">SKU</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                                                    لا توجد متغيرات مضافة بعد
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            fields.map((field, index) => (
                                                <TableRow key={field.id} className="group">
                                                    <TableCell className="p-2 align-top">
                                                        <Input
                                                            {...register(`variants.${index}.size`, {
                                                                required: 'مطلوب',
                                                                validate: () => checkVariantUniqueness(index, {}) // Validate uniqueness on change
                                                            })}
                                                            placeholder="S, M..."
                                                            className={`text-right h-9 border-border focus:border-green-500 focus:ring-green-500 ${errors.variants?.[index]?.size ? 'border-red-500' : ''}`}
                                                            aria-invalid={!!errors.variants?.[index]?.size}
                                                        />
                                                        {errors.variants?.[index]?.size && (
                                                            <span className="text-xs text-red-500 mt-1 block">
                                                                {errors.variants[index]?.size?.message}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="p-2 align-top">
                                                        <Input
                                                            {...register(`variants.${index}.color`, {
                                                                required: 'مطلوب',
                                                                validate: () => checkVariantUniqueness(index, {})
                                                            })}
                                                            placeholder="أحمر..."
                                                            className={`text-right h-9 border-border focus:border-green-500 focus:ring-green-500 ${errors.variants?.[index]?.color ? 'border-red-500' : ''}`}
                                                            aria-invalid={!!errors.variants?.[index]?.color}
                                                        />
                                                        {errors.variants?.[index]?.color && (
                                                            <span className="text-xs text-red-500 mt-1 block">
                                                                {errors.variants[index]?.color?.message}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="p-2 align-top">
                                                        <Input
                                                            type="number"
                                                            {...register(`variants.${index}.sale_price`, {
                                                                required: 'مطلوب',
                                                                valueAsNumber: true
                                                            })}
                                                            placeholder="السعر..."
                                                            className="text-right h-9 border-border focus:border-green-500 focus:ring-green-500"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-2 align-top">
                                                        <Input
                                                            type="number"
                                                            {...register(`variants.${index}.stock_quantity`, {
                                                                required: 'مطلوب',
                                                                valueAsNumber: true
                                                            })}
                                                            placeholder="الكمية..."
                                                            className="text-right h-9 border-border focus:border-green-500 focus:ring-green-500"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-2 align-top">
                                                        <Input
                                                            {...register(`variants.${index}.sku`)}
                                                            placeholder="SKU-..."
                                                            className="text-right h-9 border-border focus:border-green-500 focus:ring-green-500"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="p-2 align-top">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => remove(index)}
                                                            aria-label="حذف المتغير"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>

                        <div className="border-t border-border" />

                        {/* Images Section */}
                        <section className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">صور المنتج</h3>
                                <p className="text-xs text-muted-foreground mt-1">أضف الصور وقم بترتيبها. الصورة الأولى هي الصورة الأساسية.</p>
                            </div>

                            {product && profile?.store_id ? (
                                <>
                                    <ImageUpload
                                        productId={product.id}
                                        storeId={profile.store_id}
                                        onUploadComplete={fetchImages}
                                    />
                                    <ImageGallery
                                        images={productImages}
                                        productId={product.id}
                                        onUpdate={fetchImages}
                                    />
                                </>
                            ) : (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                                    <p className="text-sm text-blue-700">
                                        يرجى حفظ المنتج أولاً لتتمكن من رفع الصور.
                                    </p>
                                </div>
                            )}
                        </section>
                    </form>
                </div>

                <DialogFooter className="p-6 border-t bg-muted shrink-0 sm:justify-start gap-3">
                    <Button
                        type="submit"
                        form="product-form"
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                حفظ المنتج
                            </>
                        )}
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="w-full sm:w-auto border-border" disabled={isSubmitting}>
                            إلغاء
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
