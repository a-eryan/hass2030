"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import ComputerForm from "./components/ComputerForm";

const framesSrc = [
  "/frames/HASS-2030-Frame-1",
  "/frames/HASS-2030-Frame-1-Alt",
  "/frames/HASS-2030-Frame-2",
  "/frames/HASS-2030-Frame-2-Alt",
  "/frames/HASS-2030-Frame-3",
  "/frames/HASS-2030-Frame-3-Alt",
  "/frames/HASS-2030-Frame-4",
  "/frames/HASS-2030-Frame-4-Alt",
  "/frames/HASS-2030-Frame-5",
  "/frames/HASS-2030-Frame-5-Alt",
  "/frames/HASS-2030-Frame-6",
  "/frames/HASS-2030-Frame-6-Alt",
  "/frames/HASS-2030-Frame-7",
  "/frames/HASS-2030-Frame-7-Alt",
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-stevens-red">
        <ul className="flex gap-10 p-4 justify-center items-center object-contain">
          <li>
            <Image src="/stevens-hass-logo-small.svg" alt="HASS Logo" width={70} height={70} />
          </li>
          <li className="ml-auto">
            <a href="https://www.stevens.edu/hass" target="_blank" rel="noopener noreferrer" className="font-extra font-bold text-white text-2xl">
              HASS MAIN WEBSITE
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/hassatstevens/" target="_blank" rel="noopener noreferrer" className="font-extra font-bold text-white text-2xl">
              <Image src="/instagram-hass.svg" alt="Instagram Icon" width={28} height={28}/>
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/showcase/hassatstevens/" target="_blank" rel="noopener noreferrer" className="font-extra font-bold text-white text-2xl">
              <Image src="/linkedin-hass.svg" alt="LinkedIn Icon" width={28} height={28}/>
            </a>
          </li>
          <li>
            <a href="https://www.facebook.com/HASSatStevens/" target="_blank" rel="noopener noreferrer" className="font-extra font-bold text-white text-2xl">
              <Image src="/facebook-hass.svg" alt="Facebook Icon" width={28} height={28} />
            </a>
          </li>
          <li>
            <a href="https://www.youtube.com/@HASSatStevens" target="_blank" rel="noopener noreferrer" className="font-extra font-bold text-white text-2xl">
              <Image src="/youtube-hass.svg" alt="YouTube Icon" width={40.46} height={28} /> {/*rendered width of 28x28 is 28px width by 19.38 px height, giving us a ratio of approx. ratio of 1:0.692 width:height.  */}
            </a>
          </li>
        </ul>
      </nav>
      {/*flex-1: let main grow and shrink as needed to fill available space between header and footer, with footer at bottom of viewport even if main content is short*/}
      <main className="flex flex-col flex-1  mb-4">
        <h1 className="text-7xl text-center p-2 mt-4">Welcome HASS Class of 2030!</h1>
        <p className="p-2 m-4  text-center">Show your HASS spirit with a custom frame, ranging from professionalism to creativity. Your photos are not collected or shared with Stevens Institute of Technology or any third parties.</p>
        <ComputerForm framesSrc={framesSrc} />
      </main>
      <footer className="bg-dark-gray text-light-gray p-4 gap-4">
        <p>&copy;  2026 Stevens Institute of Technology</p>
      </footer>
    </div>
  );
}
