# PMB Service - Student Management API

Sistem Manajemen Mahasiswa berbasis RESTful API yang dibangun dengan Bun, Express.js, SQLite, dan Prisma.

## 📋 Fitur

- **API Key Management**: Generate, list, enable/disable API keys
- **Student Management**: CRUD operations untuk data mahasiswa
- **Authentication**: Middleware validasi API Key
- **Pagination & Search**: Support pagination dan pencarian data
- **Clean Architecture**: Modular dengan struktur routes, controllers, services

## 🛠 Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: API Key berbasis header

## 📁 Struktur Project

```
pmb-service/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Database seeder
├── src/
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middlewares
│   ├── prisma/             # Prisma client
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── server.js           # Entry point
├── .env                    # Environment variables
├── package.json
└── README.md
```

## 🚀 Instalasi

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Database

```bash
# Generate Prisma Client
bun run db:generate

# Run migrations
bun run db:migrate

# (Optional) Seed database dengan data contoh
bun run db:seed
```

### 3. Jalankan Server

```bash
# Development mode (auto-reload)
bun run dev

# Production mode
bun run start
```

Server akan berjalan di `http://localhost:3000`

## 🔑 Cara Generate API Key

### Menggunakan cURL

```bash
curl -X POST http://localhost:3000/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "My App Key"}'
```

### Response

```json
{
  "success": true,
  "message": "API key created successfully.",
  "data": {
    "id": "uuid-here",
    "name": "My App Key",
    "apiKey": "pmb_xxxxxxxxxxxxxxxxxxxxx",
    "isActive": true,
    "createdAt": "2025-12-14T10:00:00.000Z"
  }
}
```

## 📡 API Endpoints

### Health Check

| Method | Endpoint         | Description |
| ------ | ---------------- | ----------- |
| GET    | `/api/v1/health` | Status API  |

### API Keys (Public)

| Method | Endpoint                       | Description           |
| ------ | ------------------------------ | --------------------- |
| POST   | `/api/v1/api-keys`             | Generate API key baru |
| GET    | `/api/v1/api-keys`             | List semua API keys   |
| GET    | `/api/v1/api-keys/:id`         | Detail API key        |
| PUT    | `/api/v1/api-keys/:id/disable` | Nonaktifkan API key   |
| PUT    | `/api/v1/api-keys/:id/enable`  | Aktifkan API key      |
| DELETE | `/api/v1/api-keys/:id`         | Hapus API key         |

### Students (Protected - Wajib API Key)

| Method | Endpoint               | Description                 |
| ------ | ---------------------- | --------------------------- |
| POST   | `/api/v1/students`     | Tambah mahasiswa            |
| GET    | `/api/v1/students`     | List mahasiswa (pagination) |
| GET    | `/api/v1/students/:id` | Detail mahasiswa            |
| PUT    | `/api/v1/students/:id` | Update mahasiswa            |
| DELETE | `/api/v1/students/:id` | Hapus mahasiswa             |

## 🔐 Mengakses Protected Endpoints

Semua endpoint `/students` memerlukan header `x-api-key`:

```bash
curl -X GET http://localhost:3000/api/v1/students \
  -H "x-api-key: pmb_xxxxxxxxxxxxxxxxxxxxx"
```

## 📝 Contoh Request & Response

### 1. Generate API Key

**Request:**

```bash
POST /api/v1/api-keys
Content-Type: application/json

{
  "name": "Production Key"
}
```

**Response:**

```json
{
  "success": true,
  "message": "API key created successfully.",
  "data": {
    "id": "abc123",
    "name": "Production Key",
    "apiKey": "pmb_a1b2c3d4e5f6g7h8i9j0",
    "isActive": true,
    "createdAt": "2025-12-14T10:00:00.000Z"
  }
}
```

### 2. Create Student

**Request:**

```bash
POST /api/v1/students
Content-Type: application/json
x-api-key: pmb_a1b2c3d4e5f6g7h8i9j0

{
  "noReg": "REG-2025-003",
  "namaLengkap": "Budi Santoso",
  "jalur": "Reguler",
  "jurusan": "Teknik Informatika",
  "email": "budi.santoso@example.com",
  "phone": "081234567890",
  "tahunLulus": 2025,
  "gender": "Laki-laki",
  "asalSekolah": "SMAN 1 Surabaya",
  "jurusanSekolah": "IPA",
  "ranking": 10,
  "namaOrangTua": "Agus Santoso",
  "hpOrangTua": "081234567891",
  "agama": "Islam",
  "butaWarna": false,
  "provinsi": "Jawa Timur",
  "kotaKabupaten": "Surabaya",
  "kelurahan": "Gubeng",
  "kecamatan": "Gubeng",
  "kodePos": "60281",
  "alamatRumah": "Jl. Gubeng No. 123",
  "pilihanJurusan2": "Sistem Informasi",
  "pilihanJurusan3": null,
  "pilihanJurusan4": null,
  "agent": null,
  "loaPublished": false,
  "tanggalLoa": null
}
```

**Response:**

```json
{
  "success": true,
  "message": "Student created successfully.",
  "data": {
    "id": "uuid-here",
    "noReg": "REG-2025-003",
    "namaLengkap": "Budi Santoso"
    // ... semua field lainnya
  }
}
```

### 3. List Students dengan Pagination & Search

**Request:**

```bash
GET /api/v1/students?page=1&limit=10&search=Budi
x-api-key: pmb_a1b2c3d4e5f6g7h8i9j0
```

**Response:**

```json
{
  "success": true,
  "message": "Students retrieved successfully.",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 4. Error Response (401 Unauthorized)

**Request tanpa API Key:**

```bash
GET /api/v1/students
```

**Response:**

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "API key is required. Please provide x-api-key header."
}
```

## 📊 Query Parameters untuk List Students

| Parameter | Type   | Default   | Description                               |
| --------- | ------ | --------- | ----------------------------------------- |
| page      | number | 1         | Halaman yang ingin ditampilkan            |
| limit     | number | 10        | Jumlah data per halaman                   |
| search    | string | -         | Cari berdasarkan nama, no_reg, atau email |
| sortBy    | string | createdAt | Field untuk sorting                       |
| sortOrder | string | desc      | Urutan: asc atau desc                     |

## 🧪 Testing dengan cURL

```bash
# 1. Generate API Key
curl -X POST http://localhost:3000/api/v1/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key"}'

# 2. List API Keys
curl http://localhost:3000/api/v1/api-keys

# 3. List Students (ganti API_KEY dengan key yang didapat)
curl http://localhost:3000/api/v1/students \
  -H "x-api-key: API_KEY"

# 4. Create Student
curl -X POST http://localhost:3000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "x-api-key: API_KEY" \
  -d '{
    "noReg": "REG-2025-004",
    "namaLengkap": "Test Student",
    "jalur": "Reguler",
    "jurusan": "Teknik Informatika",
    "email": "test@example.com",
    "phone": "081234567890",
    "tahunLulus": 2025,
    "gender": "Laki-laki",
    "asalSekolah": "SMAN 1 Test",
    "jurusanSekolah": "IPA",
    "ranking": 1,
    "namaOrangTua": "Parent Name",
    "hpOrangTua": "081234567891",
    "agama": "Islam",
    "provinsi": "DKI Jakarta",
    "kotaKabupaten": "Jakarta Selatan",
    "kelurahan": "Kebayoran",
    "kecamatan": "Kebayoran Baru",
    "kodePos": "12160",
    "alamatRumah": "Jl. Test No. 1"
  }'
```

## 🚀 Deployment Guide

### Server Requirements

- **Runtime**: Bun v1.0+ atau Node.js v18+
- **Database**: SQLite (untuk dev) / PostgreSQL/MySQL (untuk production)
- **Memory**: Minimum 512MB RAM
- **Disk**: Minimum 1GB untuk database

### Setup Commands (Server)

#### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/your-repo/pmb-service.git
cd pmb-service

# Install dependencies
bun install
```

#### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Contoh isi `.env`:

```env
PORT=3001
NODE_ENV=production
DB_PROVIDER=sqlite
DATABASE_URL="file:./pmb.db"
```

#### 3. Database Setup

```bash
# Generate Prisma Client
bun run db:generate

# Run migrations (production)
bun run db:migrate:deploy

# (Optional) Seed initial data
bun run db:seed
```

### Render.com Deployment

**Build Command:**

```bash
bun install && bun run db:generate && bun run db:migrate:deploy && bun run db:seed
```

**Start Command:**

```bash
bun run start
```

**Environment Variables (di Render Dashboard):**

```
PORT=3001
NODE_ENV=production
DB_PROVIDER=sqlite
DATABASE_URL=file:./pmb.db
```

#### 4. Running the Server

**Development Mode:**

```bash
bun run dev
```

**Production Mode (Direct):**

```bash
bun run start
```

**Production Mode (PM2):**

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start bun --name "pmb-service" -- run start

# View logs
pm2 logs pmb-service

# Restart service
pm2 restart pmb-service

# Stop service
pm2 stop pmb-service

# Enable auto-start on boot
pm2 startup
pm2 save
```

**Production Mode (Docker):**

```bash
# Build image
docker build -t pmb-service .

# Run container
docker run -d \
  --name pmb-service \
  -p 3001:3001 \
  -v $(pwd)/prisma/pmb.db:/app/prisma/pmb.db \
  -e NODE_ENV=production \
  pmb-service

# View logs
docker logs -f pmb-service
```

### Quick Reference Commands

| Action               | Command                                           |
| -------------------- | ------------------------------------------------- |
| Install dependencies | `bun install`                                     |
| Generate Prisma      | `bun run db:generate`                             |
| Run migrations       | `bunx prisma migrate deploy`                      |
| Seed database        | `bun run db:seed`                                 |
| Start dev            | `bun run dev`                                     |
| Start production     | `bun run start`                                   |
| View database        | `bun run db:studio`                               |
| PM2 start            | `pm2 start bun --name "pmb-service" -- run start` |
| PM2 logs             | `pm2 logs pmb-service`                            |
| PM2 restart          | `pm2 restart pmb-service`                         |

### Troubleshooting

**Database connection error:**

```bash
# Reset database
rm prisma/pmb.db
bun run db:generate
bunx prisma migrate deploy
```

**Permission denied:**

```bash
# Fix file permissions
chmod -R 755 ./
```

**Port already in use:**

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

## 📄 License

MIT License
