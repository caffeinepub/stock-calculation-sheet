# Specification

## Summary
**Goal:** Make the Stock Calculation Sheet reliably save/load per authenticated user via the Motoko backend (not localStorage) and add date-based sheet history with a date selector.

**Planned changes:**
- Update Stock Calculation Sheet Save/Load to persist the currently edited sheet in the Motoko backend scoped to the logged-in Internet Identity Principal, and restore saved values on page reload.
- Add backend support for per-user, date-keyed sheet snapshots: save for a given date, load for a given date, and list available saved dates; ensure data survives canister upgrades via stable storage.
- Add a date selector on the Stock Calculation Sheet page (defaults to today) that loads the selected date’s sheet from the backend; Save writes back to the currently selected date; show loading/saving states and an English error message if saving fails.

**User-visible outcome:** Users can pick a date to view/edit that day’s Stock Calculation Sheet, save it to the backend under their account, refresh the page without losing changes, and return to prior saved dates without seeing other users’ data.
