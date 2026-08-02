/**
 * Accessible Keyboard-Operable Language Picker Component (Phase 1A)
 */
import { getLocale, setLocale, subscribeI18n } from '../i18n/index.js';

const LOCALE_LABELS = {
  'zh-TW': '繁中',
  'en': 'EN',
  'ja': '日本語',
  'ko': '한국어'
};

const LOCALE_FULL_NAMES = {
  'zh-TW': '繁體中文 (Traditional Chinese)',
  'en': 'English',
  'ja': '日本語 (Japanese)',
  'ko': '한국어 (Korean)'
};

export function createLanguagePicker(containerEl) {
  if (!containerEl) return;

  function render() {
    const activeLocale = getLocale();
    const currentShortLabel = LOCALE_LABELS[activeLocale] || '繁中';

    containerEl.innerHTML = `
      <div class="lang-picker-wrapper" style="position: relative; inline-size: max-content;">
        <button id="btn-lang-toggle" class="btn btn-secondary" 
                aria-label="Select Language (現語言: ${currentShortLabel})" 
                aria-haspopup="true" 
                aria-expanded="false"
                style="padding: 0.3rem 0.6rem; min-height: 32px; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255,255,255,0.2); color: #ffffff;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span id="lang-picker-current-label">${currentShortLabel}</span>
          <span style="font-size: 0.6rem; opacity: 0.7;">▼</span>
        </button>

        <div id="lang-picker-menu" role="menu" aria-label="Language selection" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 4px; background: rgba(15, 23, 42, 0.96); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 2000; min-width: 160px; overflow: hidden; padding: 4px 0;">
          ${Object.keys(LOCALE_LABELS).map(code => `
            <button role="menuitem" class="lang-option-btn ${code === activeLocale ? 'active' : ''}" data-locale="${code}" tabindex="-1" style="width: 100%; text-align: left; padding: 0.45rem 0.75rem; background: ${code === activeLocale ? 'rgba(56, 189, 248, 0.15)' : 'transparent'}; color: ${code === activeLocale ? '#38bdf8' : '#cbd5e1'}; border: none; font-size: 0.76rem; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
              <span>${LOCALE_FULL_NAMES[code]}</span>
              ${code === activeLocale ? '<span style="font-size: 0.7rem; color: #38bdf8;">✓</span>' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const toggleBtn = containerEl.querySelector('#btn-lang-toggle');
    const menuEl = containerEl.querySelector('#lang-picker-menu');
    if (!toggleBtn || !menuEl) return;

    let isOpen = false;

    function openMenu() {
      isOpen = true;
      toggleBtn.setAttribute('aria-expanded', 'true');
      menuEl.style.display = 'block';
      const firstOption = menuEl.querySelector('.lang-option-btn');
      if (firstOption) firstOption.focus();
    }

    function closeMenu() {
      isOpen = false;
      toggleBtn.setAttribute('aria-expanded', 'false');
      menuEl.style.display = 'none';
      toggleBtn.focus();
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen) closeMenu(); else openMenu();
    });

    toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu();
      }
    });

    const options = menuEl.querySelectorAll('.lang-option-btn');
    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedCode = opt.getAttribute('data-locale');
        if (selectedCode) {
          setLocale(selectedCode);
          closeMenu();
        }
      });

      opt.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeMenu();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = opt.nextElementSibling;
          if (next) next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = opt.previousElementSibling;
          if (prev) prev.focus(); else toggleBtn.focus();
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (isOpen && !containerEl.contains(e.target)) {
        isOpen = false;
        toggleBtn.setAttribute('aria-expanded', 'false');
        menuEl.style.display = 'none';
      }
    });
  }

  subscribeI18n(() => {
    render();
  });

  render();
}
