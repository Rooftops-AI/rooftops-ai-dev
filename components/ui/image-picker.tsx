import Image from "next/image"
import { ChangeEvent, FC, useState } from "react"
import { toast } from "sonner"
import { Input } from "./input"

interface ImagePickerProps {
  src: string
  image: File | null
  onSrcChange: (src: string) => void
  onImageChange: (image: File) => void
  width?: number
  height?: number
}

const ImagePicker: FC<ImagePickerProps> = ({
  src,
  image,
  onSrcChange,
  onImageChange,
  width = 200,
  height = 200
}) => {
  const [previewSrc, setPreviewSrc] = useState<string>(src)
  const [previewImage, setPreviewImage] = useState<File | null>(image)

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]

      const url = URL.createObjectURL(file)

      const img = new window.Image()
      img.src = url

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          toast.error("Unable to create canvas context.")
          return
        }

        // Calculate square crop dimensions
        const size = Math.min(img.width, img.height)

        // Resize to max 800x800 for profile pictures (more than enough quality)
        const maxSize = 800
        const targetSize = Math.min(size, maxSize)

        canvas.width = targetSize
        canvas.height = targetSize

        // Draw and crop to square, resizing if needed
        ctx.drawImage(
          img,
          (img.width - size) / 2,
          (img.height - size) / 2,
          size,
          size,
          0,
          0,
          targetSize,
          targetSize
        )

        // Compress to JPEG with 0.85 quality (good balance of quality/size)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85)

        // Convert data URL to File object
        canvas.toBlob(
          blob => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now()
              })

              const finalSize = compressedFile.size / 1024 / 1024 // Size in MB
              console.log(
                `Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${finalSize.toFixed(2)}MB`
              )

              setPreviewSrc(compressedDataUrl)
              setPreviewImage(compressedFile)
              onSrcChange(compressedDataUrl)
              onImageChange(compressedFile)
            }
          },
          "image/jpeg",
          0.85
        )
      }
    }
  }

  return (
    <div>
      {previewSrc && (
        <Image
          style={{ width: `${width}px`, height: `${width}px` }}
          className="rounded"
          height={width}
          width={width}
          src={previewSrc}
          alt={"Image"}
        />
      )}

      <Input
        className="mt-1 cursor-pointer hover:opacity-50"
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleImageSelect}
      />
    </div>
  )
}

export default ImagePicker
