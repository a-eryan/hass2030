import Image from "next/image";
import { createFrame } from '@/app/actions'

export default function Home() {
  return (
    <>
      <main>
        <h1>Welcome to HASS Class of 2030</h1>
        <p>This website is dedicated to the School of Humanities, Arts and Social Sciences (HASS) class of 2030 at Stevens Institute of Technology.</p>
        <form action = {createFrame}>
          <input type = "image" name = "image" accept="image/*" required />
          <input type = "radio" name = "frame" value = "frame1" required /> Frame 1
          <input type = "radio" name = "frame" value = "frame2" required /> Frame 2
          <button type="submit">Create Frame</button>
        </form>
      </main>
      <footer>
        <p>&copy;  2026 Stevens Institute of Technology</p>
        <a href="https://www.stevens.edu/school-humanities-arts-and-social-sciences" target="_blank" rel="noopener noreferrer">
          Learn more about HASS at Stevens Institute of Technology
        </a>
        <a href="https://www.instagram.com/hassatstevens/" target="_blank" rel="noopener noreferrer">
          Follow us on Instagram
        </a>
      </footer>
    </>
  );
}
