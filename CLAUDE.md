# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for "UGOL32" (Угол32) -- a construction/renovation company in Bryansk, Russia. Pure HTML/CSS/JS, no frameworks or build tools.

## Running Locally

```bash
python3 -m http.server 8080 --directory .
# Then open http://localhost:8080
```

No build step, no dependencies to install.

## Architecture

**6 HTML pages** sharing common header/footer markup (no templating -- each page has full HTML):
- `index.html` -- Homepage: hero, services preview, advantages, contact form
- `uslugi.html` -- Services detail (4 service blocks with alternating layout)
- `portfolio.html` -- Gallery with category filters + lightbox
- `about.html` -- Company info, animated counters, work process timeline
- `contacts.html` -- Contact info, form, Yandex Maps embed
- `blog.html` -- Blog cards (placeholder articles)

**CSS** (`css/style.css`): Single file with CSS custom properties for theming. Design system: black/white/red, fonts Unbounded (headings) + Onest (body). Responsive breakpoints at 1024px and 768px.

**JS** (2 files):
- `js/main.js` -- Header scroll effect, mobile burger menu, IntersectionObserver scroll reveals, animated counter (data-count attribute)
- `js/form.js` -- Phone mask (+7 format), form validation, dual submission to Telegram Bot API + EmailJS. Config constants at top of file need real tokens.

## Key Conventions

- All text in Russian (lang="ru")
- CSS naming: BEM-inspired with hyphens (`.service-card-img`, `.section-title--light`)
- CSS state classes: `.scrolled`, `.open`, `.active`, `.visible`
- Scroll animations: add class `.reveal` (with optional `.reveal-delay-1` through `.reveal-delay-4`)
- Animated counters: `data-count="100"` and `data-suffix="+"` attributes on elements
- Images stored locally in `images/` (downloaded from Unsplash -- Unsplash is blocked in Russia without VPN)
- Phone number placeholder: `+7XXXXXXXXXX` and `+7 (XXX) XXX-XX-XX` -- needs replacement with real number
- Email: `info@ugol32.ru`

## Configuration (js/form.js)

Form submission requires these values in the CONFIG object:
- `telegramBotToken` / `telegramChatId` -- for Telegram notifications
- `emailServiceId` / `emailTemplateId` / `emailPublicKey` -- for EmailJS
- Currently set to `YOUR_*` placeholders; form works in dev mode without them (logs to console)

## When Editing Pages

Header, footer, mobile nav, and mobile call button are duplicated across all 6 HTML files. Changes to shared elements must be applied to every page.

**Inline `<style>` blocks**: `uslugi.html`, `portfolio.html`, `about.html`, `contacts.html`, `blog.html` each have page-specific styles in an inline `<style>` tag. `index.html` uses only `css/style.css`. Shared styles go in `css/style.css`.

**Portfolio filters**: `portfolio.html` uses `data-category` attributes on gallery items with values: `otdelka`, `zabory`, `navesy`, `fasady`. Filter buttons and lightbox logic are in inline `<script>` at the bottom of that file (not in `main.js`).

**Images**: All images are local in `images/`. CSS background-image paths use `../images/` (relative to `css/` dir). When adding new images, use descriptive names matching the convention: `hero-*.jpg`, `service-*.jpg`, `portfolio-*.jpg`, `about-*.jpg`.