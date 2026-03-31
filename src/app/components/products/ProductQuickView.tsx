import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "../ui/sheet";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { ProductListItem, ProductVariant } from "../../types";
import { Package, Tag, Layers, BarChart3, Star, Image as ImageIcon } from "lucide-react";

interface ProductQuickViewProps {
    product: ProductListItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variants?: ProductVariant[];
}

export function ProductQuickView({
    product,
    open,
    onOpenChange,
    variants = [],
}: ProductQuickViewProps) {
    if (!product) return null;

    const isLowStock = product.total_stock <= 5 && product.total_stock > 0;
    const isOutOfStock = product.total_stock === 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col" dir="rtl">
                <SheetHeader className="p-6 border-b text-right">
                    <div className="flex items-center justify-between mb-2">
                        <Badge variant={product.is_active ? "outline" : "secondary"} className={product.is_active ? "bg-green-50 text-green-700 border-green-200" : ""}>
                            {product.is_active ? "نشط" : "مسودة"}
                        </Badge>
                        {product.is_featured && (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                                <Star className="w-3 h-3 ml-1 fill-current" />
                                مميز
                            </Badge>
                        )}
                    </div>
                    <SheetTitle className="text-2xl font-bold">{product.name}</SheetTitle>
                    <SheetDescription className="text-muted-foreground">
                        {product.category_name || "بدون تصنيف"} • {product.brand_name || "بدون علامة تجارية"}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-8">
                        {/* Image Preview */}
                        <div className="aspect-square rounded-xl bg-accent text-accent-foreground flex items-center justify-center overflow-hidden border border-border">
                            {product.primary_image ? (
                                <img
                                    src={product.primary_image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-muted-foreground">
                                    <ImageIcon className="w-12 h-12 mb-2" />
                                    <span className="text-sm">لا توجد صورة</span>
                                </div>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-border bg-muted/50">
                                <div className="flex items-center text-muted-foreground text-sm mb-1">
                                    <Tag className="w-4 h-4 ml-2" />
                                    السعر
                                </div>
                                <div className="text-xl font-bold text-foreground">
                                    {product.display_price} <span className="text-sm font-normal text-muted-foreground">ج.م</span>
                                </div>
                                {product.display_compare_at_price && (
                                    <div className="text-sm text-muted-foreground line-through">
                                        {product.display_compare_at_price} ج.م
                                    </div>
                                )}
                            </div>

                            <div className="p-4 rounded-xl border border-border bg-muted/50">
                                <div className="flex items-center text-muted-foreground text-sm mb-1">
                                    <BarChart3 className="w-4 h-4 ml-2" />
                                    المخزون
                                </div>
                                <div className={`text-xl font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-foreground'}`}>
                                    {product.total_stock} <span className="text-sm font-normal text-muted-foreground">قطعة</span>
                                </div>
                                <div className="text-sm">
                                    {isOutOfStock ? (
                                        <span className="text-red-500 font-medium">نفذ من المخزون</span>
                                    ) : isLowStock ? (
                                        <span className="text-amber-500 font-medium">مخزون منخفض</span>
                                    ) : (
                                        <span className="text-green-600 font-medium">متوفر</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center text-foreground">
                                <Package className="w-4 h-4 ml-2 text-muted-foreground" />
                                الوصف
                            </h4>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {product.description || product.short_description || "لا يوجد وصف لهذا المنتج."}
                            </p>
                        </div>

                        {/* Variants */}
                        {product.has_variants && (
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center text-foreground">
                                    <Layers className="w-4 h-4 ml-2 text-muted-foreground" />
                                    المتغيرات
                                </h4>
                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-right">
                                        <thead className="bg-muted border-b">
                                            <tr>
                                                <th className="px-4 py-2 font-medium text-muted-foreground">المتغير</th>
                                                <th className="px-4 py-2 font-medium text-muted-foreground">السعر</th>
                                                <th className="px-4 py-2 font-medium text-muted-foreground">المخزون</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {variants.map((variant) => (
                                                <tr key={variant.id} className="hover:bg-muted">
                                                    <td className="px-4 py-2">
                                                        {variant.size && variant.color
                                                            ? `${variant.size} / ${variant.color}`
                                                            : variant.size || variant.color || variant.sku || "افتراضي"}
                                                    </td>
                                                    <td className="px-4 py-2 font-medium">{variant.sale_price} ج.م</td>
                                                    <td className="px-4 py-2">
                                                        <span className={variant.stock_quantity <= 5 ? "text-amber-600" : ""}>
                                                            {variant.stock_quantity}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
