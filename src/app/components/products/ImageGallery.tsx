import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Star, GripVertical, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ProductImage } from '../../types';
import { ProductImagesService } from '../../services/product-images';
import { toast } from 'sonner';

interface SortableImageProps {
    image: ProductImage;
    onDelete: (id: string) => void;
    onSetPrimary: (id: string) => void;
    isDeleting: boolean;
    isSettingPrimary: boolean;
}

function SortableImage({ image, onDelete, onSetPrimary, isDeleting, isSettingPrimary }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden aspect-square shadow-sm hover:shadow-md transition-shadow"
        >
            <img
                src={image.image_url}
                alt={image.alt_text || 'Product Image'}
                className="w-full h-full object-cover"
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between items-start">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg cursor-grab active:cursor-grabbing text-white"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 bg-red-500/80 hover:bg-red-600"
                        onClick={() => onDelete(image.id)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    className={`w-full gap-2 ${image.is_primary ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : 'bg-white/90 hover:bg-white'}`}
                    onClick={() => !image.is_primary && onSetPrimary(image.id)}
                    disabled={isSettingPrimary || image.is_primary}
                >
                    <Star className={`w-3.5 h-3.5 ${image.is_primary ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    {image.is_primary ? 'أساسية' : 'تعيين كأساسية'}
                </Button>
            </div>

            {image.is_primary && (
                <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 text-white border-none shadow-sm">
                        أساسية
                    </Badge>
                </div>
            )}
        </div>
    );
}

interface ImageGalleryProps {
    images: ProductImage[];
    productId: string;
    onUpdate: () => void;
}

export function ImageGallery({ images, productId, onUpdate }: ImageGalleryProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSettingPrimary, setIsSettingPrimary] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex((img) => img.id === active.id);
            const newIndex = images.findIndex((img) => img.id === over.id);

            const newOrder = arrayMove(images, oldIndex, newIndex);

            // Check if immediate local update is needed for UX
            // For now, we update backend directly
            try {
                const updates = newOrder.map((img, idx) => ({
                    id: img.id,
                    sort_order: idx + 1
                }));
                await ProductImagesService.updateImageOrder(updates);
                onUpdate();
            } catch (error) {
                toast.error('فشل في إعادة ترتيب الصور');
            }
        }
    };

    const handleDelete = async (imageId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

        try {
            setIsDeleting(imageId);
            await ProductImagesService.deleteProductImage(imageId);
            toast.success('تم حذف الصورة بنجاح');
            onUpdate();
        } catch (error) {
            toast.error('فشل في حذف الصورة');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSetPrimary = async (imageId: string) => {
        try {
            setIsSettingPrimary(imageId);
            await ProductImagesService.setPrimaryImage(imageId, productId);
            toast.success('تم تعيين الصورة الأساسية بنجاح');
            onUpdate();
        } catch (error) {
            toast.error('فشل في تعيين الصورة الأساسية');
        } finally {
            setIsSettingPrimary(null);
        }
    };

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <SortableContext
                        items={images.map(img => img.id)}
                        strategy={rectSortingStrategy}
                    >
                        {images.map((image) => (
                            <SortableImage
                                key={image.id}
                                image={image}
                                onDelete={handleDelete}
                                onSetPrimary={handleSetPrimary}
                                isDeleting={isDeleting === image.id}
                                isSettingPrimary={isSettingPrimary === image.id}
                            />
                        ))}
                    </SortableContext>
                </div>
            </DndContext>

            {images.length === 0 && (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <ImageIcon className="w-12 h-12" />
                    <p className="text-sm">لا توجد صور لهذا المنتج بعد</p>
                </div>
            )}
        </div>
    );
}
