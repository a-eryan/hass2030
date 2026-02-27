"use client";
import Image from "next/image";
import { useState } from "react";

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
  const [error, setError] = useState(null);
  const [frameRequestInProgress, setFrameRequestInProgress] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFrameCreation = async (event) => {
    const formData = new FormData(event.currentTarget);
    const imageFile = formData.get('image');
    const frameType = formData.get('frame');

    if (!imageFile || imageFile.size === 0) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or WEBP image.');
      return;
    }
    setError(null);
    setFrameRequestInProgress(true);

    try {
      const canvas = await createFrame(imageFile, frameType);
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      }); //free memory by revoking old object URL when creating a new one
    } catch (err) {
      setError(err.message || 'Error creating frame. Please try again.');
    } finally {
      setFrameRequestInProgress(false);
    }
  }

  const createFrame = async (imageFile, frameType) => { //handle async operations (disk read, image decoding, frame loading) and potential errors
    //wrap in promise to handle the onload and onerror callbacks from the image elements, as well as the timeout for long-running operations. 
    return new Promise((resolve, reject) => { 
      const timeout = setTimeout(() => {
        reject(new Error('Frame creation timed out. Please try again.'));
      }, 20000); //20 second timeout
      //only need FileReader if we wanted to do something with the raw file data, but since we can create an object URL directly from the file, we can skip straight to loading the image which will handle decoding and dimension checks for us. This also simplifies error handling since we can just listen for errors on the image element.
      const img = new window.Image(); //create empty <img> element to load and decode the uploaded image file, which allows us to check dimensions and draw to canvas

      //event handlers for image loading and errors, once the image is loaded and decoded 
      img.onload = async (e) => { //once the image is loaded and decoded, we can check dimensions and draw to canvas
        clearTimeout(timeout);
        if (img.width > 2000 || img.height > 2000) {
          reject(new Error('Image dimensions are too large. Please upload an image smaller than 2000x2000 pixels.'));
          return;
        }

        const canvas = new OffscreenCanvas(2000, 2000);
        const ctx = canvas.getContext('2d');

        // Draw the uploaded image centered on the canvas
        const size = Math.min(img.width, img.height)
        const x = (img.width - size) / 2
        const y = (img.height - size) / 2

        ctx.drawImage(img,
          x,y,size,size, //source cropping to square
          0,0,2000,2000 //destination scaling to 2000x2000
        );

        //given the scaled user image is now drawn to the canvas, we can create a preview URL for the user pre frame
        const previewBlob = await canvas.convertToBlob({ type: 'image/png' }); //takes snapshot of current canvas state and encodes it as a PNG blob
        setPreviewUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(previewBlob);
        });

        //file selected, no frame yet case
        if (!frameType) {
          resolve(canvas);
          return;
        }

        const frameImg = new window.Image()
        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, 2000, 2000);
          resolve(canvas); // resolve with the canvas so handleFrameCreation can convert it
        }

        frameImg.onerror = () => reject(new Error('Frame load failed'))
        frameImg.src = `/frames/${frameType}.png`; //provide the frame as src attribute
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Error loading image file. Please try again.'));
      };
      img.src = URL.createObjectURL(imageFile); //create object URL from the uploaded file and set as source for the image element, which will trigger loading and decoding, and eventually the onload or onerror handlers defined above.
    });
  }
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
      <main className="flex flex-col flex-1 px-4 mb-4">
        <h1 className="text-7xl text-center p-2 m-4">Welcome HASS Class of 2030!</h1>
        <p className="p-2 m-4  text-center">Show your HASS spirit with a custom frame, ranging from professionalism to creativity. Your photos are not collected or shared with Stevens Institute of Technology or any third parties.</p>
        <div className="flex items-center justify-center">
          <label htmlFor="image" className="flex p-4 mb-3 h-15 w-49 cursor-pointer border-4 border-stevens-red outline-2 outline-solid outline-stevens-gray [outline-offset:-10px] font-extra font-bold text-xl text-stevens-red items-center justify-center text-center [transition:border-width_200ms_ease-in-out,outline_0s_0s] hover:border-10 hover:outline-0  hover:[transition:border-width_200ms_ease-in-out,outline_0s_200ms]">
            SELECT YOUR PHOTO
          </label>
          </div>         
        {error && <p className="text-red-500">{error}</p>}
      <div className="flex ">
          <div className=" flex flex-col items-center justify-center gap-4  ">
            <div className="bg-stevens-red h-full w-full flex flex-col items-center justify-center gap-4 p-4">
              <h2 className="text-5xl text-white">Your Frame Preview:</h2>
              {previewUrl ? (
              <img src={previewUrl} alt="Frame Preview" className="rounded-full max-h-48 bg-background" />
              ) : (
                <div className="w-48 h-48 rounded-full bg-light-gray flex items-center justify-center">
                  <span className="text-center font-bitter">Your framed photo will appear here</span>
                </div>
              )
              }
          {/*The text-, bg-, and border- Tailwind utilities work because Tailwind inlines their values at compile time. The outline-color utility apparently doesn't get that treatment.*/}
              {frameRequestInProgress ? ( 
                <button disabled className="cursor-not-allowed p-3 h-15 w-49 border-4 border-medium-gold outline-2 outline-solid outline-light-gray [outline-offset:-10px] font-extra font-bold text-xl text-white items-center justify-center text-center">Processing...</button>
              ) : (
                <a href={previewUrl} download="hass_frame.png" className="flex cursor-pointer p-3 h-15 w-49 border-4 border-medium-gold outline-2 outline-solid outline-light-gray [outline-offset:-10px] font-extra font-bold text-xl text-white items-center justify-center text-center [transition:border-width_200ms_ease-in-out,outline_0s_0s] hover:border-10 hover:outline-0 hover:[transition:border-width_200ms_ease-in-out,outline_0s_200ms]">
                DOWNLOAD FRAME</a>
              )}
            </div>
          <form onChange={handleFrameCreation}>
          <input id="image" type = "file" name = "image" accept="image/*" required className="hidden"/>
          <div className="flex flex-wrap gap-8 align-center justify-center">
            {framesSrc.map((src, index) => (
              <label key={index} className="cursor-pointer hover:scale-110 transition-transform">
                <Image src={`${src}.png`} alt={`Frame ${index + 1} Preview`} width={220} height={220} className=" 2xl:w-full rounded-full cursor-pointer" />
                <input type="radio" name="frame" value={src.split('/').pop()} required disabled={frameRequestInProgress} className="hidden" />
              </label>
            ))}
          </div>
        </form>
        </div>    
      </div>
      </main>
      <footer className="bg-dark-gray text-light-gray p-4 gap-4">
        <p>&copy;  2026 Stevens Institute of Technology</p>
      </footer>
    </div>
  );
}
