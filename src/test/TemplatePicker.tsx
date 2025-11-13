import { toPng } from "html-to-image";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { layoutC_Christmas2 } from "@/svgTemplatesString/layoutC_Christmas2";
import { layoutC_Christmas4 } from "@/svgTemplatesString/layoutC_Christmas4";
import { layoutC_Halloween1 } from "@/svgTemplatesString/layoutC_Halloween1";
import { layoutC_Halloween2 } from "@/svgTemplatesString/layoutC_Halloween2";
import TemplateCard from "./TemplateCard";
import { dataUrlToFile } from "@/utils/dataUrlToFile";
import { blobToBase64 } from "@/utils/blobToBase64";

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
import { usePhotoStore } from "@/store/usePhotoStore";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

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
  const { photoBlobs } = usePhotoStore();

  const layout: string = state?.layout || "";

  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const svg = selectedLayout
        ? layouts[selectedCategory][selectedLayout]
        : layout;

      if (!svg || !selectedLayout) return;

      const targetElement1 = document.getElementById("myDiv1");
      const targetElement2 = document.getElementById("myDiv2");
      if (!targetElement1 || !targetElement2) return;

      const base64Images = await Promise.all(photoBlobs.map(blobToBase64));

      const firstHalf = base64Images.slice(0, 4);
      const secondHalf = base64Images.slice(4, 8);

      let svgString1 = layouts[selectedCategory][selectedLayout];
      firstHalf.forEach((base64, index) => {
        svgString1 = svgString1.replace(
          new RegExp(`(<image[^>]*id="photo-${index + 1}"[^>]*)/>`, "i"),
          `$1 xlink:href="${base64}" />`
        );
      });
      targetElement1.innerHTML = svgString1;

      let svgString2 = layouts[selectedCategory][selectedLayout];
      secondHalf.forEach((base64, index) => {
        svgString2 = svgString2.replace(
          new RegExp(`(<image[^>]*id="photo-${index + 1}"[^>]*)/>`, "i"),
          `$1 xlink:href="${base64}" />`
        );
      });
      targetElement2.innerHTML = svgString2;
    };
    run();
  }, [selectedLayout, selectedCategory, layout, photoBlobs]);

  const handleUploadAsPng = async () => {
    if (!selectedLayout) return;

    setIsLoading(true);

    const target1 = document.getElementById("myDiv1");
    const target2 = document.getElementById("myDiv2");
    if (!target1 || !target2) return;

    try {
      const [strip1, strip2] = await Promise.all([
        toPng(target1, { cacheBust: true, pixelRatio: 3 }),
        toPng(target2, { cacheBust: true, pixelRatio: 3 }),
      ]);

      const img1 = new Image();
      const img2 = new Image();
      img1.src = strip1;
      img2.src = strip2;

      await Promise.all([
        new Promise((resolve) => (img1.onload = resolve)),
        new Promise((resolve) => (img2.onload = resolve)),
      ]);

      const STRIP_WIDTH_PX = 600;
      const STRIP_HEIGHT_PX = 1800;
      const GAP_PX = 2;

      const canvas = document.createElement("canvas");
      canvas.width = 1200 + GAP_PX;
      canvas.height = 1800;

      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img1, 0, 0, STRIP_WIDTH_PX, STRIP_HEIGHT_PX);
      ctx.drawImage(
        img2,
        STRIP_WIDTH_PX + GAP_PX,
        0,
        STRIP_WIDTH_PX,
        STRIP_HEIGHT_PX
      );

      const finalDataUrl = canvas.toDataURL("image/png");

      const finalFile = dataUrlToFile(finalDataUrl, "final-8photo-4x6.png");
      const imageUrl = await uploadToCloudinary(finalFile);

      if (window.electronAPI?.printFinalImage) {
        window.electronAPI.printFinalImage(finalDataUrl);
        console.log("🖨️ Sent 8-photo composite to Electron print handler");
      } else {
        console.warn("⚠️ Electron API not available (web mode)");
      }

      navigate("/finaltemplate", {
        state: {
          layout: layouts[selectedCategory][selectedLayout!],
          finalImageUrl: imageUrl,
        },
      });
    } catch (err) {
      console.error("❌ PNG upload or print failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="w-full bg-gray-100 rounded-2xl shadow-xl p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Pick Your Template
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="col-span-2">
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

            <div className="h-[400px] overflow-auto pr-2 space-y-3 grid grid-cols-3">
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

          <div className="col-span-2 flex items-center justify-center border">
            {selectedLayout ? (
              <div className=" flex items-center justify-center shadow-inner">
                <div
                  id="myDiv1"
                  className="w-full  max-w-sm  flex items-center justify-center bg-white shadow-inner"
                />
                <div
                  id="myDiv2"
                  className="w-full max-w-sm  flex items-center justify-center bg-white  shadow-inner"
                />
              </div>
            ) : (
              <p className="text-gray-500">Select a template to preview</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
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
