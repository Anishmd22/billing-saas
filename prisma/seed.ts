/**
 * Prisma seed script — run with: npx prisma db seed
 * Creates sample data to verify the database connection and schema.
 *
 * Prisma 7 requires a driver adapter — the seed uses pg Pool with DIRECT_URL.
 */
import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Seed uses the direct connection string (bypasses PgBouncer)
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create a sample client
  const client = await prisma.client.upsert({
    where: { gstNumber: '33AABCT1332L1ZX' },
    update: {},
    create: {
      gstNumber: '33AABCT1332L1ZX',
      companyName: 'Sample Industries Pvt Ltd',
      address: '42 Industrial Area, Chennai, Tamil Nadu - 600032',
      phone: '+91 98765 43210',
      email: 'billing@sampleindustries.com',
    },
  });
  console.log(`✅ Client: ${client.companyName}`);

  // Create sample products
  const product1 = await prisma.product.upsert({
    where: { id: 'seed-product-1' },
    update: {},
    create: {
      id: 'seed-product-1',
      productName: 'Steel Pipes (25mm)',
      hsnCode: '7306',
      unit: 'Mtr',
      currentStock: new Prisma.Decimal(500),
      sellingPrice: new Prisma.Decimal(120),
    },
  });

  // Log opening stock if not already present
  const existingMovement1 = await prisma.inventoryMovement.findUnique({
    where: { id: 'seed-movement-1' },
  });
  if (!existingMovement1) {
    await prisma.inventoryMovement.create({
      data: {
        id: 'seed-movement-1',
        productId: product1.id,
        movementType: 'STOCK_ADD',
        quantityChange: new Prisma.Decimal(500),
        stockBefore: new Prisma.Decimal(0),
        stockAfter: new Prisma.Decimal(500),
        remarks: 'Opening stock (seed)',
      },
    });
  }
  console.log(`✅ Product: ${product1.productName} (Stock: 500 Mtr)`);

  const product2 = await prisma.product.upsert({
    where: { id: 'seed-product-2' },
    update: {},
    create: {
      id: 'seed-product-2',
      productName: 'Aluminium Sheets (2mm)',
      hsnCode: '7606',
      unit: 'Kg',
      currentStock: new Prisma.Decimal(250),
      sellingPrice: new Prisma.Decimal(280),
    },
  });

  const existingMovement2 = await prisma.inventoryMovement.findUnique({
    where: { id: 'seed-movement-2' },
  });
  if (!existingMovement2) {
    await prisma.inventoryMovement.create({
      data: {
        id: 'seed-movement-2',
        productId: product2.id,
        movementType: 'STOCK_ADD',
        quantityChange: new Prisma.Decimal(250),
        stockBefore: new Prisma.Decimal(0),
        stockAfter: new Prisma.Decimal(250),
        remarks: 'Opening stock (seed)',
      },
    });
  }
  console.log(`✅ Product: ${product2.productName} (Stock: 250 Kg)`);

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
