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

  // Create sample applicants (upsert to avoid duplicates)
  const applicants = [
    {
      registrationNumber: 'REG-2025-001',
      fullName: 'Ahmad Fauzi',
      admissionPath: 'Reguler',
      majorChoice1: 'Teknik Informatika',
      email: 'ahmad.fauzi@example.com',
      phone: '081234567890',
      graduationYear: 2025,
      gender: 'L',
      schoolOrigin: 'SMAN 1 Jakarta',
      schoolMajor: 'IPA',
      ranking: 5,
      parentName: 'Budi Santoso',
      parentPhone: '081234567891',
      religion: 'Islam',
      colorBlind: false,
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      village: 'Kebayoran Baru',
      district: 'Kebayoran Baru',
      postalCode: '12160',
      homeAddress: 'Jl. Senopati No. 123',
      majorChoice2: 'Sistem Informasi',
      majorChoice3: null,
      majorChoice4: null,
      agent: null,
      loaPublished: false,
      loaDate: null,
      nim: null,
      convertedAt: null,
    },
    {
      registrationNumber: 'REG-2025-002',
      fullName: 'Siti Rahma',
      admissionPath: 'Beasiswa',
      majorChoice1: 'Sistem Informasi',
      email: 'siti.rahma@example.com',
      phone: '081234567892',
      graduationYear: 2025,
      gender: 'P',
      schoolOrigin: 'SMAN 3 Bandung',
      schoolMajor: 'IPA',
      ranking: 1,
      parentName: 'Iwan Setiawan',
      parentPhone: '081234567893',
      religion: 'Islam',
      colorBlind: false,
      province: 'Jawa Barat',
      city: 'Bandung',
      village: 'Dago',
      district: 'Coblong',
      postalCode: '40135',
      homeAddress: 'Jl. Dago No. 45',
      majorChoice2: 'Teknik Informatika',
      majorChoice3: 'Manajemen Informatika',
      majorChoice4: null,
      agent: 'Agent Jakarta',
      loaPublished: true,
      loaDate: new Date('2025-01-15'),
      nim: '20251234567',
      convertedAt: new Date('2025-02-01'),
    },
  ];

  for (const applicant of applicants) {
    const existing = await prisma.applicant.findUnique({
      where: { registrationNumber: applicant.registrationNumber }
    });

    if (!existing) {
      await prisma.applicant.create({ 
        data: { id: uuidv4(), ...applicant } 
      });
      console.log(`✅ Created applicant: ${applicant.fullName}`);
    } else {
      console.log(`⏭️  Applicant ${applicant.fullName} already exists, skipping...`);
    }
  }

  // Create sample study programs (upsert to avoid duplicates)
  const studyPrograms = [
    {
      idProdi: '10',
      namaProdi: 'Akuntansi',
      idJenjang: '5',
      namaJenjang: 'S1',
      idFakultas: '1',
      namaFakultas: 'Fakultas Digital, Desain dan Bisnis',
      isActive: true,
    },
    {
      idProdi: '11',
      namaProdi: 'Manajemen',
      idJenjang: '5',
      namaJenjang: 'S1',
      idFakultas: '1',
      namaFakultas: 'Fakultas Digital, Desain dan Bisnis',
      isActive: true,
    },
    {
      idProdi: '12',
      namaProdi: 'Arsitektur',
      idJenjang: '5',
      namaJenjang: 'S1',
      idFakultas: '2',
      namaFakultas: 'Fakultas Teknik dan Informatika',
      isActive: true,
    },
    {
      idProdi: '13',
      namaProdi: 'Teknik Informatika',
      idJenjang: '5',
      namaJenjang: 'S1',
      idFakultas: '2',
      namaFakultas: 'Fakultas Teknik dan Informatika',
      isActive: true,
    },
  ];

  for (const prodi of studyPrograms) {
    const existing = await prisma.studyProgram.findUnique({
      where: { idProdi: prodi.idProdi }
    });

    if (!existing) {
      await prisma.studyProgram.create({ 
        data: { id: uuidv4(), ...prodi } 
      });
      console.log(`✅ Created study program: ${prodi.namaProdi}`);
    } else {
      console.log(`⏭️  Study program ${prodi.namaProdi} already exists, skipping...`);
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
