import { getPage } from '@/lib/content';
import { PageRenderer } from '@/components/page-renderer';
import { siteOrigin } from '@/lib/site-origin';

export const metadata = { title: "PT's Home", alternates: { canonical: siteOrigin + '/' } };

export default function Home() {
  return <PageRenderer page={getPage('/')!} />;
}
