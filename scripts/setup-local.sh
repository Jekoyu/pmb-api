#!/bin/bash

# ============================================
# PMB Service - Local SQLite Setup Script
# ============================================
# This script sets up SQLite for local development
# Run this after cloning the repository

set -e

echo "🚀 PMB Service - Local Development Setup"
echo "========================================="

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file for local development..."
  cat > .env << EOF
# Local Development Environment
PORT=3001
NODE_ENV=development

# SQLite for local development
DATABASE_URL="file:./dev.db"
EOF
  echo "✅ .env file created"
else
  echo "⚠️  .env file already exists, skipping..."
fi

# Check if local schema exists
if [ ! -f prisma/schema.local.prisma ]; then
  echo "📝 Creating local SQLite schema..."
  cat > prisma/schema.local.prisma << 'EOF'
// Local Development Schema (SQLite)
// Use this for local development

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// =====================
// API Keys Table
// =====================
model ApiKey {
  id        String   @id @default(uuid())
  name      String
  apiKey    String   @unique @map("api_key")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("api_keys")
}

// =====================
// Students Table
// =====================
model Student {
  id              String   @id @default(uuid())
  noReg           String   @unique @map("no_reg")
  namaLengkap     String   @map("nama_lengkap")
  jalur           String
  jurusan         String
  email           String
  phone           String
  tahunLulus      Int      @map("tahun_lulus")
  gender          String
  asalSekolah     String   @map("asal_sekolah")
  jurusanSekolah  String   @map("jurusan_sekolah")
  ranking         Int
  namaOrangTua    String   @map("nama_orang_tua")
  hpOrangTua      String   @map("hp_orang_tua")
  agama           String
  butaWarna       Boolean  @default(false) @map("buta_warna")
  provinsi        String
  kotaKabupaten   String   @map("kota_kabupaten")
  kelurahan       String
  kecamatan       String
  kodePos         String   @map("kode_pos")
  alamatRumah     String   @map("alamat_rumah")
  pilihanJurusan2 String?  @map("pilihan_jurusan_2")
  pilihanJurusan3 String?  @map("pilihan_jurusan_3")
  pilihanJurusan4 String?  @map("pilihan_jurusan_4")
  agent           String?
  loaPublished    Boolean  @default(false) @map("loa_published")
  tanggalLoa      DateTime? @map("tanggal_loa")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("students")
}

// =====================
// Study Programs Table
// =====================
model StudyProgram {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  nimFormat String   @map("nim_format")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("study_programs")
}
EOF
  echo "✅ Local schema created"
else
  echo "⚠️  Local schema already exists, skipping..."
fi

# Generate Prisma client with local schema
echo "🔧 Generating Prisma client for SQLite..."
npx prisma generate --schema=prisma/schema.local.prisma

# Push schema to database (creates tables)
echo "📦 Creating SQLite database..."
npx prisma db push --schema=prisma/schema.local.prisma

# Seed database
echo "🌱 Seeding database..."
DATABASE_URL="file:./dev.db" bun prisma/seed.js

echo ""
echo "========================================="
echo "✅ Local development setup complete!"
echo ""
echo "To start the server:"
echo "  bun run dev"
echo ""
echo "Database file: prisma/dev.db"
echo "========================================="
