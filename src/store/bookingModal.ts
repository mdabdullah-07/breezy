import { useSyncExternalStore } from "react";

let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const bookingModal = {
  open() {
    if (!isOpen) {
      isOpen = true;
      emit();
    }
  },
  close() {
    if (isOpen) {
      isOpen = false;
      emit();
    }
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get() {
    return isOpen;
  },
};

export function useBookingModal() {
  return useSyncExternalStore(
    bookingModal.subscribe,
    bookingModal.get,
    () => false,
  );
}
