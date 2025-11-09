import { create } from "zustand";

interface PhotoStore {
  photoBlobs: Blob[];
  photoPreviews: string[];
  selectedPhotoBlobs: Blob[];
  selectionConfirmed: boolean;

  addPhoto: (blob: Blob, previewUrl: string) => void;
  setSelectedPhotoBlobs: (selected: Blob[]) => void;
  setSelectionConfirmed: (value: boolean) => void;
  clearPhotos: () => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  photoBlobs: [],
  photoPreviews: [],
  selectedPhotoBlobs: [],
  selectionConfirmed: false,

  addPhoto: (blob, previewUrl) =>
    set((state) => ({
      photoBlobs: [...state.photoBlobs, blob],
      photoPreviews: [...state.photoPreviews, previewUrl],
    })),
  setSelectedPhotoBlobs: (selected) => set({ selectedPhotoBlobs: selected }),
  setSelectionConfirmed: (value) => set({ selectionConfirmed: value }),

  clearPhotos: () =>
    set((state) => {
      state.photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      return {
        photoBlobs: [],
        photoPreviews: [],
        selectedPhotoBlobs: [],
        selectionConfirmed: false,
      };
    }),
}));
