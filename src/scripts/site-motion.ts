import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reduceMotion.matches) {
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
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -5, duration: 0.32, ease: 'power3.out', overwrite: 'auto' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, duration: 0.42, ease: 'power3.out', overwrite: 'auto' });
      });
    });

    const hoverLinks = gsap.utils.toArray<HTMLElement>('.navlink, .ctalink');
    hoverLinks.forEach((link) => {
      link.addEventListener('mouseenter', () => {
        gsap.to(link, { y: -1, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
      });
      link.addEventListener('mouseleave', () => {
        gsap.to(link, { y: 0, duration: 0.28, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
