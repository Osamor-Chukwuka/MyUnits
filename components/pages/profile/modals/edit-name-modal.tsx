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
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; phoneNumber?: string; general?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const normalizedPhoneNumber = phoneNumber.replace(/\s+/g, '').trim();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // reset errors

    const newErrors: typeof errors = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!normalizedPhoneNumber) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\+?\d{10,15}$/.test(normalizedPhoneNumber)) newErrors.phoneNumber = 'Enter a valid phone number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);

    const { ok, message } = await editUserAction({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone_number: normalizedPhoneNumber,
    });

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
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your account details.</DialogDescription>
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
          <div>
            <Label htmlFor="edit-phone-number" className="text-xs text-muted-foreground">Phone Number</Label>
            <Input
              id="edit-phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setErrors((p) => ({ ...p, phoneNumber: undefined })); }}
            />
            <p className="mt-1 text-muted-foreground text-xs">We use this for your electricity recharge requests.</p>
            {errors.phoneNumber && <p className="mt-1 text-destructive text-xs">{errors.phoneNumber}</p>}
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
