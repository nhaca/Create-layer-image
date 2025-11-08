
import { GoogleGenAI, Modality } from "@google/genai";

export const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      const mimeType = result.split(';')[0].split(':')[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const separateCharacterParts = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  // The API key is injected from the environment.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("Không tìm thấy dữ liệu ảnh trong phản hồi của AI.");

  } catch (error) {
    console.error("Lỗi gọi Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
    throw new Error(`Tạo bảng bộ phận nhân vật thất bại: ${errorMessage}`);
  }
};
