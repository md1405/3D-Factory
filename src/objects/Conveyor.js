import * as THREE from 'three'

export default class Conveyor extends THREE.Group {
  constructor() {
    super()
    
    // 1. پیکربندی ساده و متمرکز بر هدف روز چهارم
    this.config = {
      length: 10,        // طول نوار نقاله
      width: 1.2,        // عرض نوار
      beltThickness: 0.1, // ضخامت تسمه
      rollerRadius: 0.2,  // شعاع رولرها
      legHeight: 1.5,     // ارتفاع پایه‌ها
      yPosition: 2,       // ارتفاع کل نوار از زمین (با مخازن شما هماهنگ است)
      zPosition: 3,       // موقعیت عمق (همان centerZ شما)
      bottleGroupOffsetY: 0.5 // ارتفاع قرارگیری بطری روی تسمه
    }

    // 2. متریال‌های حرفه‌ای ولی بهینه برای دمو
    this.materials = {
      belt: new THREE.MeshStandardMaterial({
        color: 0x2c3e50,
        roughness: 0.8,
        metalness: 0.1
      }),
      roller: new THREE.MeshStandardMaterial({
        color: 0xbdc3c7,
        roughness: 0.3,
        metalness: 0.9
      }),
      support: new THREE.MeshStandardMaterial({
        color: 0x7f8c8d, // نارنجی ایمنی - برای تشخیص فوری پایه‌ها
        roughness: 0.4,
        metalness: 0.7
      }),
      detail: new THREE.MeshStandardMaterial({
        color: 0x7f8c8d,
        roughness: 0.4,
        metalness: 0.7
      })
    }

    // 3. ساخت ساختار سلسله‌مراتبی
    // Conveyor (this)
    //   ├── Belt System
    //   ├── Rollers (Start, End)
    //   ├── Supports (Legs)
    //   └── Bottles Group (برای انیمیشن)
    
    this.beltSystem = new THREE.Group()
    this.rollersGroup = new THREE.Group()
    this.supportsGroup = new THREE.Group()
    this.bottlesGroup = new THREE.Group() // مهم: گروه مجزا برای بطری‌ها
    
    this.add(this.beltSystem)
    this.add(this.rollersGroup)
    this.add(this.supportsGroup)
    this.add(this.bottlesGroup)

    // 4. فراخوانی متدهای ساخت
    this.createBeltSystem()
    this.createRollers()
    this.createSupports()
  }

  // --- ساخت تسمه و لبه‌ها ---
  createBeltSystem() {
    const { length, width, beltThickness, yPosition, zPosition } = this.config
    
    // تسمه اصلی (لاستیکی)
    const beltGeo = new THREE.BoxGeometry(length, beltThickness, width)
    const belt = new THREE.Mesh(beltGeo, this.materials.belt)
    belt.position.set(0, yPosition, zPosition)
    belt.castShadow = true
    belt.receiveShadow = true
    this.beltSystem.add(belt)
    
    // لبه‌های فلزی کناری برای واقع‌گرایی
    const edgeThickness = 0.05
    const edgeHeight = 0.15
    const edgeGeo = new THREE.BoxGeometry(length, edgeHeight, edgeThickness)
    
    const frontEdge = new THREE.Mesh(edgeGeo, this.materials.detail)
    frontEdge.position.set(0, yPosition + 0.05, zPosition + width/2)
    this.beltSystem.add(frontEdge)
    
    const backEdge = new THREE.Mesh(edgeGeo, this.materials.detail)
    backEdge.position.set(0, yPosition + 0.05, zPosition - width/2)
    this.beltSystem.add(backEdge)
  }

  // --- ساخت رولرهای ابتدا و انتها ---
  createRollers() {
    const { length, width, rollerRadius, yPosition, zPosition } = this.config
    
    const rollerGeo = new THREE.CylinderGeometry(rollerRadius, rollerRadius, width, 32)
    
    // رولر شروع (چپ)
    this.rollerStart = new THREE.Mesh(rollerGeo, this.materials.roller)
    this.rollerStart.position.set(-length/2 + rollerRadius, yPosition, zPosition)
    this.rollerStart.rotation.z = Math.PI / 2 // افقی کردن استوانه
    this.rollerStart.rotation.y = Math.PI / 2 // چرخاندناستوانه
    this.rollerStart.castShadow = true
    this.rollersGroup.add(this.rollerStart)
    
    // رولر پایان (راست)
    this.rollerEnd = new THREE.Mesh(rollerGeo, this.materials.roller)
    this.rollerEnd.position.set(length/2 - rollerRadius, yPosition, zPosition)
    this.rollerEnd.rotation.z = Math.PI / 2 // افقی کردن استوانه
    this.rollerEnd.rotation.y = Math.PI / 2 // چرخاندناستوانه
    this.rollerEnd.castShadow = true
    this.rollersGroup.add(this.rollerEnd)
    
    // دیسک‌های کناری رولرها برای جزئیات بیشتر
    const diskGeo = new THREE.CylinderGeometry(rollerRadius + 0.05, rollerRadius + 0.05, 0.05, 16)
    const positions = [
      { x: -length/2 + rollerRadius, z: zPosition + width/2 },
      { x: -length/2 + rollerRadius, z: zPosition - width/2 },
      { x: length/2 - rollerRadius, z: zPosition + width/2 },
      { x: length/2 - rollerRadius, z: zPosition - width/2 }
    ]
    
    positions.forEach(pos => {
      const disk = new THREE.Mesh(diskGeo, this.materials.detail)
      disk.position.set(pos.x, yPosition, pos.z)
      this.rollersGroup.add(disk)
    })
  }

  // --- ساخت پایه‌ها (نسخه ساده‌شده و خوانا) ---
  createSupports() {
    const { length, width, legHeight, yPosition, zPosition } = this.config
    
    // ۴ جفت پایه در طول نوار
    const supportCount = 4
    const spacing = length / (supportCount + 1)
    
    for (let i = 1; i <= supportCount; i++) {
      const xPos = -length/2 + i * spacing
      const supportGroup = new THREE.Group()
      
      // دو پایه عمودی
      const legGeo = new THREE.BoxGeometry(0.1, legHeight, 0.1)
      
      const frontLeg = new THREE.Mesh(legGeo, this.materials.support)
      frontLeg.position.set(0, legHeight/2, width/2 - 0.1)
      frontLeg.castShadow = true
      frontLeg.receiveShadow = true
      
      const backLeg = new THREE.Mesh(legGeo, this.materials.support)
      backLeg.position.set(0, legHeight/2, -width/2 + 0.1)
      backLeg.castShadow = true
      backLeg.receiveShadow = true
      
      supportGroup.add(frontLeg)
      supportGroup.add(backLeg)
      
      // میله افقی اتصال
      const barGeo = new THREE.BoxGeometry(0.08, 0.08, width - 0.2)
      const bar = new THREE.Mesh(barGeo, this.materials.detail)
      bar.position.set(0, legHeight * 0.15, 0) // نزدیک زمین
      supportGroup.add(bar)
      
      // قرار دادن گروه پایه
      supportGroup.position.set(xPos, yPosition - legHeight, zPosition)
      this.supportsGroup.add(supportGroup);


    }

    this.rotation.y = Math.PI / 2;

    this.position.set(-1.5, -0.5, -3);

  }

  // --- متدهای عمومی برای تعامل با دنیای خارج ---

  // افزودن بطری به گروه بطری‌ها (برای انیمیشن)
  // addBottle(bottle) {
  //   this.bottlesGroup.add(bottle)
  // }

  // // دریافت همه بطری‌های در حال حرکت
  // getBottles() {
  //   return this.bottlesGroup.children
  // }

  // دریافت رولرها برای چرخش در انیمیشن
  // getRollers() {
  //   return {
  //     start: this.rollerStart,
  //     end: this.rollerEnd
  //   }
  // }

  // // دریافت محدوده حرکت بطری‌ها
  // getBottleMovementRange() {
  //   const { length, rollerRadius, yPosition } = this.config
  //   return {
  //     minX: -length/2 + rollerRadius + 0.2,
  //     maxX: length/2 - rollerRadius - 0.2,
  //     y: yPosition + 0.5 // ارتفاع قرارگیری بطری
  //   }
  // }

  // // متد به‌روزرسانی (اختیاری - اگر منطق خاصی برای خود کانوایر باشد)
  // update(deltaTime) {
  //   // می‌تواند شامل لرزش، صدا یا افکت‌های دیگر باشد
  //   // فعلاً خالی است چون منطق انیمیشن در صحنه اصلی مدیریت می‌شود
  // }
}