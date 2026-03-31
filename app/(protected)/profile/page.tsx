import ProfilePageClient from '@/components/pages/profile/profile-page-client';
import { getCurrentUser } from '@/app/actions/auth-actions';
import { formatDate, formatDateTime } from '@/lib/utils';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) return null;

  return (
    <ProfilePageClient
      profile={{
        firstName: String(user.profile?.first_name ?? '').trim(),
        lastName: String(user.profile?.last_name ?? '').trim(),
        email: user.email ?? 'No email address',
        userId: user.id,
        createdAt: formatDate(user.created_at),
        lastSignInAt: formatDateTime(user.last_sign_in_at),
        emailVerified: Boolean(user.email_confirmed_at),
      }}
    />
  );
}
