import { Component } from '@theme/component';

/**
 * @typedef {Object} HeroCarouselRefs
 * @property {HTMLElement} track - The slide track container
 * @property {HTMLElement[]} slides - Individual slide elements
 * @property {HTMLButtonElement} prevBtn - Previous navigation button
 * @property {HTMLButtonElement} nextBtn - Next navigation button
 */

/** @extends {Component<HeroCarouselRefs>} */
class HeroCarousel extends Component {
  /** @type {number} */
  currentIndex = 0;

  /** @type {number|null} */
  autoplayInterval = null;

  /** @type {number|null} */
  resumeTimeout = null;

  /** @type {number} */
  touchStartX = 0;

  /** @type {number} */
  touchEndX = 0;

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.addEventListener('touchend', this.handleTouchEnd, { passive: true });

    if (this.dataset.autoplay === 'true') {
      this.startAutoplay();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopAutoplay();

    if (this.resumeTimeout) {
      clearTimeout(this.resumeTimeout);
    }

    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchend', this.handleTouchEnd);
  }

  get slideCount() {
    return this.refs.slides ? this.refs.slides.length : 0;
  }

  get autoplaySpeed() {
    const speed = parseInt(this.dataset.speed, 10);
    return isNaN(speed) ? 5000 : speed * 1000;
  }

  /**
   * Navigate to the previous slide.
   * @param {Event} event
   */
  prev(event) {
    event.preventDefault();

    if (this.slideCount <= 1) return;

    this.pauseAutoplayTemporarily();
    this.currentIndex = this.currentIndex <= 0 ? this.slideCount - 1 : this.currentIndex - 1;
    this.updateTrack();
  }

  /**
   * Navigate to the next slide.
   * @param {Event} event
   */
  next(event) {
    event.preventDefault();

    if (this.slideCount <= 1) return;

    this.pauseAutoplayTemporarily();
    this.currentIndex = this.currentIndex >= this.slideCount - 1 ? 0 : this.currentIndex + 1;
    this.updateTrack();
  }

  updateTrack() {
    if (!this.refs.track) return;

    this.refs.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    if (this.refs.slides) {
      for (const [index, slide] of this.refs.slides.entries()) {
        slide.setAttribute('aria-hidden', index === this.currentIndex ? 'false' : 'true');
      }
    }
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.currentIndex = this.currentIndex >= this.slideCount - 1 ? 0 : this.currentIndex + 1;
      this.updateTrack();
    }, this.autoplaySpeed);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  pauseAutoplayTemporarily() {
    if (this.dataset.autoplay !== 'true') return;

    this.stopAutoplay();

    if (this.resumeTimeout) {
      clearTimeout(this.resumeTimeout);
    }

    this.resumeTimeout = setTimeout(() => {
      this.startAutoplay();
    }, this.autoplaySpeed * 2);
  }

  /** @param {TouchEvent} event */
  handleTouchStart = (event) => {
    this.touchStartX = event.changedTouches[0].screenX;
  };

  /** @param {TouchEvent} event */
  handleTouchEnd = (event) => {
    this.touchEndX = event.changedTouches[0].screenX;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) < 50) return;

    if (diff > 0) {
      this.currentIndex = this.currentIndex >= this.slideCount - 1 ? 0 : this.currentIndex + 1;
    } else {
      this.currentIndex = this.currentIndex <= 0 ? this.slideCount - 1 : this.currentIndex - 1;
    }

    this.pauseAutoplayTemporarily();
    this.updateTrack();
  };
}

customElements.define('hero-carousel', HeroCarousel);
