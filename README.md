# ระบบจัดการ Menu และ Type (React + Prisma + Express)

โครงการนี้สร้างตามโครงสร้าง API สำหรับ `/api/menu` และ `/api/type`:

- **Frontend**: React (Vite, TypeScript, Tailwind CSS)
- **Backend**: Express.js + Prisma ORM
- **Database**: MySQL ( Docker Container หรือ Local MySQL Server / SQLite )

---

## 📁 โครงสร้างโปรเจกต์ (Directory Structure)

```
WebApp-Full/
├── .gitignore                   # ไฟล์กำหนดไฟล์ที่ไม่ต้องการดันขึ้น Git
├── .env.example                 # ตัวอย่างไฟล์ Environment Variables (ระดับ Root)
├── README.md
├── backend/
│   ├── .env.example             # ตัวอย่างไฟล์ Environment Variables (สำหรับ Backend)
│   ├── .env                     # ไฟล์ Environment Variables จริง (ถูก ignore ไม่ดันขึ้น Git)
│   ├── docker-compose.yml       # คอนฟิก MySQL 8.0 (สำหรับผู้ใช้ Docker)
│   ├── prisma/
│   │   ├── schema.prisma        # โมเดล Prisma ( default: MySQL )
│   │   ├── schema.sqlite.prisma # โมเดล Prisma สำรองสำหรับ SQLite
│   │   └── seed.ts              # ข้อมูลตัวอย่างเริ่มต้น
│   ├── src/
│   │   ├── index.ts             # Server entrypoint (Port 5000)
│   │   ├── routes/
│   │   │   ├── type.ts          # /api/type endpoints
│   │   │   └── menu.ts          # /api/menu endpoints
│   │   └── prisma.ts
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.tsx              # หน้าจอ UI จัดการ Menu & Type
    │   └── types.ts
    ├── vite.config.ts           # Proxy /api ไปที่ http://localhost:5000
    └── package.json
```

---

## 🚀 ขั้นตอนการติดตั้งและการใช้งาน (Setup & Run Guide)

### 1. กำหนด Environment Variables (`.env`)
ก๊อปปี้ไฟล์ `.env.example` เป็น `.env` ในโฟลเดอร์ `backend/`:

**บน Windows (CMD / PowerShell):**
```cmd
copy backend\.env.example backend\.env
```
**บน Linux / macOS / Bash:**
```bash
cp backend/.env.example backend/.env
```

---

### 2. ตั้งค่า Database Connection (เลือก 1 รูปแบบตามสภาพแวดล้อมของคุณ)

#### 🔹 รูปแบบที่ A: ใช้ Docker Container (แนะนำสำหรับผู้ใช้ Docker)
1. สตาร์ท MySQL ผ่าน Docker Compose (รันบน Port 3307 เพื่อไม่ให้ชนกับ MySQL ในเครื่อง):
   ```bash
   cd backend
   docker compose up -d
   ```
2. ใน `backend/.env` ตั้งค่าเป็น:
   ```env
   DATABASE_URL="mysql://root:rootpassword@localhost:3307/restaurant_db"
   PORT=5000
   ```

#### 🔹 รูปแบบที่ B: ใช้ Local MySQL ในเครื่อง (กรณีไม่ใช้ Docker เช่น XAMPP, Laragon, MySQL Service)
1. เปิดใช้งาน MySQL Service หรือ XAMPP Control Panel ในเครื่องของคุณ (Port 3306)
2. สร้าง Database ชื่อ `restaurant_db` (หรือให้ Prisma สร้างอัตโนมัติ)
3. ใน `backend/.env` เปลี่ยน `DATABASE_URL` ให้ตรงกับ Username/Password ของ MySQL ในเครื่อง:
   ```env
   DATABASE_URL="mysql://root:your_password@localhost:3306/restaurant_db"
   PORT=5000
   ```

#### 🔹 รูปแบบที่ C: ใช้ SQLite (กรณีไม่ได้ติดตั้งทั้ง Docker และ MySQL)
1. คัดลอกไฟล์ schema ของ SQLite มาทับ `schema.prisma`:
   - Windows: `copy backend\prisma\schema.sqlite.prisma backend\prisma\schema.prisma`
   - Linux/Mac: `cp backend/prisma/schema.sqlite.prisma backend/prisma/schema.prisma`
2. ใน `backend/.env` ตั้งค่าเป็น:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=5000
   ```

---

### 3. สตาร์ท Backend API (Express + Prisma)
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
*Backend API จะรันอยู่ที่: `http://localhost:5000`*

---

### 4. สตาร์ท Frontend UI (React)
```bash
cd frontend
npm install
npm run dev
```
*Frontend React จะรันอยู่ที่: `http://localhost:3000`*

---

## 📡 API Endpoints Summary

### 1. `/api/type` (ชนิดอาหาร)
- `GET /api/type` - ดึงรายการชนิดอาหารทั้งหมด
- `POST /api/type` - เพิ่มชนิดอาหารใหม่ (`{ name: string }`)
- `PUT /api/type/:id` - แก้ไขชื่อชนิดอาหาร
- `DELETE /api/type/:id` - ลบชนิดอาหาร (และเมนูที่เกี่ยวข้อง)

### 2. `/api/menu` (เมนูอาหาร)
- `GET /api/menu` - ดึงรายการเมนูทั้งหมด (พร้อมข้อมูล relation `type`)
- `POST /api/menu` - เพิ่มเมนูใหม่ (`{ name, price, isBestSeller, typeId }`)
- `PUT /api/menu/:id` - แก้ไขข้อมูลเมนู
- `DELETE /api/menu/:id` - ลบเมนูอาหาร
