import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return this.sanitize(value);
    }
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitize(str: string): string {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }

  private sanitizeObject(obj: any): any {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = this.sanitize(obj[key]);
      } else if (Array.isArray(obj[key])) {
        sanitized[key] = obj[key].map((item: any) =>
          typeof item === 'string' ? this.sanitize(item) : item,
        );
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }
}
