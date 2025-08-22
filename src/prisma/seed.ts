import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();


interface SeedUser {
  id: number;
  email: string;
  password: string;
  name: string | null;
}


interface SeedFestival {
  id: number;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

async function main() {

  await prisma.review.deleteMany();
  await prisma.festival.deleteMany();
  await prisma.user.deleteMany();


  const users: SeedUser[] = [];
  for (let i = 0; i < 5; i++) {
    const hashedPassword = await bcrypt.hash('password123', 12); // Using a fixed password for testing
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: hashedPassword,
        name: faker.person.fullName(),
      },
    });
    users.push(user);
  }


  const festivals: SeedFestival[] = [];
  for (let i = 0; i < 5; i++) {
    const festival = await prisma.festival.create({
      data: {
        name: `${faker.music.genre()} Festival`,
        location: faker.location.city(),
        startDate: faker.date.future(),
        endDate: faker.date.future({ years: 1 }),
      },
    });
    festivals.push(festival);
  }


  for (let i = 0; i < 10; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const festival = festivals[Math.floor(Math.random() * festivals.length)];

    await prisma.review.create({
      data: {
        rating: faker.number.int({ min: 1, max: 5 }),
        content: faker.lorem.sentences(2),
        festivalId: festival.id,
        userId: user.id,
      },
    });
  }

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });