import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import cameraAnimation2 from "@/assets/Camera Click.json";

const LoadingOverlay = ({ isVisible }: { isVisible: boolean }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Lottie
            animationData={cameraAnimation2}
            loop={true}
            className="w-48 h-48"
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default LoadingOverlay;
