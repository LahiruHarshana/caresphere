# Guide 11 — File Uploads & Media

> **Priority**: P1  
> **Estimated Time**: 2–3 hours  
> **Depends on**: Guide 01

---

## 1. Current State

- Caregiver verification documents are saved to local disk (`./apps/api/tmp/uploads`)
- No avatar upload exists
- No Cloudinary or S3 integration
- `CLOUDINARY_URL` is in `.env.example` but not used

---

## 2. Strategy Decision

**Option A: Cloudinary** (Recommended for MVP)
- Free tier: 25 credits/month (enough for thousands of images)
- Auto-optimization, CDN, transformations
- Simple SDK integration

**Option B: AWS S3**
- More control, better for production scale
- Requires more setup

This guide uses **Cloudinary**.

---

## 3. Cloudinary Setup

### Install SDK

```bash
pnpm --filter api add cloudinary
pnpm --filter api add -D @types/multer
```

### Create Upload Service

#### File: `apps/api/src/uploads/uploads.service.ts` (NEW)

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'caresphere',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('No file provided');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
            { format: 'webp' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadDocument(
    file: Express.Multer.File,
    folder: string = 'caresphere/documents',
  ): Promise<{ url: string; publicId: string }> {
    if (!file) throw new BadRequestException('No file provided');

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PDF, JPEG, and PNG are allowed.');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File too large. Maximum size is 10MB.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
```

#### File: `apps/api/src/uploads/uploads.module.ts` (NEW)

```typescript
import { Global, Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Global()
@Module({
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
```

Register in `AppModule`:
```typescript
imports: [UploadsModule, ...]
```

---

## 4. Avatar Upload Endpoint

### In `apps/api/src/users/users.controller.ts`:

```typescript
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@UseGuards(JwtAuthGuard)
@Post('avatar')
@UseInterceptors(FileInterceptor('avatar', {
  storage: memoryStorage(), // Store in memory for Cloudinary upload
}))
async uploadAvatar(
  @Req() req: any,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.usersService.updateAvatar(req.user.userId, file);
}
```

### In `apps/api/src/users/users.service.ts`:

```typescript
constructor(
  private prisma: PrismaService,
  private uploadsService: UploadsService,
) {}

async updateAvatar(userId: string, file: Express.Multer.File) {
  const result = await this.uploadsService.uploadImage(file, 'caresphere/avatars');

  await this.prisma.profile.update({
    where: { userId },
    data: { avatarUrl: result.url },
  });

  return { avatarUrl: result.url };
}
```

---

## 5. Frontend — Avatar Upload Component

### File: `apps/web/src/components/ui/avatar-upload.tsx` (NEW)

```tsx
"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

interface AvatarUploadProps {
  currentUrl?: string | null;
  name: string;
  token: string;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({ currentUrl, name, token, onUploaded }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/users/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUploaded(data.avatarUrl);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {name[0]?.toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-xs text-gray-500 mt-2">Click to upload</p>
    </div>
  );
}
```

---

## 6. Update .env

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 7. Update Caregiver Verification Upload

Migrate the existing verification document upload to use Cloudinary instead of local disk:

```typescript
// In caregivers.controller.ts, update the verify endpoint to use memoryStorage:
@UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
async uploadVerificationDocument(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
  return this.caregiversService.uploadVerification(req.user.userId, file);
}

// In caregivers.service.ts:
async uploadVerification(userId: string, file: Express.Multer.File) {
  const result = await this.uploadsService.uploadDocument(file, 'caresphere/verification');
  return this.prisma.caregiverProfile.update({
    where: { userId },
    data: {
      backgroundCheckUrl: result.url,
      verificationStatus: 'PENDING',
    },
  });
}
```

---

## 8. Verification Checklist

- [ ] Cloudinary configuration loads from env variables
- [ ] Avatar upload works and returns a Cloudinary URL
- [ ] Avatar appears in profile and navigation
- [ ] Verification document uploads to Cloudinary
- [ ] File type validation rejects invalid formats
- [ ] File size limit (5MB images, 10MB documents) enforced
- [ ] Old local disk upload code is removed
