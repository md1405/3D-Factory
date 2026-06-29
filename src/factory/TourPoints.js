// src/factory/TourPoints.js
export const tourPoints = [
    {
        name: "Raw Milk Storage Tank",
        nameFa: "مخزن ذخیره شیر خام",
        cameraPosition: [2, 5, 10],
        target: [-4, 3.5, 6],
        duration: 4000,
        processStep: 1,
        // description: "ذخیره‌سازی شیر خام در دمای کنترل شده",
        description: "Storage of raw milk at controlled temperature"
    },
    {
        name: "Pasteurization Tank",
        nameFa: "مخزن پاستوریزاسیون",
        cameraPosition: [2, 5, 4],
        target: [-4, 3.5, 0],
        duration: 4000,
        processStep: 2,
        // description: "فرآیند پاستوریزاسیون شیر",
        description: "Milk Pasteurization Process"
    },
    {
        name: "Bottle Conveyor System",
        nameFa: "سیستم نوار نقاله بطری",
        cameraPosition: [0, 5, 8],
        target: [0, 2, 3],
        duration: 5000,
        processStep: 3,
        // description: "انتقال و پر کردن بطری‌ها",
        description: "Transferring and filling bottles"
    }
];