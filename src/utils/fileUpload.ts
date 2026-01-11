// src/utils/fileUpload.ts

export const uploadToCloudinary = async (file: File): Promise<string> => {
  // --- CONFIGURACIÓN DESDE .ENV ---
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  // -------------------------------

  // Validación de seguridad para que no falle silenciosamente
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Faltan variables de entorno de Cloudinary");
    throw new Error("Error de configuración del servidor (Cloudinary)");
  }

  try {
    const processedFile = await compressImage(file);
    const formData = new FormData();
    formData.append("file", processedFile);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error al subir imagen");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// ... el resto de la función compressImage sigue igual ...
async function compressImage(file: File): Promise<Blob | File> {
    // ... (el código de compresión que ya tenías)
    if (!file.type.startsWith("image/")) return file;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          resolve(file); 
          return;
        }
  
        const MAX_WIDTH = 1920;
        let width = img.width;
        let height = img.height;
  
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
  
        canvas.width = width;
        canvas.height = height;
  
        ctx.drawImage(img, 0, 0, width, height);
  
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = (err) => reject(err);
    });
}