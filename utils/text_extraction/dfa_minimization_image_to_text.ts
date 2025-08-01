import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { dfa_minimization_extraction_prompt } from "../prompt_templates/text_extract_prompts";

export async function extract_dfa_text_from_image(imageFile: File): Promise<string> {
  const encodedImage = await fileToBase64(imageFile);

   const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    maxOutputTokens: undefined,
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    maxRetries: 2
  });

const message = new HumanMessage({
    content: [
      { type: "text", text: dfa_minimization_extraction_prompt },
      {
        type: "image_url",
        image_url: `data:${imageFile.type};base64,${encodedImage}`,
      },
    ],
  });


  const result = await llm.invoke([message]);
  return result.content as string;
}
// Utility: Convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1]; // remove data:image/...;base64, part
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

}