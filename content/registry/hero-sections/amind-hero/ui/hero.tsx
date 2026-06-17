import React from 'react';
const bubbles: Record<string, string> = {
  notes: '#FF5924',
  bookmarks: '#FF4FA3',
  inspiration: '#2D9CDB',
  articles: '#EB5757',
  images: '#F5B700'
};
function Bubble({ word }: {word: string;}) {
  const color = bubbles[word];
  return (
    <span
      className="inline-block rounded-full border bg-white/70 px-4 py-1 text-[17px] font-medium leading-tight"
      style={{
        borderColor: color,
        color
      }}>
      
      {word}
    </span>);

}
function AppStoreIcon() {
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D96F6]"
      aria-hidden="true">
      
      <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
        <path d="M12.7 5.2l.9-1.6a.7.7 0 00-1.2-.7l-.9 1.6-.9-1.6a.7.7 0 10-1.2.7l5 8.7H10l-3.4 6a.7.7 0 001.2.7l.9-1.5h6.6l.9 1.5a.7.7 0 001.2-.7l-1.6-2.8h2.5a.7.7 0 000-1.4h-3.3l-3.5-6 1.2-2.2zM6.2 12.3H4.7a.7.7 0 000 1.4h.7l.8-1.4z" />
      </svg>
    </span>);

}
function ChromeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#fff" />
      <path
        d="M12 2a10 10 0 018.66 5H12a5 5 0 00-4.55 2.94L4.1 5.13A10 10 0 0112 2z"
        fill="#EA4335" />
      
      <path
        d="M21.95 11A10 10 0 0112.4 22l4.13-7.15A5 5 0 0017 12c0-1.06-.33-2.05-.9-2.86h5.56c.19.6.29 1.22.29 1.86z"
        fill="#FBBC05"
        transform="rotate(120 12 12)" />
      
      <path
        d="M12 22a10 10 0 01-7.9-16.87l3.35 4.81A5 5 0 0012 17l-2.4 4.7c.78.2 1.58.3 2.4.3z"
        fill="#34A853" />
      
      <circle cx="12" cy="12" r="4" fill="#fff" />
      <circle cx="12" cy="12" r="3.2" fill="#4285F4" />
    </svg>);

}
function PlayStoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 3.5v17l9-8.5-9-8.5z" fill="#00C4FF" />
      <path
        d="M4 3.5l9 8.5 3.5-3.3L5.6 3.2A1.5 1.5 0 004 3.5z"
        fill="#00E676" />
      
      <path d="M4 20.5c.4.4 1 .5 1.6.2l10.9-5.5L13 12l-9 8.5z" fill="#FF3D00" />
      <path
        d="M16.5 8.7L13 12l3.5 3.3 3-1.5c1.1-.6 1.1-2 0-2.6l-3-1.5z"
        fill="#FFC107" />
      
    </svg>);

}
const appButtons = [
{
  label: 'iPhone app',
  icon: <AppStoreIcon />
},
{
  label: 'Browser Extension',
  icon: <ChromeIcon />
},
{
  label: 'Android app',
  icon: <PlayStoreIcon />
}];

export function Hero() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-4 pt-28 pb-10 text-center md:pt-36">
      <h1 className="amind-blur-rise amind-d2 font-serif-display mx-auto text-[clamp(3.4rem,10vw,8.75rem)] font-normal leading-[0.85] tracking-[-0.03em] text-black">
        Remember everything.
        <br />
        Organize nothing.
      </h1>

      <p className="amind-rise amind-d4 mx-auto mt-14 max-w-xl text-[17px] leading-loose text-gray-800">
        <span className="mr-1">All your</span> <Bubble word="notes" />{' '}
        <Bubble word="bookmarks" /> <Bubble word="inspiration" />{' '}
        <Bubble word="articles" /> <span className="mx-1">and</span>{' '}
        <Bubble word="images" />{' '}
        <span className="ml-1">in one single, private place.</span>
      </p>

      <div className="amind-rise amind-d5 mt-20 flex flex-wrap items-center justify-center gap-4">
        {appButtons.map((btn) =>
        <a
          key={btn.label}
          href="#"
          className="flex items-center gap-2.5 rounded-full border border-gray-200/80 bg-[#F2F4F7]/90 px-6 py-3.5 text-[15px] font-medium text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          
            {btn.icon}
            {btn.label}
          </a>
        )}
      </div>
    </section>);

}