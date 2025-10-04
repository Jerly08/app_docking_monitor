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

  // Create Work Item Templates
  console.log('🎯 Creating work item templates...');
  
  // Package A: PELAYANAN UMUM Templates
  const packageATemplates = [
    // Package Level
    {
      id: 'TPL-A',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      level: 'PACKAGE',
      title: 'PELAYANAN UMUM',
      displayOrder: 1,
      isActive: true
    },
    
    // Item 1: Setibanya di muara
    {
      id: 'TPL-A-1',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '1',
      itemTitle: 'Setibanya di muara, kapal dipandu masuk perairan dock dibantu 1 (satu) tugboat, selesainya dipandu kembali keluar dari perairan dock',
      parentTemplateId: 'TPL-A',
      level: 'ITEM',
      title: 'Setibanya di muara, kapal dipandu masuk perairan dock dibantu 1 (satu) tugboat, selesainya dipandu kembali keluar dari perairan dock',
      volume: 1,
      unit: 'ls',
      hasRealization: true,
      displayOrder: 1,
      isActive: true
    },
    {
      id: 'TPL-A-1-R',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '1',
      parentTemplateId: 'TPL-A-1',
      level: 'REALIZATION',
      title: 'Realisasi',
      description: 'Diberikan fasilitas kapal pandu setibanya dimuara untuk masuk area Galangan Surya, Selesai docking dipandu kembali keluar dari area Galangan Surya. Ket : Masuk area dock pada 23 Agustus 2025 menggunakan 1 kapal pandu',
      volume: 1,
      unit: 'set',
      displayOrder: 1,
      isActive: true
    },
    
    // Item 2: Assistensi naik/turun dock
    {
      id: 'TPL-A-2',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '2',
      itemTitle: 'Assistensi naik/turun dock dan penataan ganjel',
      parentTemplateId: 'TPL-A',
      level: 'ITEM',
      title: 'Assistensi naik/turun dock dan penataan ganjel',
      volume: 1,
      unit: 'ls',
      hasRealization: true,
      displayOrder: 2,
      isActive: true
    },
    {
      id: 'TPL-A-2-R',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '2',
      parentTemplateId: 'TPL-A-2',
      level: 'REALIZATION',
      title: 'Realisasi',
      description: 'Diberikan fasilitas assistensi naik / turun dock dan penataan ganjel',
      volume: 1,
      unit: 'ls',
      displayOrder: 1,
      isActive: true
    },
    
    // Item 3: Docking undocking
    {
      id: 'TPL-A-3',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '3',
      itemTitle: 'Docking undocking',
      parentTemplateId: 'TPL-A',
      level: 'ITEM',
      title: 'Docking undocking',
      volume: 1,
      unit: 'ls',
      hasRealization: true,
      displayOrder: 3,
      isActive: true
    },
    {
      id: 'TPL-A-3-R',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '3',
      parentTemplateId: 'TPL-A-3',
      level: 'REALIZATION',
      title: 'Realisasi',
      description: 'Diberikan fasilitas Docking dan Undocking',
      volume: 1,
      unit: 'ls',
      displayOrder: 1,
      isActive: true
    },
    
    // Item 4: Dry docking
    {
      id: 'TPL-A-4',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '4',
      itemTitle: 'Dry docking',
      parentTemplateId: 'TPL-A',
      level: 'ITEM',
      title: 'Dry docking',
      volume: 14,
      unit: 'hr',
      hasRealization: true,
      displayOrder: 4,
      isActive: true
    },
    {
      id: 'TPL-A-4-R',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '4',
      parentTemplateId: 'TPL-A-4',
      level: 'REALIZATION',
      title: 'Realisasi',
      description: 'Diberikan fasilitas Dry Docking ( Kapal diatas dock ) sebagai berikut : - Kapal naik dock tanggal 23 Agustus 2025 - Kapal turun dock tanggal 07 September 2025',
      volume: 16,
      unit: 'hr',
      displayOrder: 1,
      isActive: true
    },
    
    // Item 5: Dibuatkan docking report
    {
      id: 'TPL-A-5',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '5',
      itemTitle: 'Dibuatkan docking report',
      parentTemplateId: 'TPL-A',
      level: 'ITEM',
      title: 'Dibuatkan docking report',
      volume: 1,
      unit: 'ls',
      hasRealization: true,
      displayOrder: 5,
      isActive: true
    },
    {
      id: 'TPL-A-5-R',
      packageLetter: 'A',
      packageName: 'PELAYANAN UMUM',
      itemNumber: '5',
      parentTemplateId: 'TPL-A-5',
      level: 'REALIZATION',
      title: 'Realisasi',
      description: 'Dibuatkan Docking Report sebanyak 6 set',
      volume: 1,
      unit: 'ls',
      displayOrder: 1,
      isActive: true
    }
  ];
  
  for (const template of packageATemplates) {
    await prisma.workItemTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template
    });
  }
  
  console.log('✅ Created Package A templates (PELAYANAN UMUM)');
  
  // Package B: UNIT PERAWATAN LAMBUNG & TANGKI Templates
  const packageBTemplates = [
    // Package Level
    {
      id: 'TPL-B',
      packageLetter: 'B',
      packageName: 'UNIT PERAWATAN LAMBUNG & TANGKI',
      level: 'PACKAGE',
      title: 'UNIT PERAWATAN LAMBUNG & TANGKI',
      displayOrder: 1,
      isActive: true
    },
    
    // Item 1: Badan Kapal Bawah Garis Air (BGA)
    {
      id: 'TPL-B-1',
      packageLetter: 'B',
      packageName: 'UNIT PERAWATAN LAMBUNG & TANGKI',
      itemNumber: '1',
      itemTitle: 'Badan Kapal Bawah Garis Air (BGA)',
      parentTemplateId: 'TPL-B',
      level: 'ITEM',
      title: 'Badan Kapal Bawah Garis Air (BGA)',
      hasRealization: true,
      displayOrder: 1,
      isActive: true
    },
    
    // Sub Items for BGA
    {
      id: 'TPL-B-1-a',
      packageLetter: 'B',
      packageName: 'UNIT PERAWATAN LAMBUNG & TANGKI',
      itemNumber: '1',
      parentTemplateId: 'TPL-B-1',
      level: 'SUB_ITEM',
      subLetter: 'a',
      title: 'Skrap (70%)',
      volume: 525,
      unit: 'm²',
      displayOrder: 1,
      isActive: true
    },
    {
      id: 'TPL-B-1-b',
      packageLetter: 'B',
      packageName: 'UNIT PERAWATAN LAMBUNG & TANGKI',
      itemNumber: '1',
      parentTemplateId: 'TPL-B-1',
      level: 'SUB_ITEM',
      subLetter: 'b',
      title: 'Water jet air tawar',
      volume: 750,
      unit: 'm²',
      displayOrder: 2,
      isActive: true
    },
    {
      id: 'TPL-B-1-c',
      packageLetter: 'B',
      packageName: 'UNIT PERAWATAN LAMBUNG & TANGKI',
      itemNumber: '1',
      parentTemplateId: 'TPL-B-1',
      level: 'SUB_ITEM',
      subLetter: 'c',
      title: 'Fullblasting (100%)',
      volume: 750,
      unit: 'm²',
      displayOrder: 3,
      isActive: true
    },
    {
      id: 'TPL-B-1-d',
      packageLetter: 'B',
      packageName: 'UNIT PERAWATAN LAMBUNG & TANGKI',
      itemNumber: '1',
      parentTemplateId: 'TPL-B-1',
      level: 'SUB_ITEM',
      subLetter: 'd',
      title: 'Cuci air tawar cuci air tawar setelah full blassting',
      volume: 750,
      unit: 'm²',
      displayOrder: 4,
      isActive: true
    },
    {
      id: 'TPL-B-1-e',
      packageLetter: 'B',
      packageName: 'UNIT PERAWATAN LAMBUNG & TANGKI',
      itemNumber: '1',
      parentTemplateId: 'TPL-B-1',
      level: 'SUB_ITEM',
      subLetter: 'e',
      title: 'Pengecatan (1 x AC, 1 x Sealer, 1 x AF)',
      volume: 2250,
      unit: 'm²',
      displayOrder: 5,
      isActive: true
    },
    
    // Realization for BGA
    {
      id: 'TPL-B-1-R',
      packageLetter: 'B',
      packageName: 'UNIT PERAWATAN LAMBUNG & TANGKI',
      itemNumber: '1',
      parentTemplateId: 'TPL-B-1',
      level: 'REALIZATION',
      title: 'Realisasi',
      description: 'Perawatan lambung Bawah Garis Air ( keel s/d water line ) sebagai berikut : a. Skrap 640,1 m² SELESAI 100% b. Cuci air tawar menggunakan water jet bertekanan 846,98 m² SELESAI 100% c. Cuci air tawar 846,98 m² SELESAI 100% d. Full Blasting 846,98 m² SELESAI 100% e. Pengecatan 1 x primer 846,98 m² SELESAI 100% Pengecatan 1 x sealer 846,98 m² SELESAI 100% Pengecatan 1 x AF',
      displayOrder: 99,
      isActive: true
    }
  ];
  
  for (const template of packageBTemplates) {
    await prisma.workItemTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template
    });
  }
  
  console.log('✅ Created Package B templates (UNIT PERAWATAN LAMBUNG & TANGKI)');
  
  // Create sample projects
  console.log('🏗️ Creating sample projects...');
  
  const sampleProjects = [
    {
      id: 'PRJ-001',
      projectName: 'MT. FERIMAS SEJAHTERA / TAHUN 2025',
      vesselName: 'MT. FERIMAS SEJAHTERA',
      customerCompany: 'PT. Industri Transpalme',
      vesselSpecs: {
        loa: '64.82 meter',
        lpp: '58.00 meter',
        breadth: '11.00 meter',
        depth: '4.50 meter',
        dwt_gt: '5.5/3 meter',
        dok_type: 'Dianalisa',
        vessel_type: 'DSS Survey',
        status: 'SPECIAL SURVEY'
      },
      status: 'ACTIVE',
      startDate: new Date('2025-08-23'),
      endDate: new Date('2025-09-08'),
      notes: 'Project docking untuk kapal tanker dengan special survey requirements'
    },
    {
      id: 'PRJ-002',
      projectName: 'MV. OCEAN STAR / TAHUN 2025',
      vesselName: 'MV. OCEAN STAR',
      customerCompany: 'PT. Maritime Solutions',
      vesselSpecs: {
        loa: '72.50 meter',
        lpp: '65.00 meter', 
        breadth: '12.80 meter',
        depth: '5.20 meter',
        dwt_gt: '6.2/4 meter',
        dok_type: 'Routine',
        vessel_type: 'Cargo Ship',
        status: 'MAINTENANCE'
      },
      status: 'ACTIVE',
      startDate: new Date('2025-09-15'),
      endDate: new Date('2025-10-05'),
      notes: 'Routine maintenance docking for cargo vessel'
    }
  ];
  
  for (const project of sampleProjects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: project,
      create: project
    });
  }
  
  console.log('✅ Created sample projects');

  // Create sample work items from templates for projects
  console.log('📝 Creating sample work items from templates...');
  
  // Work items for Project 1 (MT. FERIMAS SEJAHTERA) - from Package A templates
  const project1WorkItems = [
    {
      id: 'WI-PRJ001-A1',
      title: 'Setibanya di muara, kapal dipandu masuk perairan dock dibantu 1 (satu) tugboat, selesainya dipandu kembali keluar dari perairan dock',
      description: 'Layanan pandu untuk masuk dan keluar area dock',
      volume: 1,
      unit: 'ls',
      status: 'COMPLETED',
      completion: 100,
      package: 'PELAYANAN UMUM',
      startDate: '2025-08-23',
      finishDate: '2025-08-23',
      resourceNames: 'Kapal Pandu',
      projectId: 'PRJ-001',
      templateId: 'TPL-A-1'
    },
    {
      id: 'WI-PRJ001-A1-R',
      title: 'Realisasi',
      description: 'Diberikan fasilitas kapal pandu setibanya dimuara untuk masuk area Galangan Surya, Selesai docking dipandu kembali keluar dari area Galangan Surya. Ket : Masuk area dock pada 23 Agustus 2025 menggunakan 1 kapal pandu',
      volume: 1,
      unit: 'set',
      completion: 100,
      package: 'PELAYANAN UMUM',
      parentId: 'WI-PRJ001-A1',
      resourceNames: 'Kapal Pandu',
      projectId: 'PRJ-001',
      templateId: 'TPL-A-1-R'
    },
    {
      id: 'WI-PRJ001-A4',
      title: 'Dry docking',
      description: 'Fasilitas dry docking untuk kapal',
      volume: 16,
      unit: 'hr',
      status: 'COMPLETED',
      completion: 100,
      package: 'PELAYANAN UMUM',
      startDate: '2025-08-23',
      finishDate: '2025-09-07',
      resourceNames: 'Dock Facility',
      projectId: 'PRJ-001',
      templateId: 'TPL-A-4'
    },
    {
      id: 'WI-PRJ001-A4-R',
      title: 'Realisasi',
      description: 'Diberikan fasilitas Dry Docking ( Kapal diatas dock ) sebagai berikut : - Kapal naik dock tanggal 23 Agustus 2025 - Kapal turun dock tanggal 07 September 2025',
      volume: 16,
      unit: 'hr',
      completion: 100,
      package: 'PELAYANAN UMUM',
      parentId: 'WI-PRJ001-A4',
      resourceNames: 'Dock Facility',
      projectId: 'PRJ-001',
      templateId: 'TPL-A-4-R'
    }
  ];
  
  // Work items for Project 2 (MV. OCEAN STAR) - basic items
  const project2WorkItems = [
    {
      id: 'WI-PRJ002-A1',
      title: 'Setibanya di muara, kapal dipandu masuk perairan dock dibantu 1 (satu) tugboat, selesainya dipandu kembali keluar dari perairan dock',
      description: 'Layanan pandu untuk masuk dan keluar area dock',
      volume: 1,
      unit: 'ls',
      status: 'PLANNED',
      completion: 0,
      package: 'PELAYANAN UMUM',
      startDate: '2025-09-15',
      finishDate: '2025-09-15',
      resourceNames: 'Kapal Pandu',
      projectId: 'PRJ-002',
      templateId: 'TPL-A-1'
    }
  ];
  
  const sampleWorkItems = [...project1WorkItems, ...project2WorkItems];

  for (const workItem of sampleWorkItems) {
    await prisma.workItem.upsert({
      where: { id: workItem.id },
      update: workItem,
      create: workItem
    });
  }

  console.log('✅ Created sample work items with project associations');
  
  // Migrate existing work items to default project (if any exist)
  console.log('🔄 Migrating existing work items to default project...');
  
  try {
    const existingWorkItems = await prisma.workItem.findMany({
      where: { projectId: null }
    });
    
    if (existingWorkItems.length > 0) {
      // Create a default project for existing items
      const defaultProject = await prisma.project.upsert({
        where: { id: 'PRJ-DEFAULT' },
        update: {},
        create: {
          id: 'PRJ-DEFAULT',
          projectName: 'Legacy Work Items / Migration',
          vesselName: 'LEGACY_DATA',
          customerCompany: 'Migration Data',
          status: 'ACTIVE',
          notes: 'Auto-created project for existing work items during migration'
        }
      });
      
      // Update existing work items to belong to default project
      await prisma.workItem.updateMany({
        where: { projectId: null },
        data: { projectId: 'PRJ-DEFAULT' }
      });
      
      console.log(`✅ Migrated ${existingWorkItems.length} existing work items to default project`);
    } else {
      console.log('✅ No existing work items to migrate');
    }
  } catch (error) {
    console.log('⚠️ Migration skipped - tables may not exist yet');
  }

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
  
  console.log('\n🏗️ Sample Projects Created:');
  console.log('🚢 PRJ-001: MT. FERIMAS SEJAHTERA / TAHUN 2025');
  console.log('🚢 PRJ-002: MV. OCEAN STAR / TAHUN 2025');
  
  console.log('\n🎯 Work Item Templates Created:');
  console.log('🏷️ Package A: PELAYANAN UMUM (5 main items + realizations)');
  console.log('🏷️ Package B: UNIT PERAWATAN LAMBUNG & TANGKI (1 main item + 5 sub-items + realization)');
  
  console.log('\n📝 Sample Work Items Created:');
  console.log('✨ Project-based work items with template associations');
  console.log('✨ Hierarchical parent-child relationships');
  console.log('✨ Ready for multi-project development!');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Run: npm run prisma:generate');
  console.log('2. Test API endpoints for projects and templates');
  console.log('3. Implement project selector in frontend');
  console.log('4. Test report generation with project data');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });