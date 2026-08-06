import 'server-only';

import { headers } from 'next/headers';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export async function getAppUrl() {
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl) {
    return trimTrailingSlash(envUrl);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const protocol = vercelUrl.includes('localhost') ? 'http' : 'https';
    return trimTrailingSlash(`${protocol}://${vercelUrl}`);
  }

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');

  if (!host) {
    throw new Error('Could not determine the current app URL.');
  }

  const protocol =
    headerList.get('x-forwarded-proto') ??
    (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return trimTrailingSlash(`${protocol}://${host}`);
}
