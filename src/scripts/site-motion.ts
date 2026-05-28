import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionContext: gsap.Context | undefined;
let cleanupListeners: Array<() => void> = [];
let currentPageKey = '';

const cleanupMotion = () => {
  cleanupListeners.forEach((cleanup) => cleanup());
  cleanupListeners = [];
  motionContext?.revert();
  motionContext = undefined;
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

const addHoverTween = (element: HTMLElement, enterVars: gsap.TweenVars, leaveVars: gsap.TweenVars) => {
  const onEnter = () => gsap.to(element, enterVars);
  const onLeave = () => gsap.to(element, leaveVars);

  element.addEventListener('mouseenter', onEnter);
  element.addEventListener('mouseleave', onLeave);
  cleanupListeners.push(() => {
    element.removeEventListener('mouseenter', onEnter);
    element.removeEventListener('mouseleave', onLeave);
  });
};

const initMotion = () => {
  const pageKey = `${window.location.pathname}${window.location.search}`;
  if (currentPageKey === pageKey && motionContext) {
    return;
  }

  currentPageKey = pageKey;
  cleanupMotion();

  if (reduceMotion.matches) {
    return;
  }

  motionContext = gsap.context(() => {
    gsap.fromTo(
      '#main-content',
      { autoAlpha: 0.92, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        clearProps: 'opacity,visibility,transform',
        duration: 0.38,
        ease: 'power3.out',
      },
    );

  const firstReadSelectors = [
    '.nav',
    '.copysection.projectcopy .subline.homesub',
    '.copysection.projectcopy .mainline.smallhomesection',
    '.copysection.projectcopy .splitpara',
    '.aboutintro.hp.herohp > *',
    '.homecontainer > *:first-child',
    '.heading-3.topheader',
    '.heading-4',
  ];

  const firstReadElements = gsap.utils.toArray<HTMLElement>(firstReadSelectors.join(', '));

  if (firstReadElements.length) {
    gsap.set(firstReadElements, { autoAlpha: 0, y: 14 });
    gsap.to(firstReadElements, {
      autoAlpha: 1,
      y: 0,
      clearProps: 'opacity,visibility,transform',
      delay: 0.04,
      duration: 0.72,
      ease: 'power3.out',
      stagger: 0.055,
    });
  }

  const revealElements = gsap.utils
    .toArray<HTMLElement>(
      [
        '.projectblock',
        '.projectblocklink',
        '.smallproject',
        '.writingblocks',
        '.projectimg',
        '.projectimg-copy',
        '.projectimg-copy-copy',
        '.posttext > *',
        '.paragraph-4',
        '.paragraph-5',
        '.div-block-31',
      ].join(', '),
    )
    .filter((element) => !firstReadElements.includes(element));

  if (revealElements.length) {
    gsap.set(revealElements, { autoAlpha: 0, y: 22 });
    ScrollTrigger.batch(revealElements, {
      once: true,
      start: 'top 88%',
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          clearProps: 'opacity,visibility,transform',
          duration: 0.68,
          ease: 'power3.out',
          stagger: 0.045,
        });
      },
    });
  }

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const hoverCards = gsap.utils.toArray<HTMLElement>('.projectblocklink, .smallproject, .writingblocks');
    hoverCards.forEach((card) => {
      addHoverTween(
        card,
        { y: -5, duration: 0.32, ease: 'power3.out', overwrite: 'auto' },
        { y: 0, duration: 0.42, ease: 'power3.out', overwrite: 'auto' },
      );
    });

    const hoverLinks = gsap.utils.toArray<HTMLElement>('.navlink, .ctalink');
    hoverLinks.forEach((link) => {
      addHoverTween(
        link,
        { y: -1, duration: 0.22, ease: 'power2.out', overwrite: 'auto' },
        { y: 0, duration: 0.28, ease: 'power2.out', overwrite: 'auto' },
      );
    });
  }

    requestAnimationFrame(() => ScrollTrigger.refresh());
  });
};

document.addEventListener('astro:before-swap', cleanupMotion);
document.addEventListener('astro:page-load', initMotion);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotion, { once: true });
} else {
  initMotion();
}
