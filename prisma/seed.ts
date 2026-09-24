/**
 * Prisma Seed Script for Obsidian Cinema
 * Populates initial Administrator, sample catalog, and default AdSettings
 */

import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@obsidiancinema.com';
const ADMIN_INITIAL_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'ObsidianAdmin2026!';

export async function seedPrisma(prisma: any) {
  console.log('Seeding Obsidian Cinema database...');

  // 1. Seed or get Administrator
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  let adminUser = existingAdmin;
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(ADMIN_INITIAL_PASSWORD, salt);

    adminUser = await prisma.user.create({
      data: {
        name: 'Chief Curator',
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      },
    });
    console.log(`Created Initial Administrator: ${ADMIN_EMAIL}`);
  }

  // 2. Seed Default AdSettings
  const adSettings = await prisma.adSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      enabled: true,
      publisherId: process.env.ADSENSE_PUBLISHER_ID || 'ca-pub-1234567890123456',
      homepageSlot: '1122334455',
      movieListingSlot: '2233445566',
      movieDetailsSlot: '3344556677',
      footerSlot: '4455667788',
    },
  });
  console.log('Default Ad Settings initialized.');

  // 3. Seed Initial Movies if empty
  const movieCount = await prisma.movie.count();
  if (movieCount === 0) {
    const initialMovies = [
      {
        tmdbId: 157336,
        title: 'Interstellar',
        posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqJJR0KP8UN8vJjZ9rUOXE.jpg',
        overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
        releaseDate: '2014-11-05',
        genre: 'Sci-Fi',
        rating: 8.4,
        duration: '169 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        published: true,
        featured: true,
      },
      {
        tmdbId: 27205,
        title: 'Inception',
        posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
        overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: "inception".',
        releaseDate: '2010-07-15',
        genre: 'Action',
        rating: 8.8,
        duration: '148 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        published: true,
        featured: false,
      },
      {
        tmdbId: 155,
        title: 'The Dark Knight',
        posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
        overview: 'Batman raises the stakes in his war on crime. With the help of allies Lt. Jim Gordon and DA Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
        releaseDate: '2008-07-16',
        genre: 'Drama',
        rating: 9.0,
        duration: '152 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        published: true,
        featured: true,
      },
      {
        tmdbId: 438631,
        title: 'Dune',
        posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/lzWHmYZrBtPTMpPT8g2gEG03vWs.jpg',
        overview: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.',
        releaseDate: '2021-09-15',
        genre: 'Sci-Fi',
        rating: 8.1,
        duration: '155 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        published: true,
        featured: false,
      },
    ];

    for (const movie of initialMovies) {
      await prisma.movie.create({ data: movie });
    }
    console.log(`Seeded ${initialMovies.length} baseline movies.`);
  }

  // 4. Audit Log
  if (adminUser) {
    await prisma.auditLog.create({
      data: {
        adminId: adminUser.id,
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'SYSTEM',
        metadata: JSON.stringify({ seededAt: new Date().toISOString() }),
      },
    });
  }

  console.log('Seeding completed successfully.');
}
