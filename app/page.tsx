import { getPage } from '@/lib/content';
import { PageRenderer } from '@/components/page-renderer';
import { metadataFor } from '@/lib/metadata';

export function generateMetadata() { return metadataFor(getPage('/')!); }

export default function Home() {
  return <PageRenderer page={getPage('/')!} />;
}
