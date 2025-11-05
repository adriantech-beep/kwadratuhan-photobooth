import { toPng } from "html-to-image";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { layoutC_Christmas2 } from "@/svgTemplatesString/layoutC_Christmas2";
import { layoutC_Christmas4 } from "@/svgTemplatesString/layoutC_Christmas4";
import { layoutC_Halloween1 } from "@/svgTemplatesString/layoutC_Halloween1";
import { layoutC_Halloween2 } from "@/svgTemplatesString/layoutC_Halloween2";
import TemplateCard from "./TemplateCard";
import { usePhotoStore } from "@/store/photoStore";
import { uploadSvgToCloudinary } from "@/utils/uploadSvgToCloudinary";
import { dataUrlToFile } from "@/utils/dataUrlToFile";
import { blobToBase64 } from "@/utils/blobToBase64";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET_SVG,
} from "@/config/env";
import LoadingOverlay from "@/components/LoadingOverlay";
import { layoutC_Assorted1 } from "@/svgTemplatesString/layoutC_Assorted1";
import { layoutC_Assorted2 } from "@/svgTemplatesString/layoutC_Assorted2";
import { layoutC_Assorted3 } from "@/svgTemplatesString/layoutC_Assorted3";
import { layoutC_Assorted4 } from "@/svgTemplatesString/layoutC_Assorted4";
import { layoutC_Assorted5 } from "@/svgTemplatesString/layoutC_Assorted5";
import { layoutC_Assorted6 } from "@/svgTemplatesString/layoutC_Assorted6";
import { layoutC_Assorted7 } from "@/svgTemplatesString/layoutC_Assorted7";
import { layoutC_Assorted8 } from "@/svgTemplatesString/layoutC_Assorted8";
import { layoutC_Assorted9 } from "@/svgTemplatesString/layoutC_Assorted9";
import { layoutC_Assorted10 } from "@/svgTemplatesString/layoutC_Assorted10";

declare global {
  interface Window {
    electronAPI: {
      printFinalImage: any;
      sendImage: (imageData: string) => Promise<void>;
    };
  }
}

const layouts: Record<string, Record<string, string>> = {
  Classic: {
    LayoutC_Assorted1: layoutC_Assorted1,
    LayoutC_Assorted2: layoutC_Assorted2,
    LayoutC_Assorted3: layoutC_Assorted3,
    LayoutC_Assorted4: layoutC_Assorted4,
    LayoutC_Assorted5: layoutC_Assorted5,
    LayoutC_Assorted6: layoutC_Assorted6,
    LayoutC_Assorted7: layoutC_Assorted7,
    LayoutC_Assorted8: layoutC_Assorted8,
    LayoutC_Assorted9: layoutC_Assorted9,
    LayoutC_Assorted10: layoutC_Assorted10,
  },
  Seasonal: {
    LayoutC_Christmas2: layoutC_Christmas2,
    LayoutC_Christmas4: layoutC_Christmas4,
    LayoutC_Halloween1: layoutC_Halloween1,
    LayoutC_Halloween2: layoutC_Halloween2,
  },
};

export default function TemplatePicker() {
  const [selectedCategory, setSelectedCategory] =
    useState<keyof typeof layouts>("Classic");
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { state } = useLocation();
  const blobs = usePhotoStore((s) => s.blobs);
  const layout: string = state?.layout || "";

  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const svg = selectedLayout
        ? layouts[selectedCategory][selectedLayout]
        : layout;

      if (!svg) return;

      const targetElement = document.getElementById("myDiv");
      if (!targetElement) return;

      let svgString = svg;
      const base64Images = await Promise.all(blobs.map(blobToBase64));

      base64Images.forEach((base64, index) => {
        svgString = svgString.replace(
          new RegExp(`(<image[^>]*id="photo-${index + 1}"[^>]*)/>`, "i"),
          `$1 xlink:href="${base64}" />`
        );
      });

      targetElement.innerHTML = svgString;
    };
    run();
  }, [selectedLayout, selectedCategory, layout, blobs]);

  const handleUploadAsPng = async () => {
    if (!selectedLayout) return;

    setIsLoading(true);
    const targetElement = document.getElementById("myDiv");
    if (!targetElement) return;

    try {
      // Step 1: Capture single 2×6 layout as PNG
      const singleStrip = await toPng(targetElement, {
        cacheBust: true,
        pixelRatio: 3,
      });

      // Step 2: Load it for composition
      const img = new Image();
      img.src = singleStrip;
      await new Promise((resolve) => (img.onload = resolve));

      // === CONFIG ===
      //   const DPI = 300;
      const STRIP_WIDTH_PX = 600; // 2 inches * 300 dpi
      const STRIP_HEIGHT_PX = 1800; // 6 inches * 300 dpi
      const GAP_PX = 2; //  gap between strips

      // Step 3: Create true 4×6 canvas (portrait for correct layout)
      const canvas = document.createElement("canvas");
      canvas.width = 1800; // 6 inches * 300 dpi (tall)
      canvas.height = 1200; // 4 inches * 300 dpi (wide)
      const ctx = canvas.getContext("2d")!;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Step 4: Rotate for proper portrait orientation
      ctx.save();
      ctx.translate(0, canvas.height);
      ctx.rotate(-Math.PI / 2); // rotate clockwise to portrait

      // Step 5: Draw two vertical 2×6 strips side-by-side
      ctx.drawImage(img, 0, 0, STRIP_WIDTH_PX, STRIP_HEIGHT_PX);
      ctx.drawImage(
        img,
        STRIP_WIDTH_PX + GAP_PX,
        0,
        STRIP_WIDTH_PX,
        STRIP_HEIGHT_PX
      );
      ctx.restore();

      // Step 6: Export the 4×6 composite
      const finalDataUrl = canvas.toDataURL("image/png");

      const finalFile = dataUrlToFile(finalDataUrl, "final-4x6.png");
      const result = await uploadSvgToCloudinary(
        finalFile,
        CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_UPLOAD_PRESET_SVG
      );
      console.log("✅ Final 4×6 PNG uploaded:", result.secure_url);

      if (window.electronAPI?.printFinalImage) {
        window.electronAPI.printFinalImage(finalDataUrl);
        console.log(
          "🖨️ Sent rotated 4×6 composite to Electron print handler (silent)"
        );
      } else {
        console.warn("⚠️ Electron API not available (web mode)");
      }

      navigate("/choosing-template", {
        state: {
          layout: layouts[selectedCategory][selectedLayout!],
        },
      });
      setIsLoading(false);
    } catch (err) {
      console.error("❌ PNG upload or print failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black">
      <div className="w-full max-w-5xl bg-gray-100 rounded-2xl shadow-xl p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Pick Your Template
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="flex flex-col gap-3 mb-4">
              {Object.keys(layouts).map((cat) => (
                <button
                  key={cat}
                  className={`text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat as keyof typeof layouts);
                    setSelectedLayout(null);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="h-[400px] overflow-y-auto pr-2 space-y-3">
              {Object.entries(layouts[selectedCategory]).map(([key, svg]) => (
                <TemplateCard
                  key={key}
                  name={key}
                  svgString={svg}
                  selected={selectedLayout === key}
                  onClick={() => setSelectedLayout(key)}
                />
              ))}
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-center rounded-lg border">
            {selectedLayout ? (
              <div className="flex items-center justify-center shadow-inner p-4">
                <div
                  id="myDiv"
                  className="w-full max-w-sm aspect-2/3 flex items-center justify-center"
                />
              </div>
            ) : (
              <p className="text-gray-500">Select a template to preview</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            disabled={!selectedLayout}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedLayout
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleUploadAsPng}
          >
            Proceed
          </button>
        </div>
      </div>

      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}
