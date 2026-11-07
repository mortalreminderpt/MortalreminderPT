import { getPage } from '@/lib/content';
import { PageRenderer } from '@/components/page-renderer';

export default function NotFound() {
  return <PageRenderer page={getPage('/404.html')!} />;
}
