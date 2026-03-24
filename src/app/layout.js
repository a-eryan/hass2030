import { Saira_Extra_Condensed, Bitter } from "next/font/google";
import "./globals.css";

const sairaExtraCondensed = Saira_Extra_Condensed({
  variable: "--font-saira-extra-condensed", //specified CSS variable name
  weight: ["400", "700"],
  subsets: ["latin"],
});

const bitter = Bitter({
  variable: "--font-bitter", //specified CSS variable name
  subsets: ["latin"],
});

export const metadata = {
  title: "HASS Class of 2030 Profile Picture Frame Creator",
  description: "Website dedicated to providing a multitude of profile picture frame options for the School of Humanities, Arts and Social Sciences (HASS) class of 2030 at Stevens Institute of Technology. ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${sairaExtraCondensed.variable} ${bitter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
