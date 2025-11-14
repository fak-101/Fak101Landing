// Scroll-triggered animation utility
// Similar to Framer's scroll animations

interface AnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

class ScrollAnimations {
  private observer: IntersectionObserver;
  private options: AnimationOptions;

  constructor(options: AnimationOptions = {}) {
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      once: true,
      ...options,
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin,
      }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const animationType = element.dataset.animate || 'fadeIn';
        
        this.animateElement(element, animationType);
        
        if (this.options.once) {
          this.observer.unobserve(element);
        }
      }
    });
  }

  private animateElement(element: HTMLElement, type: string) {
    // Set initial state
    element.classList.add('animate-out');
    
    // Trigger animation
    requestAnimationFrame(() => {
      element.classList.add('animate-in');
      element.setAttribute('data-animate', type);
      
      // Remove initial state classes after animation starts
      setTimeout(() => {
        element.classList.remove('animate-out');
      }, 10);
    });
  }

  public observe(element: HTMLElement) {
    this.observer.observe(element);
  }

  public observeAll(selector: string) {
    document.querySelectorAll(selector).forEach((el) => {
      this.observe(el as HTMLElement);
    });
  }

  public disconnect() {
    this.observer.disconnect();
  }
}

// Counter animation for numbers
export function animateCounter(
  element: HTMLElement,
  target: number,
  duration: number = 2000,
  suffix: string = ''
) {
  const start = 0;
  const startTime = performance.now();

  const updateCounter = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (target - start) * easeOutQuart);
    
    element.textContent = current + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target + suffix;
    }
  };

  requestAnimationFrame(updateCounter);
}

// Parse number from text (handles "99+", "10", etc.)
function parseNumber(text: string): { value: number; suffix: string } {
  // Match numbers and any trailing characters (like +, %, etc.)
  const match = text.match(/^(\d+)(.*)$/);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      suffix: match[2] || ''
    };
  }
  return { value: 0, suffix: '' };
}

// Initialize counter animations for elements with data-counter attribute
export function initCounterAnimations() {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const originalText = element.textContent || '';
          const { value, suffix } = parseNumber(originalText);
          
          if (value > 0) {
            // Store original text if not already stored
            if (!element.dataset.originalText) {
              element.dataset.originalText = originalText;
            }
            
            // Calculate duration - smaller numbers get faster animation
            let duration = parseInt(element.dataset.counterDuration || '2000', 10);
            if (value <= 5) {
              duration = Math.min(duration, 600);
            } else if (value <= 20) {
              duration = Math.min(duration, 800);
            } else {
              duration = Math.min(duration, Math.min(value * 50, 2000));
            }
            
            // Animate the counter
            animateCounter(element, value, duration, suffix);
            
            // Unobserve after animation starts
            counterObserver.unobserve(element);
          }
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: '0px'
    }
  );

  // Observe all elements with data-counter attribute
  document.querySelectorAll('[data-counter]').forEach((el) => {
    counterObserver.observe(el as HTMLElement);
  });

  return counterObserver;
}

// Parallax effect for elements
export function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  function updateParallax() {
    parallaxElements.forEach((element) => {
      const el = element as HTMLElement;
      const speed = parseFloat(el.dataset.parallax || '0.5');
      const rect = el.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      
      el.style.transform = `translateY(${rate}px)`;
    });
  }
  
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Initialize scroll animations
export function initScrollAnimations() {
  const animations = new ScrollAnimations({
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    once: true,
  });

  // Observe all elements with data-animate attribute
  animations.observeAll('[data-animate]');

  // Observe elements with stagger animation
  const staggerContainers = document.querySelectorAll('[data-stagger]');
  staggerContainers.forEach((container) => {
    const children = container.querySelectorAll('[data-stagger-item]');
    children.forEach((child, index) => {
      const delay = index * 100;
      (child as HTMLElement).style.transitionDelay = `${delay}ms`;
      (child as HTMLElement).style.animationDelay = `${delay}ms`;
      animations.observe(child as HTMLElement);
    });
  });

  // Initialize parallax
  initParallax();

  // Initialize counter animations
  initCounterAnimations();

  return animations;
}

// Initialize on DOM load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollAnimations();
    });
  } else {
    initScrollAnimations();
  }
}

