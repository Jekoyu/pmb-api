import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create initial API Key (upsert to avoid duplicates)
  const existingApiKey = await prisma.apiKey.findFirst({
    where: { name: 'Default Admin Key' }
  });

  if (!existingApiKey) {
    const apiKey = await prisma.apiKey.create({
      data: {
        id: uuidv4(),
        name: 'Default Admin Key',
        apiKey: `pmb_${uuidv4().replace(/-/g, '')}`,
        isActive: true,
      },
    });
    console.log('✅ Created API Key:', apiKey.apiKey);
  } else {
    console.log('⏭️  API Key already exists, skipping...');
  }

  // Create sample students (upsert to avoid duplicates)
  const students = [
    {
      noReg: 'REG-2025-001',
      namaLengkap: 'Ahmad Fauzi',
      jalur: 'Reguler',
      jurusan: 'Teknik Informatika',
      email: 'ahmad.fauzi@example.com',
      phone: '081234567890',
      tahunLulus: 2025,
      gender: 'Laki-laki',
      asalSekolah: 'SMAN 1 Jakarta',
      jurusanSekolah: 'IPA',
      ranking: 5,
      namaOrangTua: 'Budi Santoso',
      hpOrangTua: '081234567891',
      agama: 'Islam',
      butaWarna: false,
      provinsi: 'DKI Jakarta',
      kotaKabupaten: 'Jakarta Selatan',
      kelurahan: 'Kebayoran Baru',
      kecamatan: 'Kebayoran Baru',
      kodePos: '12160',
      alamatRumah: 'Jl. Senopati No. 123',
      pilihanJurusan2: 'Sistem Informasi',
      pilihanJurusan3: null,
      pilihanJurusan4: null,
      agent: null,
      loaPublished: false,
      tanggalLoa: null,
    },
    {
      noReg: 'REG-2025-002',
      namaLengkap: 'Siti Rahma',
      jalur: 'Beasiswa',
      jurusan: 'Sistem Informasi',
      email: 'siti.rahma@example.com',
      phone: '081234567892',
      tahunLulus: 2025,
      gender: 'Perempuan',
      asalSekolah: 'SMAN 3 Bandung',
      jurusanSekolah: 'IPA',
      ranking: 1,
      namaOrangTua: 'Iwan Setiawan',
      hpOrangTua: '081234567893',
      agama: 'Islam',
      butaWarna: false,
      provinsi: 'Jawa Barat',
      kotaKabupaten: 'Bandung',
      kelurahan: 'Dago',
      kecamatan: 'Coblong',
      kodePos: '40135',
      alamatRumah: 'Jl. Dago No. 45',
      pilihanJurusan2: 'Teknik Informatika',
      pilihanJurusan3: 'Manajemen Informatika',
      pilihanJurusan4: null,
      agent: 'Agent Jakarta',
      loaPublished: true,
      tanggalLoa: new Date('2025-01-15'),
    },
  ];

  for (const student of students) {
    const existing = await prisma.student.findUnique({
      where: { noReg: student.noReg }
    });

    if (!existing) {
      await prisma.student.create({ 
        data: { id: uuidv4(), ...student } 
      });
      console.log(`✅ Created student: ${student.namaLengkap}`);
    } else {
      console.log(`⏭️  Student ${student.namaLengkap} already exists, skipping...`);
    }
  }

  // Create sample study programs (upsert to avoid duplicates)
  const studyPrograms = [
    {
      code: '51',
      name: 'Teknik Informatika',
      nimFormat: '{year}{code}{sequence}',
      isActive: true,
    },
    {
      code: '52',
      name: 'Sistem Informasi',
      nimFormat: '{year}{code}{sequence}',
      isActive: true,
    },
    {
      code: '53',
      name: 'Manajemen Informatika',
      nimFormat: '{year}{code}{sequence}',
      isActive: true,
    },
    {
      code: '54',
      name: 'Akuntansi',
      nimFormat: '{year}{code}{sequence}',
      isActive: true,
    },
  ];

  for (const prodi of studyPrograms) {
    const existing = await prisma.studyProgram.findUnique({
      where: { code: prodi.code }
    });

    if (!existing) {
      await prisma.studyProgram.create({ 
        data: { id: uuidv4(), ...prodi } 
      });
      console.log(`✅ Created study program: ${prodi.name}`);
    } else {
      console.log(`⏭️  Study program ${prodi.name} already exists, skipping...`);
    }
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
