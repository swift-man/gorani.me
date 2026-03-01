# Project Agent Guide

## Workspace Roles
- `ios/`: iOS native project workspace.
- `android/`: Android native project workspace.
- `react-native/`: Cross-platform React project (Web + iOS + Android UI layer).
- `fastapi/`: Backend API service workspace.
- `admin/`: Admin panel workspace.

## Cross-platform UI Requirements
- Target platforms: Web, iOS, Android.
- Native (iOS/Android): use native-style `Tab Bar + Navigation Bar`.
- Web: use a dedicated top navigation bar and web routing.

## Primary Top Navigation Menus
- 시세
- 커뮤니티
- 뉴스
- 내 정보

## Screen Scope
Each menu must include:
- List/Main screen
- Detail screen (empty scaffold allowed)

## Implementation Notes
- Keep web and native navigation split by platform.
- Reuse shared screen components where possible.
- Start with blank detail screens, then fill features incrementally.
