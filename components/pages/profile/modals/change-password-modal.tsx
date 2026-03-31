'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { changePassword, logoutAction } from '@/app/actions/auth-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: (v: boolean) => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string; general?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const validateInputs = () => {
    const newErrors: typeof errors = {};
    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    if (newPassword.length < 8) newErrors.newPassword = 'Must be at least 8 characters';
    if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from current';
    }
    return newErrors;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);

    const { ok, message } = await changePassword(currentPassword, newPassword);

    if (ok) {
      toast.success(message || 'Password changed successfully');
      onClose(false);

      const logout = await logoutAction();
      if (logout?.ok === false) {
        toast.error(logout.message || 'Logout failed. Please log out manually to complete the process.');
      }

    } else {
      setErrors((prev) => ({ ...prev, general: message || 'Failed to change password' }));
      toast.error(message || 'Failed to change password');
    }

    setIsSaving(false);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    }
    onClose(v);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="current-password" className="text-xs ">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setErrors((p) => ({ ...p, currentPassword: undefined })); }}
            />
            {errors.currentPassword && <p className="mt-1 text-destructive text-xs">{errors.currentPassword}</p>}
          </div>
          <div>
            <Label htmlFor="new-password" className="text-xs ">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: undefined })); }}
            />
            {errors.newPassword && <p className="mt-1 text-destructive text-xs">{errors.newPassword}</p>}
          </div>
          <div>
            <Label htmlFor="confirm-password" className="text-xs">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
            />
            {errors.confirmPassword && <p className="mt-1 text-destructive text-xs">{errors.confirmPassword}</p>}
          </div>
          {errors.general && <p className="mt-1 text-destructive text-sm text-center">{errors.general}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
