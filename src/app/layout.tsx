import { createClient } from "@utils/supabase/server";
import RootLayout from "./layoutcomp";
import { Database } from "../../lib/database.types";
import { Analytics } from "@vercel/analytics/next"


export const metadata = {
  title: 'AfroAllure | Empowering Black Beauty Professionals',
  icons: {
    icon: '/unnamed.ico',
  },
}
export default async function Layout({ children }: any) {
  return <>
    <Analytics />
    <RootLayout children={children} />
  </>
}
