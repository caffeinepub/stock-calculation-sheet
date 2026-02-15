# Specification

## Summary
**Goal:** Improve quantity/weight entry to support natural typing while enforcing 3-decimal formatting, and ensure the full Stock Calculation Sheet prints cleanly on a single A5 page.

**Planned changes:**
- Update all quantity/weight inputs (Opening Stock, Purchase, Sales, Suspense) to allow free-form editing without mid-typing reformatting, then normalize on commit/blur to exactly three decimals.
- Ensure all totals (section footers and Final Calculation) remain numerically consistent and always display with three decimals; treat invalid/empty inputs as 0.000 after commit without showing NaN.
- Adjust print-only styles to force A5 single-page output for the entire sheet (all four tables + Final Calculation) with clean spacing, no clipping, and no internal page breaks, without affecting on-screen layout.

**User-visible outcome:** Users can enter quantities naturally (including partial decimals) and see values/totals consistently formatted to 0.000 after committing edits, and printing produces exactly one A5 page containing the full sheet without cut-offs or unwanted page breaks.
