'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  return (
    <div className="space-y-4">
      {/* Main Cover Image */}
      <div 
        className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border group cursor-pointer"
        onClick={() => {
          setSelectedImageIndex(0);
          setIsLightboxOpen(true);
        }}
      >
        <Image 
          src={images[0] || "/placeholder.jpg"} 
          alt={`${title}, primary listing photo`} 
          fill 
          priority={true}
          className="object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white border border-white/30">
            <Maximize2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel */}
      {images.length > 1 && (
        <div className="relative group">
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x"
          >
            {images.map((url, i) => (
              <div 
                key={`${url}-${i}`} 
                className="relative flex-none w-40 sm:w-60 aspect-[4/3] rounded-xl overflow-hidden border-2 cursor-pointer hover:border-primary transition-all snap-start"
                onClick={() => {
                  setSelectedImageIndex(i);
                  setIsLightboxOpen(true);
                }}
              >
                <Image 
                  src={url} 
                  alt={`${title}, photo ${i + 1}`} 
                  fill 
                  className="object-cover" 
                />
                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold backdrop-blur-sm">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Scroll Indicators/Shadows */}
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Fullscreen Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[100vw] h-[100dvh] p-0 border-none bg-black/95 gap-0 rounded-none overflow-hidden">
          <div className="relative w-full h-full flex flex-col">
            {/* Header / Close */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
              <span className="text-white text-sm font-medium">
                {selectedImageIndex + 1} / {images.length}
              </span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                  <X className="w-6 h-6" />
                </Button>
              </DialogClose>
            </div>

            {/* Main Image Container */}
            <div 
              className="flex-1 flex items-center justify-center p-4 sm:p-12 relative overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative w-full h-full pointer-events-none select-none">
                <Image 
                  src={images[selectedImageIndex]} 
                  alt={`${title}, full screen photo ${selectedImageIndex + 1}`} 
                  fill 
                  className="object-contain" 
                  priority
                />
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-50"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-50"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Strip at bottom */}
            {images.length > 1 && (
              <div className="h-24 bg-black/40 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-2 px-4 overflow-x-auto no-scrollbar">
                {images.map((url, i) => (
                  <button 
                    key={`thumb-${i}`}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative flex-none h-16 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === i ? 'border-primary scale-110' : 'border-transparent opacity-50'
                    }`}
                  >
                    <Image src={url} alt={`Thumbnail ${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
