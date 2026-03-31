'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ProfileData } from '@/types/profile-types';
import { editUserAction } from '@/app/actions/auth-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';


interface EditNameModalProps {
  isOpen: boolean;
  onClose: (v: boolean) => void;
  profile: ProfileData;
}

export default function EditNameModal({ isOpen, onClose, profile }: EditNameModalProps) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; general?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // reset errors

    const newErrors: typeof errors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    const { ok, message } = await editUserAction({ first_name: firstName, last_name: lastName });

    if (ok) {
      toast.success(message || 'Profile updated successfully');
      onClose(false);
      router.refresh();
    } else {
      setErrors((prev) => ({ ...prev, general: message || 'Failed to update profile' }));
      toast.error(message || 'Failed to update profile');
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Name</DialogTitle>
          <DialogDescription>Update your display name.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="edit-first-name" className="text-xs text-muted-foreground">First Name</Label>
            <Input
              id="edit-first-name"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: undefined })); }}
            />
            {errors.firstName && <p className="mt-1 text-destructive text-xs">{errors.firstName}</p>}
          </div>
          <div>
            <Label htmlFor="edit-last-name" className="text-xs text-muted-foreground">Last Name</Label>
            <Input
              id="edit-last-name"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: undefined })); }}
            />
            {errors.lastName && <p className="mt-1 text-destructive text-xs">{errors.lastName}</p>}
          </div>
          {errors.general && <p className="mt-1 text-destructive text-xs text-center">{errors.general}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
