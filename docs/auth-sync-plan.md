# Auth & Route Sync Plan

## Auth
Use **Firebase Auth** with OAuth providers (Google, Discord, etc). Already have a Firebase project set up.

## Storage
Use **Firestore** (already in use for shared route links).

## Data Structure

```
users/{uid}                          # manifest document (1 read on load)
  routes: {
    [routeId]: updatedAt (ISO string)
    [routeId]: updatedAt
    ...
  }

users/{uid}/routes/{routeId}         # full route document (read only when needed)
  name, dungeonKey, pulls, notes, drawings, assignments, ...
```

## Sync Strategy

On app load:
1. Read `users/{uid}` — 1 Firestore read to get the manifest
2. Compare each `routeId → updatedAt` against what's in local state
3. Fetch only routes that are newer than the local copy

This avoids reading all N route documents on every load, regardless of how long the device has been offline.

## Route Size Limit
Cap route document size before upload (suggested: ~10KB) to prevent abuse. Enforce in the save logic before writing to Firestore.

## Notes
- Keep the existing Firestore `routes` collection for anonymous shared-link routes — no changes needed there
- The manifest doc must be updated atomically with any route write (use a Firestore batch write)
