import { Product, Customer } from '../app/types';

export const mockProducts: Product[] = [
    {
        id: 'p1',
        name: 'تيشيرت قطن فاخر',
        costPrice: 150,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        variants: [
            { id: 'v1', productId: 'p1', size: 'M', color: 'أسود', sku: 'TS-BLK-M', isActive: true },
            { id: 'v2', productId: 'p1', size: 'L', color: 'أسود', sku: 'TS-BLK-L', isActive: true },
            { id: 'v3', productId: 'p1', size: 'XL', color: 'أبيض', sku: 'TS-WHT-XL', isActive: true },
        ],
    },
    {
        id: 'p2',
        name: 'بنطلون جينز كلاسيك',
        costPrice: 200,
        isActive: true,
        createdAt: '2024-01-20T14:30:00Z',
        variants: [
            { id: 'v4', productId: 'p2', size: '32', color: 'أزرق', sku: 'JN-BLU-32', isActive: true },
            { id: 'v5', productId: 'p2', size: '34', color: 'أزرق', sku: 'JN-BLU-34', isActive: true },
        ],
    },
    {
        id: 'p3',
        name: 'هودي شتوي',
        costPrice: 350,
        isActive: false,
        createdAt: '2023-11-05T09:15:00Z',
        variants: [
            { id: 'v6', productId: 'p3', size: 'L', color: 'رمادي', sku: 'HD-GRY-L', isActive: true },
        ],
    },
];

export const mockCustomers: Customer[] = [
    {
        id: 'c1',
        name: 'أحمد محمد',
        phone: '01012345678',
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        address: 'شارع عباس العقاد، عمارة 5',
    },
    {
        id: 'c2',
        name: 'سارة علي',
        phone: '01198765432',
        governorate: 'الجيزة',
        city: 'الدقي',
        address: 'شارع التحرير، مكتب 12',
    },
];

export const governorates = [
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'الدقهلية',
    'الشرقية',
    'المنوفية',
    'القليوبية',
    'البحيرة',
    'الغربية',
    'بور سعيد',
    'دمياط',
    'الإسماعيلية',
    'السويس',
    'كفر الشيخ',
    'الفيوم',
    'بني سويف',
    'المنيا',
    'أسيوط',
    'سوهاج',
    'قنا',
    'الأقصر',
    'أسوان',
    'البحر الأحمر',
    'الوادى الجديد',
    'مطروح',
    'شمال سيناء',
    'جنوب سيناء',
];
