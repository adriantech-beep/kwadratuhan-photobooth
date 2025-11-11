import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QrCode, Banknote, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PaymentOption() {
  const [selected, setSelected] = useState<"cash" | "qr" | null>(null);
  const navigate = useNavigate();

  const handleSelect = (option: "cash" | "qr") => {
    if (option) {
      setTimeout(() => {
        navigate("/camera");
      }, 5000);
    }
    setSelected(option);
  };

  const handleCloseOverlay = () => setSelected(null);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-black text-yellow-400 font-semibold">
      <h1 className="text-3xl font-bold mb-10 tracking-wide text-yellow-400">
        Choose Payment Method
      </h1>

      <div className="grid grid-cols-2 gap-10 w-full max-w-2xl px-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect("cash")}
          className="flex flex-col items-center justify-center border-2 border-yellow-400 bg-neutral-900 rounded-xl p-10 cursor-pointer transition-colors hover:bg-neutral-800"
        >
          <Banknote size={72} className="text-yellow-400 mb-4" />
          <span className="text-xl">Insert Cash</span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect("qr")}
          className="flex flex-col items-center justify-center border-2 border-yellow-400 bg-neutral-900 rounded-xl p-10 cursor-pointer transition-colors hover:bg-neutral-800"
        >
          <QrCode size={72} className="text-yellow-400 mb-4" />
          <span className="text-xl">Pay via QR</span>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-8"
          >
            {selected === "cash" ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <video
                  src="/1110.mp4"
                  autoPlay
                  loop
                  muted
                  className="w-[600px] h-[400px] rounded-lg mb-8 border-2 border-yellow-500 object-cover"
                />
                <p className="text-lg text-yellow-300">
                  Listening for payment...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <img
                  src="/qr-removebg-preview.png"
                  alt="QR Code"
                  className="w-72 h-72 rounded-md border-2 border-yellow-400 bg-white p-3"
                />
                <p className="text-lg text-yellow-300 mt-6">
                  Scan the QR code to pay
                </p>
              </div>
            )}

            <Button
              onClick={handleCloseOverlay}
              className="mt-10 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
