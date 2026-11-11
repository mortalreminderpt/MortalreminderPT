import { getPage } from '@/lib/content';
import { PageRenderer } from '@/components/page-renderer';
import { NotFoundLocale } from '@/components/not-found-locale';

export default function NotFound() {
  return <NotFoundLocale english={<PageRenderer page={getPage('/404.html')!} />} chinese={<PageRenderer page={getPage('/zh-cn/404.html')!} />} />;
}
