# Slot Creation Logic

Pulsebook automates slot generation for Healthcare Professionals (HCPs) to enable future bookings while maintaining flexibility for schedule changes.

## 1. Weekly Automated Generation (Cron)

Every **Monday at 00:00 (Midnight)**, the system automatically generates slots for the entire week (Monday to Sunday) for all active HCP schedules.

### Workflow:
1.  **Duration Promotion**: If a `pendingSlotDuration` was set during the previous week, it is promoted to the active `slotDuration`.
2.  **Range Calculation**: The system identifies the Monday to Sunday range for the current calendar week.
3.  **Slot Insertion**: For each day in the range that matches the HCP's `availableDays`, the system generates slots based on the `slotDuration`.

### Example:
- **Scenario**: On Sunday night, HCP Clark Kent has `slotDuration: 15` and `pendingSlotDuration: 30`. His `availableDays` are `[MONDAY, WEDNESDAY]`.
- **Monday 00:00**:
    - `slotDuration` becomes `30`.
    - `pendingSlotDuration` becomes `null`.
    - 30-minute slots are generated for the current Monday and current Wednesday.

## 2. Mid-Week Schedule Updates

HCPs or Clinic Admins can update schedules at any time. The impact depends on what is updated:

### A. Updating `availableDays`
Changes to available days take effect **immediately** for the remainder of the current week.

-   **Adding a Day**: If a day is added (e.g., adding Thursday on a Tuesday), slots for the upcoming Thursday are generated immediately.
-   **Removing a Day**: If a day is removed (e.g., removing Friday on a Wednesday), all **unappointed** slots for that Friday are deleted immediately. Slots with existing appointments are preserved.

### B. Updating `slotDuration`
Changes to slot duration are **deferred** to the following week.

-   The new duration is stored as `pendingSlotDuration`.
-   Existing slots for the current week are **not** modified to avoid clashing with existing appointments.
-   The new duration will be used during the next Monday's automated generation.

## 3. New Schedule Creation
When a new schedule is created (e.g., for a new HCP onboarding), slots are **not** generated immediately. They will be created during the next Monday's automated cycle. This aligns with the business rule that onboarding typically happens the week prior to starting.

## Summary Table

| Action | Immediate Effect | Deferred Effect (Next Monday) |
| :--- | :--- | :--- |
| **Weekly Cron** | N/A | Generates all slots for the week |
| **Add `availableDay`** | Slots created for remainder of week | Used for future weeks |
| **Remove `availableDay`** | Unappointed slots deleted for remainder of week | Used for future weeks |
| **Update `slotDuration`** | None | Becomes the active duration |
