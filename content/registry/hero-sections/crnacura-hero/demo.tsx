'use client';

/**
 * 3D Letters Menu Hover — React Component
 * Drop this into any React / Next.js project.
 * Peer deps: gsap, splitting
 *
 * Usage:
 *   import MenuHover from './demo';
 *   <MenuHover />
 *
 * To customise items pass the `items` prop:
 *   <MenuHover items={[{ label: 'Studio', img: '/img/1.jpg' }, ...]} />
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import 'splitting/dist/splitting.css';
import 'splitting/dist/splitting-cells.css';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
  label: string;
  img: string;
}

interface MenuHoverProps {
  items?: MenuItem[];
}

// ─── Default menu data ────────────────────────────────────────────────────────

const DEFAULT_ITEMS: MenuItem[] = [
  { label: 'Gotiva',  img: 'https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876069/5_bgrt7d.jpg' },
  { label: 'Hava',   img: 'https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876068/2_jogaln.jpg' },
  { label: 'Sikter', img: 'https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876068/3_bbhxhv.jpg' },
  { label: 'Valo',   img: 'https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876069/4_ukbrmy.jpg' },
  { label: 'Opanci', img: 'https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876068/1_dkcyis.jpg' },
  { label: 'Insan',  img: 'https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876069/6_bg6zv6.jpg' },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

const lerp  = (a: number, b: number, n: number) => (1 - n) * a + n * b;
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
const map   = (x: number, a: number, b: number, c: number, d: number) =>
  ((x - a) * (d - c)) / (b - a) + c;

// ─── Component ────────────────────────────────────────────────────────────────

export default function MenuHover({ items = DEFAULT_ITEMS }: MenuHoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef  = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const initTokenRef = useRef(0);

  useEffect(() => {
    const initToken = ++initTokenRef.current;
    const menuRootEl = menuRef.current;
    let disposed = false;

    // Dynamically import Splitting so it only runs client-side
    import('splitting').then(({ default: Splitting }) => {
      if (disposed || initToken !== initTokenRef.current) return;

      const menuEl = menuRef.current;
      if (!menuEl) return;

      menuEl.querySelectorAll<HTMLElement>('[data-splitting]').forEach((el) => {
        if (el.dataset.splittingDone) return;
        Splitting({ target: el });
        el.dataset.splittingDone = 'true';
      });

      init(initToken);
    });

    // ── Shared mouse state ──────────────────────────────────────────────────
    let mousePos      = { x: 0, y: 0 };
    let mousePosCache = { x: 0, y: 0 };
    let cursorDirection = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Custom cursor ───────────────────────────────────────────────────────
    const cursorEl = cursorRef.current;
    let cursorRAF: number;

    interface CursorState {
      tx: { previous: number; current: number; amt: number };
      ty: { previous: number; current: number; amt: number };
      scale: { previous: number; current: number; amt: number };
      opacity: { previous: number; current: number; amt: number };
    }

    const cursorState: CursorState = {
      tx:      { previous: 0, current: 0, amt: 0.15 },
      ty:      { previous: 0, current: 0, amt: 0.15 },
      scale:   { previous: 1, current: 1, amt: 0.15 },
      opacity: { previous: 1, current: 1, amt: 0.10 },
    };

    const renderCursor = () => {
      if (!cursorEl) return;
      cursorState.tx.current = mousePos.x - cursorEl.offsetWidth  / 2;
      cursorState.ty.current = mousePos.y - cursorEl.offsetHeight / 2;

      (Object.keys(cursorState) as Array<keyof CursorState>).forEach(key => {
        cursorState[key].previous = lerp(
          cursorState[key].previous,
          cursorState[key].current,
          cursorState[key].amt,
        );
      });

      cursorEl.style.transform = `translate(${cursorState.tx.previous}px, ${cursorState.ty.previous}px) scale(${cursorState.scale.previous})`;
      cursorEl.style.opacity   = String(cursorState.opacity.previous);
      cursorRAF = requestAnimationFrame(renderCursor);
    };

    const onFirstMove = () => {
      if (!cursorEl) return;
      cursorState.tx.previous = cursorState.tx.current = mousePos.x - cursorEl.offsetWidth  / 2;
      cursorState.ty.previous = cursorState.ty.current = mousePos.y - cursorEl.offsetHeight / 2;
      gsap.to(cursorEl, { duration: 0.9, ease: 'power3.out', opacity: 1 });
      cursorRAF = requestAnimationFrame(renderCursor);
      window.removeEventListener('mousemove', onFirstMove);
    };
    window.addEventListener('mousemove', onFirstMove);

    const cursorEnter = () => {
      cursorState.scale.current   = 2.5;
      cursorState.opacity.current = 0.5;
    };
    const cursorLeave = () => {
      cursorState.scale.current   = 1;
      cursorState.opacity.current = 1;
    };

    // ── Menu initialisation ─────────────────────────────────────────────────
    const menuItemCleanups: Array<() => void> = [];

    function init(token: number) {
      if (disposed || token !== initTokenRef.current) return;

      const menuEl = menuRef.current;
      if (!menuEl) return;

      const menuItemEls = Array.from(menuEl.querySelectorAll<HTMLElement>('.menu__item'));
      const totalItems  = menuItemEls.length;

      menuItemEls.forEach((el) => {
        el.querySelectorAll('.hover-reveal').forEach((node) => node.remove());
        el.querySelectorAll('.word--clone').forEach((node) => node.remove());
      });

      // Entrance animation
      const innerTexts = menuItemEls.map(el => el.querySelector<HTMLElement>('.menu__item-text')!);
      gsap.timeline()
        .set(innerTexts, { x: '20%', opacity: 0 })
        .to(innerTexts, { duration: 1, ease: 'power3', x: '0%', stagger: 0.05 })
        .to(innerTexts, { duration: 0.4, ease: 'power1', opacity: 1, stagger: 0.05 }, 0);

      // Animatable property template
      const makeProps = () => ({
        tx:         { previous: 0, current: 0, amt: 0.15 },
        ty:         { previous: 0, current: 0, amt: 0.15 },
        rotation:   { previous: 0, current: 0, amt: 0.15 },
        brightness: { previous: 1, current: 1, amt: 0.06 },
      });

      menuItemEls.forEach((el, idx) => {
        if (disposed || token !== initTokenRef.current) return;

        const itemData = items[idx];
        if (!itemData) return;

        if (el.querySelector('.hover-reveal')) return;

        const props    = makeProps();

        // ── Build reveal image DOM ──────────────────────────────────────────
        const reveal      = document.createElement('div');
        const revealInner = document.createElement('div');
        const revealImg   = document.createElement('div');

        reveal.className      = 'hover-reveal';
        revealInner.className = 'hover-reveal__inner';
        revealImg.className   = 'hover-reveal__img';

        reveal.style.transformOrigin     = '0% 0%';
        revealImg.style.backgroundImage  = `url(${itemData.img})`;

        revealInner.appendChild(revealImg);
        reveal.appendChild(revealInner);
        el.appendChild(reveal);

        // ── Splitting chars ─────────────────────────────────────────────────
        const textInner   = el.querySelector<HTMLElement>('.menu__item-text')!;
        const word        = textInner.querySelector<HTMLElement>('.word')!;
        const wordClone   = word.cloneNode(true) as HTMLElement;
        wordClone.classList.add('word--clone');
        textInner.appendChild(wordClone);

        const titleChars      = Array.from(word.querySelectorAll<HTMLElement>('span.char'));
        const titleCloneChars = Array.from(wordClone.querySelectorAll<HTMLElement>('span.char'));

        // ── Bounds ──────────────────────────────────────────────────────────
        let bounds = { el: el.getBoundingClientRect(), width: reveal.offsetWidth, height: reveal.offsetHeight };
        const calcBounds = () => {
          bounds = { el: el.getBoundingClientRect(), width: reveal.offsetWidth, height: reveal.offsetHeight };
        };

        // ── GSAP timelines ──────────────────────────────────────────────────
        let tl: gsap.core.Timeline | null = null;
        let charsTl: gsap.core.Timeline | null = null;
        let rafId: number | undefined;
        let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
        let firstRAFCycle = false;
        let isHovered = false;

        const animateCharsIn = () => {
          charsTl?.kill();
          charsTl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2', stagger: 0.025 } })
            .to(titleChars, { y: '100%', rotationX: -90, opacity: 0 })
            .to(titleCloneChars, { startAt: { y: '-100%', rotationX: 90, opacity: 0 }, y: '0%', rotationX: 0, opacity: 1 }, 0);
        };

        const animateCharsOut = () => {
          charsTl?.kill();
          charsTl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2', stagger: 0.025 } })
            .to(titleCloneChars, { y: '-100%', rotationX: 90, opacity: 0 })
            .to(titleChars, { startAt: { y: '100%', rotationX: -90, opacity: 0 }, y: '0%', rotationX: 0, opacity: 1 }, 0);
        };

        const showImage = () => {
          tl?.kill();
          tl = gsap.timeline({
            onStart: () => {
              gsap.set([reveal, revealInner], { opacity: 1 });
              gsap.set(el, { zIndex: totalItems });
            },
          })
            .to(revealInner, { duration: 1.3, ease: 'expo', startAt: { scale: 0.5 }, scale: 1 })
            .to(revealImg,   { duration: 1.3, ease: 'expo', startAt: { scaleX: 2 },  scaleX: 1 }, 0)
            .to(reveal,      { duration: 0.6, ease: 'power1.inOut' }, 0);
        };

        const hideImage = () => {
          tl?.kill();
          tl = gsap.timeline({
            defaults: { duration: 1.2, ease: 'power1' },
            onStart:    () => { gsap.set(el, { zIndex: 1 }); },
            onComplete: () => { gsap.set(reveal, { opacity: 0 }); },
          })
            .to(revealInner, { opacity: 0 })
            .to(revealImg,   { scaleX: 1.7 }, 0)
            .to(reveal,      { rotation: cursorDirection.x < 0 ? '+=5' : '-=5', y: '200%' }, 0);
        };

        // ── rAF render loop ─────────────────────────────────────────────────
        const loopRender = () => {
          if (!rafId) rafId = requestAnimationFrame(render);
        };
        const stopRendering = () => {
          if (rafId) { cancelAnimationFrame(rafId); rafId = undefined; }
        };

        const render = () => {
          rafId = undefined;

          const mouseDistanceX = clamp(Math.abs(mousePosCache.x - mousePos.x), 0, 100);
          cursorDirection = { x: mousePosCache.x - mousePos.x, y: mousePosCache.y - mousePos.y };
          mousePosCache   = { ...mousePos };

          const startingAngle = -30;

          // top-right corner of the reveal always tracks the cursor
          // (in the original, isPositionOdd was never assigned so always falsy)
          props.tx.current = Math.abs(mousePos.x - bounds.el.left) - bounds.width;

          props.ty.current = firstRAFCycle
            ? bounds.height / 1.5
            : Math.abs(mousePos.y - bounds.el.top);

          props.rotation.current = firstRAFCycle
            ? startingAngle
            : map(mouseDistanceX, 0, 300, startingAngle,
                cursorDirection.x < 0 ? startingAngle + 100 : startingAngle - 100);

          props.brightness.current = firstRAFCycle ? 1 : map(mouseDistanceX, 0, 100, 1, 5);

          props.tx.previous         = firstRAFCycle ? props.tx.current         : lerp(props.tx.previous,         props.tx.current,         props.tx.amt);
          props.ty.previous         = firstRAFCycle ? props.ty.current         : lerp(props.ty.previous,         props.ty.current,         props.ty.amt);
          props.rotation.previous   = firstRAFCycle ? props.rotation.current   : lerp(props.rotation.previous,   props.rotation.current,   props.rotation.amt);
          props.brightness.previous = firstRAFCycle ? props.brightness.current : lerp(props.brightness.previous, props.brightness.current, props.brightness.amt);

          gsap.set(reveal, {
            x:        props.tx.previous,
            y:        props.ty.previous,
            rotation: props.rotation.previous,
          });

          firstRAFCycle = false;
          loopRender();
        };

        // ── Event handlers ──────────────────────────────────────────────────
        const onMouseEnter = () => {
          hoverTimeout = setTimeout(() => {
            if (disposed || token !== initTokenRef.current) return;

            menuItemEls.forEach((other) => {
              if (other === el) return;
              other.querySelectorAll<HTMLElement>('.hover-reveal').forEach((reveal) => {
                gsap.killTweensOf(reveal);
                gsap.set(reveal, { opacity: 0, x: 0, y: 0, rotation: 0 });
              });
              gsap.set(other, { zIndex: 1 });
            });

            isHovered = true;
            firstRAFCycle = true;
            calcBounds();
            reveal.style.transformOrigin = '100% 0%';
            animateCharsIn();
            showImage();
            loopRender();
          }, 100);
        };

        const onMouseLeave = () => {
          if (hoverTimeout) clearTimeout(hoverTimeout);
          if (isHovered) {
            isHovered = false;
            stopRendering();
            animateCharsOut();
            hideImage();
          }
        };

        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseenter', cursorEnter);
        el.addEventListener('mouseleave', cursorLeave);

        menuItemCleanups.push(() => {
          el.removeEventListener('mouseenter', onMouseEnter);
          el.removeEventListener('mouseleave', onMouseLeave);
          el.removeEventListener('mouseenter', cursorEnter);
          el.removeEventListener('mouseleave', cursorLeave);
          stopRendering();
          tl?.kill();
          charsTl?.kill();
          if (hoverTimeout) clearTimeout(hoverTimeout);
          // Remove injected DOM
          if (reveal.parentNode) reveal.parentNode.removeChild(reveal);
          if (wordClone.parentNode) wordClone.parentNode.removeChild(wordClone);
        });
      });

      // links cursor
      document.querySelectorAll('a').forEach(a => {
        a.addEventListener('mouseenter', cursorEnter);
        a.addEventListener('mouseleave', cursorLeave);
      });
    }

    // ── Preload images then init ────────────────────────────────────────────
    // Simple promise-based image preloader (no imagesloaded dep needed)
    const preload = (imgs: string[]) =>
      Promise.all(imgs.map(src => new Promise<void>(res => {
        const img = new Image();
        img.onload = img.onerror = () => res();
        img.src = src;
      })));

    preload(items.map(i => i.img)).then(() => {
      rootRef.current?.classList.remove('loading');
    });

    // ── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      disposed = true;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousemove', onFirstMove);
      cancelAnimationFrame(cursorRAF);
      menuItemCleanups.forEach(fn => fn());
      menuItemCleanups.length = 0;

      menuRootEl?.querySelectorAll('[data-splitting]').forEach((el) => {
        delete (el as HTMLElement).dataset.splittingDone;
      });
    };
  }, [items]);

  return (
    <div
      ref={rootRef}
      className="crnacura-hero loading"
      style={{
        background: "#f7f5f0",
        color: "#111111",
        minHeight: "100%",
        height: "100%",
        position: "relative",
        isolation: "isolate",
        fontFamily: "roc-grotesk, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @import url("https://use.typekit.net/pkk0kuo.css");

        .crnacura-hero,
        [data-theme="dark"] .crnacura-hero,
        [data-theme="light"] .crnacura-hero {
          background: #f7f5f0;
          color: #111111;
        }

        .crnacura-hero {
          font-size: 20px;
          overflow: hidden;
        }

        .crnacura-hero__main {
          height: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #f7f5f0;
          position: relative;
        }

        .crnacura-hero.loading::before,
        .crnacura-hero.loading::after {
          content: '';
          position: fixed;
          z-index: 1000;
        }
        .crnacura-hero.loading::before {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #f7f5f0;
        }
        .crnacura-hero.loading::after {
          top: 50%;
          left: 50%;
          width: 60px;
          height: 60px;
          margin: -30px 0 0 -30px;
          opacity: 0.4;
          background: #ccc0a2;
          animation: crnacura-loader 0.7s linear infinite alternate forwards;
        }
        @keyframes crnacura-loader {
          to { opacity: 1; transform: scale3d(0.5, 0.5, 1); }
        }

        .crnacura-hero a {
          text-decoration: none;
          color: #ccc0a2;
          outline: none;
          position: relative;
        }
        .crnacura-hero a:hover { color: #000000; outline: none; }
        .crnacura-hero a:focus { outline: none; background: lightgrey; }
        .crnacura-hero a:focus:not(:focus-visible) { background: transparent; }
        .crnacura-hero a:focus-visible { outline: 2px solid red; background: transparent; }

        .crnacura-hero__cursor { display: none; }

        .crnacura-hero__logo {
          position: fixed;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: none;
        }
        .crnacura-hero__logo img {
          display: block;
          height: 40px;
          width: auto;
        }

        .crnacura-hero .menu {
          padding: 2rem 1rem 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          user-select: none;
          -webkit-user-select: none;
          counter-reset: menucounter;
          z-index: 100;
        }
        .crnacura-hero .menu__item {
          margin-bottom: 1rem;
          font-family: kudryashev-d-contrast-sans, sans-serif;
          text-transform: uppercase;
          cursor: pointer;
          color: #000000;
          will-change: transform;
        }
        .crnacura-hero .menu__item::before {
          counter-increment: menucounter;
          content: counters(menucounter, ".", decimal-leading-zero);
          position: absolute;
          left: 0;
          top: 0;
          color: #ccc0a2;
          z-index: -1;
          line-height: 1;
        }
        .crnacura-hero .menu__item-text {
          pointer-events: none;
          display: block;
          line-height: 1;
          position: relative;
          z-index: -1;
          font-size: 2rem;
        }
        .crnacura-hero .menu__item-text .word {
          padding: 0 1.25rem;
          overflow: hidden;
          perspective: 1000px;
          perspective-origin: -150% 50%;
        }
        .crnacura-hero .menu__item-text .word--clone {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        .crnacura-hero .menu__item-text .word--clone .char { opacity: 0; }
        .crnacura-hero .menu__item-text .char {
          transform-origin: 0% 0%;
          will-change: transform;
        }

        [data-theme="dark"] .crnacura-hero .menu__item,
        [data-theme="light"] .crnacura-hero .menu__item {
          color: #000000;
        }

        .crnacura-hero .hover-reveal {
          position: absolute;
          z-index: -1;
          width: 350px;
          height: 450px;
          top: 0;
          left: 0;
          pointer-events: none;
          opacity: 0;
          will-change: transform, filter;
        }
        .crnacura-hero .hover-reveal__inner {
          overflow: hidden;
          will-change: transform, opacity;
        }
        .crnacura-hero .hover-reveal__inner,
        .crnacura-hero .hover-reveal__img {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .crnacura-hero .hover-reveal__img {
          background-size: cover;
          background-position: 50% 50%;
          will-change: transform;
        }

        .crnacura-hero .content {
          position: relative;
          width: min(42rem, 88vw);
          max-width: 42rem;
          margin: 0 auto;
          padding: 0 1.5rem;
          z-index: 3;
          text-align: center;
          font-size: 1.125rem;
          line-height: 1.65;
          color: #111111;
          background: #f7f5f0;
        }

        [data-theme="dark"] .crnacura-hero .content,
        [data-theme="light"] .crnacura-hero .content {
          color: #111111;
          background: #f7f5f0;
        }

        .crnacura-hero__bottom {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          padding: 0 0 8vh;
          background: #f7f5f0;
        }

        [data-theme="dark"] .crnacura-hero__bottom,
        [data-theme="light"] .crnacura-hero__bottom {
          background: #f7f5f0;
        }

        .crnacura-hero__bottom-fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 100%;
          height: 28vh;
          background: linear-gradient(to bottom, rgba(247, 245, 240, 0) 0%, #f7f5f0 100%);
          pointer-events: none;
        }

        @media screen and (min-width: 53em) {
          .crnacura-hero__logo { top: 2.5rem; }
          .crnacura-hero__logo img { height: 52px; }
          .crnacura-hero .menu { padding: 21vh 1rem 3rem; }
          .crnacura-hero .menu__item::before { left: 1vw; top: 0.25vw; }
          .crnacura-hero .menu__item-text { font-size: 7.5vw; }
          .crnacura-hero .menu__item-text .word { padding: 0 3vw; }
        }

        @media (any-pointer: fine) {
          .crnacura-hero__cursor {
            position: fixed;
            top: 0;
            left: 0;
            display: block;
            pointer-events: none;
            z-index: 1001;
          }
          .crnacura-hero__cursor-inner {
            fill: #e0530e;
            stroke: none;
            stroke-width: 1px;
            opacity: 0.7;
          }
        }
      `}</style>

      <div ref={cursorRef} className="crnacura-hero__cursor" style={{ opacity: 0 }}>
        <svg className="crnacura-hero__cursor-inner" width="25" height="25" viewBox="0 0 25 25">
          <circle cx="12.5" cy="12.5" r="12.5" />
        </svg>
      </div>

      <main className="crnacura-hero__main">
        <div className="crnacura-hero__logo">
          <img
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781877270/zepalogo1_bnzxuc.png"
            alt="Zepa"
            draggable={false}
          />
        </div>

        <nav ref={menuRef} className="menu">
          {items.map((item, i) => (
            <a key={i} className="menu__item" data-img={item.img}>
              <span className="menu__item-text" data-splitting>
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        <div className="crnacura-hero__bottom">
          <div className="crnacura-hero__bottom-fade" aria-hidden="true" />
          <p className="content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </p>
        </div>
      </main>
    </div>
  );
}
