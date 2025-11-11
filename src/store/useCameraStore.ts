import { create } from "zustand";

interface CameraState {
  isVideoOn: boolean;
  isEditing: boolean;
  isSelectingImages: boolean;
  isPreviewMode: boolean;
  isCountdown: boolean;
  countdown: number | null;
  timer: number;
  showTimerOptions: boolean;
  rotation: number;
  isFlipped: boolean;
  isCapturing: boolean;
  isProcessing: boolean;

  setIsVideoOn: (value: boolean) => void;
  setIsEditing: (value: boolean) => void;
  setIsSelectingImages: (value: boolean) => void;
  setIsPreviewMode: (value: boolean) => void;
  setIsCountdown: (value: boolean) => void;
  setCountdown: (value: number | null) => void;
  setTimer: (value: number) => void;
  setShowTimerOptions: (value: boolean) => void;
  setRotation: (value: number) => void;
  setIsFlipped: (value: boolean) => void;
  setIsCapturing: (value: boolean) => void;
  setIsProcessing: (value: boolean) => void;

  resetCameraState: () => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  isVideoOn: false,
  isEditing: false,
  isSelectingImages: false,
  isPreviewMode: false,
  isCountdown: false,
  countdown: null,
  timer: 3,
  showTimerOptions: false,
  rotation: 0,
  isFlipped: true,
  isCapturing: false,
  isProcessing: false,

  setIsVideoOn: (value) => set({ isVideoOn: value }),
  setIsEditing: (value) => set({ isEditing: value }),
  setIsSelectingImages: (value) => set({ isSelectingImages: value }),
  setIsPreviewMode: (value) => set({ isPreviewMode: value }),
  setIsCountdown: (value) => set({ isCountdown: value }),
  setCountdown: (value) => set({ countdown: value }),
  setTimer: (value) => set({ timer: value }),
  setShowTimerOptions: (value) => set({ showTimerOptions: value }),
  setRotation: (value) => set(() => ({ rotation: value % 360 })),
  setIsFlipped: (value) => set({ isFlipped: value }),
  setIsCapturing: (value) => set({ isCapturing: value }),
  setIsProcessing: (value) => set({ isProcessing: value }),

  resetCameraState: () =>
    set({
      isVideoOn: false,
      isEditing: false,
      isSelectingImages: false,
      isPreviewMode: false,
      isCountdown: false,
      countdown: null,
      timer: 3,
      showTimerOptions: false,
      rotation: 0,
      isFlipped: true,
      isCapturing: false,
      isProcessing: false,
    }),
}));
