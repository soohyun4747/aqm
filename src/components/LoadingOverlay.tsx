// src/components/LoadingOverlay.tsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLoadingStore } from '../stores/loadingStore';

export default function LoadingOverlay() {
  const { isOpen } = useLoadingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [mounted, isOpen]);

  if (!mounted || !isOpen) return null; // 👈 서버/닫힘 상태에서는 렌더 안 함

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/30 border-t-white" />
    </div>,
    document.body
  );
}
