# Expandable/Accordion Sections Implementation

## Overview

Professional e-commerce sites use expandable accordion sections for product details to:

- Keep the interface clean and organized
- Allow users to expand only what they want to see
- Reduce initial information overload
- Improve mobile experience

## Implementation

### Features Added:

1. **State Management**

```javascript
const [expandedSections, setExpandedSections] = useState({
  benefits: false,
  howToUse: false,
  ingredients: false,
});
```

2. **Toggle Function**

```javascript
const toggleSection = (section) => {
  setExpandedSections((prev) => ({
    ...prev,
    [section]: !prev[section],
  }));
};
```

3. **Accordion UI Pattern**
   Each section has:

- **Header button** with hover effect
- **Title** in uppercase with tracking
- **Chevron icon** that rotates when expanded
- **Content** that slides in with fade animation

### Sections:

#### 1. Key Benefits

- **Collapsed**: Shows "KEY BENEFITS" with down arrow
- **Expanded**: Shows bulleted list with checkmark icons
- Content: List of product benefits

#### 2. How to Use

- **Collapsed**: Shows "HOW TO USE" with down arrow
- **Expanded**: Shows application instructions
- Content: Step-by-step usage instructions

#### 3. Key Ingredients

- **Collapsed**: Shows "KEY INGREDIENTS" with down arrow
- **Expanded**: Shows detailed ingredient information
- Content:
  - Ingredient names (bold)
  - Descriptions
  - Full ingredient list at bottom

## Styling Details

### Header Button:

```jsx
className =
  "w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors";
```

### Title:

```jsx
className = "text-sm font-semibold text-gray-900 uppercase tracking-wider";
```

### Chevron Icon:

```jsx
className={`w-5 h-5 text-gray-500 transition-transform ${
  expandedSections.benefits ? "rotate-180" : ""
}`}
```

### Content Container:

```jsx
className = "pb-4 px-1 animate-fadeIn";
```

## Animation

Added custom fade-in animation in `styles.css`:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
```

## Benefits of This Pattern

### User Experience:

✅ **Cleaner interface** - Less overwhelming on first view
✅ **User control** - Expand only what interests them
✅ **Mobile-friendly** - Saves vertical space
✅ **Professional** - Matches industry standards
✅ **Accessible** - Keyboard navigable, semantic HTML

### Design:

✅ **Visual hierarchy** - Clear organization
✅ **Smooth animations** - Professional feel
✅ **Hover feedback** - Interactive feel
✅ **Icon rotation** - Clear open/close state

## Common Patterns on E-commerce Sites

### Sephora:

- Accordion for "Details", "How to Use", "Ingredients"
- Opens one at a time (optional behavior)
- Plus/minus icon

### Nordstrom:

- Expandable sections for product details
- Chevron icon rotation
- Smooth transitions

### Net-a-Porter:

- Minimal accordion style
- Thin borders
- Subtle animations

### Our Implementation:

- Matches professional standards
- Multiple sections can be open simultaneously
- Smooth fade-in animation
- Hover effects on headers
- Rotating chevron icons

## How to Use

### In Admin:

When adding products, format fields normally:

**Key Benefits** (one per line):

```
Hydrates deeply
Reduces fine lines
Brightens complexion
```

**How to Apply**:

```
Apply a small amount to clean, dry skin. Gently massage in circular motions until fully absorbed. Use morning and evening for best results.
```

**Ingredients**:

```
White Truffles
Infused with a patented anti-oxidant complex...

Hyaluronic Acid & Ceramide
Deeply hydrate and strengthen...
```

### For Customers:

- Click section header to expand/collapse
- Multiple sections can be open at once
- Smooth animations provide feedback
- Chevron indicates current state

## Customization Options

### To make only one section open at a time:

```javascript
const toggleSection = (section) => {
  setExpandedSections({
    benefits: section === "benefits",
    howToUse: section === "howToUse",
    ingredients: section === "ingredients",
  });
};
```

### To have a section open by default:

```javascript
const [expandedSections, setExpandedSections] = useState({
  benefits: true, // Open by default
  howToUse: false,
  ingredients: false,
});
```

### To change icon style:

Replace chevron with plus/minus:

```jsx
{
  expandedSections.benefits ? (
    <MinusIcon className="w-5 h-5" />
  ) : (
    <PlusIcon className="w-5 h-5" />
  );
}
```

## Accessibility

- ✅ Semantic button elements
- ✅ Keyboard accessible (Tab, Enter, Space)
- ✅ Clear focus states
- ✅ ARIA attributes can be added:
  - `aria-expanded={expandedSections.benefits}`
  - `aria-controls="benefits-content"`
  - `id="benefits-content"` on content div

## Mobile Optimization

- Full-width touch targets
- Adequate padding (py-4)
- Clear visual feedback on tap
- Smooth animations
- No horizontal scroll

## Browser Support

- ✅ All modern browsers
- ✅ iOS Safari
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Graceful degradation for older browsers

## Future Enhancements

Potential additions:

- [ ] Deep linking (URL hash to open specific section)
- [ ] Remember user's expanded state in localStorage
- [ ] Animate height transition (more complex)
- [ ] Add "Expand All" / "Collapse All" buttons
- [ ] Add ARIA live regions for screen readers
