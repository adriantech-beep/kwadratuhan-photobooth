import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import SilentProcessor from "./SilentProcess";
import { usePhotoStore } from "@/store/usePhotoStore";

interface UploadImageProps {
  autoStartUpload?: boolean;
}

const UploadImage = ({ autoStartUpload = false }: UploadImageProps) => {
  const [stage, setStage] = useState<"upload" | "silent_process" | "done">(
    "upload"
  );
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [originalUrls, setOriginalUrls] = useState<string[]>([]);
  const [finalUrls, setFinalUrls] = useState<string[]>([]);
  const hasStartedUpload = useRef(false);

  const { selectedPhotoBlobs } = usePhotoStore();
  const navigate = useNavigate();

  const totalProgress =
    uploadProgress.length > 0
      ? uploadProgress.reduce((a, b) => a + b, 0) / uploadProgress.length
      : 0;

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
        setUploadProgress(new Array(selectedPhotoBlobs.length).fill(0));

        for (let i = 0; i < selectedPhotoBlobs.length; i++) {
          const blob = selectedPhotoBlobs[i];
          const url = await uploadToCloudinary(blob);
          uploadResults.push(url);

          setUploadProgress((prev) => {
            const updated = [...prev];
            updated[i] = 100;
            return updated;
          });
        }

        setOriginalUrls(uploadResults);
        setStage("silent_process");
      } catch (err) {
        console.error("Upload failed:", err);
        setStage("done");
      }
    })();
  }, [autoStartUpload, selectedPhotoBlobs]);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen text-center bg-black">
      {stage === "upload" && (
        <div className="flex flex-col items-center gap-8 text-yellow-400">
          <div className="text-3xl font-bold">{Math.round(totalProgress)}%</div>
          <p>
            {uploadProgress.filter((p) => p === 100).length} /{" "}
            {selectedPhotoBlobs.length} uploaded
          </p>
        </div>
      )}

      {stage === "silent_process" && (
        <SilentProcessor
          uploadedUrls={originalUrls}
          onProcessingComplete={(finalUrls) => {
            setFinalUrls(finalUrls);
            setStage("done");
          }}
        />
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-3xl text-white">All Photos Ready!</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {finalUrls.map((url, i) => (
              <img key={i} src={url} className="w-32 h-32 rounded-lg" />
            ))}
          </div>

          <Button
            onClick={() => navigate("/template-picker")}
            className="bg-white text-gray-800 px-6 py-3 rounded-lg"
          >
            Choose templates now
          </Button>
        </div>
      )}
    </section>
  );
};

export default UploadImage;
