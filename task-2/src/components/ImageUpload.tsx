import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";

export const ImageUpload = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("event-covers").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("event-covers").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success("Cover uploaded");
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <img src={value} alt="Cover" className="aspect-[16/9] w-full object-cover" />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute right-2 top-2"
            onClick={() => onChange("")}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Remove
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 transition hover:border-primary hover:bg-secondary/60"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="mt-2 text-sm font-medium">Click to upload cover image</span>
              <span className="mt-1 text-xs text-muted-foreground">PNG or JPG • up to 5MB</span>
            </>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
};
