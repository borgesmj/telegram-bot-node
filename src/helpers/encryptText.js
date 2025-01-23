import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import dotenv from "dotenv";
dotenv.config();

const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
export const generateUserIV = async () => {
  return await randomBytes(16).toString("hex");
};

export const encrypText = (text, userIv) => {
  const iv = Buffer.isBuffer(userIv) ? userIv : Buffer.from(userIv, "hex");
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  let encryptedText = cipher.update(text, "utf8", "hex");
  encryptedText += cipher.final("hex");
  return `${iv.toString("hex")}:${encryptedText}`;
};

export const decryptText = (encryptedText) => {
  if (!encryptedText) {
    return;
  }
  try {
    // Separar el IV y el texto cifrado
    const [ivHex, encryptedData] = encryptedText.split(":");

    // Convertir el IV a un Buffer
    const iv = Buffer.from(ivHex, "hex");

    // Crear el descifrador
    const decipher = createDecipheriv("aes-256-cbc", key, iv);

    // Descifrar el texto
    let decryptedText = decipher.update(encryptedData, "hex", "utf8");
    decryptedText += decipher.final("utf8");

    // Devolver el texto descifrado
    return decryptedText;
  } catch (error) {
    console.error("Error al descifrar el texto:", error.message);
    throw new Error("No se pudo descifrar el texto.");
  }
};
