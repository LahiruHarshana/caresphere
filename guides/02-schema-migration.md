# Guide 02 — Schema Migration & Data Model Completion

> **Priority**: P0  
> **Estimated Time**: 1–2 hours  
> **Depends on**: Guide 01

---

## 1. Problem Summary

The registration form collects fields that the database **cannot store**:
- `dateOfBirth` — Not in the `Profile` model
- `careType`, `careFrequency`, `specialRequirements`, `preferredSchedule` — Customer care preferences have no storage
- `agreeToBackgroundCheck` — Not tracked anywhere

The `auth.service.ts` destructures these values but never uses them.

---

## 2. Updated Prisma Schema

### File: `apps/api/prisma/schema.prisma`

Add the following changes to the existing schema:

#### A. Update the `Profile` model — add `dateOfBirth`:

```prisma
model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName String
  lastName  String
  avatarUrl String?
  bio       String?
  phone     String?
  address   String?
  lat       Float?
  lng       Float?
  languages String[]
  dateOfBirth DateTime?           // ADD THIS

  @@index([userId])
  @@index([lat, lng])
}
```

#### B. Add a `CustomerProfile` model — store care preferences:

```prisma
model CustomerProfile {
  id                  String   @id @default(uuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  careType            String?
  careFrequency       String?
  specialRequirements String?
  preferredSchedule   String?
  emergencyContact    String?           // Future: emergency contact
  emergencyPhone      String?           // Future: emergency phone
  medicalNotes        String?           // Future: high-level medical notes

  @@index([userId])
}
```

#### C. Update the `User` model — add `CustomerProfile` relation:

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role
  isVerified   Boolean  @default(false)
  isBanned     Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profile          Profile?
  caregiverProfile CaregiverProfile?
  customerProfile  CustomerProfile?      // ADD THIS

  // ... rest of relations unchanged
  customerBookings Booking[] @relation("CustomerBookings")
  caregiverBookings Booking[] @relation("CaregiverBookings")
  reviewsWritten   Review[] @relation("ReviewAuthor")
  reviewsReceived  Review[] @relation("ReviewTarget")
  familyVaults     FamilyVault[]
  sentMessages     Message[] @relation("MessageSender")
  receivedMessages Message[] @relation("MessageReceiver")
  notifications    Notification[]
  auditLogs        AuditLog[]

  @@index([role])
}
```

#### D. Update `CaregiverProfile` — add background check consent:

```prisma
model CaregiverProfile {
  id                    String             @id @default(uuid())
  userId                String             @unique
  user                  User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  hourlyRate            Float
  experienceYears       Int
  certifications        String[]
  specialties           String[]
  verificationStatus    VerificationStatus @default(PENDING)
  backgroundCheckUrl    String?
  isAvailable           Boolean            @default(true)
  agreedToBackgroundCheck Boolean          @default(false)    // ADD THIS
  bio                   String?                                // ADD THIS (caregiver-specific bio)

  @@index([userId])
  @@index([verificationStatus])
}
```

---

## 3. Run the Migration

```bash
# Navigate to the API directory context (commands run from project root)
pnpm --filter api exec prisma migrate dev --name add_customer_profile_and_fields
```

This will:
1. Generate a new SQL migration file
2. Apply it to your local database
3. Regenerate the Prisma Client

---

## 4. Update Auth Service to Store New Fields

### File: `apps/api/src/auth/auth.service.ts`

Update the `register` method to store the previously-ignored fields:

```typescript
async register(registerDto: RegisterDto) {
  const {
    email,
    password,
    role,
    firstName,
    lastName,
    phone,
    address,
    dateOfBirth,
    bio,
    specialties,
    experienceYears,
    hourlyRate,
    certifications,
    careType,
    careFrequency,
    specialRequirements,
    preferredSchedule,
    agreeToBackgroundCheck,
  } = registerDto;

  const existingUser = await this.usersService.findByEmail(email);
  if (existingUser) {
    throw new UnauthorizedException('User already exists');
  }

  const passwordHash = await argon2.hash(password);

  const user = await this.prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      profile: {
        create: {
          firstName,
          lastName,
          phone: phone || null,
          address: address || null,
          bio: bio || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
      },
      // Create customer profile with care preferences
      ...(role === 'CUSTOMER' && {
        customerProfile: {
          create: {
            careType: careType || null,
            careFrequency: careFrequency || null,
            specialRequirements: specialRequirements || null,
            preferredSchedule: preferredSchedule || null,
          },
        },
      }),
      // Create caregiver profile
      ...(role === 'CAREGIVER' && {
        caregiverProfile: {
          create: {
            hourlyRate: hourlyRate || 0,
            experienceYears: experienceYears || 0,
            certifications: certifications || [],
            specialties: specialties || [],
            agreedToBackgroundCheck: agreeToBackgroundCheck || false,
          },
        },
      }),
    },
    include: {
      profile: true,
      caregiverProfile: true,
      customerProfile: true,
    },
  });

  const tokens = await this.getTokens(user.id, user.email, user.role);
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName,
      lastName,
    },
    ...tokens,
  };
}
```

---

## 5. Update Seed Script

### File: `apps/api/prisma/seed.ts`

Add customer profile creation for seeded customers:

```typescript
// In the customer creation loop, add customerProfile:
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
      customerProfile: {   // ADD THIS
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
```

---

## 6. Re-seed the Database

After migration:

```bash
pnpm --filter api exec prisma db seed
```

---

## 7. Verification Checklist

- [ ] Migration runs successfully without errors
- [ ] `prisma studio` shows the new `CustomerProfile` table with data
- [ ] Register a new CUSTOMER — check that `CustomerProfile` row is created
- [ ] Register a new CAREGIVER — check that `CaregiverProfile` has `agreedToBackgroundCheck`
- [ ] Seed script runs without errors
- [ ] Profile model has `dateOfBirth` column
