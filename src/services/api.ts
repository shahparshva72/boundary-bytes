import ky from 'ky';
import { env } from '@/lib/env';

const goApiBaseUrl = env.NEXT_PUBLIC_GO_API_URL.replace(/\/+$/, '');

export const goApi = ky.create({
  prefixUrl: `${goApiBaseUrl}/api`,
});

export default goApi;
