# Accessibility & i18n Strategy: Tokyo Waterbus Atlas

> **Version**: `v1.1.0-RC.3.22`  
> **Status**: Design & Implementation Guidelines

---

## ♿ Accessibility Target Guidelines (WCAG 2.1 AA)

- **Interactive Target Sizes**: All interactive buttons, tabs, links, and inputs must have a minimum CSS bounding box of **24x24 px**, with a preferred target size of **44x44 px** for primary mobile touch controls.
- **Color Contrast**: Text elements must maintain a minimum contrast ratio of 4.5:1 against background surfaces.
- **Keyboard Navigation**: All tabs, buttons, drawers, and modal controls must be accessible via `Tab` / `Shift+Tab` and triggerable via `Enter` or `Space`.
- **Screen Reader Support**: Use semantic HTML5 elements (`<header>`, `<nav>`, `<aside>`, `<main>`, `<footer>`), explicit `aria-label`, `aria-selected`, `aria-pressed`, and `role="tablist"` attributes.

---

## 🌐 Multilingual i18n Architecture Strategy *(Planned for Phase 1)*

- **Externalized Locale Dictionaries**: All UI strings will be extracted from component files into standalone locale files (`src/locales/zh-TW.json`, `src/locales/en.json`, `src/locales/ja.json`, `src/locales/ko.json`).
- **Dynamic HTML `lang` Attribute**: Update `<html lang="...">` dynamically when switching active locale.
- **Time & Date Formatting**: All timestamps rendered in Japan Standard Time (JST, UTC+9) using standardized ISO/Intl formatters.
- **Localized Entity Names**: Pier and route names rendered with primary local language text and secondary native Japanese / Romaji labels.
