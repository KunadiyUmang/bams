import { PrismaClient, UserRole, TransactionType, PaymentMethod, TransactionStatus, Language } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.dailyReport.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.business.deleteMany({});

  // Hashes for passwords
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const ownerPasswordHash = await bcrypt.hash('Owner@123', 10);
  const empPasswordHash = await bcrypt.hash('Emp@123', 10);

  // 1. Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@bams.com',
      passwordHash: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      name: 'Super Admin',
      phone: '+91 9876543210',
      languagePref: Language.EN,
      isActive: true,
    },
  });
  console.log('Created Super Admin:', superAdmin.email);

  // 2. Create Business Owner User
  const owner = await prisma.user.create({
    data: {
      email: 'owner@bams.com',
      passwordHash: ownerPasswordHash,
      role: UserRole.BUSINESS_OWNER,
      name: 'Rajesh Patel',
      phone: '+91 9825012345',
      languagePref: Language.GU,
      isActive: true,
    },
  });
  console.log('Created Business Owner:', owner.email);

  // 3. Create sample Business
  const business = await prisma.business.create({
    data: {
      name: 'Patel Enterprises',
      nameGu: 'પટેલ એન્ટરપ્રાઇઝ',
      description: 'Trading and General Supplies',
      phone: '+91 9825012345',
      email: 'contact@patelenterprises.com',
      address: 'Shop 12, Sardar Complex, Ring Road, Surat, Gujarat',
      openingBalance: 150000.00,
      currency: 'INR',
      isActive: true,
      ownerId: owner.id,
    },
  });
  console.log('Created Business:', business.name);

  // Update Owner's businessId
  await prisma.user.update({
    where: { id: owner.id },
    data: { businessId: business.id },
  });

  // 4. Create 2 Employees
  const employee1 = await prisma.user.create({
    data: {
      email: 'employee1@bams.com',
      passwordHash: empPasswordHash,
      role: UserRole.EMPLOYEE,
      employeeId: 'EMP001',
      name: 'Amit Shah',
      phone: '+91 9825098765',
      languagePref: Language.GU,
      isActive: true,
      businessId: business.id,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'employee2@bams.com',
      passwordHash: empPasswordHash,
      role: UserRole.EMPLOYEE,
      employeeId: 'EMP002',
      name: 'Pooja Joshi',
      phone: '+91 9825054321',
      languagePref: Language.EN,
      isActive: true,
      businessId: business.id,
    },
  });
  console.log('Created Employees:', employee1.email, employee2.email);

  // 5. Create default categories (system-wide and business-specific)
  const categoryDefs = [
    // Income
    { nameEn: 'Sales', nameGu: 'વેચાણ', type: TransactionType.INCOME, isSystem: true },
    { nameEn: 'Service', nameGu: 'સેવા', type: TransactionType.INCOME, isSystem: true },
    { nameEn: 'Investment Returns', nameGu: 'રોકાણ વળતર', type: TransactionType.INCOME, isSystem: true },
    { nameEn: 'Other Income', nameGu: 'અન્ય આવક', type: TransactionType.INCOME, isSystem: true },
    // Expense
    { nameEn: 'Rent', nameGu: 'ભાડું', type: TransactionType.EXPENSE, isSystem: true },
    { nameEn: 'Utilities', nameGu: 'ઉપયોગિતા બિલ', type: TransactionType.EXPENSE, isSystem: true },
    { nameEn: 'Salaries', nameGu: 'પગાર', type: TransactionType.EXPENSE, isSystem: true },
    { nameEn: 'Office Supplies', nameGu: 'ઓફિસ સામગ્રી', type: TransactionType.EXPENSE, isSystem: true },
    { nameEn: 'Travel', nameGu: 'મુસાફરી', type: TransactionType.EXPENSE, isSystem: true },
    { nameEn: 'Marketing', nameGu: 'માર્કેટિંગ', type: TransactionType.EXPENSE, isSystem: true },
    { nameEn: 'Other Expense', nameGu: 'અન્ય ખર્ચ', type: TransactionType.EXPENSE, isSystem: true },
    // Investment
    { nameEn: 'Capital Investment', nameGu: 'મૂડી રોકાણ', type: TransactionType.INVESTMENT, isSystem: true },
    { nameEn: 'Equipment', nameGu: 'સાધનસામગ્રી', type: TransactionType.INVESTMENT, isSystem: true },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categoryDefs) {
    const created = await prisma.category.create({
      data: {
        ...cat,
        businessId: business.id,
      },
    });
    createdCategories[cat.nameEn] = created;
  }
  console.log(`Created ${Object.keys(createdCategories).length} Categories`);

  // 6. Create sample transactions for the last 30 days
  const now = new Date();
  const sampleTransactions = [
    {
      type: TransactionType.INCOME,
      amount: 45000.00,
      description: 'Bulk order payment - textile chemicals',
      descriptionGu: 'મોટો ઓર્ડર ચુકવણી - ટેક્સટાઇલ કેમિકલ્સ',
      categoryName: 'Sales',
      paymentMethod: PaymentMethod.BANK,
      status: TransactionStatus.APPROVED,
      daysAgo: 28,
      userId: owner.id,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 25000.00,
      description: 'Monthly office and warehouse rent',
      descriptionGu: 'માસિક ઓફિસ અને વેરહાઉસ ભાડું',
      categoryName: 'Rent',
      paymentMethod: PaymentMethod.BANK,
      status: TransactionStatus.APPROVED,
      daysAgo: 27,
      userId: owner.id,
    },
    {
      type: TransactionType.INCOME,
      amount: 18500.00,
      description: 'Consultation service fee',
      descriptionGu: 'કન્સલ્ટેશન સેવા ફી',
      categoryName: 'Service',
      paymentMethod: PaymentMethod.UPI,
      status: TransactionStatus.APPROVED,
      daysAgo: 25,
      userId: employee1.id,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 3200.00,
      description: 'Electricity bill for Surat office',
      descriptionGu: 'સુરત ઓફિસ માટે વીજળીનું બિલ',
      categoryName: 'Utilities',
      paymentMethod: PaymentMethod.ONLINE,
      status: TransactionStatus.APPROVED,
      daysAgo: 24,
      userId: employee2.id,
    },
    {
      type: TransactionType.INVESTMENT,
      amount: 50000.00,
      description: 'Purchased 2 heavy-duty packaging machines',
      descriptionGu: '૨ હેવી ડ્યુટી પેકેજિંગ મશીન ખરીદ્યા',
      categoryName: 'Equipment',
      paymentMethod: PaymentMethod.BANK,
      status: TransactionStatus.APPROVED,
      daysAgo: 20,
      userId: owner.id,
    },
    {
      type: TransactionType.INCOME,
      amount: 62000.00,
      description: 'Client payment invoice #PE-2024-001',
      descriptionGu: 'ગ્રાહક ચુકવણી ઇનવોઇસ #PE-2024-001',
      categoryName: 'Sales',
      paymentMethod: PaymentMethod.BANK,
      status: TransactionStatus.APPROVED,
      daysAgo: 18,
      userId: employee1.id,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 4500.00,
      description: 'Office printer ink, stationery and paper rims',
      descriptionGu: 'ઓફિસ પ્રિન્ટર ઇંક, સ્ટેશનરી અને કાગળ રિમ્સ',
      categoryName: 'Office Supplies',
      paymentMethod: PaymentMethod.CASH,
      status: TransactionStatus.APPROVED,
      daysAgo: 15,
      userId: employee2.id,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 35000.00,
      description: 'Staff salaries for previous month',
      descriptionGu: 'અગાઉના મહિના માટે સ્ટાફ પગાર',
      categoryName: 'Salaries',
      paymentMethod: PaymentMethod.BANK,
      status: TransactionStatus.APPROVED,
      daysAgo: 12,
      userId: owner.id,
    },
    {
      type: TransactionType.INCOME,
      amount: 29000.00,
      description: 'Retail products sales cash receipt',
      descriptionGu: 'છૂટક ઉત્પાદનો વેચાણ રોકડ રસીદ',
      categoryName: 'Sales',
      paymentMethod: PaymentMethod.CASH,
      status: TransactionStatus.APPROVED,
      daysAgo: 10,
      userId: employee1.id,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 6800.00,
      description: 'Travel expenses for Ahmedabad client visit',
      descriptionGu: 'અમદાવાદ ક્લાયન્ટ મુલાકાત માટે મુસાફરી ખર્ચ',
      categoryName: 'Travel',
      paymentMethod: PaymentMethod.ONLINE,
      status: TransactionStatus.APPROVED,
      daysAgo: 8,
      userId: employee1.id,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 12000.00,
      description: 'Digital marketing and local newspaper banner',
      descriptionGu: 'ડિજિટલ માર્કેટિંગ અને સ્થાનિક અખબાર બેનર',
      categoryName: 'Marketing',
      paymentMethod: PaymentMethod.ONLINE,
      status: TransactionStatus.APPROVED,
      daysAgo: 5,
      userId: owner.id,
    },
    {
      type: TransactionType.INCOME,
      amount: 38000.00,
      description: 'Product delivery milestone payment',
      descriptionGu: 'પ્રોડક્ટ ડિલિવરી માઇલસ્ટોન ચુકવણી',
      categoryName: 'Sales',
      paymentMethod: PaymentMethod.CHEQUE,
      status: TransactionStatus.APPROVED,
      daysAgo: 3,
      userId: employee2.id,
    },
    {
      type: TransactionType.EXPENSE,
      amount: 2150.00,
      description: 'High-speed internet connection bill',
      descriptionGu: 'હાઇ-સ્પીડ ઇન્ટરનેટ કનેક્શન બિલ',
      categoryName: 'Utilities',
      paymentMethod: PaymentMethod.UPI,
      status: TransactionStatus.PENDING,
      daysAgo: 1,
      userId: employee1.id,
    },
    {
      type: TransactionType.INCOME,
      amount: 14500.00,
      description: 'Maintenance service fee received in cash',
      descriptionGu: 'જાળવણી સેવા ફી રોકડમાં પ્રાપ્ત થઈ',
      categoryName: 'Service',
      paymentMethod: PaymentMethod.CASH,
      status: TransactionStatus.PENDING,
      daysAgo: 0,
      userId: employee2.id,
    },
  ];

  for (let i = 0; i < sampleTransactions.length; i++) {
    const item = sampleTransactions[i];
    const txDate = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000);
    const categoryRecord = createdCategories[item.categoryName];

    await prisma.transaction.create({
      data: {
        type: item.type,
        amount: item.amount,
        description: item.description,
        descriptionGu: item.descriptionGu,
        category: item.categoryName,
        categoryId: categoryRecord ? categoryRecord.id : null,
        paymentMethod: item.paymentMethod,
        status: item.status,
        date: txDate,
        userId: item.userId,
        businessId: business.id,
        approvedBy: item.status === TransactionStatus.APPROVED ? owner.id : null,
        approvedAt: item.status === TransactionStatus.APPROVED ? txDate : null,
        referenceId: `REF-${2024000 + i}`,
      },
    });
  }

  console.log(`Created ${sampleTransactions.length} sample transactions.`);
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
