const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Read mock data
  const mockDataPath = path.join(__dirname, '../docs/mock-data.json');
  const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

  // 1. Create Admin User
  console.log('Seeding users...');
  for (const user of mockData.users) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: hashedPassword },
      create: {
        email: user.email,
        password: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN',
      },
    });
  }

  // 2. Seed Departments
  console.log('Seeding departments...');
  const departmentIdMap = new Map();
  for (const dept of mockData.departments) {
    const createdDept = await prisma.department.upsert({
      where: { name: dept.name },
      update: { nameHn: dept.name }, // Using the same name for Hindi for now as per mock data
      create: {
        name: dept.name,
        nameHn: dept.name,
      },
    });
    departmentIdMap.set(dept.id, createdDept.id);
  }

  // 3. Seed Categories
  console.log('Seeding categories...');
  const categoryIdMap = new Map();
  for (const cat of mockData.categories) {
    const createdCat = await prisma.category.upsert({
      where: { name: cat.name },
      update: { has_parts: cat.has_parts },
      create: {
        name: cat.name,
        has_parts: cat.has_parts,
      },
    });
    categoryIdMap.set(cat.id, createdCat.id);
  }

  // 4. Seed Category Parts
  console.log('Seeding category parts...');
  const partIdMap = new Map();
  for (const part of mockData.category_parts) {
    const categoryId = categoryIdMap.get(part.category_id);
    if (!categoryId) continue;

    const existingPart = await prisma.categoryPart.findFirst({
      where: {
        category_id: categoryId,
        part_name: part.part_name,
      },
    });

    if (existingPart) {
      const updatedPart = await prisma.categoryPart.update({
        where: { id: existingPart.id },
        data: {
          part_name: part.part_name,
          category_id: categoryId,
        },
      });
      partIdMap.set(part.id, updatedPart.id);
    } else {
      const createdPart = await prisma.categoryPart.create({
        data: {
          part_name: part.part_name,
          category_id: categoryId,
        },
      });
      partIdMap.set(part.id, createdPart.id);
    }
  }

  // 5. Seed Schemes
  console.log('Seeding schemes...');
  for (const scheme of mockData.schemes) {
    const departmentId = departmentIdMap.get(scheme.department_id);
    if (!departmentId) {
      console.warn(`Department ID ${scheme.department_id} not found for scheme ${scheme.scheme_code}`);
      continue;
    }

    await prisma.scheme.upsert({
      where: { scheme_code: scheme.scheme_code },
      update: {
        scheme_name: scheme.scheme_name,
        total_budget_provision: scheme.total_budget_provision,
        progressive_allotment: scheme.progressive_allotment,
        actual_progressive_expenditure: scheme.actual_progressive_expenditure,
        pct_budget_expenditure: scheme.pct_budget_expenditure,
        pct_actual_expenditure: scheme.pct_actual_expenditure,
        provisional_expenditure_current_month: scheme.provisional_expenditure_current_month,
        department_id: departmentId,
      },
      create: {
        scheme_code: scheme.scheme_code,
        scheme_name: scheme.scheme_name,
        total_budget_provision: scheme.total_budget_provision,
        progressive_allotment: scheme.progressive_allotment,
        actual_progressive_expenditure: scheme.actual_progressive_expenditure,
        pct_budget_expenditure: scheme.pct_budget_expenditure,
        pct_actual_expenditure: scheme.pct_actual_expenditure,
        provisional_expenditure_current_month: scheme.provisional_expenditure_current_month,
        department_id: departmentId,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
