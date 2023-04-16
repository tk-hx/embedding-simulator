// lib/openai.ts

import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";

async function generateText(prompt: string, apiKey: string): Promise<string> {
  const config = new Configuration({ apiKey: apiKey });
  const openai = new OpenAIApi(config);
  const requestOptions: CreateCompletionRequest = {
    model: "text-davinci-002",
    prompt: prompt,
    max_tokens: 2048,
    top_p: 1,
    n: 1,
    stop: null,
    temperature: 1,
  };

  try {
    const result = await openai.createCompletion(requestOptions);

    if (result.data.choices && result.data.choices.length > 0 && result.data.choices[0].text) {
      console.log(JSON.stringify(result.data));
      return result.data.choices[0].text.trim();
    } else {
      throw new Error("No generated text found.");
    }
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

export { generateText };
