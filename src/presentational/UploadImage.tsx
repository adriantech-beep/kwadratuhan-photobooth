import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import SilentProcessor from "./SilentProcess";
import { usePhotoStore } from "@/store/usePhotoStore";
import Lottie from "lottie-react";
import bearAnim from "@/assets/Cute bear dancing.json";

interface UploadImageProps {
  autoStartUpload?: boolean;
}

const UploadImage = ({ autoStartUpload = false }: UploadImageProps) => {
  const [stage, setStage] = useState<"upload" | "silent_process" | "done">(
    "upload"
  );
  const [originalUrls, setOriginalUrls] = useState<string[]>([]);
  const hasStartedUpload = useRef(false);

  const { selectedPhotoBlobs } = usePhotoStore();
  const sessionId = `session_${Date.now()}`;
  const navigate = useNavigate();

  // const handleProcessingComplete = useCallback(() => {
  //   navigate("/template-picker");
  //   setStage("done");
  // }, [navigate]);

  // setSessionId(sessionId);

  useEffect(() => {
    if (
      !autoStartUpload ||
      hasStartedUpload.current ||
      !selectedPhotoBlobs.length
    )
      return;

    hasStartedUpload.current = true;

    (async () => {
      try {
        setStage("upload");
        const uploadResults: string[] = [];
        for (let i = 0; i < selectedPhotoBlobs.length; i++) {
          const blob = selectedPhotoBlobs[i];
          const url = await uploadToCloudinary(blob);
          // const url = await uploadToCloudinary(
          //   blob,
          //   `photobooth/${sessionId}/originals`
          // );

          uploadResults.push(url);
        }

        setOriginalUrls(uploadResults);
        setStage("silent_process");
      } catch (err) {
        console.error("Upload failed:", err);
        setStage("done");
      }
    })();
  }, [autoStartUpload, selectedPhotoBlobs, sessionId]);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen text-center bg-black">
      {stage === "upload" && (
        <div>
          <Lottie animationData={bearAnim} loop={true} className="w-48 h-48" />
          <p className="text-yellow-300">Uploading images...</p>
        </div>
      )}

      {stage === "silent_process" && (
        <SilentProcessor
          uploadedUrls={originalUrls}
          onProcessingComplete={() => {
            navigate("/template-picker");
            setStage("done");
          }}
        />
      )}
    </section>
  );
};

export default UploadImage;
