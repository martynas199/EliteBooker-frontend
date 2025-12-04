# Quick Typography Reference Card

## 🎨 Font Families

| Tailwind Class | Font             | Use For                             |
| -------------- | ---------------- | ----------------------------------- |
| `font-serif`   | Playfair Display | Headings, titles, navigation        |
| `font-sans`    | Poppins          | Body text, buttons, forms (default) |
| `font-script`  | Dancing Script   | Decorative sections only            |

---

## 📏 Font Sizes (Responsive)

| Element | Desktop | Mobile | Tailwind Class         |
| ------- | ------- | ------ | ---------------------- |
| h1      | 40px    | 32px   | `text-3xl md:text-4xl` |
| h2      | 32px    | 28px   | `text-2xl md:text-3xl` |
| h3      | 24px    | 22px   | `text-xl md:text-2xl`  |
| h4      | 20px    | 18px   | `text-lg md:text-xl`   |
| Body    | 16px    | 16px   | `text-base`            |
| Small   | 14px    | 14px   | `text-sm`              |

---

## ⚖️ Font Weights

| Weight     | Numeric | Tailwind         | Use For             |
| ---------- | ------- | ---------------- | ------------------- |
| Light      | 300     | `font-light`     | Subtitles, hints    |
| Regular    | 400     | `font-normal`    | Body text (default) |
| Medium     | 500     | `font-medium`    | Buttons, labels     |
| Semi-Bold  | 600     | `font-semibold`  | Subheadings         |
| Bold       | 700     | `font-bold`      | Headings            |
| Extra-Bold | 800     | `font-extrabold` | Display text        |

---

## 📐 Letter Spacing

| Tailwind Class    | Value    | Use For        |
| ----------------- | -------- | -------------- |
| `tracking-tight`  | -0.025em | Large display  |
| `tracking-normal` | 0em      | Default        |
| `tracking-wide`   | 0.025em  | Headings ⭐    |
| `tracking-wider`  | 0.05em   | Uppercase text |

---

## 📝 Common Patterns

### Page Header

```jsx
<div className="mb-8">
  <h1 className="text-3xl font-serif font-bold tracking-wide">Page Title</h1>
  <p className="mt-2 text-gray-600 font-light">Subtitle or description</p>
</div>
```

### Section Header

```jsx
<h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide mb-6">
  Section Title
</h2>
```

### Navigation Link

```jsx
<Link className="text-sm font-serif font-medium tracking-wide hover:text-brand-600">
  Services
</Link>
```

### Product Card Title

```jsx
<h3 className="text-base font-serif font-semibold tracking-wide line-clamp-2">
  Product Name
</h3>
```

### Button Text

```jsx
<button className="px-6 py-3 font-medium uppercase tracking-wider">
  BOOK NOW
</button>
```

### Hero Section

```jsx
<h1 className="heading-display text-white mb-4">
  Discover Beauty
</h1>
<p className="text-lg font-light leading-relaxed">
  Experience luxury treatments...
</p>
```

### Form Label

```jsx
<label className="block text-sm font-medium text-gray-700 mb-2">
  Full Name
</label>
```

### Description Text

```jsx
<p className="text-gray-700 leading-relaxed">
  Long description with comfortable line height for readability.
</p>
```

---

## 🎯 Custom Classes

### `.heading-display`

Large display headings for hero sections

```html
<h1 class="heading-display">Welcome</h1>
```

### `.heading-script`

Decorative script headings

```html
<h2 class="heading-script">Featured Products</h2>
```

### `.text-luxury`

Premium body text with enhanced readability

```html
<p class="text-luxury">Luxury description...</p>
```

### `.text-button`

Uppercase button text

```html
<button class="text-button">BOOK NOW</button>
```

---

## ✅ Best Practices Checklist

- [x] Use `font-serif` for all headings (h1-h6)
- [x] Use `font-sans` for body text (automatic)
- [x] Add `tracking-wide` to headings for elegance
- [x] Use `font-light` for subtitles
- [x] Use `font-medium` or `font-semibold` for buttons
- [x] Add `leading-relaxed` to long paragraphs
- [x] Minimum 16px for body text (mobile)
- [x] Use semantic HTML (h1, h2, h3, not just classes)

---

## 🚫 Common Mistakes

❌ **Don't**: Skip heading levels (h1 → h3)  
✅ **Do**: Use sequential levels (h1 → h2 → h3)

❌ **Don't**: Use script font for body text  
✅ **Do**: Use script only for decorative sections

❌ **Don't**: Use inline styles for fonts  
✅ **Do**: Use Tailwind classes

❌ **Don't**: Make body text smaller than 16px on mobile  
✅ **Do**: Keep minimum 16px to prevent iOS zoom

❌ **Don't**: Use too many font weights  
✅ **Do**: Stick to 3-4 weights (light, regular, medium, bold)

---

## 🔍 Quick Troubleshooting

**Font not showing?**

- Check browser console for font loading errors
- Verify internet connection (fonts loaded from Google)
- Clear browser cache

**Text looks too bold/light?**

- Check font-weight class applied
- Test in different browsers (rendering varies)

**Layout breaking on mobile?**

- Ensure responsive text classes (text-3xl md:text-4xl)
- Check for nowrap or fixed widths
- Test on actual device, not just DevTools

---

## 📚 Documentation

- **Full Guide**: See `TYPOGRAPHY_GUIDE.md` (3,800+ lines)
- **Implementation**: See `TYPOGRAPHY_SUMMARY.md`
- **Tailwind Config**: `tailwind.config.js`
- **Base Styles**: `src/styles.css`

---

**Last Updated**: 2024  
**Quick Reference Version**: 1.0
