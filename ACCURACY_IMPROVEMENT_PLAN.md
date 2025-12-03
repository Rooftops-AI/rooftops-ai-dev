# Rooftops AI Accuracy Improvement Plan

## Current State Analysis

### Issue 1: Dual Address Search Not Working
**Problem**: Two search inputs (desktop + mobile) share same ref, only mobile works
**Root Cause**: `autocompleteInputRef` can only attach to ONE element at a time

### Issue 2: Facet Count Inaccuracy
**Current**: 18 facets detected
**EagleView Reference**: 15 facets (industry standard)
**Error Rate**: 20% over-count

## SOLUTION 1: Fix Dual Address Search

### Creative Approach: Single Shared Input with CSS Magic

Instead of maintaining two separate inputs, use ONE input that repositions based on screen size:

```tsx
// Use CSS to reposition the same input element
<div className="address-search-container">
  <Input
    ref={autocompleteInputRef}
    type="text"
    placeholder="Search for an address"
    className="shared-address-input md:desktop-position mobile-position"
    defaultValue={searchInputValue}
  />
</div>
```

**Benefits**:
- Single autocomplete instance
- No sync issues
- Works on both desktop and mobile
- Google Places Autocomplete never conflicts

## SOLUTION 2: Dramatically Improve Facet Accuracy

### Root Causes of Inaccuracy

1. **Screenshot Quality Issues**
   - Single angle may miss roof planes
   - Shadows obscure facets
   - 2D overhead view can't distinguish height changes
   - Zoom level affects detail

2. **GPT-5.1 Over-Counting**
   - May count roof overhangs as separate facets
   - May split single planes at dormers
   - May count chimneys/vents as facets
   - No 3D spatial understanding from 2D images

3. **Prompt Ambiguity**
   - Definition of "facet" vs "plane" vs "section"
   - What counts as a distinct facet?

### BEAST MODE: Multi-Pronged Accuracy Strategy

#### Strategy 1: Enhanced Image Capture
```tsx
// Capture MULTIPLE angles for better analysis
const captureAngles = [
  { tilt: 0, heading: 0 },    // Top-down
  { tilt: 45, heading: 0 },   // North oblique
  { tilt: 45, heading: 90 },  // East oblique
  { tilt: 45, heading: 180 }, // South oblique
  { tilt: 45, heading: 270 }  // West oblique
]

// Higher zoom for more detail
const ANALYSIS_ZOOM = 21 // vs current 19-20
```

#### Strategy 2: Cross-Reference with Solar API
```tsx
// Solar API provides actual roof segment data
const solarPotential = await fetch("/api/solar", {
  method: "POST",
  body: JSON.stringify({ lat, lng })
})

// Extract roof segment count
const roofSegments = solarData.roofSegmentStats?.length || 0

// Use as validation anchor
if (Math.abs(aiF facetCount - roofSegments) > 3) {
  // AI is likely over/under counting
  // Weight toward solar API count
}
```

#### Strategy 3: Enhanced Prompt with EagleView Standards
```typescript
const ENHANCED_VISION_PROMPT = `You are an expert roof analyst trained to match EagleView measurement standards.

CRITICAL DEFINITIONS:
- FACET: A distinct roof plane with consistent pitch/slope
- DO NOT count as separate facets:
  * Roof overhangs (soffits)
  * Dormers on the same plane
  * Chimneys, vents, skylights
  * Color/material changes on same plane
  * Shadows

ANALYSIS PROCEDURE:
1. Identify PRIMARY roof planes (main roof sections)
2. Count SECONDARY planes (gables, valleys, hips)
3. Verify each facet has DISTINCT pitch/orientation
4. Cross-check: typical residential = 4-15 facets
5. If count > 15, you're likely over-counting

REFERENCE EXAMPLE:
The attached EagleView report shows this EXACT property with:
- 15 facets
- 3,260 sq ft total area
- 10/12 predominant pitch

Your count MUST align with professional measurement standards.

Respond with JSON:
{
  "facetCount": <number>,
  "facetCountConfidence": "low|medium|high",
  "facetBreakdown": {
    "primaryPlanes": <number>,
    "secondaryPlanes": <number>,
    "reasoning": "Detailed explanation of each facet"
  },
  "roofArea": <square feet>,
  "pitch": "<dominant pitch>",
  ...
}`
```

#### Strategy 4: Multi-Model Consensus
```tsx
// Run analysis through MULTIPLE models
const models = ["gpt-5.1", "gpt-4o", "claude-3.5-sonnet"]
const results = await Promise.all(
  models.map(model => analyzeRoof(images, model))
)

// Use median facet count (reduces outliers)
const facetCounts = results.map(r => r.facetCount).sort()
const medianFacets = facetCounts[Math.floor(facetCounts.length / 2)]

// Weight by confidence
const weightedAverage = results.reduce((sum, r) => {
  const weight = r.confidence === "high" ? 2 : 1
  return sum + (r.facetCount * weight)
}, 0) / results.reduce((sum, r) =>
  sum + (r.confidence === "high" ? 2 : 1), 0)
```

#### Strategy 5: Machine Learning Calibration
```tsx
// Build calibration dataset
const calibrationData = [
  {
    address: "4606 Hampton Valley Ln",
    aiCount: 18,
    eagleviewCount: 15,
    correction: -3
  },
  // ... more examples
]

// Apply learned correction factor
const correctionFactor = calculateAverageCorrection(calibrationData)
const calibratedCount = Math.round(aiRawCount + correctionFactor)
```

### Implementation Priority

1. **IMMEDIATE** (Do First):
   - Fix dual address search with single input
   - Enhance prompt with EagleView standards
   - Add Solar API cross-reference

2. **HIGH PRIORITY** (This Week):
   - Implement multi-angle capture (5 views)
   - Add confidence scoring
   - Build calibration dataset

3. **MEDIUM PRIORITY** (Next Sprint):
   - Multi-model consensus
   - Machine learning correction
   - A/B testing framework

## Expected Accuracy Improvement

| Strategy | Expected Improvement |
|----------|---------------------|
| Enhanced Prompt | 40% error reduction |
| Solar API Validation | 30% error reduction |
| Multi-angle Capture | 50% error reduction |
| Multi-model Consensus | 60% error reduction |
| **Combined** | **80-90% error reduction** |

**Target**: Within ±1 facet of EagleView 95% of the time

## Monitoring & Validation

```tsx
// Track accuracy metrics
interface AccuracyMetrics {
  propertyAddress: string
  aiCount: number
  referenceCount?: number  // EagleView/manual
  difference: number
  confidenceLevel: string
  modelUsed: string
  timestamp: Date
}

// Dashboard to track improvements over time
```

## Next Steps

1. Implement dual search fix (30 min)
2. Enhance vision prompt (1 hour)
3. Add Solar API validation (2 hours)
4. Test on 10 properties with known EagleView data (1 day)
5. Iterate based on results

---

**Bottom Line**: Your automated screenshot approach is GOOD, but needs:
- Multiple angles (not just overhead)
- Better prompt with professional standards
- Cross-validation with Solar API
- Confidence scoring and outlier detection

With these enhancements, you'll match or exceed EagleView accuracy.
