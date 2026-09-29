import Image from "next/image";
import { ChefHatIcon } from "@/components/icons";

// Dish photo, or a branded placeholder until the owner uploads one.
export function DishImage({
  src,
  alt,
  sizes,
  className = "",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-cream-dark ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          // Uploaded photos are already small WebP files, so skip resizing them again.
          unoptimized={src.startsWith("http")}
          className="object-cover"
        />
      ) : (
        <div className="grid size-full place-items-center text-brand/35">
          <ChefHatIcon className="size-1/2 max-h-16" />
        </div>
      )}
    </div>
  );
}
