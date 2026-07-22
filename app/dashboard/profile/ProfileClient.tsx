'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Lock,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Calendar,
  Mail,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/lib/utils/date';

// ── Schemas ──────────────────────────────────────────────────────────────────

const nameSchema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(100).trim(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Needs an uppercase letter')
      .regex(/[0-9]/, 'Needs a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type NameForm = z.infer<typeof nameSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

export function ProfileClient({ user }: { user: UserData }) {
  const { setUser } = useAuthStore();
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Name form ───────────────────────────────────────────────────────────────
  const nameForm = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user.name ?? '' },
  });

  async function updateName(data: NameForm) {
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json() as { error?: string };
      toast.error(json.error ?? 'Update failed');
      return;
    }
    const { data: updated } = await res.json() as { data: { name: string } };
    setUser({ ...user, name: updated.name, role: user.role as 'user' | 'admin', imageUrl: null });
    toast.success('Name updated!');
  }

  // ── Password form ────────────────────────────────────────────────────────────
  const pwForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  async function changePassword(data: PasswordForm) {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });
    const json = await res.json() as { error?: string; data?: { message: string } };
    if (!res.ok) {
      toast.error(json.error ?? 'Password change failed');
      return;
    }
    toast.success(json.data?.message ?? 'Password changed. Please sign in again.');
    pwForm.reset();
    setTimeout(() => router.push('/sign-in'), 1500);
  }

  // ── Delete account ───────────────────────────────────────────────────────────
  async function deleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        toast.error(json.error ?? 'Delete failed');
        return;
      }
      setUser(null);
      toast.success('Account deleted');
      router.push('/');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account info */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="size-4" />
            <h2 className="font-semibold">Account Info</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Shield className="size-4 shrink-0" />
            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
              {user.role}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="size-4 shrink-0" />
            <span>Member since {formatDate(user.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Edit name */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="size-4" />
            <h2 className="font-semibold">Display Name</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={nameForm.handleSubmit(updateName)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Your name"
                {...nameForm.register('name')}
              />
              {nameForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {nameForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={nameForm.formState.isSubmitting}
            >
              {nameForm.formState.isSubmitting ? (
                <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
              ) : (
                'Save Name'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Lock className="size-4" />
            <h2 className="font-semibold">Change Password</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={pwForm.handleSubmit(changePassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...pwForm.register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {pwForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {pwForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  {...pwForm.register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {pwForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {pwForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...pwForm.register('confirmPassword')}
              />
              {pwForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {pwForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={pwForm.formState.isSubmitting}
            >
              {pwForm.formState.isSubmitting ? (
                <><Loader2 className="size-3.5 animate-spin" /> Changing…</>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      {user.role !== 'admin' && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Trash2 className="size-4 text-destructive" />
              <h2 className="font-semibold text-destructive">Danger Zone</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>

            {!deleteConfirm ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="size-3.5" /> Delete Account
              </Button>
            ) : (
              <div className="space-y-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-sm font-medium text-destructive">
                  Are you sure? This will delete all your data.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteAccount}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <><Loader2 className="size-3.5 animate-spin" /> Deleting…</>
                    ) : (
                      'Yes, delete my account'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
