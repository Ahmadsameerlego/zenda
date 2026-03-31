import { useState, useEffect } from 'react';
import {
    Search, Plus, Edit, Trash2, MoreHorizontal, Loader2,
    AlertCircle, RefreshCw, CheckCircle2, XCircle, Award,
    ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '../components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Skeleton } from '../components/ui/skeleton';
import { Brand } from '../types';
import { ProductsService } from '../services/products';
import { useAuth } from '../context/AuthProvider';
import { toast } from 'sonner';

interface BrandsArabicProps {
    language: 'ar' | 'en';
}

export function BrandsArabic({ language }: BrandsArabicProps) {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<string | null>(null);

    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        is_active: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { profile } = useAuth();
    const isRTL = language === 'ar';

    const fetchBrands = async () => {
        if (!profile?.store_id) return;

        try {
            setLoading(true);
            setError(null);
            const data = await ProductsService.getBrands(profile.store_id);
            setBrands(data);
        } catch (err) {
            console.error('Error fetching brands:', err);
            setError('حدث خطأ أثناء تحميل البراندات.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, [profile?.store_id]);

    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenModal = (brand?: Brand) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                slug: brand.slug,
                is_active: brand.is_active
            });
        } else {
            setEditingBrand(null);
            setFormData({
                name: '',
                slug: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleNameChange = (name: string) => {
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        setFormData(prev => ({ ...prev, name, slug }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.store_id) return;
        if (!formData.name.trim()) {
            toast.error('اسم البراند مطلوب');
            return;
        }

        try {
            setIsSubmitting(true);
            if (editingBrand) {
                await ProductsService.updateBrand(editingBrand.id, formData, profile.store_id);
                toast.success('تم تحديث البراند بنجاح');
            } else {
                await ProductsService.createBrand(formData, profile.store_id);
                toast.success('تم إضافة البراند بنجاح');
            }
            setIsModalOpen(false);
            fetchBrands();
        } catch (err) {
            console.error('Error saving brand:', err);
            toast.error('فشل في حفظ البراند');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (brand: Brand) => {
        if (!profile?.store_id) return;
        try {
            const newStatus = !brand.is_active;
            await ProductsService.updateBrandStatus(brand.id, newStatus, profile.store_id);
            setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, is_active: newStatus } : b));
            toast.success(newStatus ? 'تم تفعيل البراند' : 'تم تعطيل البراند');
        } catch (err) {
            toast.error('فشل في تغيير الحالة');
        }
    };

    const handleDelete = async () => {
        if (!brandToDelete || !profile?.store_id) return;
        try {
            setIsDeleting(true);
            await ProductsService.deleteBrand(brandToDelete, profile.store_id);
            toast.success('تم حذف البراند بنجاح');
            setBrands(prev => prev.filter(b => b.id !== brandToDelete));
            setBrandToDelete(null);
        } catch (err) {
            toast.error('فشل في حذف البراند. قد يكون مرتبطاً بمنتجات.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h3 className="text-lg font-semibold">{error}</h3>
                <Button onClick={fetchBrands} variant="outline">إعادة المحاولة</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">البراندات (العلامات التجارية)</h1>
                    <p className="text-muted-foreground mt-1">إدارة العلامات التجارية في متجرك</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6">
                    <Plus className="w-5 h-5" />
                    إضافة براند جديد
                </Button>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                    <div className="relative max-w-sm">
                        <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                        <Input
                            placeholder="البحث عن براند..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`h-11 ${isRTL ? 'pr-10' : 'pl-10'} bg-muted/50 border-border focus:bg-card transition-all`}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-transparent">
                                <TableHead className="font-bold">اسم البراند</TableHead>
                                <TableHead className="font-bold">Slug</TableHead>
                                <TableHead className="font-bold text-center">الحالة</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredBrands.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-[300px] text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                            <div className="bg-accent text-accent-foreground p-6 rounded-full text-muted-foreground">
                                                <Award className="w-12 h-12" />
                                            </div>
                                            <p className="text-lg font-medium text-foreground">لا توجد براندات</p>
                                            <Button onClick={() => handleOpenModal()} variant="outline" className="text-green-600 border-green-200">
                                                إضافة أول براند
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBrands.map((brand) => (
                                    <TableRow key={brand.id} className="group hover:bg-muted/80 transition-colors">
                                        <TableCell className="font-medium text-foreground">{brand.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{brand.slug}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={brand.is_active ? 'default' : 'secondary'}
                                                className={`font-medium ${brand.is_active
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                    : 'bg-accent text-accent-foreground text-gray-700 hover:bg-accent hover:text-accent-foreground'
                                                    }`}
                                            >
                                                {brand.is_active ? 'نشط' : 'معطل'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                                    <DropdownMenuItem onClick={() => handleOpenModal(brand)}>
                                                        <Edit className="w-4 h-4 ml-2 text-muted-foreground" />
                                                        تعديل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(brand)}>
                                                        {brand.is_active ? (
                                                            <>
                                                                <XCircle className="w-4 h-4 ml-2 text-red-500" />
                                                                تعطيل
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />
                                                                تفعيل
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setBrandToDelete(brand.id)}
                                                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 ml-2" />
                                                        حذف
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]" dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingBrand ? 'تعديل البراند' : 'إضافة براند جديد'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">اسم العلامة التجارية</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="مثال: أديداس، نايكي..."
                                className="text-right"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (للرابط)</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                className="text-right font-mono text-sm bg-muted"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="is_active">الحالة</Label>
                            <div className="flex items-center gap-2 h-10">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                />
                                <span className="text-sm text-muted-foreground">{formData.is_active ? 'نشط' : 'معطل'}</span>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                                {editingBrand ? 'حفظ التغييرات' : 'إضافة البراند'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!brandToDelete} onOpenChange={(open) => !open && setBrandToDelete(null)}>
                <DialogContent className="sm:max-w-[400px]" dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground">هل أنت متأكد من حذف هذا البراند؟ لا يمكن التراجع عن هذا الإجراء، وسيتم إزالته من جميع المنتجات المرتبطة به.</p>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setBrandToDelete(null)}>إلغاء</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                            حذف البراند
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
