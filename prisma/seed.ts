import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Create default users
  const users = [
    {
      id: 'admin-user-id',
      username: 'admin',
      email: 'admin@dockingmonitor.com',
      password: adminPassword,
      role: 'ADMIN',
      fullName: 'System Administrator',
      isActive: true
    },
    {
      id: 'manager-user-id',
      username: 'manager',
      email: 'manager@dockingmonitor.com',
      password: managerPassword,
      role: 'MANAGER',
      fullName: 'Project Manager',
      isActive: true
    },
    {
      id: 'user-user-id',
      username: 'user',
      email: 'user@dockingmonitor.com',
      password: userPassword,
      role: 'USER',
      fullName: 'Regular User',
      isActive: true
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        email: user.email,
        password: user.password,
        role: user.role,
        fullName: user.fullName,
        isActive: user.isActive
      },
      create: user
    });
  }

  console.log('✅ Created default users (admin, manager, user)');

  // Create sample work items
  const sampleWorkItems = [
    {
      id: 'PELAYANAN-001',
      number: 1,
      category: 'PELAYANAN UMUM',
      title: 'Persiapan Area Docking',
      description: 'Menyiapkan area docking untuk kedatangan kapal',
      volume: 1,
      unit: 'Area',
      status: 'IN_PROGRESS',
      completion: 75,
      package: 'Package A',
      durationDays: 3,
      startDate: '2024-01-01',
      finishDate: '2024-01-03',
      resourceNames: 'Tim Persiapan',
      isMilestone: false
    },
    {
      id: 'SURVEY-001',
      number: 2,
      category: 'SURVEY & ESTIMASI',
      title: 'Survey Kondisi Kapal',
      description: 'Melakukan survey menyeluruh terhadap kondisi kapal',
      volume: 1,
      unit: 'Survey',
      status: 'PLANNED',
      completion: 0,
      package: 'Package A',
      durationDays: 5,
      startDate: '2024-01-04',
      finishDate: '2024-01-08',
      resourceNames: 'Tim Survey',
      isMilestone: true
    },
    {
      id: 'SURVEY-001-1',
      number: 3,
      category: 'SURVEY & ESTIMASI',
      title: 'Inspeksi Hull',
      description: 'Pemeriksaan detail kondisi lambung kapal',
      volume: 1,
      unit: 'Inspeksi',
      status: 'PLANNED',
      completion: 0,
      parentId: 'SURVEY-001',
      package: 'Package A',
      durationDays: 2,
      startDate: '2024-01-04',
      finishDate: '2024-01-05',
      resourceNames: 'Inspector Hull'
    },
    {
      id: 'SURVEY-001-2',
      number: 4,
      category: 'SURVEY & ESTIMASI',
      title: 'Inspeksi Mesin',
      description: 'Pemeriksaan sistem mesin dan peralatan',
      volume: 1,
      unit: 'Inspeksi',
      status: 'PLANNED',
      completion: 0,
      parentId: 'SURVEY-001',
      package: 'Package A',
      durationDays: 2,
      startDate: '2024-01-06',
      finishDate: '2024-01-07',
      resourceNames: 'Inspector Mesin'
    },
    {
      id: 'PROJECT-001',
      number: 5,
      category: 'PROJECT MANAGEMENT',
      title: 'Koordinasi Proyek Docking',
      description: 'Manajemen dan koordinasi keseluruhan proyek',
      volume: 1,
      unit: 'Proyek',
      status: 'IN_PROGRESS',
      completion: 50,
      package: 'Package A',
      durationDays: 30,
      startDate: '2024-01-01',
      finishDate: '2024-01-30',
      resourceNames: 'Project Manager',
      isMilestone: false
    }
  ];

  for (const workItem of sampleWorkItems) {
    await prisma.workItem.upsert({
      where: { id: workItem.id },
      update: workItem,
      create: workItem
    });
  }

  console.log('✅ Created sample work items');

  // Create sample tasks
  const sampleTasks = [
    {
      name: 'Setup Area Kerja',
      description: 'Menyiapkan tools dan area kerja untuk proses docking',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-02'),
      status: 'COMPLETED',
      priority: 'HIGH',
      assignedTo: 'Tim Persiapan',
      estimatedHours: 16,
      actualHours: 14,
      completion: 100,
      workItemId: 'PELAYANAN-001',
      resourceNames: 'Tim Persiapan, Equipment'
    },
    {
      name: 'Dokumentasi Survey',
      description: 'Membuat dokumentasi hasil survey dan estimasi',
      startDate: new Date('2024-01-08'),
      endDate: new Date('2024-01-09'),
      status: 'PLANNED',
      priority: 'MEDIUM',
      assignedTo: 'Documentation Team',
      estimatedHours: 8,
      completion: 0,
      workItemId: 'SURVEY-001',
      resourceNames: 'Documentation Team'
    },
    {
      name: 'Review Progress Mingguan',
      description: 'Meeting review progress dan koordinasi tim',
      startDate: new Date('2024-01-07'),
      endDate: new Date('2024-01-07'),
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedTo: 'Project Manager',
      estimatedHours: 4,
      actualHours: 2,
      completion: 75,
      workItemId: 'PROJECT-001',
      resourceNames: 'All Teams'
    }
  ];

  for (const task of sampleTasks) {
    await prisma.task.create({
      data: task
    });
  }

  console.log('✅ Created sample tasks');
  console.log('🎉 Database seed completed successfully!');
  
  console.log('\n📋 Default Users Created:');
  console.log('👤 Username: admin    | Password: admin123    | Role: ADMIN');
  console.log('👤 Username: manager  | Password: manager123  | Role: MANAGER');
  console.log('👤 Username: user     | Password: user123     | Role: USER');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });