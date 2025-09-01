import { PrismaClient, User, Festival } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');


  await prisma.review.deleteMany();
  await prisma.festival.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');


  const users: User[] = [];
  for (let i = 0; i < 5; i++) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: hashedPassword,
        name: faker.person.fullName(),
        isEmailVerified: true,
      },
    });
    users.push(user);
  }

  console.log(`Created ${users.length} users`);


  const festivals: Festival[] = [];
  for (let i = 0; i < 10; i++) {
    const festival = await prisma.festival.create({
      data: {
        name: `${faker.music.genre()} Festival`,
        location: faker.location.city(),
        startDate: faker.date.soon({ days: 30 }),
        endDate: faker.date.soon({ days: 35 }),
      },
    });
    festivals.push(festival);
  }

  console.log(`Created ${festivals.length} festivals`);


  for (let i = 0; i < 20; i++) {
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

  console.log('Created 20 reviews');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });