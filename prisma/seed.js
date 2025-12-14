import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create initial API Key
  const apiKey = await prisma.apiKey.create({
    data: {
      id: uuidv4(),
      name: 'Default Admin Key',
      apiKey: `pmb_${uuidv4().replace(/-/g, '')}`,
      isActive: true,
    },
  });

  console.log('✅ Created API Key:', apiKey.apiKey);

  // Create sample students
  const students = [
    {
      id: uuidv4(),
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
      id: uuidv4(),
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
    await prisma.student.create({ data: student });
    console.log(`✅ Created student: ${student.namaLengkap}`);
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
