"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useSwipeable } from 'react-swipeable';

export default function MobileForm({framesSrc}) {
	const [error, setError] = useState(null);
  const [frameRequestInProgress, setFrameRequestInProgress] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [framedImageReady, setFramedImageReady] = useState(false);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(null);
  const [showFirstPreviewMsg, setShowFirstPreviewMsg] = useState(false);
  const fileRef = useRef(null);
  const formRef = useRef(null);
  const frameRefs = useRef([]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (frameRequestInProgress) return;
      setSelectedFrameIndex(prev => ((prev ?? 0) - 1 + framesSrc.length) % framesSrc.length);
    },
    onSwipedRight: () => {
      if (frameRequestInProgress) return;
      setSelectedFrameIndex(prev => ((prev ?? -1) + 1) % framesSrc.length);
    },
    preventScrollOnSwipe: true,
  });

  useEffect(() => {
    if (selectedFrameIndex !== null && fileRef.current?.size > 0) {
      formRef.current?.requestSubmit();
    }
    frameRefs.current[selectedFrameIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }, [selectedFrameIndex]);

  const handleFrameCreation = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const imageFile = fileRef.current;
    const frameType = formData.get('frame');
    console.log('Selected frame type:', frameType); 
    console.log('Selected image file:', imageFile);
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
        if (!prev) setShowFirstPreviewMsg(true);
        return url;
      });
      setFramedImageReady(!!frameType);
    } catch (err) {
      setError(err.message || 'Error creating frame. Please try again.');
    } finally {
      setFrameRequestInProgress(false);
    }
  }
  const createFrame = async (imageFile, frameType) => { //handle async operations (disk read, image decoding, frame loading) and potential errors
      //wrap in promise to handle the onload and onerror (callback based, not promises) from the image elements, as well as the timeout for long-running operations. 
      return new Promise((resolve, reject) => { 
        const timeout = setTimeout(() => {
          reject(new Error('Frame creation timed out. Please try again.'));
        }, 20000); //20 second timeout
        //only need FileReader if we wanted to do something with the raw file data, but since we can create an object URL directly from the file, we can skip straight to loading the image which will handle decoding and dimension checks for us. This also simplifies error handling since we can just listen for errors on the image element.
        const img = new window.Image(); //create empty <img> element to load and decode the uploaded image file, which allows us to check dimensions and draw to canvas

        //event handlers for image loading and errors, once the image is loaded and decoded 
        img.onload = async (e) => { //once the image is loaded and decoded, we can check dimensions and draw to canvas
          URL.revokeObjectURL(img.src); //free memory used by the object URL since we no longer need it after the image is loaded
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
            if (!prev) setShowFirstPreviewMsg(true);
            return URL.createObjectURL(previewBlob);
          });

          if (!frameType) { //parent function renders a preview of the user's image without a frame (no frame selected) 
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
          URL.revokeObjectURL(img.src); //free memory used by the object URL since we no longer need it after the image load fails
          clearTimeout(timeout);
          reject(new Error('Error loading image file. Please try again.'));
        };
        img.src = URL.createObjectURL(imageFile); //create object URL from the uploaded file and set as source for the image element, which will trigger loading and decoding, and eventually the onload or onerror handlers defined above.
      });
    }	  
	return (
<form onSubmit={handleFrameCreation} ref={formRef}> {/*formRef to get the form DOM node*/}
		<input type="file" name="image" id="image" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={frameRequestInProgress} onChange={(e) => { fileRef.current = e.target.files?.[0] ?? null; setFramedImageReady(false); e.target.form?.requestSubmit(); }} />
		<div className="flex items-center justify-center">
			<label htmlFor="image" className="flex p-4 mb-3 h-15 w-49 cursor-pointer border-4 border-stevens-red outline-2 outline-solid outline-stevens-gray [outline-offset:-10px] font-extra font-bold text-xl text-stevens-red items-center justify-center text-center [transition:border-width_200ms_ease-in-out,outline_0s_0s] hover:border-10 hover:outline-0  hover:[transition:border-width_200ms_ease-in-out,outline_0s_200ms]">
				SELECT YOUR PHOTO
			</label>
		</div>
		{error && <p className="text-red-500 text-center">{error}</p>}
		<div className="[background:linear-gradient(rgba(163,38,56,.70),rgba(163,38,56,.90))_center/cover_no-repeat,url('/17-008_Stevens_441_16903__1_.jpg')_center/cover_no-repeat] flex flex-row  h-full w-full items-start justify-center gap-4 p-4">
			<div className="flex flex-1 self-stretch flex-col items-center justify-center gap-4 p-4 ">
      {showFirstPreviewMsg && (
        <div className="absolute bg-dark-blue/90 flex flex-col items-center justify-center ">
          <Image src="/swipe-animation.gif" alt="Swipe Animation" unoptimized width={200} height={100} className="mt-2 filter invert hue-rotate-355 saturate-85 brightness-98" />
          <p className="p-2 text-background text-center font-bitter text-lg">Swipe to switch frames, or tap one to select it.</p>
          <button onClick={() => setShowFirstPreviewMsg(false)} className="mb-4 px-4 py-2 bg-dark-gray text-background">OK</button>
        </div>
      )}        
				<h2 className="text-5xl text-white text-center">Your Frame Preview:</h2>
					{previewUrl ? (
					<img {...swipeHandlers} src={previewUrl} alt="Frame Preview" className="rounded-full max-h-48 bg-background" />
					) : (
						<div className="w-48 h-48 rounded-full bg-light-gray flex items-center justify-center">
							<span className="text-center font-bitter">Your framed photo will appear here</span>
						</div>
						)
						}
			<div className="flex flex-row gap-4 align-middle items-center  overflow-x-auto " >
				{framesSrc.map((src, index) => (
					<label key={index} className="shrink-0 cursor-pointer hover:scale-105 transition-transform">
						<Image src={`${src}.png`} alt={`Frame ${index + 1} Preview`} width={80} height={80} className="rounded-full cursor-pointer bg-stevens-gray" ref={element => frameRefs.current[index] = element} />
						<input type="radio" name="frame" value={src.split('/').pop()} checked={selectedFrameIndex === index} disabled={frameRequestInProgress} className="hidden" onChange={() => { setSelectedFrameIndex(index); }} />
					</label>
				))}
			</div>            
				{/*The text-, bg-, and border- Tailwind utilities work because Tailwind inlines their values at compile time. The outline-color utility apparently doesn't get that treatment.*/}
					{frameRequestInProgress ? (
						<button disabled className="cursor-not-allowed p-3 h-15 w-49 border-4 border-medium-gold outline-2 outline-solid outline-light-gray [outline-offset:-10px] font-extra font-bold text-xl text-white items-center justify-center text-center">Processing...</button>
						) : (
						<a href={framedImageReady ? previewUrl : undefined} download={framedImageReady ? "hass_frame.png" : undefined} className={`flex p-3 h-15 w-49 border-4 border-medium-gold outline-2 outline-solid outline-light-gray [outline-offset:-10px] font-extra font-bold text-xl text-white items-center justify-center text-center ${framedImageReady ? 'cursor-pointer [transition:border-width_200ms_ease-in-out,outline_0s_0s] hover:border-10 hover:outline-0 hover:[transition:border-width_200ms_ease-in-out,outline_0s_200ms]' : 'cursor-not-allowed'}`}>
            DOWNLOAD FRAME</a>
						)}
			</div>
		</div>
	</form>
	)
}
