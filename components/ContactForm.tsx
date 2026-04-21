'use client';
import { useEffect, useRef, useState } from 'react';
import { useT } from './LangProvider';

const MIN_SENDING_MS = 1200;
const FLY_OUT_MS = 600;
const SENT_HOLD_MS = 2500;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ContactForm({ id }: { id: string }) {
  const { t, lang } = useT();
  const formRef = useRef<HTMLFormElement>(null);
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'fly-out' | 'sent' | 'error'>('idle');

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const safeSet = (s: typeof state) => {
    if (mountedRef.current) setState(s);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state !== 'idle') return;
    const form = formRef.current!;
    const data = new FormData(form);
    setState('sending');

    const started = Date.now();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          lang,
        }),
        signal: ctrl.signal,
      });

      const elapsed = Date.now() - started;
      if (elapsed < MIN_SENDING_MS) await wait(MIN_SENDING_MS - elapsed);
      if (!mountedRef.current) return;
      if (!res.ok) throw new Error('send_failed');

      safeSet('fly-out');
      await wait(FLY_OUT_MS);
      if (!mountedRef.current) return;
      safeSet('sent');
      await wait(SENT_HOLD_MS);
      if (!mountedRef.current) return;
      form.reset();
      safeSet('idle');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      safeSet('error');
      await wait(3000);
      if (!mountedRef.current) return;
      safeSet('idle');
    }
  };

  const btnClass = `btn btn-primary w-100 btn-submit-animate${
    state === 'sending' ? ' sending' : state === 'fly-out' ? ' fly-out' : state === 'sent' ? ' sent' : ''
  }`;

  const btnLabel =
    state === 'sent' ? t('btn-submit-sent') :
    state === 'error' ? t('btn-submit-error') :
    t('btn-submit');

  return (
    <form ref={formRef} id={id} className="inline-form" onSubmit={onSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor={`${id}-name`}>{t('label-name')}</label>
          <input id={`${id}-name`} type="text" name="name" placeholder={t('placeholder-name')} required />
        </div>
        <div className="form-group">
          <label htmlFor={`${id}-email`}>{t('label-email')}</label>
          <input id={`${id}-email`} type="email" name="email" placeholder={t('placeholder-email')} required />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor={`${id}-message`}>{t('label-help')}</label>
        <textarea id={`${id}-message`} name="message" rows={4} placeholder={t('placeholder-help')} required />
      </div>
      <button type="submit" className={btnClass} disabled={state !== 'idle'}>
        <span className="btn-text">{btnLabel}</span>
        <svg className="icon-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        <svg className="icon-plane" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" transform="rotate(90 12 12)" /></svg>
        <div className="wind-lines"><span></span><span></span><span></span></div>
      </button>
    </form>
  );
}
