"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function VideoPreview() {
  const [videoSrc] = useState<string>("/1109.mp4");
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPlaying && videoSrc && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay prevented:", err);
      });
    }
  }, [isPlaying, videoSrc]);

  const navigateToCamera = () => {
    navigate("/payment-option");
    setIsPlaying(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          muted
          loop
          autoPlay
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center bg-black/30 backdrop-blur-[2px]">
        <div className="absolute top-0 left-12 z-20 w-82 h-20 bg-linear-to-r from-black/98  to-transparent flex items-center gap-3 px-6">
          <div className="h-8 w-8 bg-yellow-400 text-black font-bold flex items-center justify-center rounded-md">
            K
          </div>
          <span className="font-semibold text-yellow-100 text-xl tracking-wide">
            Kwadratuhan
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-20"
        >
          <Card className="w-[340px] bg-zinc-900/80 border border-yellow-500/30 text-center shadow-xl backdrop-blur-md">
            <CardContent className="flex flex-col items-center justify-center space-y-6 mt-6">
              <div className="bg-yellow-600/20 rounded-xl p-6">
                <img
                  src="/public/Kwadratuhan_Logo.jpg"
                  alt="PhotoSnap"
                  className="w-24 h-24 object-contain mx-auto"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold mb-2 text-yellow-400">
                  Welcome!
                </h1>
                <p className="text-sm text-yellow-100/80 leading-relaxed px-4">
                  Capture your best moments and start your photo journey with
                  our Photobooth. Tap below to begin!
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center pb-6">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-transform hover:scale-[1.02]"
                onClick={navigateToCamera}
              >
                Start Your Editing Journey
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
