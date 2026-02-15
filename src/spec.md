# Specification

## Summary
**Goal:** Improve quantity/weight cell UX by showing an empty input with a placeholder when the stored value is zero, and ensure whole-number entries reliably commit and normalize to 3-decimal precision.

**Planned changes:**
- Update quantity/weight inputs across all editable sections so stored zero values render as an empty field (value="") with a "0.000" placeholder, while calculations still treat empty as 0.
- Adjust quantity/weight commit/normalization so whole numbers (e.g., "56") save consistently on Enter, blur, or page-level Save, and display after commit as fixed 3-decimal format (e.g., 56.000).
- Preserve existing display behavior for non-zero values (fixed 3-decimal when not actively editing).

**User-visible outcome:** Quantity/weight fields no longer appear pre-filled with “0.000”; users can enter whole numbers without typing a decimal, and values reliably save and display as 3-decimal numbers across Opening Stock, Purchase, Sales, and Suspense.
