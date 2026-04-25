import ky from 'ky';

const goApiBaseUrl = (process.env.NEXT_PUBLIC_GO_API_URL ?? '').replace(/\/$/, '');
const nextApiBaseUrl = typeof window !== 'undefined' ? window.location.origin : '';

export const goApi = ky.create({
  prefixUrl: goApiBaseUrl ? `${goApiBaseUrl}/api` : '/api',
});

export const nextApi = ky.create({
  prefixUrl: `${nextApiBaseUrl}/api`,
});

export default goApi;
