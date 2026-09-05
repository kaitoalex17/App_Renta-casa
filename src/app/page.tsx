import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'TENANT') {
    redirect('/portal/magic_token_juan_123456789');
  }

  redirect('/dashboard');
}
