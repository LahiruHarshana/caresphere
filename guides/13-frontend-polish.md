# Guide 13 — Frontend Polish

> **Priority**: P1  
> **Estimated Time**: 4–5 hours  
> **Depends on**: Guides 04–06

---

## 1. Loading Skeletons

Replace all "Loading..." text with proper skeleton UI.

### File: `apps/web/src/components/ui/skeleton.tsx` (NEW)

```tsx
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 rounded-md",
        className
      )}
    />
  );
}

// Pre-built patterns:

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border">
      <div className="border-b p-4">
        <div className="flex gap-4">
          {Array(cols).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-0">
          <div className="flex gap-4">
            {Array(cols).fill(0).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
```

### Usage

Replace every instance of:
```tsx
if (loading) return <div>Loading...</div>;
```
With:
```tsx
if (loading) return <DashboardSkeleton />;
```

---

## 2. Error Boundary

### File: `apps/web/src/components/ui/error-boundary.tsx` (NEW)

```tsx
"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### Wrap layouts:

```tsx
// In each layout:
<ErrorBoundary>
  {children}
</ErrorBoundary>
```

---

## 3. Toast Notifications

### File: `apps/web/src/components/ui/toast.tsx` (NEW)

```tsx
"use client";

import { useState, createContext, useContext, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <CheckCircle className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg ${bgColors[t.type]} animate-slide-in-right`}
          >
            {icons[t.type]}
            <p className="text-sm font-medium text-gray-900 flex-1">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
```

Add animation to `globals.css`:
```css
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
```

### Wrap in root layout:
```tsx
<ToastProvider>
  <AuthProvider>
    {children}
  </AuthProvider>
</ToastProvider>
```

---

## 4. Empty States

Create consistent empty state components:

```tsx
// apps/web/src/components/ui/empty-state.tsx

import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      {action && (
        action.href ? (
          <a href={action.href} className="inline-flex items-center bg-primary text-white px-6 py-2.5 rounded-lg font-medium">
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} className="inline-flex items-center bg-primary text-white px-6 py-2.5 rounded-lg font-medium">
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
```

---

## 5. Responsive Design Audit

### Key areas to fix:
1. **Admin sidebar**: Already responsive
2. **Booking form**: Grid columns collapse on mobile ✅
3. **Caregivers browse**: Grid collapses ✅
4. **Chat**: 3-column grid needs mobile handling (show list OR window, not both)
5. **Earnings table**: Add `overflow-x-auto` ✅
6. **Nav links**: Need mobile hamburger menu or bottom tab bar

### Mobile Chat Fix

```tsx
// In chat page, add mobile view toggle:
const [showList, setShowList] = useState(true);

// Mobile: show either list OR chat window
<div className={`md:col-span-1 ${selectedUser && !showList ? 'hidden md:block' : ''}`}>
  {/* conversation list */}
</div>
<div className={`md:col-span-2 ${!selectedUser || showList ? 'hidden md:block' : ''}`}>
  {/* chat window with back button on mobile */}
</div>
```

---

## 6. Page Metadata (SEO)

Add metadata to key pages:

```tsx
// In app/layout.tsx:
export const metadata = {
  title: 'CareSphere — Trusted Caregiving Platform',
  description: 'Find trusted, verified caregivers for your loved ones. Book professional elderly care, child care, and special needs services.',
  keywords: 'caregiving, elderly care, child care, home care, caregivers',
};

// In login page (add to layout or use generateMetadata):
export const metadata = {
  title: 'Login | CareSphere',
  description: 'Sign in to your CareSphere account.',
};
```

---

## 7. Verification Checklist

- [ ] All loading states use skeleton components instead of text
- [ ] ErrorBoundary catches and displays errors gracefully
- [ ] Toast notifications appear on form submissions
- [ ] Empty states have helpful messages and CTAs
- [ ] Chat page works on mobile (list/chat toggle)
- [ ] Tables scroll horizontally on mobile
- [ ] Page titles are descriptive for SEO
- [ ] 404 page exists and renders correctly
- [ ] No console errors in production build
