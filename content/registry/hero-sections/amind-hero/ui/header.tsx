import React from 'react';
export function Header() {
  const navItems = [
  {
    label: 'What',
    dot: '#FF5924'
  },
  {
    label: 'Why',
    dot: '#F5B700'
  },
  {
    label: 'How',
    dot: '#FF4FA3'
  },
  {
    label: "What's New",
    dot: '#34C759'
  }];

  return (
    <header className="amind-fade amind-d1 absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <a
          href="#"
          className="flex items-center gap-2"
          aria-label="mymind home">
          
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            aria-hidden="true">
            
            <circle
              cx="13"
              cy="13"
              r="11.5"
              stroke="#1a1a1a"
              strokeWidth="1.8" />
            
            <circle cx="10" cy="10.5" r="1.4" fill="#1a1a1a" />
            <path
              d="M14 16.5c1.8 0 3.2-1.1 3.6-2.6"
              stroke="#1a1a1a"
              strokeWidth="1.6"
              strokeLinecap="round" />
            
          </svg>
          <span className="text-lg font-bold tracking-tight text-[#1a1a1a]">
            mymind<sup className="text-[10px] font-medium">®</sup>
          </span>
        </a>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Main navigation">
          
          {navItems.map((item) =>
          <a
            key={item.label}
            href="#"
            className="flex items-center gap-1.5 text-[15px] font-medium text-gray-700 transition-colors hover:text-gray-950">
            
              <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: item.dot
              }}
              aria-hidden="true" />
            
              {item.label}
            </a>
          )}
        </nav>

        <div className="flex items-center gap-5">
          <a
            href="#"
            className="text-[15px] font-medium text-gray-700 transition-colors hover:text-gray-950">
            
            Log in
          </a>
          <a
            href="#"
            className="rounded-full bg-[#FF5924] px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition-transform hover:scale-105">
            
            Sign up
          </a>
        </div>
      </div>
    </header>);

}