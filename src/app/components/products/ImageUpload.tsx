import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { ProductImagesService } from '../../services/product-images';

interface ImageUploadProps {
    productId: string;
    storeId: string;
    onUploadComplete: () => void;
}

export function ImageUpload({ productId, storeId, onUploadComplete }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setUploading(true);
        setProgress(0);

        const totalFiles = acceptedFiles.length;
        let completedFiles = 0;

        try {
            for (const file of acceptedFiles) {
                // Basic validation
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`الملف ${file.name} يتجاوز الحد الأقصى (5 ميجابايت)`);
                    continue;
                }

                await ProductImagesService.uploadProductImage(file, productId, storeId);
                completedFiles++;
                setProgress(Math.round((completedFiles / totalFiles) * 100));
            }

            toast.success('تم رفع الصور بنجاح');
            onUploadComplete();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('حدث خطأ أثناء رفع الصور');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [productId, storeId, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        disabled: uploading
    });

    return (
        <div className="space-y-4 text-right" dir="rtl">
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
                    flex flex-col items-center justify-center gap-3
                    ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'}
                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                    {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    ) : (
                        <Upload className="w-6 h-6" />
                    )}
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                        اسحب الصور هنا أو انقر للاختيار
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, WebP (بحد أقصى 5 ميجابايت)
                    </p>
                </div>
            </div>

            {uploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>جاري الرفع...</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1 bg-gray-100" />
                </div>
            )}
        </div>
    );
}
