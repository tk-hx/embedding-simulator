// lib/openAi.ts

import {
  Configuration,
  OpenAIApi,
  CreateChatCompletionRequest,
  ChatCompletionRequestMessage,
} from "openai";

interface EmbeddingData {
  text: string;
  answer: string | null;
  vector: number[];
}

/**
 * Generate text from a list of messages.
 * @param messages The list of messages to generate text from.
 * @param apiKey The OpenAI API key.
 * @returns The generated text.
 */
async function generateText(
  messages: ChatCompletionRequestMessage[],
  apiKey: string
): Promise<string> {
  const config = new Configuration({ apiKey: apiKey });
  delete config.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(config);
  const requestOptions: CreateChatCompletionRequest = {
    model: "gpt-3.5-turbo",
    messages: messages,
  };

  try {
    const result = await openai.createChatCompletion(requestOptions);

    if (
      result.data.choices &&
      result.data.choices.length > 0 &&
      result.data.choices[0].message !== null
    ) {
      console.log(JSON.stringify(result.data));
      return result.data.choices[0].message!.content;
    } else {
      throw new Error("No generated text found.");
    }
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

const MAX_RETRY = 10000;
const RETRY_INTERVAL = 5000;

/**
 * Generate a vector from a string.
 * @param text The string to generate a vector from.
 * @param apiKey The OpenAI API key.
 * @returns A vector of numbers.
 */
async function generateVector(
  text: string,
  apiKey: string | null
): Promise<EmbeddingData> {
  if (!apiKey) {
    throw new Error("API key is not set.");
  }

  const config = new Configuration({ apiKey: apiKey });
  delete config.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(config);

  for (let retryCount = 0; retryCount < MAX_RETRY; retryCount++) {
    try {
      const response = await openai.createEmbedding({
        input: text,
        model: "text-embedding-ada-002",
      });

      if (response.data) {
        const vector = response.data.data[0].embedding;
        return { text: text, answer: null, vector: vector };
      } else {
        throw new Error("No response data found.");
      }
    } catch (error) {
      console.log(error);
      sleep(RETRY_INTERVAL);
      continue;
    }
  }

  throw new Error("MAX_RETRY times exceeded.");
}

async function generateAnswer(
  message: string,
  apiKey: string
): Promise<string> {
  const chatCompletionRequestMessages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content:
        "Please summarize the following text and answer the user's question in the author's tone. \
        If there's no relevant information in the text, respond with \
        \"There is no applicable information. I cannot answer your question.\" \
        Keep your answers in English, within 50 words, and always respond in the language used by the user.",
    },
    {
      role: "user",
      content: message,
    },
  ];

  return await generateText(chatCompletionRequestMessages, apiKey);
}

/**
 * Sleep for a given number of milliseconds.
 * @param ms The number of milliseconds to sleep.
 * @returns A promise that resolves after the given number of milliseconds.
 */
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type { EmbeddingData };
export { generateText, generateVector, generateAnswer };
