import dotenv from 'dotenv';
import { GoogleGenAI, createUserContent } from "@google/genai";
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { IGetMeasureFromGemini } from 'types/measure';

dotenv.config();
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) throw new Error("Chave da API do Gemini não configurada.");
const port = process.env.PORT || 80;
const HOST = process.env.HOST || 'localhost';

const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const TEMP_UPLOAD_DIR = path.join(__dirname, '..', 'temp-uploads');

async function ensureTempDirExists() {
    try {
        await fs.mkdir(TEMP_UPLOAD_DIR, { recursive: true });
    } catch (error) {
        console.error("Erro ao criar diretório temporário:", error);
    }
}
ensureTempDirExists();

export const getMeasureFromGemini = async (base64Image: string): Promise<IGetMeasureFromGemini> => {
    try {
        const mimeType = base64Image.substring(
            base64Image.indexOf(":") + 1,
            base64Image.indexOf(";")
        );
        const base64Data = base64Image.split(",")[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const imageName = `${crypto.randomUUID()}.${mimeType.split('/')[1]}`;
        const imagePath = path.join(TEMP_UPLOAD_DIR, imageName);
        const imageUrl = `http://${HOST}:${port}/temp-uploads/${imageName}`;

        // Salva a imagem temporariamente no disco
        await fs.writeFile(imagePath, imageBuffer);
        console.log("Imagem salva temporariamente em:", imagePath);

        const imagePart = {
            inlineData: { data: base64Data, mimeType: mimeType }
        };

        const prompt = "Qual é o valor numérico exibido nesta imagem?";

        const result = await ai.models.generateContent({
            model: "gemini-1.5-pro",
            contents: createUserContent([imagePart, prompt]),
        });
        console.log("Resposta do Gemini:", result.text);

        if (!result.text) throw new Error("Não foi possível identificar um número na imagem.");
        const numberMatch = result.text.match(/\d+(\.\d+)?/);
        if (!numberMatch) throw new Error("Não foi possível identificar um número na imagem.");

        return {
            image_url: imageUrl,
            measure_value: parseFloat(numberMatch[0]),
        };
    } catch (error: any) {
        console.error("Erro ao processar imagem com Gemini:", error);
        throw new Error(`Erro ao processar imagem com Gemini: ${error.message}`);
    }
};
