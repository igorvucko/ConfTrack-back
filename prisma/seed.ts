import { PrismaClient, Prisma  } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  const users:any[] = []
  const festivals: any[] = []

  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
email: faker.internet.email(),
        password: faker.internet.password(),
      },
    })
    users.push(user)
  }

  for (let i = 0; i < 5; i++) {
    const festival = await prisma.festival.create({
      data: {
        name: `${faker.music.genre()} Festival`,
location: faker.location.city(),
startDate: faker.date.future(),
endDate: faker.date.future({ years: 1 }),
      },
    })
    festivals.push(festival)
  }

  for (let i = 0; i < 10; i++) {
    const user = faker.helpers.arrayElement(users)
    const festival = faker.helpers.arrayElement(festivals)

await prisma.review.create({
  data: {
    rating: faker.number.int({ min: 1, max: 5 }),
    content: faker.lorem.sentences(2),
    festivalId: 1,
    userId: 1,
  },
});
}

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())