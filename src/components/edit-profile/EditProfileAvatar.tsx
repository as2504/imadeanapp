import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Plus, Loader2, X, ZoomIn, ZoomOut, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface EditProfileAvatarProps {
  initial: string;
  avatarUrl: string | null;
  onImageChange: (url: string) => void;
}

const CROP_SIZE = 400;

const EditProfileAvatar = ({ initial, avatarUrl, onImageChange }: EditProfileAvatarProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Remove avatar confirmation
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const openFileSelector = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (file.size > 500 * 1024) {
      toast({ title: "File too large", description: "Profile picture must be under 500KB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setCropOpen(true);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Load image element when src changes
  useEffect(() => {
    if (!imageSrc) { setImageEl(null); return; }
    const img = new Image();
    img.onload = () => setImageEl(img);
    img.src = imageSrc;
  }, [imageSrc]);

  // Calculate fit scale so image covers the crop area
  const getFitScale = useCallback(() => {
    if (!imageEl) return 1;
    const scaleX = CROP_SIZE / imageEl.naturalWidth;
    const scaleY = CROP_SIZE / imageEl.naturalHeight;
    return Math.max(scaleX, scaleY);
  }, [imageEl]);

  // Clamp offset so image doesn't go out of bounds
  const clampOffset = useCallback((ox: number, oy: number, z: number) => {
    if (!imageEl) return { x: 0, y: 0 };
    const fitScale = getFitScale();
    const scaledW = imageEl.naturalWidth * fitScale * z;
    const scaledH = imageEl.naturalHeight * fitScale * z;
    const maxX = Math.max(0, (scaledW - CROP_SIZE) / 2);
    const maxY = Math.max(0, (scaledH - CROP_SIZE) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, ox)), y: Math.max(-maxY, Math.min(maxY, oy)) };
  }, [imageEl, getFitScale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingImage) return;
    const newOffset = clampOffset(e.clientX - dragStart.x, e.clientY - dragStart.y, zoom);
    setOffset(newOffset);
  };

  const handleMouseUp = () => setIsDraggingImage(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDraggingImage(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingImage || e.touches.length !== 1) return;
    const newOffset = clampOffset(e.touches[0].clientX - dragStart.x, e.touches[0].clientY - dragStart.y, zoom);
    setOffset(newOffset);
  };

  const handleTouchEnd = () => setIsDraggingImage(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(1, Math.min(3, zoom - e.deltaY * 0.002));
    setZoom(newZoom);
    setOffset(clampOffset(offset.x, offset.y, newZoom));
  };

  const handleZoomChange = (val: number[]) => {
    const newZoom = val[0];
    setZoom(newZoom);
    setOffset(clampOffset(offset.x, offset.y, newZoom));
  };

  const handleCropConfirm = async () => {
    if (!imageEl || !user) return;
    setUploading(true);
    setCropOpen(false);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = CROP_SIZE;
      canvas.height = CROP_SIZE;
      const ctx = canvas.getContext("2d")!;

      const fitScale = getFitScale();
      const totalScale = fitScale * zoom;
      const drawW = imageEl.naturalWidth * totalScale;
      const drawH = imageEl.naturalHeight * totalScale;
      const drawX = (CROP_SIZE - drawW) / 2 + offset.x;
      const drawY = (CROP_SIZE - drawH) / 2 + offset.y;

      ctx.drawImage(imageEl, drawX, drawY, drawW, drawH);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
      );

      const filePath = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("app-assets")
        .upload(`avatars/${filePath}`, blob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("app-assets")
        .getPublicUrl(`avatars/${filePath}`);

      onImageChange(publicUrl);
      toast({ title: "Success", description: "Avatar uploaded successfully." });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({ title: "Upload failed", description: error.message || "Could not upload image.", variant: "destructive" });
    } finally {
      setUploading(false);
      setImageSrc(null);
      setImageEl(null);
    }
  };

  const handleRemoveAvatar = () => {
    onImageChange("");
    setShowRemoveConfirm(false);
    toast({ title: "Avatar removed", description: "Save changes to apply." });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) openFileSelector(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) openFileSelector(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fitScale = imageEl ? getFitScale() : 1;

  return (
    <>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative group w-20 h-20 rounded-2xl overflow-hidden shrink-0 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 border-2 border-border/40 ${dragging
            ? "border-primary scale-105 shadow-lg shadow-primary/10"
            : "hover:border-primary/50 hover:shadow-md"
          }`}
        >
          {uploading ? (
            <div className="w-full h-full bg-surface flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center">
              <span className="text-2xl font-bold text-primary/70 select-none">{initial}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-foreground/40 transition-opacity duration-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
            <Camera size={18} className="text-white" />
          </div>

          {dragging && (
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center animate-pulse">
              <Plus size={20} className="text-primary" />
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
        </button>

        {/* Camera badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-sm pointer-events-none">
          <Camera size={10} strokeWidth={3} />
        </div>

        {/* Remove badge */}
        {avatarUrl && !uploading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowRemoveConfirm(true); }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center border-2 border-background shadow-sm hover:scale-110 transition-transform z-10"
          >
            <X size={10} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Remove confirmation dialog */}
      <Dialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Remove profile photo?</DialogTitle>
            <DialogDescription>Your avatar will be removed. Save changes to apply.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" size="sm" onClick={() => setShowRemoveConfirm(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleRemoveAvatar}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crop dialog */}
      <Dialog open={cropOpen} onOpenChange={(open) => { if (!open) { setCropOpen(false); setImageSrc(null); setImageEl(null); } }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Adjust your photo</DialogTitle>
            <DialogDescription>Drag to reposition, scroll or use the slider to zoom.</DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-2">
            {/* Crop area */}
            <div
              ref={containerRef}
              className="relative w-full aspect-square max-w-[300px] mx-auto rounded-xl overflow-hidden bg-muted cursor-grab active:cursor-grabbing border border-border/40"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              style={{ touchAction: "none" }}
            >
              {imageEl && (
                <img
                  src={imageSrc!}
                  alt="Crop preview"
                  draggable={false}
                  className="absolute select-none pointer-events-none"
                  style={{
                    width: imageEl.naturalWidth * fitScale * zoom,
                    height: imageEl.naturalHeight * fitScale * zoom,
                    left: `calc(50% + ${offset.x}px)`,
                    top: `calc(50% + ${offset.y}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
              {/* Corner guides */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/60 rounded-tl" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/60 rounded-tr" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/60 rounded-bl" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/60 rounded-br" />
              </div>
            </div>

            {/* Zoom slider */}
            <div className="flex items-center gap-3 mt-4 px-2">
              <ZoomOut size={16} className="text-muted-foreground shrink-0" />
              <Slider min={1} max={3} step={0.01} value={[zoom]} onValueChange={handleZoomChange} className="flex-1" />
              <ZoomIn size={16} className="text-muted-foreground shrink-0" />
            </div>
          </div>

          <div className="flex justify-end gap-2 px-6 pb-6 pt-2">
            <Button variant="outline" onClick={() => { setCropOpen(false); setImageSrc(null); setImageEl(null); }}>Cancel</Button>
            <Button onClick={handleCropConfirm} disabled={!imageEl} className="gap-1">
              <Check size={16} /> Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditProfileAvatar;
