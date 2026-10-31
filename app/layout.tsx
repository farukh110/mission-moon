import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Moon",
  description: "An offline 3D space exploration game for lower secondary students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before React loads. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
