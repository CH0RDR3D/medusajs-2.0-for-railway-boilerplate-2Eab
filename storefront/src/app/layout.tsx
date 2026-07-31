import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import ThemeProvider from "@modules/layout/components/theme-provider"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

const themeInitScript = `(() => {
  try {
    const key = "shadystore-theme";
    const saved = localStorage.getItem(key);
    const pref = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const mode = pref === "system" ? system : pref;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);
    document.documentElement.setAttribute("data-mode", mode);
  } catch {}
})();`

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)] transition-colors duration-300">
        <ThemeProvider>
          <main className="relative">{props.children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
