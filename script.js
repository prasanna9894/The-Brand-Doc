(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const valueCards = [...document.querySelectorAll('.value-card')];
  const strengthCard = document.querySelector('.strength-card');
  const replayRevealItems = [...valueCards, ...(strengthCard ? [strengthCard] : [])];
  const revealItems = [...document.querySelectorAll('.reveal')]
    .filter(item => !replayRevealItems.includes(item));
  const funnelSegments = [...document.querySelectorAll('.funnel-segment')];
  const serviceTrack = document.querySelector('.services-track');
  const serviceStage = document.querySelector('.services-stage');
  const serviceCards = [...document.querySelectorAll('.service-card')];
  const progressBar = document.querySelector('.service-progress span');
  const heroContent = document.querySelector('.hero-scroll-content');
  const siteNav = document.querySelector('.site-nav');
  const parallaxItems = [...document.querySelectorAll('.founder-art, .founder-info')];
  const pinSections = [...document.querySelectorAll('.audience, .testimonials')];
  const hero = document.querySelector('.hero');
  const heroOrbits = [...document.querySelectorAll('.hero-orbit')];
  const contactFormDialog = document.querySelector('#contact-form-dialog');
  const contactFormTrigger = document.querySelector('.nav-cta');
  const contactFormClose = document.querySelector('.contact-form-close');

  let funnelRevealTimers = [];
  const resetFunnelSegments = () => {
    funnelRevealTimers.forEach(timer => window.clearTimeout(timer));
    funnelRevealTimers = [];
    funnelSegments.forEach(segment => segment.classList.remove('is-visible'));
  };

  const revealFunnelSegments = delay => {
    resetFunnelSegments();
    funnelSegments.forEach((segment,index) => {
      const timer = window.setTimeout(() => segment.classList.add('is-visible'), index * delay);
      funnelRevealTimers.push(timer);
    });
  };

  const observeFunnelSegments = delay => {
    const funnel = document.querySelector('.funnel-svg');
    if (!funnel || !('IntersectionObserver' in window)) {
      revealFunnelSegments(delay);
      return;
    }

    let isVisible = false;
    const funnelObserver = new IntersectionObserver(entries => {
      const isIntersecting = entries.some(entry => entry.isIntersecting);
      if (isIntersecting && !isVisible) revealFunnelSegments(delay);
      if (!isIntersecting && isVisible) resetFunnelSegments();
      isVisible = isIntersecting;
    }, {threshold:.2});
    funnelObserver.observe(funnel);
  };

  const observeRevealGroup = (trigger, items, delay) => {
    if (!trigger || !items.length) return;

    let timers = [];
    let isVisible = false;
    const reset = () => {
      timers.forEach(timer => window.clearTimeout(timer));
      timers = [];
      items.forEach(item => item.classList.remove('is-visible'));
    };
    const reveal = () => {
      reset();
      items.forEach((item,index) => {
        timers.push(window.setTimeout(() => item.classList.add('is-visible'), index * delay));
      });
    };

    if (!('IntersectionObserver' in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(entries => {
      const isIntersecting = entries.some(entry => entry.isIntersecting);
      if (isIntersecting && !isVisible) reveal();
      if (!isIntersecting && isVisible) reset();
      isVisible = isIntersecting;
    }, {threshold:.14, rootMargin:'0px 0px -5% 0px'});
    observer.observe(trigger);
  };

  if (contactFormDialog && contactFormTrigger && contactFormClose) {
    contactFormTrigger.addEventListener('click', () => contactFormDialog.showModal());
    contactFormClose.addEventListener('click', () => contactFormDialog.close());
    contactFormDialog.addEventListener('click', event => {
      if (event.target === contactFormDialog) contactFormDialog.close();
    });
  }

  const mobileNav = document.querySelector('.mobile-nav');
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { mobileNav.open = false; });
    });
  }

  const updateNav = () => {
    if (siteNav) siteNav.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  const updatePinnedSections = () => {
    pinSections.forEach(section => {
      const stage = section.querySelector('.wrap');
      if (!stage) return;
      const items = [...section.querySelectorAll('.pin-item')];
      const progressFill = section.querySelector('.pin-progress-fill');
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const isOnScreen = rect.top < window.innerHeight && rect.bottom > 0;
      const revealCount = Math.min(items.length, Math.ceil(progress * items.length));
      const visibleCount = isOnScreen ? Math.max(1, revealCount) : revealCount;

      if (section.classList.contains('audience')) {
        items.slice(0, visibleCount).forEach(item => item.classList.add('is-pin-visible'));
      } else {
        items.forEach((item,index) => item.classList.toggle('is-pin-visible', index < visibleCount));
      }
      if (progressFill) progressFill.style.width = `${progress * 100}%`;
    });
  };

  let queued = false;
  const updateScenes = () => {
    queued = false;
    updateNav();
    updatePinnedSections();

    if (serviceTrack && serviceStage) {
      const rect = serviceTrack.getBoundingClientRect();
      const travel = Math.max(1, serviceTrack.offsetHeight - serviceStage.offsetHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const visibleCount = Math.min(serviceCards.length, Math.max(1, Math.ceil(progress * serviceCards.length)));
      serviceCards.forEach((card,index) => card.classList.toggle('is-visible', index < visibleCount));
      if (progressBar) progressBar.style.width = `${progress * 100}%`;
    }

    if (heroContent) {
      const heroProgress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * .82)));
      heroContent.style.opacity = String(1 - heroProgress * .88);
      heroContent.style.transform = `scale(${1 - heroProgress * .045}) translateY(${heroProgress * 24}px)`;
    }

    if (!reduceMotion) {
      parallaxItems.forEach(item => {
        const card = item.closest('.founder-card');
        if (!card) return;
        const bounds = card.getBoundingClientRect();
        const centerOffset = bounds.top + bounds.height / 2 - window.innerHeight / 2;
        const speed = Number(item.dataset.speed || 0);
        const shift = Math.max(-24, Math.min(24, -centerOffset * speed));
        item.style.transform = `translateY(${shift}px)`;
      });
    }
  };

  const requestUpdate = () => {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(updateScenes);
    }
  };

  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate);
  updateScenes();

  if (reduceMotion) {
    revealItems.forEach(item => item.classList.add('is-visible'));
    observeFunnelSegments(100);
    observeRevealGroup(document.querySelector('.value-grid'), valueCards, 110);
    observeRevealGroup(strengthCard, strengthCard ? [strengthCard] : [], 0);
    serviceCards.forEach(item => item.classList.add('is-visible'));
    document.querySelectorAll('.pin-item').forEach(item => item.classList.add('is-pin-visible'));
    return;
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries,observer) => {
      entries.forEach(entry => {
        if (entry.target.classList.contains('work-more')) {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
          return;
        }
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.14, rootMargin:'0px 0px -5% 0px'});
    revealItems.forEach(item => revealObserver.observe(item));

    observeFunnelSegments(240);
    observeRevealGroup(document.querySelector('.value-grid'), valueCards, 140);
    observeRevealGroup(strengthCard, strengthCard ? [strengthCard] : [], 0);
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
    revealFunnelSegments(240);
    serviceCards.forEach(item => item.classList.add('is-visible'));
  }

  // Premium but restrained hero pointer parallax.
  if (hero && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    let px=.5, py=.5, cx=.5, cy=.5, frame=false;
    const tick = () => {
      frame=false;
      cx += (px-cx)*.055;
      cy += (py-cy)*.055;
      heroOrbits.forEach((orbit,index) => {
        const amount=(index+1)*2.2;
        orbit.style.marginLeft=`${(cx-.5)*amount}px`;
        orbit.style.marginTop=`${(cy-.5)*amount}px`;
      });
    };
    hero.addEventListener('pointermove',e => {
      const r=hero.getBoundingClientRect();
      px=(e.clientX-r.left)/r.width; py=(e.clientY-r.top)/r.height;
      if(!frame){frame=true;requestAnimationFrame(tick);}
    });
    hero.addEventListener('pointerleave',() => {
      px=.5;py=.5;
      if(!frame){frame=true;requestAnimationFrame(tick);}
    });
  }
})();