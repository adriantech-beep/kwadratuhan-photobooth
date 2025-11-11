import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotoStore } from "@/store/usePhotoStore";

const SelectorImage = () => {
  const { photoBlobs, setSelectedPhotoBlobs, setSelectionConfirmed } =
    usePhotoStore();

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const toggleImageSelection = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : prev.length < 8
        ? [...prev, index]
        : prev
    );
  };

  const handleConfirm = () => {
    const selectedBlobs = selectedIndices.map((i) => photoBlobs[i]);
    setSelectedPhotoBlobs(selectedBlobs);
    setSelectionConfirmed(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">
          Select 8 Images
        </h1>
        <p className="text-yellow-300">{selectedIndices.length}/8 selected</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl">
        {photoBlobs.map((blob, index) => {
          const isSelected = selectedIndices.includes(index);

          return (
            <motion.div
              key={index}
              className="relative cursor-pointer group"
              onClick={() => setPreviewIndex(index)}
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={URL.createObjectURL(blob)}
                alt={`photo-${index + 1}`}
                className={`w-full h-auto rounded-lg border-2 object-cover transition-all ${
                  isSelected
                    ? "border-yellow-400 ring-2 ring-yellow-400"
                    : "border-yellow-700 group-hover:border-yellow-400"
                }`}
              />

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
                >
                  <Check size={40} className="text-yellow-400" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Button
        onClick={handleConfirm}
        disabled={selectedIndices.length !== 8}
        className="rounded-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirm Selection ({selectedIndices.length}/8)
      </Button>

      <AnimatePresence>
        {previewIndex !== null && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative bg-black rounded-2xl overflow-hidden max-w-3xl w-full border p-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2  bg-yellow-300 rounded-full hover:bg-red-400"
                onClick={() => setPreviewIndex(null)}
              >
                <X size={28} />
              </Button>

              <img
                src={URL.createObjectURL(photoBlobs[previewIndex])}
                alt={`preview-${previewIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg mb-4 border-yellow-400"
              />

              <div className="w-full flex justify-center  items-center text-yellow-300">
                <Button
                  onClick={() => {
                    toggleImageSelection(previewIndex);
                    setPreviewIndex(null);
                  }}
                  className={`rounded-full px-6 py-2 font-semibold ${
                    selectedIndices.includes(previewIndex)
                      ? "bg-yellow-700 text-white hover:bg-yellow-800"
                      : "bg-yellow-400 text-black hover:bg-yellow-500"
                  }`}
                >
                  {selectedIndices.includes(previewIndex)
                    ? "Remove from Selection"
                    : "Select Image"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectorImage;
