'use client';

import { useState } from 'react';
import { User, Mail, Calendar, Shield, KeyRound, Pencil, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProfileData } from '@/types/profile-types';
import EditNameModal from '@/components/pages/profile/modals/edit-name-modal';
import ChangePasswordModal from '@/components/pages/profile/modals/change-password-modal';

interface ProfilePageClientProps {
  profile: ProfileData;
}

export default function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email || 'User';
  const initials = (profile.firstName?.[0] ?? profile.email?.[0] ?? 'U').toUpperCase();

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Profile header card */}
        <Card className="relative mb-8 overflow-hidden border border-border">
          <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-br from-primary/15 to-primary/5" />
          <div className="relative flex sm:flex-row flex-col sm:items-end gap-5 px-6 pt-14 pb-6">
            <Avatar className="border-4 border-background rounded-full w-20 h-20 shadow-sm">
              <AvatarFallback className="bg-primary/10 font-bold text-primary text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-bold text-foreground text-2xl truncate">{displayName}</h1>
                {profile.emailVerified ? (
                  <Badge className="gap-1 bg-green-600/10 text-green-600 hover:bg-green-600/10 text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    Not verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{profile.email}</p>
            </div>
          </div>
        </Card>

        <div className="gap-6 grid">
          {/* Account info */}
          <Card className="p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="flex items-center gap-2 font-semibold text-foreground text-lg">
                <div className="flex justify-center items-center bg-primary/10 rounded-lg w-8 h-8">
                  <User className="w-4 h-4 text-primary" />
                </div>
                Account Information
              </h3>
              <Button variant="outline" size="sm" className="gap-1.5 bg-transparent" onClick={() => setEditNameOpen(true)}>
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              <div className="gap-4 grid sm:grid-cols-2">
                <div className="bg-muted/30 px-4 py-3 border border-border rounded-lg">
                  <p className="mb-1 text-muted-foreground text-xs uppercase tracking-wider">First Name</p>
                  <p className="font-medium text-foreground text-sm">{profile.firstName || '—'}</p>
                </div>
                <div className="bg-muted/30 px-4 py-3 border border-border rounded-lg">
                  <p className="mb-1 text-muted-foreground text-xs uppercase tracking-wider">Last Name</p>
                  <p className="font-medium text-foreground text-sm">{profile.lastName || '—'}</p>
                </div>
              </div>

              <div className="bg-muted/30 px-4 py-3 border border-border rounded-lg">
                <p className="flex items-center gap-1.5 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                  <Mail className="w-3 h-3" /> Email Address
                </p>
                <p className="font-medium text-foreground text-sm">{profile.email}</p>
              </div>

              <div className="gap-4 grid sm:grid-cols-2">
                <div className="bg-muted/30 px-4 py-3 border border-border rounded-lg">
                  <p className="flex items-center gap-1.5 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <Calendar className="w-3 h-3" /> Member Since
                  </p>
                  <p className="font-medium text-foreground text-sm">{profile.createdAt}</p>
                </div>
                <div className="bg-muted/30 px-4 py-3 border border-border rounded-lg">
                  <p className="flex items-center gap-1.5 mb-1 text-muted-foreground text-xs uppercase tracking-wider">
                    <Clock className="w-3 h-3" /> Last Sign In
                  </p>
                  <p className="font-medium text-foreground text-sm">{profile.lastSignInAt}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6 border border-border">
            <h3 className="flex items-center gap-2 mb-6 font-semibold text-foreground text-lg">
              <div className="flex justify-center items-center bg-primary/10 rounded-lg w-8 h-8">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              Security
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-muted/30 px-4 py-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Password</p>
                    <p className="text-muted-foreground text-xs">••••••••</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setChangePasswordOpen(true)}>
                  Change
                </Button>
              </div>

              <div className="flex items-center gap-3 bg-muted/30 px-4 py-3 border border-border rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground text-sm">Email Verification</p>
                  <p className="text-muted-foreground text-xs">
                    {profile.emailVerified ? 'Your email is verified' : 'Your email is not verified'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Edit Name Modal */}
      <EditNameModal isOpen={editNameOpen} onClose={setEditNameOpen} profile={profile} />

      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={changePasswordOpen} onClose={setChangePasswordOpen} />
    </div>
  );
}
