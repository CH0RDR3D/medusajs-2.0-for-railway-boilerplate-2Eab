# ShadyStore Mobile (Android)

A thin native Android shell (built with [Capacitor](https://capacitorjs.com/docs)) that wraps
the shadystore storefront in a WebView. The storefront is a server-rendered Next.js app, so
this app loads it live via `server.url` in [capacitor.config.json](capacitor.config.json)
rather than bundling a static build.

## Before you run it

- **Local dev**: start the storefront (`pnpm dev` in `../storefront`, listening on port 3000).
  The default config points at `http://10.0.2.2:3000`, which is the Android emulator's alias
  for your machine's `localhost`. Testing on a physical device? Change the URL to your
  machine's LAN IP, e.g. `http://192.168.1.50:3000`.
- **Production**: change `server.url` to your deployed HTTPS storefront URL and set
  `cleartext` to `false` before shipping a release build.

## Common commands

Run these from the `mobile/` directory.

```powershell
npm install                # install Capacitor deps
npx cap sync android       # copy config + native deps into the android/ project
npx cap open android       # open the project in Android Studio
npx cap run android        # build & run on a connected device/emulator
npx cap build android      # produce a signed AAB/APK for distribution
npx cap doctor             # check your native toolchain setup
```

Whenever you change `capacitor.config.json`, re-run `npx cap sync android`.
