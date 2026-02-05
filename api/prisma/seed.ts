import prisma from "../src/db.js";

async function main() {
  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.person.deleteMany();
  await prisma.galleryState.deleteMany();

  // Create people
  const people = await Promise.all([
    prisma.person.create({
      data: {
        name: "Alice Johnson",
        major: "Computer Science",
        year: 2024,
        imageUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=faces,center",
      },
    }),
    prisma.person.create({
      data: {
        name: "Bob Smith",
        major: "Electrical Engineering",
        year: 2023,
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=faces,center",
      },
    }),
    prisma.person.create({
      data: {
        name: "Carol Williams",
        major: "Biology",
        year: 2025,
        imageUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop&crop=faces,center",
      },
    }),
    prisma.person.create({
      data: {
        name: "David Brown",
        major: "Mathematics",
        year: 2024,
        imageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&crop=faces,center",
      },
    }),
  ]);

  // Create initial gallery state
  await prisma.galleryState.create({
    data: {
      id: 1,
      isReleased: false,
    },
  });

  console.log("✅ Database seeded with sample data");
  console.log(`Created ${people.length} people`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
