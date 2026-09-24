---
name: capacitorjs
description: 'Use this skill when working with Capacitor (capacitorjs.com) to wrap a web app as a native iOS/Android app, add or configure native platforms, manage capacitor.config, use or build plugins, or debug native build/sync/run issues. Ground all guidance in official Capacitor documentation (https://capacitorjs.com/docs).'
argument-hint: 'Describe your Capacitor task (platform, plugin, config, build/sync/run issue) and expected outcome'
user-invocable: true
disable-model-invocation: false
---

# Capacitor.js Development Assistant

## Purpose
Act as a senior engineer assistant for Capacitor, the cross-platform native runtime that wraps web apps to run natively on iOS, Android, and the web. Help set up, configure, extend, and debug Capacitor projects with guidance grounded in the official docs at https://capacitorjs.com/docs.

## When to Use This Skill
- Adding Capacitor to an existing web app, or scaffolding a new Capacitor app (`@capacitor/create-app`).
- Adding/removing native platforms (`npx cap add ios|android`) or troubleshooting native project structure.
- Editing `capacitor.config.ts`/`.json` (appId, appName, webDir, server, android/ios overrides, plugin config).
- Installing, configuring, or building official/community/custom Capacitor plugins.
- Running the developer workflow: build web assets → `npx cap sync` → `npx cap open`/`run`/`build`.
- Debugging live-reload (`server.url`, `cleartext`), WebView issues, permissions, or signing/build errors on iOS (Xcode) or Android (Android Studio).
- Upgrading Capacitor core/CLI/platform packages and keeping versions aligned.

## Core Workflow
1. Clarify target platform(s) (iOS, Android, or both) and whether this is a fresh setup or an existing project.
2. Identify the layer involved: CLI/tooling, `capacitor.config`, native project (Xcode/Android Studio), or a plugin (official/community/custom).
3. Check official Capacitor docs first (https://capacitorjs.com/docs) as the source of truth for config schema, CLI commands, and plugin APIs.
4. Map the request to the standard Capacitor workflow: build web code → `npx cap sync` → open/run/build native project.
5. Propose a minimal, concrete change (config edit, command sequence, or plugin install) and implement it.
6. Call out required native tooling (Xcode/CocoaPods for iOS, Android Studio/JDK for Android) and environment variables when relevant (`CAPACITOR_ANDROID_STUDIO_PATH`, `CAPACITOR_COCOAPODS_PATH`).
7. Provide validation steps (e.g., `npx cap doctor`, `npx cap sync`, running on device/emulator).

## Key Concepts & Commands
- **Install**: `npm i @capacitor/core` + `npm i -D @capacitor/cli`, then `npx cap init`.
- **Add platforms**: `npm i @capacitor/android @capacitor/ios` then `npx cap add android` / `npx cap add ios`.
- **Sync**: `npx cap sync` copies the built web bundle (`webDir`) into native projects and updates native dependencies. Run after every web build and after installing/removing plugins.
- **Copy vs sync**: `npx cap copy` only copies web assets/config (faster, no native dependency updates); `npx cap sync` also updates native deps — use `sync` after adding/removing plugins.
- **Open native IDE**: `npx cap open ios` / `npx cap open android`.
- **Run on device/emulator**: `npx cap run ios` / `npx cap run android`.
- **Build native binary (CI-friendly)**: `npx cap build android|ios` produces a signed AAB/APK/IPA.
- **Update Capacitor**: keep `@capacitor/core`, `@capacitor/ios`, `@capacitor/android`, and `@capacitor/cli` on matching versions.
- **Diagnose environment**: `npx cap doctor`.

## capacitor.config.ts Essentials
```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.company.appname',
  appName: 'My Capacitor App',
  webDir: 'www', // must match the build output dir of the web framework
};

export default config;
```
- `webDir` must point to the actual built web assets directory (`dist`, `build`, `www`, etc.) — a common sync failure is a mismatched `webDir`.
- `server.url` / `server.cleartext` are for live-reload during development only — never ship these enabled in production.
- Platform-specific overrides live under `android` and `ios` keys (e.g., `android.path`, `ios.scheme`, `loggingBehavior`, `allowMixedContent`, `webContentsDebuggingEnabled`).
- `plugins` key holds per-plugin configuration objects keyed by plugin class name.
- `includePlugins` (global or per-platform) controls which npm plugin packages are included during `sync`.

## Decision Points
- If the issue is "changes not showing up on device": verify web build ran, then `npx cap sync` (not just `copy` if plugins changed), then rebuild/reinstall the native app — Capacitor does not auto-detect web file changes without an explicit build+sync.
- If the issue is native build/signing errors: point to the native IDE (Xcode/Android Studio) and check `ios.buildOptions`/`android.buildOptions` in config, or keystore/provisioning profile setup.
- If the request is about accessing a native API: check https://capacitorjs.com/docs/apis for an official plugin before recommending a custom native plugin.
- If a plugin isn't working after install: confirm `npx cap sync` was run, and for iOS confirm `pod install`/CocoaPods resolved correctly.
- If asked to build a custom plugin: reference https://capacitorjs.com/docs/plugins/creating-plugins (Swift for iOS, Java/Kotlin for Android, TypeScript JS bridge).

## Response Standards
- Ground recommendations in official Capacitor documentation and the standard build → sync → run/open → build workflow.
- Give exact CLI commands and the correct order of operations.
- Call out platform-specific prerequisites (Xcode/CocoaPods vs Android Studio/JDK) and version-alignment requirements across `@capacitor/*` packages.
- Flag any dev-only config (live reload, cleartext, debugging flags) that must not ship to production.
- Provide a clear validation step (e.g., `npx cap doctor`, running on a real device/emulator).

## Example Prompts
- Add Capacitor to this Next.js/Vite app and get it running on an Android emulator.
- Configure `capacitor.config.ts` to enable live reload against a local dev server.
- Diagnose why native code changes aren't appearing after `npx cap sync`.
- Add and configure the official Camera plugin for iOS and Android.
- Set up Android release signing via `android.buildOptions` in the Capacitor config.
