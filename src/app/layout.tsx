import { createClient } from "@utils/supabase/server";
import RootLayout from "./layoutcomp";
import { Database } from "../../lib/database.types";

export const metadata = {
  title: 'AfroAllure',
  icons: {
    icon: '/unnamed.ico',
  },
}
export default async function Layout({ children }: any) {
  return <><RootLayout children={children} />
  </>
}
