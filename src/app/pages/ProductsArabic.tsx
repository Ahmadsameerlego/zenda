import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2, MoreHorizontal, Loader2, AlertCircle, RefreshCw, Eye, Copy, Star, CheckCircle2, XCircle, Package, Image as ImageIcon } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { Skeleton } from '../components/ui/skeleton';
import { ProductForm } from '../components/products/ProductForm';
import { ProductQuickView } from '../components/products/ProductQuickView';
import { ProductListItem, ProductDetails, Category, Brand, ProductVariant } from '../../app/types';
import { ProductsService } from '../services/products';
import { useAuth } from '../context/AuthProvider';
import { toast } from 'sonner';

interface ProductsArabicProps {
  language: 'ar' | 'en';
}

export function ProductsArabic({ language }: ProductsArabicProps) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetails | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductListItem | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewVariants, setQuickViewVariants] = useState<ProductVariant[]>([]);

  const { profile } = useAuth();
  const isRTL = language === 'ar';

  const fetchData = async () => {
    if (!profile?.store_id) return;

    try {
      setLoading(true);
      setError(null);
      const [productsData, categoriesData, brandsData] = await Promise.all([
        ProductsService.getProductsList(profile.store_id),
        ProductsService.getCategories(profile.store_id),
        ProductsService.getBrands(profile.store_id)
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.store_id) {
      fetchData();
    }
  }, [profile?.store_id]);

  const filteredProducts = products.filter((product: ProductListItem) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    const matchesBrand = brandFilter === 'all' || product.brand_id === brandFilter;
    const matchesFeatured = featuredFilter === 'all' ||
      (featuredFilter === 'featured' && product.is_featured) ||
      (featuredFilter === 'not_featured' && !product.is_featured);

    let matchesStock = true;
    if (stockFilter === 'in_stock') matchesStock = product.total_stock > 5;
    if (stockFilter === 'low_stock') matchesStock = product.total_stock <= 5 && product.total_stock > 0;
    if (stockFilter === 'out_of_stock') matchesStock = product.total_stock === 0;

    return matchesSearch && matchesStatus && matchesCategory && matchesBrand && matchesFeatured && matchesStock;
  });

  const handleProductSaved = () => {
    fetchData();
    setIsFormOpen(false);
    setEditingProduct(null);
    toast.success(editingProduct ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await ProductsService.deleteProduct(id, profile?.store_id || '');
      toast.success('تم حذف المنتج بنجاح');
      fetchData();
    } catch (err) {
      console.error('Error deleting product', err);
      toast.error('فشل حذف المنتج');
    }
  };

  const handleToggleStatus = async (product: ProductListItem) => {
    const newStatus = !product.is_active;
    const toastId = toast.loading(newStatus ? 'جاري تفعيل الطلب...' : 'جاري إيقاف الطلب...');
    try {
      await ProductsService.updateProductStatus(product.id, newStatus, profile?.store_id || '');
      toast.success(newStatus ? 'تم تفعيل الطلب على المنتج' : 'تم إيقاف الطلب على المنتج', { id: toastId });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'فشل تغيير حالة الطلب', { id: toastId });
    }
  };

  const handleTogglePublished = async (product: ProductListItem) => {
    const newPublished = !product.is_published;
    const toastId = toast.loading(newPublished ? 'جاري نشر المنتج...' : 'جاري إخفاء المنتج...');
    try {
      await ProductsService.updateProductPublished(product.id, newPublished, profile?.store_id || '');
      toast.success(newPublished ? 'تم نشر المنتج في المتجر' : 'تم إخفاء المنتج من المتجر', { id: toastId });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'فشل تغيير حالة النشر', { id: toastId });
    }
  };

  const handleToggleFeatured = async (product: ProductListItem) => {
    const newFeatured = !product.is_featured;
    const toastId = toast.loading(newFeatured ? 'جاري تمييز المنتج...' : 'جاري إلغاء التمييز...');
    try {
      await ProductsService.toggleProductFeatured(product.id, newFeatured, profile?.store_id || '');
      toast.success(newFeatured ? 'تم تمييز المنتج كمنتج خاص' : 'تم إلغاء تمييز المنتج', { id: toastId });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'فشل تغيير حالة التمييز', { id: toastId });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setBrandFilter('all');
    setStockFilter('all');
    setFeaturedFilter('all');
    toast.info('تم إعادة ضبط الفلاتر');
  };

  const handleCopyLink = (product: ProductListItem) => {
    const link = product.slug || product.id;
    navigator.clipboard.writeText(link);
    toast.success('تم نسخ الرابط');
  };

  const handleEditClick = async (product: ProductListItem) => {
    try {
      const fullProduct = await ProductsService.getProductById(product.id, profile?.store_id || '');
      setEditingProduct(fullProduct);
      setIsFormOpen(true);
    } catch (err) {
      console.error('Error fetching full product:', err);
      toast.error('فشل في تحميل بيانات المنتج');
    }
  };

  const handleOpenQuickView = async (product: ProductListItem) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
    if (product.has_variants) {
      try {
        const fullProduct = await ProductsService.getProductById(product.id, profile?.store_id || '');
        setQuickViewVariants(fullProduct.variants);
      } catch (err) {
        console.error('Error fetching variants:', err);
      }
    } else {
      setQuickViewVariants([]);
    }
  };

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="bg-red-50 p-4 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{error}</h3>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar'
              ? 'إدارة محتوى متجرك والمخزون والأسعار'
              : 'Manage your store products, inventory, and pricing'}
          </p>
        </div>

        <Button onClick={handleAddNewClick} className="bg-green-600 hover:bg-green-700 shadow-sm gap-2 h-11 px-6">
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Advanced Filters Section */}
        <div className="p-6 border-b border-border bg-card shadow-sm">
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
                <div className={`absolute top-1/2 -translate-y-1/2 flex items-center h-full ${isRTL ? 'right-3' : 'left-3'} pointer-events-none z-10`}>
                  <Search className="w-4 h-4 text-muted-foreground" />
                </div>
                <Input
                  placeholder={language === 'ar' ? 'بحث باسم المنتج أو الرابط...' : 'Search by name or slug...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`h-11 ${isRTL ? 'pr-10 text-right' : 'pl-10'} bg-card border-border rounded-lg focus:border-green-500 focus:ring-green-500 transition-all shadow-sm placeholder:text-muted-foreground placeholder:text-right`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Status Select */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 bg-card border-border rounded-lg focus:ring-green-500 focus:border-green-500 transition-all text-right shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Select */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11 bg-card border-border rounded-lg focus:ring-green-500 focus:border-green-500 transition-all text-right shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectValue placeholder="التصنيف" />
                </SelectTrigger>
                <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectItem value="all">كل التصنيفات</SelectItem>
                  {categories.map((cat: Category) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Brand Select */}
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="h-11 bg-card border-border rounded-lg focus:ring-green-500 focus:border-green-500 transition-all text-right shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectValue placeholder="العلامة التجارية" />
                </SelectTrigger>
                <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectItem value="all">كل الماركات</SelectItem>
                  {brands.map((brand: Brand) => (
                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Stock Select */}
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="h-11 bg-card border-border rounded-lg focus:ring-green-500 focus:border-green-500 transition-all text-right shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectValue placeholder="حالة المخزون" />
                </SelectTrigger>
                <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectItem value="all">كل مستويات المخزون</SelectItem>
                  <SelectItem value="in_stock">متوفر (أكثر من 5)</SelectItem>
                  <SelectItem value="low_stock">مخزون منخفض (1-5)</SelectItem>
                  <SelectItem value="out_of_stock">نفذ من المخزون (0)</SelectItem>
                </SelectContent>
              </Select>

              {/* Featured Select */}
              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger className="h-11 bg-card border-border rounded-lg focus:ring-green-500 focus:border-green-500 transition-all text-right shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectValue placeholder="مميز" />
                </SelectTrigger>
                <SelectContent dir={isRTL ? 'rtl' : 'ltr'}>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="featured">المنتجات المميزة</SelectItem>
                  <SelectItem value="not_featured">منتجات عادية</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset Button */}
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="h-11 border-border rounded-lg text-muted-foreground hover:text-foreground transition-all gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {language === 'ar' ? 'إعادة ضبط' : 'Reset Filters'}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/50">
                <TableHead className="w-[300px] font-bold text-foreground">المنتج</TableHead>
                <TableHead className="font-bold text-foreground">التصنيف</TableHead>
                <TableHead className="font-bold text-foreground">السعر</TableHead>
                <TableHead className="font-bold text-foreground text-center">المخزون</TableHead>
                <TableHead className="font-bold text-foreground">النوع</TableHead>
                <TableHead className="font-bold text-foreground">
                  <div className="flex items-center gap-1.5 justify-center">
                    ظاهر في المتجر
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">لو مفعّلة، المنتج هيظهر للعملاء في المتجر</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className="font-bold text-foreground">
                  <div className="flex items-center gap-1.5 justify-center">
                    متاح للطلب
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">لو مفعّلة، العميل يقدر يطلب المنتج</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-full rouned-lg" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                      <div className="bg-accent text-accent-foreground p-6 rounded-full">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <div className="max-w-[200px]">
                        <p className="text-lg font-medium text-foreground">لا توجد منتجات</p>
                        <p className="text-sm mt-1">ابدأ بإضافة أول منتج لتظهر هنا في القائمة</p>
                      </div>
                      <Button onClick={handleAddNewClick} variant="outline" className="mt-2 text-green-600 border-green-200 hover:bg-green-50">
                        إضافة منتج جديد
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product: ProductListItem) => (
                  <TableRow key={product.id} className="group hover:bg-muted/80 transition-colors border-b last:border-0">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-accent text-accent-foreground border border-border overflow-hidden flex-shrink-0">
                          {product.primary_image ? (
                            <img src={product.primary_image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground truncate">
                            {product.name}
                            {product.is_featured && <Star className="inline w-3.5 h-3.5 mr-1.5 text-amber-500 fill-amber-500" />}
                          </span>
                          <span className="text-xs text-muted-foreground truncate mt-0.5">/{product.slug || String(product.id).substring(0, 8)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{product.category_name || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{product.display_price} ج.م</span>
                        {product.display_compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through">{product.display_compare_at_price} ج.م</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-semibold ${product.total_stock === 0 ? 'text-red-600' :
                          product.total_stock <= 5 ? 'text-amber-600' : 'text-foreground'
                          }`}>
                          {product.total_stock}
                        </span>
                        <div className="flex gap-1 mt-1">
                          {product.total_stock === 0 ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100 text-[10px] h-4 px-1">نفذ</Badge>
                          ) : product.total_stock <= 5 ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] h-4 px-1">منخفض</Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal bg-accent text-accent-foreground text-muted-foreground border-0">
                        {product.has_variants ? "متعدد المتغيرات" : "منتج بسيط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={product.is_published ? 'default' : 'secondary'}
                        className={`font-medium ${product.is_published
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-0'
                          : 'bg-accent text-accent-foreground text-gray-700 hover:bg-accent hover:text-accent-foreground shadow-none border-0'
                          }`}
                      >
                        {product.is_published ? 'ظاهر' : 'مخفي'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={product.is_active ? 'default' : 'secondary'}
                        className={`font-medium ${product.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-0'
                          : 'bg-red-50 text-red-700 hover:bg-red-50 shadow-none border-0'
                          }`}
                      >
                        {product.is_active ? 'نشط' : 'متوقف'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-card border hover:border-border">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-[180px]">
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenQuickView(product)}>
                            <Eye className="w-4 h-4 ml-2 text-muted-foreground" />
                            عرض المنتج
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(product)}>
                            <Edit className="w-4 h-4 ml-2 text-muted-foreground" />
                            تعديل المنتج
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(product)}>
                            <Copy className="w-4 h-4 ml-2 text-muted-foreground" />
                            نسخ الرابط
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">حالة الظهور</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleTogglePublished(product)}>
                            {product.is_published ? (
                              <>
                                <XCircle className="w-4 h-4 ml-2 text-muted-foreground" />
                                إخفاء المنتج
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />
                                نشر المنتج
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">حالة الطلب</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                            {product.is_active ? (
                              <>
                                <XCircle className="w-4 h-4 ml-2 text-red-500" />
                                إيقاف الطلب عليه
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />
                                تفعيل الطلب عليه
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                            <Star className={`w-4 h-4 ml-2 ${product.is_featured ? 'text-muted-foreground' : 'text-amber-500 fill-amber-500'}`} />
                            {product.is_featured ? 'إلغاء التمييز' : 'تمييز كمنتج خاص'}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف المنتج
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

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={editingProduct}
        onSubmit={handleProductSaved}
      />

      <ProductQuickView
        open={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        product={quickViewProduct}
        variants={quickViewVariants}
      />
    </div>
  );
}
