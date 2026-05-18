import '@mantine/core/styles.css';

import { createClient } from "@/app/utils/supabase/server";
import RootLayout from "./layoutcomp";
import { Database } from "../../lib/database.types";
import { Analytics } from "@vercel/analytics/next"
import { CssVarsProvider } from "@mui/joy";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';



export const metadata = {
  title: 'AfroAllure | Empowering Black Beauty Professionals',
  icons: {
    icon: '/unnamed.ico',
  },
}
export default async function Layout({ children }: any) {
  return <>
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <Analytics />
          <RootLayout children={children} />
        </MantineProvider>
      </body>
    </html>


  </>
}
