import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import ShuffleSessionProvider from "@modules/common/components/shuffle-session-provider"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <ShuffleSessionProvider>
      <Nav />
      {props.children}
      <Footer />
    </ShuffleSessionProvider>
  )
}
