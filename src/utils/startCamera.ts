import { useCameraStore } from "@/store/useCameraStore";
import { usePhotoStore } from "@/store/usePhotoStore";

export const startCamera = async (
  videoRef: React.RefObject<HTMLVideoElement | null>
) => {
  const { isPreviewMode, setIsPreviewMode, setIsVideoOn } =
    useCameraStore.getState();
  const { clearPhotos } = usePhotoStore.getState();
  if (isPreviewMode) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        aspectRatio: 16 / 9,
      },
    });

    if (videoRef.current) videoRef.current.srcObject = stream;

    setIsPreviewMode(true);
    setIsVideoOn(false);
    clearPhotos();
  } catch (error) {
    console.error("Camera access denied or error:", error);
  }
};
