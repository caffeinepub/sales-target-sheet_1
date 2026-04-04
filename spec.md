# Sales Target Sheet

## Current State
The settings page (PratikSoniPage) is accessible via a tab named with the logged-in user's mobile number. It has sections for currency, color theme, category management, and user management (admin only). The top nav shows the mobile number as the user identifier. There is no display name feature -- users can only be identified by their mobile number.

The backend User type contains only `mobile` and `password` fields. There is no name field in the backend or frontend.

## Requested Changes (Diff)

### Add
- A "Profile" section at the top of the settings page (PratikSoniPage) with:
  - Display of the current user's name (or mobile number if no name set)
  - An edit button (pencil icon) to enable inline editing of the display name
  - Save/cancel controls when editing
- Backend function `setUserName(mobile, name)` to persist the display name
- Backend function `getUserName(mobile)` to retrieve it
- Display the user name (if set) in the top nav alongside the mobile number

### Modify
- `User` type in backend: add optional `displayName` field (stored as `?Text`)
- `TopNav` component: show display name above mobile number if set
- `App.tsx`: pass display name to TopNav (via state, fetched after login)

### Remove
- Nothing removed

## Implementation Plan
1. Update backend `User` type to include `displayName: ?Text`
2. Add `setUserName(mobile, name)` and `getUserName(mobile)` backend functions
3. Regenerate `backend.d.ts` bindings (done by generate_motoko_code)
4. Add Profile section to PratikSoniPage with inline edit for display name
5. Fetch display name after login in App.tsx and pass to TopNav
6. Update TopNav to show name if available
