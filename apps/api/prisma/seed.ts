import { PrismaClient, Role, VerificationStatus, BookingStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

const connectionString = process.env.DATABASE_URL || 'postgresql://caresphere:caresphere@localhost:5433/caresphere';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.earning.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.familyVault.deleteMany();
  await prisma.caregiverProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash('password123');

  // Create Admin
  await prisma.user.create({
    data: {
      email: 'admin@caresphere.com',
      passwordHash,
      role: Role.ADMIN,
      isVerified: true,
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Admin',
        },
      },
    },
  });

  // Create Caregivers
  const caregiversData = [
    { email: 'sarah.c@example.com', name: ['Sarah', 'Carey'], specialties: ['Elderly Care', 'Dementia'], rate: 25 },
    { email: 'john.d@example.com', name: ['John', 'Doe'], specialties: ['Child Care', 'First Aid'], rate: 20 },
    { email: 'emily.s@example.com', name: ['Emily', 'Smith'], specialties: ['Special Needs', 'Physical Therapy'], rate: 35 },
    { email: 'mike.r@example.com', name: ['Mike', 'Ross'], specialties: ['Elderly Care', 'Meal Prep'], rate: 22 },
    { email: 'lisa.v@example.com', name: ['Lisa', 'Vance'], specialties: ['Hospice Care', 'Medication'], rate: 40 },
  ];

  const caregivers = [];
  for (const c of caregiversData) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash,
        role: Role.CAREGIVER,
        isVerified: true,
        profile: {
          create: {
            firstName: c.name[0],
            lastName: c.name[1],
            phone: '1234567890',
            address: '123 Care St',
            lat: 40.7128 + (Math.random() - 0.5) * 0.1,
            lng: -74.0060 + (Math.random() - 0.5) * 0.1,
            languages: ['English', 'Spanish'],
          },
        },
        caregiverProfile: {
          create: {
            hourlyRate: c.rate,
            experienceYears: Math.floor(Math.random() * 10) + 2,
            specialties: c.specialties,
            certifications: ['CPR', 'First Aid'],
            verificationStatus: VerificationStatus.APPROVED,
            isAvailable: true,
            agreedToBackgroundCheck: true,
          },
        },
      },
    });
    caregivers.push(user);
  }

  // Create Customers
  const customers = [];
  for (let i = 1; i <= 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        passwordHash,
        role: Role.CUSTOMER,
        isVerified: true,
        profile: {
          create: {
            firstName: `Customer`,
            lastName: `${i}`,
            phone: `987654321${i}`,
            address: `456 Home Ave`,
            lat: 40.7128,
            lng: -74.0060,
            dateOfBirth: new Date('1985-06-15'),
          },
        },
        customerProfile: {
          create: {
            careType: ['Elderly Care', 'Child Care', 'Special Needs Care'][i - 1],
            careFrequency: 'Weekly',
            preferredSchedule: 'Morning (8AM - 12PM)',
            specialRequirements: i === 1 ? 'Wheelchair accessible' : null,
          },
        },
      },
    });
    customers.push(user);
  }

  // Create some bookings
  for (let i = 0; i < 3; i++) {
    const customer = customers[i];
    const caregiver = caregivers[i];
    
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        caregiverId: caregiver.id,
        serviceType: caregiver.email === 'sarah.c@example.com' ? 'Elderly Care' : 'General Care',
        scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 1)), // Past days
        endAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 1) + 1000 * 60 * 60 * 4), // 4 hours duration
        status: BookingStatus.COMPLETED,
        totalCost: 100 + i * 20,
        notes: 'Initial checkup.',
      },
    });

    // Create a review
    await prisma.review.create({
      data: {
        bookingId: booking.id,
        authorId: customer.id,
        targetId: caregiver.id,
        rating: 5 - (i % 2),
        comment: 'Great service!',
      },
    });

    // Create an earning for caregiver
    await prisma.earning.create({
      data: {
        bookingId: booking.id,
        amount: (booking.totalCost || 0) * 0.9, // 10% platform fee
        status: 'PAID',
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
