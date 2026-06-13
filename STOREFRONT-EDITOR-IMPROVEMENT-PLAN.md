# Storefront Editor Improvement Plan
## Making Storefront Editing Better, Easier, and Seamless

---

## 🎯 Vision

Transform the storefront editor from a technical customization tool into an intuitive, delightful visual editor that empowers vendors to create beautiful storefronts without technical knowledge.

---

## 📊 Current State Analysis

### What Works Well ✅
- Real-time preview iframe
- Undo/redo functionality
- Template system
- Mobile/tablet/desktop viewport switching
- Draft saving (autosave)
- Theme presets

### Pain Points ❌
- **Not intuitive**: Users need to understand sections, panels, and technical terms
- **Hidden features**: Many customization options are buried in tabs
- **No visual feedback**: Changes require clicking through menus
- **Learning curve**: New users don't know where to start
- **Limited guidance**: No inline help or suggestions
- **Context switching**: Jump between preview and controls

---

## 🚀 Improvement Strategy

### Phase 1: Visual Editing & Direct Manipulation
**Goal**: Enable click-to-edit directly on the preview

#### 1.1 Click-to-Edit Preview
- **Feature**: Click any element in the preview to edit it inline
- **Implementation**:
  - Add overlay indicators on preview elements
  - Show edit icon on hover
  - Open contextual editor panel on click
  - Highlight selected element with border
  
**Benefits**:
- Eliminate guesswork about what controls affect what
- Reduce cognitive load
- Faster workflow

#### 1.2 Inline Text Editing
- **Feature**: Double-click text in preview to edit directly
- **Elements**: Store name, descriptions, section headings, buttons
- **Implementation**:
  - contentEditable overlay on text elements
  - Save on blur or Enter key
  - Cancel on Escape

**Benefits**:
- WYSIWYG experience
- Immediate visual feedback
- Natural editing flow

#### 1.3 Drag-and-Drop Section Reordering
- **Feature**: Drag sections up/down in preview to reorder
- **Implementation**:
  - Drag handle appears on section hover
  - Visual drop zones between sections
  - Smooth animations
  
**Benefits**:
- Intuitive layout control
- Visual feedback
- No menu diving

---

### Phase 2: Smart Defaults & AI Assistance
**Goal**: Reduce decision fatigue with intelligent suggestions

#### 2.1 AI-Powered Color Palette Generator
- **Feature**: "Generate color scheme" button
- **Implementation**:
  - Input: Brand description or industry
  - Output: Complete color palette (primary, accent, background, text)
  - Preview 3-5 options
  - One-click apply

**Benefits**:
- Professional designs without color theory knowledge
- Consistency across theme
- Inspiration for non-designers

#### 2.2 Smart Image Suggestions
- **Feature**: Suggest optimal image sizes and crops
- **Implementation**:
  - Show ideal dimensions tooltip
  - Auto-crop/resize uploaded images
  - Suggest placeholder if no image
  - Generate AI placeholder images (optional)

**Benefits**:
- No broken layouts
- Professional appearance
- Reduced frustration

#### 2.3 Template Quick Start
- **Feature**: Industry-specific template recommendations
- **Implementation**:
  - Quiz on first visit: "What do you sell?"
  - Show 3 pre-configured templates
  - One-click apply with sample content
  - Easy customization after

**Benefits**:
- Faster onboarding
- Professional starting point
- Reduces blank-canvas syndrome

---

### Phase 3: Guided Experience & Help
**Goal**: Eliminate confusion with contextual guidance

#### 3.1 Interactive Tutorial Overlay
- **Feature**: First-time walkthrough
- **Implementation**:
  - Spotlight key areas sequentially
  - Animated arrows and tooltips
  - "Try it" interactive steps
  - Skippable/resumable

**Benefits**:
- Faster learning
- Confidence building
- Reduced support requests

#### 3.2 Contextual Help Tips
- **Feature**: Inline help icons with tooltips
- **Implementation**:
  - "?" icon next to complex options
  - Hover/click for explanation
  - Links to relevant guides
  - Video demos (optional)

**Benefits**:
- Self-service learning
- Just-in-time help
- Reduced confusion

#### 3.3 Completion Checklist
- **Feature**: "Store setup progress" indicator
- **Implementation**:
  - Checklist panel: Logo, colors, sections, products
  - Progress bar (0-100%)
  - Quick links to incomplete items
  - Celebration on 100%

**Benefits**:
- Clear goals
- Motivation to complete
- Professional-looking stores

---

### Phase 4: Performance & Polish
**Goal**: Make the editor fast and delightful

#### 4.1 Instant Preview Updates
- **Feature**: Zero-delay preview refresh
- **Implementation**:
  - Debounce input (150ms)
  - Optimistic UI updates
  - CSS transitions for smooth changes
  - Loading states for heavy operations

**Benefits**:
- Feels responsive
- Immediate feedback
- Professional feel

#### 4.2 Keyboard Shortcuts
- **Feature**: Power-user shortcuts
- **Implementation**:
  - Cmd/Ctrl+Z/Y: Undo/Redo
  - Cmd/Ctrl+S: Save
  - Cmd/Ctrl+P: Preview in new tab
  - Esc: Close modals/panels
  - Show shortcut hints on hover

**Benefits**:
- Faster for power users
- Professional workflow
- Reduced mouse clicks

#### 4.3 Autosave with Visual Confirmation
- **Feature**: Silent autosave with status indicator
- **Implementation**:
  - Save every 30 seconds
  - "Saving..." → "Saved" indicator
  - Recover unsaved changes on crash
  - Version history (Pro/Business tier)

**Benefits**:
- Never lose work
- Peace of mind
- Professional reliability

---

### Phase 5: Advanced Features (Pro/Business)
**Goal**: Premium value for paid tiers

#### 5.1 Custom CSS Editor
- **Feature**: Advanced users can add custom CSS
- **Implementation**:
  - Code editor with syntax highlighting
  - Live preview
  - CSS validation
  - Save/reset options
  - Business tier only

#### 5.2 A/B Testing (Business)
- **Feature**: Test multiple store designs
- **Implementation**:
  - Create variants (A/B)
  - Split traffic automatically
  - Track conversion metrics
  - Declare winner
  - Business tier only

#### 5.3 Template Marketplace
- **Feature**: Browse and buy premium templates
- **Implementation**:
  - Gallery of premium templates
  - Preview before purchase
  - One-click install
  - Revenue share with designers

---

## 🎨 UI/UX Improvements

### 1. Side-by-Side Editor Layout
```
┌─────────────────────────────────────────────┐
│ [Top Toolbar: Save | Preview | Undo | Redo]│
├──────────┬──────────────────────────────────┤
│          │                                  │
│  Editor  │         Live Preview            │
│  Panel   │                                  │
│          │     (Click to edit)              │
│  [Tabs]  │                                  │
│  • Style │     [Store content here]        │
│  • Layout│                                  │
│  • Text  │                                  │
│          │                                  │
│  [Tools] │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### 2. Floating Context Menu
- Appears when clicking preview elements
- Shows relevant controls only
- Positioned near click point
- Quick access to common actions

### 3. Visual Style Guide
- Show current colors in sidebar
- Click color to edit
- See all typography in one place
- Preview hover states

---

## 📱 Mobile Editor Optimization

### Challenges
- Small screen real estate
- Touch interactions
- Preview accuracy

### Solutions
1. **Mobile-First Controls**: Bottom sheet design
2. **Swipe Navigation**: Swipe between editor/preview
3. **Full-Screen Preview**: Hide controls when previewing
4. **Touch-Friendly Targets**: Larger hit areas

---

## 🔧 Technical Implementation

### Architecture Changes

#### 1. PostMessage Communication
```typescript
// Parent (editor) → IFrame (preview)
iframe.postMessage({
  type: 'UPDATE_THEME',
  payload: { primary_color: '#10b981' }
}, '*');

// IFrame (preview) → Parent (editor)
window.parent.postMessage({
  type: 'ELEMENT_CLICKED',
  payload: { elementId: 'hero-title' }
}, '*');
```

#### 2. State Management
```typescript
// Use Zustand for global editor state
const useEditorStore = create((set) => ({
  theme: {},
  selectedElement: null,
  updateTheme: (updates) => set({ theme: { ...theme, ...updates }}),
  selectElement: (id) => set({ selectedElement: id }),
}));
```

#### 3. Optimistic Updates
```typescript
// Update UI immediately, sync to server in background
function updateColor(color: string) {
  // 1. Update local state (instant)
  setLocalTheme({ ...theme, primary_color: color });
  
  // 2. Queue server sync (async)
  debouncedSave({ primary_color: color });
}
```

---

## 📈 Success Metrics

### User Experience
- Time to first customization: < 30 seconds
- Completion rate: > 80%
- User satisfaction: > 4.5/5 stars
- Support ticket reduction: -50%

### Technical
- Preview update latency: < 100ms
- Autosave success rate: > 99.9%
- Crash/error rate: < 0.1%
- Page load time: < 2 seconds

### Business
- Feature adoption: > 60% use advanced features
- Upsell conversion: +20% to Pro/Business
- Store completion: +40%
- User retention: +25%

---

## 🗓️ Implementation Roadmap

### Sprint 1-2 (Weeks 1-4): Foundation
- [ ] Click-to-edit preview infrastructure
- [ ] Inline text editing
- [ ] Contextual help system
- [ ] Performance optimization

### Sprint 3-4 (Weeks 5-8): Visual Editing
- [ ] Drag-and-drop sections
- [ ] Floating context menu
- [ ] Visual style guide
- [ ] Keyboard shortcuts

### Sprint 5-6 (Weeks 9-12): Intelligence
- [ ] AI color palette generator
- [ ] Smart image handling
- [ ] Template quick start
- [ ] Completion checklist

### Sprint 7-8 (Weeks 13-16): Polish & Advanced
- [ ] Interactive tutorial
- [ ] Version history
- [ ] Custom CSS editor
- [ ] Mobile optimization

### Sprint 9-10 (Weeks 17-20): Business Features
- [ ] A/B testing
- [ ] Template marketplace
- [ ] Analytics integration
- [ ] Export/import themes

---

## 💡 Quick Wins (Do First)

### Week 1 Quick Improvements
1. **Add "Preview in New Tab" button** - 2 hours
2. **Keyboard shortcuts (Cmd+S, Cmd+Z)** - 4 hours
3. **Autosave indicator** - 3 hours
4. **Hover tooltips on all controls** - 6 hours
5. **"Reset to default" buttons** - 4 hours

Total: ~19 hours = 2-3 days
Impact: Immediate UX improvement

---

## 🎓 User Research Questions

Before building, validate with users:
1. What's the most confusing part of the current editor?
2. What would make you feel more confident customizing?
3. Have you used other site builders? What did you like?
4. Would you pay more for advanced features? Which ones?
5. Mobile or desktop editing - which matters more?

---

## 🏆 Competitive Analysis

### Shopify Theme Editor
✅ **Strengths**: Click-to-edit, visual sections, mobile preview
❌ **Weaknesses**: Slow, complex for beginners, requires theme knowledge

### Wix Editor
✅ **Strengths**: Drag-and-drop everything, intuitive, fast
❌ **Weaknesses**: Too much freedom (analysis paralysis), performance issues

### Squarespace
✅ **Strengths**: Beautiful templates, guided setup, mobile-first
❌ **Weaknesses**: Limited customization, expensive

### Vendle Opportunity
- **Better than Shopify**: Simpler, faster, no theme coding required
- **Better than Wix**: Structured guidance, better performance
- **Better than Squarespace**: More customization, better pricing
- **Unique angle**: AI-assisted design, Nigerian market focus

---

## 🛡️ Error Handling & Reliability

### Zero-Error Customization Strategy

#### 1. Input Validation
```typescript
// Validate all inputs before applying
const validateThemeUpdate = (update: Partial<StoreTheme>) => {
  // Color validation
  if (update.primary_color && !isValidHexColor(update.primary_color)) {
    return { error: 'Invalid color format. Use #RRGGBB' };
  }
  
  // URL validation
  if (update.hero_image_url && !isValidUrl(update.hero_image_url)) {
    return { error: 'Invalid image URL' };
  }
  
  // JSON structure validation
  if (update.sections && !isValidSectionsJSON(update.sections)) {
    return { error: 'Invalid section configuration' };
  }
  
  return { valid: true };
};
```

#### 2. Graceful Degradation
- **Fallback values**: If custom color fails, use default
- **Error boundaries**: Catch React errors, show recovery UI
- **Preview fallback**: If preview crashes, show static screenshot
- **Safe mode**: Reset to defaults if editor breaks

#### 3. Real-Time Error Detection
```typescript
// Show errors inline as user types
<ColorInput
  value={color}
  onChange={setColor}
  error={!isValidHexColor(color) ? 'Invalid color format' : null}
  hint="Use format: #FF0000"
/>
```

#### 4. Undo Protection
- **Auto-checkpoint**: Save state before risky operations
- **Bulk undo**: Revert multiple changes at once
- **Named checkpoints**: "Before AI suggestions", "Before template change"
- **Recovery mode**: Restore from last known good state

#### 5. Preview Error Handling
```typescript
// Catch preview rendering errors
useEffect(() => {
  const handlePreviewError = (error: MessageEvent) => {
    if (error.data.type === 'PREVIEW_ERROR') {
      // Show error toast
      toast.error('Preview update failed. Reverting...');
      // Revert to last good state
      restoreLastCheckpoint();
    }
  };
  
  window.addEventListener('message', handlePreviewError);
  return () => window.removeEventListener('message', handlePreviewError);
}, []);
```

### Error Prevention Checklist
- [ ] Validate all color inputs (hex, rgb, rgba)
- [ ] Validate all URLs (http/https only)
- [ ] Check image file size (< 5MB)
- [ ] Validate image dimensions (warn if > 4000px)
- [ ] Check JSON structure before save
- [ ] Prevent duplicate section IDs
- [ ] Validate custom CSS (if allowed)
- [ ] Check for circular references in links
- [ ] Prevent XSS in text inputs
- [ ] Rate limit autosave (max 1/second)

### User-Friendly Error Messages
❌ **Bad**: "Invalid JSON in sections array"
✅ **Good**: "Oops! Something went wrong with your layout. We've restored your previous version."

❌ **Bad**: "Network error 500"
✅ **Good**: "Couldn't save right now. Your changes are safe and we'll try again in a moment."

❌ **Bad**: "TypeError: Cannot read property 'color'"
✅ **Good**: "There's a problem with your color settings. Click 'Reset Colors' to fix it."

---

## 📸 Cloudinary Image Upload Integration

### Feature: Seamless Image Management

#### 1. Upload Widget Integration
```typescript
import { CldUploadWidget } from 'next-cloudinary';

<CldUploadWidget
  uploadPreset="vendle_storefront"
  onSuccess={(result) => {
    const url = result.info.secure_url;
    updateTheme({ hero_image_url: url });
  }}
  options={{
    sources: ['local', 'url', 'camera'],
    maxFiles: 1,
    maxFileSize: 5000000, // 5MB
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    styles: {
      palette: {
        window: "#FFFFFF",
        windowBorder: "#10b981",
        tabIcon: "#10b981",
        menuIcons: "#64748b",
        textDark: "#0f172a",
        textLight: "#FFFFFF",
        link: "#10b981",
        action: "#10b981",
      },
    },
  }}
>
  {({ open }) => (
    <button onClick={open}>
      Upload Image
    </button>
  )}
</CldUploadWidget>
```

#### 2. Image Upload Locations

**All sections that support images:**
1. **Logo**
   - Max size: 1MB
   - Recommended: 200x200px, square
   - Auto-crop: Yes
   - Formats: PNG (transparent), JPG, SVG

2. **Hero Section**
   - Max size: 5MB
   - Recommended: 1920x1080px (16:9)
   - Auto-crop: Yes
   - Formats: JPG, PNG, WebP

3. **Banner Images**
   - Max size: 3MB
   - Recommended: 1600x600px
   - Auto-crop: Yes
   - Formats: JPG, PNG, WebP

4. **Feature Section Icons**
   - Max size: 500KB
   - Recommended: 128x128px, square
   - Auto-crop: Yes
   - Formats: PNG (transparent), SVG

5. **Background Images**
   - Max size: 5MB
   - Recommended: 1920x1080px
   - Auto-crop: Optional
   - Formats: JPG, PNG, WebP

6. **Gallery Images**
   - Max size: 3MB each
   - Recommended: 800x800px, square
   - Auto-crop: Yes
   - Formats: JPG, PNG, WebP
   - Multiple upload: Yes (max 6)

7. **Custom Section Images**
   - Max size: 3MB
   - Recommended: Varies by section
   - Auto-crop: Optional
   - Formats: JPG, PNG, WebP

#### 3. Cloudinary Transformations
```typescript
// Auto-optimize images on upload
const cloudinaryConfig = {
  transformation: [
    // Automatic format selection (WebP for modern browsers)
    { fetch_format: 'auto' },
    // Automatic quality optimization
    { quality: 'auto:good' },
    // Responsive sizing
    { width: 'auto', crop: 'scale', dpr: 'auto' },
  ],
};

// Example URLs generated:
// Original: https://res.cloudinary.com/.../image.jpg
// Optimized: https://res.cloudinary.com/.../f_auto,q_auto:good,w_auto/image.jpg
```

#### 4. Image Upload Flow (PRIMARY METHOD)
```typescript
const ImageUploadButton = ({ onUpload, imageType, currentImageUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);

  return (
    <div className="space-y-4">
      {/* Current Image Preview */}
      {currentImageUrl && (
        <div className="relative group">
          <img 
            src={currentImageUrl} 
            alt="Current image" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button 
              onClick={() => setShowLibrary(true)}
              className="btn-secondary"
            >
              Replace
            </button>
            <button 
              onClick={() => onUpload(null)}
              className="btn-danger"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Upload New Image (Primary Action) */}
      <CldUploadWidget
        uploadPreset="vendle_storefront"
        onUploadStart={() => {
          setUploading(true);
          setError(null);
        }}
        onSuccess={(result) => {
          const optimizedUrl = result.info.secure_url;
          onUpload(optimizedUrl);
          setUploading(false);
          toast.success('Image uploaded successfully!');
        }}
        onError={(error) => {
          setError('Upload failed. Please try again.');
          setUploading(false);
          toast.error('Image upload failed');
        }}
      >
        {({ open }) => (
          <div>
            <button 
              onClick={open}
              disabled={uploading}
              className="btn-primary w-full"
            >
              {uploading ? (
                <>
                  <Spinner className="mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2" />
                  Upload New Image
                </>
              )}
            </button>
            
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <p className="text-slate-500 text-xs mt-2">
              <strong>Recommended:</strong> {getImageRecommendation(imageType)}
            </p>
          </div>
        )}
      </CldUploadWidget>

      {/* OR: Choose from Previously Uploaded (Secondary Option) */}
      <button
        onClick={() => setShowLibrary(!showLibrary)}
        className="btn-ghost w-full text-sm"
      >
        <LibraryIcon className="mr-2" />
        Or choose from library ({previousImageCount})
      </button>

      {/* Image Library Modal */}
      {showLibrary && (
        <ImageLibraryModal
          onSelect={(url) => {
            onUpload(url);
            setShowLibrary(false);
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
};
```

**Key Features:**
1. **Upload New Image** - PRIMARY action (big button)
2. **Choose from Library** - Secondary action (smaller link)
3. **Replace existing** - Shows current image with overlay controls
4. **Remove image** - Delete option in hover state
5. **Visual feedback** - Loading states, error messages, success toasts

#### 5. Image Management Features

**Upload Improvements:**
- Drag-and-drop zone
- Paste from clipboard (Cmd/Ctrl+V)
- URL input option (paste image URL)
- Camera capture (mobile)
- Multiple file selection (for galleries)

**Preview & Editing:**
- Live preview before upload
- Basic crop/rotate tools
- Brightness/contrast adjustment
- Filter presets (optional)

**Error Handling:**
- File too large → Suggest compression
- Wrong format → List supported formats
- Upload failed → Retry automatically
- Network error → Queue for later

**Smart Suggestions:**
```typescript
const getImageRecommendation = (imageType: string) => {
  const recommendations = {
    logo: '200x200px, PNG with transparent background',
    hero: '1920x1080px (16:9), high quality JPG',
    banner: '1600x600px, JPG or WebP',
    icon: '128x128px, PNG with transparent background',
    background: '1920x1080px, JPG (will be compressed)',
    gallery: '800x800px square, JPG or PNG',
  };
  
  return recommendations[imageType] || 'Optimal size will be suggested';
};
```

#### 6. Cloudinary Setup
```typescript
// Environment variables needed
// .env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=vendle_storefront

// Cloudinary dashboard setup:
// 1. Create upload preset: "vendle_storefront"
// 2. Settings:
//    - Signing mode: Unsigned
//    - Folder: storefront/{vendor_id}
//    - Transformations: Auto format, Auto quality
//    - Access mode: Public
//    - Unique filename: true
// 3. Enable upload widget in dashboard
```

#### 7. Image Library (Phase 2)
```typescript
// Browse previously uploaded images
const ImageLibrary = ({ onSelect }) => {
  const [images, setImages] = useState([]);
  
  useEffect(() => {
    // Fetch vendor's uploaded images from Cloudinary
    fetch(`https://res.cloudinary.com/${cloudName}/image/list/${vendorId}.json`)
      .then(res => res.json())
      .then(data => setImages(data.resources));
  }, []);
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map(img => (
        <img
          key={img.public_id}
          src={img.secure_url}
          onClick={() => onSelect(img.secure_url)}
          className="cursor-pointer hover:ring-2"
        />
      ))}
    </div>
  );
};
```

### Image Upload Error Recovery
```typescript
// Automatic retry on network failure
const uploadWithRetry = async (file, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadToCloudinary(file);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Exponential backoff: 1s, 2s, 4s
      await sleep(Math.pow(2, i) * 1000);
    }
  }
};
```

---

## 🔒 Technical Considerations

### Security
- Sanitize all user input
- CSP headers for iframe
- Rate limiting on autosave
- Validate CSS (if custom CSS allowed)
- **Cloudinary signed uploads** (prevent abuse)
- **Image URL validation** (only allow Cloudinary URLs)
- **XSS prevention** in text inputs

### Performance
- Lazy load preview iframe
- Debounce input handlers
- **Optimize image uploads** (Cloudinary auto-optimization)
- **Progressive image loading** (blur-up technique)
- Cache theme data
- **Background upload queue** (don't block UI)

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus management
- **Alt text prompts** for all images
- **Image description suggestions** (AI-powered)

---

## 📦 Dependencies & Tools

### New Libraries Needed
- **react-beautiful-dnd**: Drag and drop
- **monaco-editor**: Custom CSS editor (optional)
- **react-colorful**: Better color picker
- **framer-motion**: Smooth animations
- **zustand**: State management (if not using Redux)

### AI Integration (Optional)
- **OpenAI API**: Color palette generation
- **Replicate**: Image generation
- **Anthropic Claude**: Content suggestions

---

## 🎯 North Star Metric

**"Time from signup to published store with 5+ products"**

Target: < 30 minutes (currently: 2-3 hours)

---

## 📞 Next Steps

1. **User interviews** (5-10 vendors) - Week 1
2. **Prototype click-to-edit** (Figma) - Week 1-2
3. **Technical spike** (PostMessage, performance) - Week 2
4. **Build MVP** (Quick wins + click-to-edit) - Week 3-4
5. **Beta test** (10 vendors) - Week 5
6. **Iterate & launch** - Week 6

---

## 💬 Questions to Answer

- [ ] Should we support mobile editor or require desktop?
- [ ] How much AI assistance is too much?
- [ ] Custom CSS: Pro tier or Business only?
- [ ] Version history: Keep how many versions?
- [ ] Should we allow vendors to share/sell templates?

---

*This is a living document. Update as we learn from users and build the product.*

**Last updated**: 2026-06-13
**Owner**: Product Team
**Status**: Planning Phase
