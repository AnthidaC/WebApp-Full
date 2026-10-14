# Restaurant Menu Web Application (Full Stack Project)

ระบบเว็บแอปพลิเคชันจัดการเมนูอาหาร เชื่อมต่อฐานข้อมูลผ่าน Backend และ Prisma ORM

---

## 🚀 รันด้วย Docker (One-Command Run)

สามารถรันทุก Service พร้อมกันทั้ง **Frontend**, **Backend**, **Database (MySQL)** และ **Environment Variables** ได้ด้วยคำสั่งเดียว:

```bash
docker compose up --build
```

### พอร์ตและจุดเชื่อมต่อของระบบ (Access Points):
* **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
* **Backend REST API**: [http://localhost:5000](http://localhost:5000)
* **MySQL Database**: `localhost:3307` (Database: `restaurant_db`, User: `root`, Password: `rootpassword`)

> เมื่อรันคำสั่ง Docker Compose ระบบจะเริ่มต้น MySQL ฐานข้อมูล, รัน Prisma Push สร้างตาราง `menu` และ `type`, ทำการ Seed ข้อมูลเมนูเริ่มต้นให้อัตโนมัติ และเปิด Nginx Serve Frontend ทันที

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
WebApp-Full/
├── docker-compose.yml          # คอนฟิกรัน 3 Services พร้อมกัน (Front + Back + DB)
├── .env.example                # ตัวอย่าง Environment variables
├── README.md
├── backend/
│   ├── Dockerfile              # Dockerfile สำหรับ Backend (Node.js + Express + Prisma)
│   ├── .dockerignore
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma Schema (menu & type)
│   │   └── seed.ts             # สคริปต์เพิ่มข้อมูลตัวอย่าง
│   ├── src/
│   │   ├── index.ts            # Express Server
│   │   └── routes/
│   │       ├── auth.ts         # Register & Login API
│   │       ├── menu.ts         # Menu CRUD API
│   │       └── type.ts         # Type CRUD API
│   └── package.json
└── frontend/
    ├── Dockerfile              # Dockerfile แบบ Multi-stage (Node Build -> Nginx)
    ├── .dockerignore
    ├── nginx.conf              # คอนฟิก Nginx Reverse Proxy /api ไปยัง Backend
    ├── src/
    │   ├── App.tsx             # หน้าจอหลัก (Portal, Todo Full Stack 2, Todo Authen)
    │   └── types.ts
    └── package.json
```

---

## 🎯 โหมดการทำงานของระบบ

เมื่อเปิดหน้าเว็บ [http://localhost:3000](http://localhost:3000) จะมี **หน้าแรกหลัก (Portal)** ให้เลือก 2 รูปแบบงาน:

1. **`todo full stack 2`**:
   * โหมดดั้งเดิมตามใบงาน: **ไม่มี Role และไม่ต้องล็อกอิน**
   * มีปุ่ม **`[แก้ไข]`** วางข้างปุ่ม **`[Del]`** ในทุกรายการ
   * เมื่อกดแก้ไข ข้อมูลจะเด้งไปที่กล่องกรอกแรก (`name :`) ทันที พร้อม Focus และกระพริบไฮไลต์เพื่อแก้ไขในหน้าเดียวกัน

2. **`todo authen`**:
   * ระบบยืนยันตัวตน: **Register ➔ Login ➔ Home**
   * รองรับครบ 3 Roles:
     * **Guest mode**: ดูเมนูและคะแนนดาวได้อย่างเดียว
     * **User mode**: มี Dropdown ให้สมาชิกเลือกคะแนนดาว 1-5 ดาวแบบ Real-time
     * **Admin mode**: จัดการเพิ่ม/ลบ/แก้ไขเมนู และสลับไปหน้า User เพื่อเปลี่ยนสิทธิ์ผู้ใช้ได้

---

## 💻 วิธีการรันแบบ Manual (ไม่ใช้ Docker)

### 1. รัน Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### 2. รัน Frontend
```bash
cd frontend
npm install
npm run dev
```
