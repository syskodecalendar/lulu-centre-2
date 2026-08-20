(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const clamp = (n, a=0, b=1) => Math.min(b, Math.max(a, n));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const gsapReady = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  // Preloader
  window.addEventListener('load', () => setTimeout(() => $('#preloader')?.classList.add('is-hidden'), 350));
  setTimeout(() => $('#preloader')?.classList.add('is-hidden'), 2400);

  // Smooth scroll
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.18, smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.05 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // Header / menu
  const menu = $('#menuPanel');
  const menuBtn = $('#menuBtn');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menu?.classList.toggle('is-open', open);
    menu?.setAttribute('aria-hidden', String(!open));
    menuBtn?.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
    if (gsapReady) {
      gsap.to('.menu__bg',{scaleY:open?1:0,duration:.7,ease:'power4.inOut',transformOrigin:open?'top':'bottom'});
      gsap.to('.menu nav a',{opacity:open?1:0,y:open?0:18,stagger:open?.035:0,duration:open?.5:.2,delay:open?.22:0,ease:'power3.out'});
    }
  };
  menuBtn?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('.js-scroll').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); setMenu(false);
    const el = $(a.getAttribute('href'));
    if (!el) return;
    if (lenis) lenis.scrollTo(el,{offset:0,duration:1.5}); else el.scrollIntoView({behavior:'smooth'});
  }));

  // Custom cursor
  if (fine && !reduce) {
    const c = $('#cursor'); let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;c?.classList.add('is-visible')});
    addEventListener('mouseout',e=>{if(!e.relatedTarget)c?.classList.remove('is-visible')});
    $$('a,button,.facility-card,.metric,.why-grid article').forEach(el=>{
      el.addEventListener('mouseenter',()=>c?.classList.add('is-active'));
      el.addEventListener('mouseleave',()=>c?.classList.remove('is-active'));
    });
    const loop=()=>{cx+=(mx-cx)*.16;cy+=(my-cy)*.16;if(c){c.style.left=cx+'px';c.style.top=cy+'px'}requestAnimationFrame(loop)};loop();
  }

  // progress and section index
  const header = $('#header'), pageProgress=$('#pageProgress'), activeIndex=$('#activeIndex');
  let lastY=0;
  const updateChrome = () => {
    const y=scrollY, max=document.documentElement.scrollHeight-innerHeight;
    if(pageProgress) pageProgress.style.width=((max?y/max:0)*100)+'%';
    header?.classList.toggle('is-scrolled',y>80);
    if(y>260 && y>lastY+7 && !document.body.classList.contains('menu-open')) header?.classList.add('is-hidden');
    else if(y<lastY-4 || y<260) header?.classList.remove('is-hidden');
    lastY=y;
    let active='01';
    $$('.section-anchor').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<=innerHeight*.55&&r.bottom>=innerHeight*.35)active=el.dataset.section||active});
    if(activeIndex) activeIndex.textContent=active;
  };
  addEventListener('scroll',updateChrome,{passive:true}); updateChrome();

  // Number counters fallback/animation
  const counted=new WeakSet();
  const countUp=el=>{if(counted.has(el))return;counted.add(el);const end=Number(el.dataset.count||0);const start=performance.now();const dur=1200;const step=now=>{const p=clamp((now-start)/dur);const e=1-Math.pow(1-p,3);el.textContent=Math.round(end*e).toLocaleString('en-US');if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)};

  if (gsapReady && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t=>lenis?.raf(t*1000));
    gsap.ticker.lagSmoothing(0);

    // OPENING: hero zoom -> welcome portal expands
    const opening = gsap.timeline({scrollTrigger:{trigger:'#openingStory',start:'top top',end:'bottom bottom',scrub:1.15}});
    opening
      .to('.opening-hero__media img',{scale:1.34,yPercent:-2,ease:'none',duration:1.25},0)
      .to('.opening-hero__copy',{y:-120,scale:.9,opacity:0,ease:'power2.in',duration:.65},.35)
      .to('.scroll-hint',{opacity:0,y:20,duration:.25},.18)
      .fromTo('.opening-welcome',{clipPath:'inset(46% 45% round 32px)',scale:.62,opacity:.01},{clipPath:'inset(0% 0% round 0px)',scale:1,opacity:1,ease:'power3.inOut',duration:1},.72)
      .fromTo('.opening-welcome__media img',{scale:1.2},{scale:1.04,ease:'none',duration:1},.72)
      .fromTo('.opening-welcome__copy',{opacity:0,y:70},{opacity:1,y:0,duration:.6,ease:'power3.out'},1.08)
      .fromTo('.welcome-stats div',{opacity:0,y:25},{opacity:1,y:0,stagger:.08,duration:.45},1.22);

    // Property reveals
    gsap.utils.toArray('.reveal').forEach(el=>gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 86%',once:true}}));
    gsap.utils.toArray('.reveal-card').forEach(el=>gsap.to(el,{opacity:1,y:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
    gsap.utils.toArray('.reveal-list').forEach(list=>gsap.to([...list.children],{opacity:1,y:0,duration:.7,stagger:.08,ease:'power3.out',scrollTrigger:{trigger:list,start:'top 86%',once:true}}));
    gsap.utils.toArray('.reveal-media').forEach(wrap=>{const img=$('img',wrap);if(img)gsap.to(img,{scale:1,duration:1.25,ease:'power3.out',scrollTrigger:{trigger:wrap,start:'top 88%',once:true}})});
    $$('[data-count]').forEach(el=>ScrollTrigger.create({trigger:el,start:'top 92%',once:true,onEnter:()=>countUp(el)}));
    gsap.to('.property-orbit--1',{rotation:80,y:90,scrollTrigger:{trigger:'#property',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.to('.property-orbit--2',{rotation:-70,y:-70,scrollTrigger:{trigger:'#property',start:'top bottom',end:'bottom top',scrub:1}});

    // EXPERIENCE: cards move/depth, then WHY expands from center
    const exp=gsap.timeline({scrollTrigger:{trigger:'#experienceStory',start:'top top',end:'bottom bottom',scrub:1.1}});
    exp
      .fromTo('.exp-copy',{opacity:0,y:55},{opacity:1,y:0,duration:.35},0)
      .fromTo('.exp-card--a',{xPercent:-30,yPercent:18,rotation:-10,scale:.78},{xPercent:0,yPercent:0,rotation:-4,scale:1,duration:.55,ease:'power3.out'},0)
      .fromTo('.exp-card--b',{yPercent:40,scale:.72},{yPercent:0,scale:1,duration:.62,ease:'power3.out'},.05)
      .fromTo('.exp-card--c',{xPercent:30,yPercent:18,rotation:10,scale:.78},{xPercent:0,yPercent:0,rotation:4,scale:1,duration:.55,ease:'power3.out'},0)
      .to('.exp-cards',{scale:1.12,yPercent:-5,duration:.5,ease:'power2.in'},.62)
      .to('.exp-copy',{opacity:0,y:-55,duration:.35},.64)
      .to('.experience-panel',{opacity:.25,duration:.35},.72)
      .fromTo('.why-panel',{clipPath:'inset(50% 50% round 34px)',scale:.72,opacity:.01},{clipPath:'inset(0% 0% round 0px)',scale:1,opacity:1,duration:.75,ease:'power4.inOut'},.73)
      .fromTo('.why-panel__media img',{scale:1.22},{scale:1.04,duration:.75,ease:'none'},.73)
      .fromTo('.why-panel__inner',{opacity:0,y:50},{opacity:1,y:0,duration:.4},1.02)
      .fromTo('.why-grid article',{opacity:0,y:22},{opacity:1,y:0,stagger:.045,duration:.33},1.08);

    // Normal floor image parallax
    gsap.to('#ground .floor-media img',{yPercent:-9,ease:'none',scrollTrigger:{trigger:'#ground',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.to('#first .floor-media img',{yPercent:-9,ease:'none',scrollTrigger:{trigger:'#first',start:'top bottom',end:'bottom top',scrub:1}});

    // RETAIL STORY: three different transitions
    const retail=gsap.timeline({scrollTrigger:{trigger:'#retailStory',start:'top top',end:'bottom bottom',scrub:1.1}});
    retail
      .to('.retail-scene--hyper .retail-scene__media img',{scale:1.28,yPercent:-3,duration:1,ease:'none'},0)
      .to('.retail-scene--hyper .retail-scene__copy',{x:-60,opacity:.2,duration:.38},.62)
      .fromTo('.retail-scene--tenant',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.62,ease:'power4.inOut'},.7)
      .fromTo('.retail-scene--tenant .retail-scene__media img',{scale:1.18,xPercent:7},{scale:1.02,xPercent:0,duration:.7,ease:'none'},.7)
      .fromTo('.retail-scene--tenant .retail-scene__copy',{opacity:0,x:-70},{opacity:1,x:0,duration:.4},.96)
      .to('.retail-scene--tenant .retail-scene__copy',{opacity:.2,x:-45,duration:.35},1.55)
      .fromTo('.retail-scene--food',{clipPath:'circle(0% at 50% 50%)'},{clipPath:'circle(78% at 50% 50%)',duration:.7,ease:'power4.inOut'},1.62)
      .fromTo('.retail-scene--food .retail-scene__media img',{scale:1.34},{scale:1.04,duration:.74,ease:'none'},1.62)
      .fromTo('.retail-scene--food .retail-scene__copy',{opacity:0,y:65},{opacity:1,y:0,duration:.42},1.9)
      .to('.retail-scene--food .retail-scene__media img',{scale:1.13,duration:.55,ease:'none'},2.35);

    // Walkthrough cinematic zoom
    const walk=gsap.timeline({scrollTrigger:{trigger:'#walkthrough',start:'top top',end:'bottom bottom',scrub:1.2}});
    walk
      .fromTo('.walkthrough-media img',{scale:1.02},{scale:1.58,yPercent:-3,duration:1,ease:'none'},0)
      .fromTo('.walkthrough-ring',{scale:.7,opacity:0},{scale:1,opacity:1,duration:.35},0)
      .to('.walkthrough-ring',{scale:2.2,opacity:0,duration:.58,ease:'power2.in'},.43)
      .to('.walkthrough-copy',{scale:1.06,y:-70,opacity:0,duration:.45,ease:'power2.in'},.58)
      .to('.walkthrough-veil',{backgroundColor:'rgba(12,10,8,.76)',duration:.35},.66);

    // Rest: subtle parallax
    gsap.to('#access .access-media img',{yPercent:-7,ease:'none',scrollTrigger:{trigger:'#access',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.to('#future .future__image img',{yPercent:-8,ease:'none',scrollTrigger:{trigger:'#future',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.to('.footer__media img',{scale:1.08,ease:'none',scrollTrigger:{trigger:'#contact',start:'top bottom',end:'bottom top',scrub:1}});

    ScrollTrigger.refresh();
  } else {
    // graceful no-GSAP fallback
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity=1;e.target.style.transform='none';if(e.target.matches('[data-count]'))countUp(e.target)}}),{threshold:.12});
    $$('.reveal,.reveal-card,[data-count]').forEach(el=>io.observe(el));
  }

// Walkthrough fullscreen video
const walkthroughUrl = '';
const modal = $('#walkthroughModal');
const modalVideo = $('#walkthroughModalVideo');

$('#walkthroughBtn')?.addEventListener('click', () => {

  if (walkthroughUrl) {
    window.open(walkthroughUrl, '_blank', 'noopener');
    return;
  }

  document.body.classList.add('modal-open');
  modal?.classList.add('is-open');
  modal?.setAttribute('aria-hidden', 'false');
  lenis?.stop();

  if (!modalVideo) return;

  modalVideo.currentTime = 0;
  modalVideo.muted = false;
  modalVideo.controls = true;

  modalVideo.play().catch(() => {});

  // Chrome / Edge / Firefox
  if (modalVideo.requestFullscreen) {
    modalVideo.requestFullscreen().catch(() => {});
  }

  // Safari desktop
  else if (modalVideo.webkitRequestFullscreen) {
    modalVideo.webkitRequestFullscreen();
  }

  // iPhone / iPad Safari
  else if (modalVideo.webkitEnterFullscreen) {
    modalVideo.webkitEnterFullscreen();
  }

});


const closeModal = () => {

  if (modalVideo) {
    modalVideo.pause();
    modalVideo.currentTime = 0;
  }

  document.body.classList.remove('modal-open');
  modal?.classList.remove('is-open');
  modal?.setAttribute('aria-hidden', 'true');

  if (!document.body.classList.contains('menu-open')) {
    lenis?.start();
  }
};


$('#walkthroughClose')?.addEventListener('click', closeModal);

modal?.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    setMenu(false);
  }
});
})();
