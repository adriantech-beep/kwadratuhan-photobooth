import { useCameraStore } from "@/store/useCameraStore";
import { usePhotoStore } from "@/store/usePhotoStore";

export const capturePhoto = async (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  photoRef: React.RefObject<HTMLCanvasElement | null>
): Promise<Blob | null> => {
  const { isCapturing, setIsCapturing, rotation, isFlipped } =
    useCameraStore.getState();
  const { addPhoto } = usePhotoStore.getState();

  if (isCapturing) return null;
  setIsCapturing(true);

  const video = videoRef.current;
  const canvas = photoRef.current;
  if (!video || !canvas) {
    setIsCapturing(false);
    return null;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    setIsCapturing(false);
    return null;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(isFlipped ? -1 : 1, 1);
  ctx.drawImage(
    video,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  );
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        addPhoto(blob, previewUrl);
      }
      setIsCapturing(false);
      resolve(blob ?? null);
    }, "image/png");
  });
};
