import { useState, useRef } from "react";
import { Camera, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface EditProfileAvatarProps {
    initial: string;
    avatarUrl: string | null;
    onImageChange: (url: string) => void;
}

const EditProfileAvatar = ({ initial, avatarUrl, onImageChange }: EditProfileAvatarProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
            return;
        }
        if (!user) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            onImageChange(publicUrl);
            toast({ title: "Success", description: "Avatar uploaded successfully." });
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast({ 
                title: "Upload failed", 
                description: error.message || "Could not upload image.", 
                variant: "destructive" 
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
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
                {/* Avatar image or initial */}
                {uploading ? (
                    <div className="w-full h-full bg-surface flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                ) : avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary/70 select-none">
                            {initial}
                        </span>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/40 transition-opacity duration-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                    <Camera size={18} className="text-white" />
                </div>

                {/* Drag indicator */}
                {dragging && (
                    <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center animate-pulse">
                        <Plus size={20} className="text-primary" />
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                />
            </button>
            
            {/* Small camera badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background shadow-sm pointer-events-none">
                <Camera size={10} strokeWidth={3} />
            </div>
        </div>
    );
};

export default EditProfileAvatar;
