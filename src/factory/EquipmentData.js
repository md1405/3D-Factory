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