import ui from '@/content/i18n/ui.json';
import type { Language } from './types';

export const labelsFor = (language: Language) => ui[language];
export const htmlLanguage = (language: Language) => language === 'zh-cn' ? 'zh-CN' : 'en';
