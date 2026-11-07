'use client';

import { useRef } from 'react';
import config from '@/content/site.json';
import type { Language } from '@/lib/types';

export function ContactForm({ lang }: { lang: Language }) {
  const t = config.translations[lang].global.contact;
  const form = useRef<HTMLFormElement>(null);
  const email = config.site.contact.email;
  return <div className="form-container">
    <p className="contact-description">{t.content}</p>
    <form className="form" id="contact-form" action={`mailto:${email}`} ref={form} onSubmit={e => e.preventDefault()}>
      <div className="form__group">
        <label className="form__label screen-reader-text" htmlFor="form-name">{t.name}</label>
        <input className="form__input" id="form-name" type="text" name="name" placeholder={t.name} autoComplete="name" required />
      </div>
      <div className="form__group">
        <label className="form__label screen-reader-text" htmlFor="form-email">{t.email}</label>
        <input className="form__input" id="form-email" type="email" name="email" placeholder={t.email} autoComplete="email" required />
      </div>
      <div className="form__group">
        <label className="form__label screen-reader-text" htmlFor="form-text">{t.message}</label>
        <textarea className="form__input" id="form-text" name="message" rows={10} placeholder={t.message} required />
      </div>
      <div className="form__group"><a className="button button--primary" id="contact-mail-link" href={`mailto:${email}`} onClick={event => {
        if (!form.current?.reportValidity()) { event.preventDefault(); return; }
        const values = new FormData(form.current);
        const body = [`${t.name}: ${String(values.get('name')).trim()}`, `${t.email}: ${String(values.get('email')).trim()}`, '', `${t.message}:`, String(values.get('message')).trim()].join('\n');
        event.currentTarget.href = `mailto:${email}?subject=${encodeURIComponent('Blog Contact')}&body=${encodeURIComponent(body)}`;
      }}>{t['send-message']}</a></div>
    </form>
    <hr />
  </div>;
}
