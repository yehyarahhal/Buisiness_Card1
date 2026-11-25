# Digital Business Card

Static, dependency-light card: semantic HTML, CSS variables, vanilla JS. No build step.

```
digital-card/
├── index.html      content + inline SVG icon sprite
├── styles.css      tokens → base → BEM blocks → print
├── script.js       CONFIG, vCard, copy, share, QR, theme
└── assets/         avatar.svg (replace), favicon.svg
```

## Customize
1. **Content**: edit the text, `mailto:`, `tel:` and social `href`s in `index.html`.
2. **Contact file + QR**: edit `CONFIG` at the top of `script.js` (keep it in sync with the HTML).
3. **Photo**: replace `assets/avatar.svg` with a 192×192 `.webp`/`.jpg` (under 30 KB) and update the `<img src>`. For the vCard photo set `CONFIG.photo` to a JPEG path.
4. **Colors / fonts**: change variables in `:root` and the two dark blocks in `styles.css`. Re-check contrast after any change (see checklist).
5. **Short URL**: create a short link to your hosted card and paste it in `CONFIG.shortUrl`. The QR code, "Copy link" and Share all use it.
6. **Language / RTL**: set `<html lang="ar" dir="rtl">`. Layout uses logical properties, so it mirrors automatically. Phone numbers keep `dir="ltr"`.
7. **QR library**: loaded from cdnjs (`qrcodejs@1.0.0`). To self-host, download it to the project and change the `<script src>`. If it fails to load, the QR panel hides itself.

## Deploy (any static host)
- **GitHub Pages**: push the folder, then Settings → Pages → deploy from branch.
- **Netlify / Cloudflare Pages / Vercel**: drag the folder in, or connect the repo. No build command, publish directory `/`.
- Use HTTPS (needed for clipboard and Web Share). Add long-cache headers for `/assets/*`.

## Accessibility and testing checklist
**Accessibility**
- [ ] Tab through the page: order is logical, focus ring visible everywhere
- [ ] Skip link appears on first Tab
- [ ] All controls ≥ 44×44 px (touch targets)
- [ ] Icon-only buttons have text names (screen-reader only)
- [ ] Copy/download feedback is announced (toast uses `aria-live`)
- [ ] Contrast ≥ 4.5:1 in light and dark (check with WebAIM or DevTools)
- [ ] Zoom to 200% and 400%: no clipped or overlapping content
- [ ] OS "reduce motion" on: no animation
- [ ] Windows High Contrast / forced colors: borders still visible
- [ ] Screen reader pass (VoiceOver, TalkBack or NVDA): name, role, contacts read in order

**Functional**
- [ ] vCard imports correctly on iOS Contacts, Android Contacts, Outlook
- [ ] Copy works on HTTPS and falls back on HTTP/older browsers
- [ ] QR scans from a phone at arm's length, on screen and on paper
- [ ] Share button shows on mobile, hidden on unsupported desktops
- [ ] Theme: follows system, manual toggle persists after reload, no flash
- [ ] JavaScript disabled: content, links, mailto/tel and the QR `<details>` still work (QR image and vCard need JS)

**Performance and compatibility**
- [ ] Lighthouse mobile: Performance, Accessibility, Best Practices, SEO ≥ 95
- [ ] Latest Chrome, Safari (iOS + macOS), Firefox, Edge
- [ ] Print preview: one page, no buttons, link URLs shown, QR present
