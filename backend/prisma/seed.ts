import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.menu.deleteMany();
  await prisma.type.deleteMany();

  // Create Types
  const drinkType = await prisma.type.create({
    data: { name: 'เครื่องดื่ม (Drinks)' },
  });

  const foodType = await prisma.type.create({
    data: { name: 'อาหารจานเดียว (Main Course)' },
  });

  const dessertType = await prisma.type.create({
    data: { name: 'ของหวาน (Dessert)' },
  });

  // Create Menus
  await prisma.menu.createMany({
    data: [
      {
        name: 'ชาไทยเย็น (Thai Iced Tea)',
        price: 45.0,
        isBestSeller: true,
        typeId: drinkType.typeId,
      },
      {
        name: 'กาแฟอเมริกาโน่ (Americano)',
        price: 50.0,
        isBestSeller: false,
        typeId: drinkType.typeId,
      },
      {
        name: 'ผัดไทยกุ้งสด (Pad Thai with Shrimp)',
        price: 89.0,
        isBestSeller: true,
        typeId: foodType.typeId,
      },
      {
        name: 'ข้าวผัดกระเพราหมูกรอบ (Crispy Pork Basil Rice)',
        price: 75.0,
        isBestSeller: true,
        typeId: foodType.typeId,
      },
      {
        name: 'ข้าวเหนียวมะม่วง (Mango Sticky Rice)',
        price: 120.0,
        isBestSeller: false,
        typeId: dessertType.typeId,
      },
    ],
  });

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
