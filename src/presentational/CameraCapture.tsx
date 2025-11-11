import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Video,
  RotateCcw,
  Timer,
  RefreshCcw,
  FlipHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import SelectorImage from "./SelectorImage";
import UploadImage from "./UploadImage";
import LoadingThreeDotsJumping from "@/components/LoadingThreeDotsJumping";
import { usePhotoStore } from "@/store/usePhotoStore";
import { useCameraStore } from "@/store/useCameraStore";
import { capturePhoto } from "@/utils/capturePhoto";
import { startCamera } from "@/utils/startCamera";

const CameraCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCountdownActiveRef = useRef(false);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isSessionActiveRef = useRef(false);

  const maxShots = 10;
  const delayBetweenShots = 1500;

  const { photoBlobs, clearPhotos, photoPreviews, selectionConfirmed } =
    usePhotoStore();

  useEffect(() => {
    console.log("photoBlobs:", photoBlobs);
    // console.log("selectedPhotoBlobs:", selectedPhotoBlobs);
    console.log("selectionConfirmed:", selectionConfirmed);
  }, [photoBlobs, selectionConfirmed]);

  const {
    isVideoOn,
    setIsVideoOn,
    isEditing,
    setIsEditing,
    isSelectingImages,
    setIsSelectingImages,
    isPreviewMode,
    setIsPreviewMode,
    isCountdown,
    setIsCountdown,
    countdown,
    setCountdown,
    timer,
    setTimer,
    showTimerOptions,
    setShowTimerOptions,
    rotation,
    setRotation,
    isFlipped,
    setIsFlipped,
    isCapturing,
    setIsCapturing,
    isProcessing,
    setIsProcessing,
    resetCameraState,
  } = useCameraStore();

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    isCountdownActiveRef.current = false;
    isSessionActiveRef.current = false;
    clearAllTimeouts();

    setIsVideoOn(false);
    setIsPreviewMode(false);
    setIsCapturing(false);

    setIsCountdown(false);
    setCountdown(null);
  };

  const startCountdown = (duration: number, onEnd: () => void) => {
    let count = duration;
    isCountdownActiveRef.current = true;
    setCountdown(count);
    setIsCountdown(true);

    countdownRef.current = setInterval(() => {
      if (!isCountdownActiveRef.current) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        return;
      }

      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        isCountdownActiveRef.current = false;
        setIsCountdown(false);
        onEnd();
      }
    }, 1000);
  };

  const startBoothSession = async () => {
    if (isCapturing) return;

    if (!isPreviewMode) {
      await startCamera(videoRef);
    }

    isSessionActiveRef.current = true;
    setIsVideoOn(true);
    setIsPreviewMode(false);
    let shot = 0;

    const takeNextShot = async () => {
      if (!isSessionActiveRef.current) return;

      if (shot >= maxShots) {
        stopCamera();
        const timeoutId = setTimeout(() => setIsEditing(true), 800);
        timeoutIdsRef.current.push(timeoutId);
        return;
      }

      startCountdown(timer, async () => {
        await capturePhoto(videoRef, photoRef);
        shot++;

        if (shot < maxShots) {
          const timeoutId = setTimeout(() => takeNextShot(), delayBetweenShots);
          timeoutIdsRef.current.push(timeoutId);
        } else {
          stopCamera();
        }
      });
    };

    takeNextShot();
  };

  const handleRetake = async () => {
    stopCamera();
    clearPhotos();
    resetCameraState();
    isSessionActiveRef.current = false;

    setTimeout(() => startBoothSession(), 100);
  };

  const handleEditPhotos = () => {
    setIsProcessing(true);
    const timeoutId = setTimeout(() => {
      setIsProcessing(false);
      setIsSelectingImages(true);
    }, 1200);
    timeoutIdsRef.current.push(timeoutId);
  };

  useEffect(() => {
    const autoStartPreview = async () => {
      if (!isPreviewMode) {
        await startCamera(videoRef);
      }
    };

    const timeout = setTimeout(autoStartPreview, 500);
    return () => {
      clearTimeout(timeout);
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSelectingImages && photoBlobs.length > 0 && selectionConfirmed) {
      setIsSelectingImages(false);
      setIsEditing(true);
    }
  }, [
    isSelectingImages,
    photoBlobs.length,
    selectionConfirmed,
    setIsSelectingImages,
    setIsEditing,
  ]);

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-screen bg-black text-yellow-400 text-2xl font-semibold"
      >
        Processing your photos <LoadingThreeDotsJumping />
      </motion.div>
    );
  }

  if (isSelectingImages && photoBlobs.length > 0) {
    return <SelectorImage />;
  }

  if (isEditing && photoBlobs.length > 0) {
    return <UploadImage autoStartUpload />;
  }

  return (
    <section className="flex items-center gap-6 p-4 md:p-6 w-full max-w-[1200px] mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-col items-center justify-center gap-2 md:gap-2 w-full">
        <div className="relative w-full h-full md:w-full aspect-video border border-yellow-500 rounded-2xl overflow-hidden bg-black/90 shadow-lg shadow-yellow-500/30 flex justify-center items-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isFlipped ? "scale-x-[-1]" : ""
            }`}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <AnimatePresence mode="wait">
            {isCountdown && countdown !== null && (
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.2,
                  transition: { duration: 0.15 },
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center text-yellow-400 text-6xl md:text-8xl font-bold bg-black/50"
              >
                {countdown}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-5 gap-3 items-center md:items-start justify-center mt-5">
          {photoPreviews.map((url, index) => (
            <motion.img
              key={index}
              src={url}
              alt={`shot-${index + 1}`}
              className="w-28 h-20 md:w-44 md:h-36 object-cover rounded-lg border-2 border-yellow-400 shadow-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            />
          ))}
          {Array.from({ length: maxShots - photoPreviews.length }).map(
            (_, i) => (
              <div
                key={i}
                className="w-28 h-20 md:w-44 md:h-36 rounded-lg border-2 border-dashed border-yellow-700 bg-black/50"
              />
            )
          )}
        </div>
      </div>

      <canvas ref={photoRef} className="hidden" />

      <div className="flex flex-col justify-center gap-3 md:gap-4 mt-4">
        {isPreviewMode && !isVideoOn && photoBlobs.length === 0 && (
          <div className="h-[280px] flex flex-col items-center gap-2">
            <Button
              onClick={() => startBoothSession()}
              variant="outline"
              className="rounded-full border-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center text-base md:text-lg font-semibold transition-all duration-300 bg-transparent"
            >
              <Camera size={16} className="md:size-20" />
            </Button>
            <div className="relative">
              <Button
                onClick={() => setShowTimerOptions(!showTimerOptions)}
                variant="outline"
                disabled={isCapturing}
                className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm md:text-lg px-4 py-2 flex items-center gap-2"
              >
                <Timer size={18} /> Timer
              </Button>

              {showTimerOptions && (
                <div className="absolute left-0 mt-2 bg-black border border-yellow-400 rounded-xl p-1.5 shadow-lg flex gap-0.5">
                  {[3, 5, 10].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTimer(t);
                        setShowTimerOptions(false);
                      }}
                      className={`px-2  rounded-md text-sm font-semibold ${
                        timer === t
                          ? "bg-yellow-400 text-black"
                          : "text-yellow-400 hover:bg-yellow-400/20"
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setRotation((rotation + 90) % 360)}
              variant="outline"
              disabled={isCapturing}
              className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm md:text-lg px-4 py-2 flex items-center gap-2"
            >
              <RefreshCcw size={18} /> Rotate
            </Button>

            <Button
              onClick={() => setIsFlipped(!isFlipped)}
              variant="outline"
              disabled={isCapturing}
              className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm md:text-lg px-4 py-2 flex items-center gap-2"
            >
              <FlipHorizontal size={18} /> Flip
            </Button>
          </div>
        )}

        {isVideoOn && !isPreviewMode && photoBlobs.length >= 1 && (
          <>
            <Button
              onClick={stopCamera}
              className="rounded-full border-4 border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center gap-1 text-sm md:text-lg font-semibold"
            >
              <Video size={28} />
              Stop
            </Button>
          </>
        )}

        {!isVideoOn && photoBlobs.length > 0 && (
          <div className="flex flex-col  items-center justify-center gap-4 mt-6">
            <Button
              disabled={photoBlobs.length < 8}
              onClick={handleEditPhotos}
              className="rounded-full bg-yellow-400 text-black font-semibold px-4 py-19 text-base md:text-lg shadow-md hover:bg-yellow-500 hover:shadow-lg focus:ring-2 focus:ring-yellow-300 transition-all duration-200"
            >
              Edit & Continue
            </Button>

            <Button
              onClick={handleRetake}
              variant="outline"
              className="rounded-full flex items-center gap-2 border-2 border-yellow-400 text-yellow-400 px-8 py-3 text-base md:text-lg hover:bg-yellow-400 hover:text-black transition-all duration-200"
            >
              <RotateCcw size={20} /> Retake
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CameraCapture;
