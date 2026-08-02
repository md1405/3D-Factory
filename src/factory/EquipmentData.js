export const equipmentData = {
    rawMilkTank: {
        id: 'rawMilkTank',
        // Display names
        name: 'Raw Milk Storage Tank',
        nameFa: 'مخزن ذخیره شیر خام',
        
        // Tour information (one line)
        tourInfo: 'Capacity: 10,000 L | Temp: 4°C',
        
        // Camera position for the tour
        cameraPosition: [2, 5, 10],
        target: [-4, 3.5, 6],
        duration: 4000,
        processStep: 1,
        
        // 🔥 NEW: Configuration schema
        config: {
            capacity: {
                type: 'radio',
                label: 'Capacity',
                options: [
                    { 
                        value: 10000, 
                        label: '10,000 L', 
                        scale: 0.8,
                        specs: [
                            { label: 'Capacity', value: '10,000 Liters' },
                            { label: 'Diameter', value: '1.6 m' },
                            { label: 'Height', value: '5.0 m' },
                            { label: 'Weight', value: '2,200 kg' }
                        ]
                    },
                    { 
                        value: 20000, 
                        label: '20,000 L', 
                        scale: 1.0,
                        specs: [
                            { label: 'Capacity', value: '20,000 Liters' },
                            { label: 'Diameter', value: '2.0 m' },
                            { label: 'Height', value: '6.4 m' },
                            { label: 'Weight', value: '3,800 kg' }
                        ]
                    },
                    { 
                        value: 30000, 
                        label: '30,000 L', 
                        scale: 1.3,
                        specs: [
                            { label: 'Capacity', value: '30,000 Liters' },
                            { label: 'Diameter', value: '2.4 m' },
                            { label: 'Height', value: '7.0 m' },
                            { label: 'Weight', value: '5,500 kg' }
                        ]
                    },
                ],
                default: 10000
            },
            material: {
                type: 'radio',
                label: 'Material',
                options: [
                    { 
                        value: 'SS304', 
                        label: 'SS304',
                        color: 0xd8d8d8,
                        specs: [
                            { label: 'Material', value: 'Stainless Steel 304' },
                            { label: 'Corrosion Resistance', value: 'Good' },
                            { label: 'Max Temp', value: '870°C' }
                        ]
                    },
                    { 
                        value: 'SS316L', 
                        label: 'SS316L',
                        color: 0xe0e0e0,
                        specs: [
                            { label: 'Material', value: 'Stainless Steel 316L' },
                            { label: 'Corrosion Resistance', value: 'Excellent' },
                            { label: 'Max Temp', value: '870°C' }
                        ]
                    },
                ],
                default: 'SS304'
            },
        },
        
        // Current state (initialized from defaults)
        currentConfig: {
            capacity: 10000,
            material: 'SS304',
            insulation: true
        },
        
        // Full information for InfoPanel (bilingual)
        info: {
            fa: {
                title: 'مخزن ذخیره شیر خام',
                description: 'ظرفیت ۱۰,۰۰۰ لیتر، استیل ۳۰۴، مجهز به سیستم CIP',
                specs: [
                    { label: 'ظرفیت', value: '۱۰,۰۰۰ لیتر' },
                    { label: 'جنس', value: 'استیل ضد زنگ ۳۰۴' },
                    { label: 'دما', value: '۴ درجه سانتی‌گراد' },
                    { label: 'استاندارد', value: 'ISO 22000' }
                ]
            },
            en: {
                title: 'Raw Milk Storage Tank',
                description: '10,000 L capacity, AISI 304, CIP equipped',
                specs: [
                    { label: 'Capacity', value: '10,000 Liters' },
                    { label: 'Material', value: 'Stainless Steel 304' },
                    { label: 'Temperature', value: '4°C ± 0.5' },
                    { label: 'Standard', value: 'ISO 22000' }
                ]
            }
        }
    },

    pasteurizationTank: {
        id: 'pasteurizationTank',
        name: 'Pasteurization Tank',
        nameFa: 'مخزن پاستوریزاسیون',
        
        tourInfo: 'HTST | 72°C for 15 sec',
        
        cameraPosition: [2, 5, 4],
        target: [-4, 3.5, 0],
        duration: 4000,
        processStep: 2,
        
        // 🔥 NEW: Configuration schema
        config: {
            capacity: {
                type: 'radio',
                label: 'Capacity',
                options: [
                    { value: 5000, label: '5,000 L', scale: 0.8, specs: [{ label: 'Capacity', value: '5,000 Liters' }] },
                    { value: 10000, label: '10,000 L', scale: 1.0, specs: [{ label: 'Capacity', value: '10,000 Liters' }] },
                    { value: 15000, label: '15,000 L', scale: 1.2, specs: [{ label: 'Capacity', value: '15,000 Liters' }] },
                ],
                default: 10000
            },
            material: {
                type: 'radio',
                label: 'Material',
                options: [
                    { value: 'SS304', label: 'SS304', color: 0xd8d8d8 },
                    { value: 'SS316L', label: 'SS316L', color: 0xe8e8e8 },
                ],
                default: 'SS316L'
            },

        },
        
        currentConfig: {
            capacity: 10000,
            material: 'SS316L',
            insulation: true
        },
        
        info: {
            fa: {
                title: 'مخزن پاستوریزاسیون',
                description: 'فرآیند حرارتی ۷۲ درجه سانتی‌گراد به مدت ۱۵ ثانیه',
                specs: [
                    { label: 'روش', value: 'HTST (دمای بالا - زمان کوتاه)' },
                    { label: 'دما', value: '۷۲ درجه سانتی‌گراد' },
                    { label: 'زمان نگهداری', value: '۱۵ ثانیه' },
                    { label: 'جنس', value: 'استیل ۳۱۶L' }
                ]
            },
            en: {
                title: 'Pasteurization Tank',
                description: 'Thermal process at 72°C for 15 seconds',
                specs: [
                    { label: 'Method', value: 'HTST (High Temp - Short Time)' },
                    { label: 'Temperature', value: '72°C' },
                    { label: 'Holding Time', value: '15 Seconds' },
                    { label: 'Material', value: 'Stainless Steel 316L' }
                ]
            }
        }
    },

    conveyor: {
        id: 'conveyor',
        name: 'Bottle Conveyor System',
        nameFa: 'سیستم نوار نقاله بطری',
        
        tourInfo: 'Speed: 0.5 m/s | 120 bottles/min',
        
        cameraPosition: [0, 5, 8],
        target: [0, 2, 3],
        duration: 5000,
        processStep: 3,
        
        // 🔥 NEW: Configuration schema
        config: {
            speed: {
                type: 'radio',
                label: 'Speed',
                options: [
                    { value: 0.3, label: 'Low (80 bpm)', scale: 1.0 },
                    { value: 0.5, label: 'Medium (120 bpm)', scale: 1.0 },
                    { value: 0.8, label: 'High (180 bpm)', scale: 1.0 },
                ],
                default: 0.5
            },
            length: {
                type: 'radio',
                label: 'Length',
                options: [
                    { value: 6, label: '6 meters', scale: 0.75 },
                    { value: 8, label: '8 meters', scale: 1.0 },
                    { value: 10, label: '10 meters', scale: 1.25 },
                ],
                default: 8
            },
        },
        
        currentConfig: {
            speed: 0.5,
            length: 8
        },
        
        info: {
            fa: {
                title: 'نوار نقاله',
                description: 'انتقال بطری‌ها به بخش بسته‌بندی با سرعت قابل تنظیم',
                specs: [
                    { label: 'نوع', value: 'نوار نقاله مدولار' },
                    { label: 'سرعت', value: '۰.۵ متر بر ثانیه' },
                    { label: 'ظرفیت', value: '۱۲۰ بطری در دقیقه' },
                    { label: 'جنس', value: 'پلی‌پروپیلن غذایی' }
                ]
            },
            en: {
                title: 'Conveyor',
                description: 'Bottle transfer to packaging section with adjustable speed',
                specs: [
                    { label: 'Type', value: 'Modular Belt Conveyor' },
                    { label: 'Speed', value: '0.5 m/s' },
                    { label: 'Capacity', value: '120 bottles/min' },
                    { label: 'Material', value: 'Food-Grade Polypropylene' }
                ]
            }
        }
    }
};

// ========================================
// Tour point array (built from the data above)
// ========================================
export const tourPoints = Object.values(equipmentData).map(item => ({
    name: item.name,
    nameFa: item.nameFa,
    cameraPosition: item.cameraPosition,
    target: item.target,
    duration: item.duration,
    processStep: item.processStep,
    description: item.tourInfo
}));