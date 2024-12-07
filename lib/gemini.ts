import { GoogleGenerativeAI } from '@google/generative-ai';
import { Student } from './types';

const MISSING_API_KEY_MESSAGE = 'Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.';
const API_ERROR_MESSAGE = 'Failed to get response from Gemini API. Please check your API key and try again.';

function validateApiKey(apiKey: string | undefined): string {
  if (!apiKey) {
    throw new Error(MISSING_API_KEY_MESSAGE);
  }
  if (apiKey === 'your-api-key-here') {
    throw new Error('Please replace the placeholder API key with your actual Gemini API key');
  }
  return apiKey;
}

const genAI = new GoogleGenerativeAI(
  validateApiKey(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
);

function generateSystemPrompt(student: Student): string {
  const classes = student.classes.map(c => ({
    name: c.name,
    schedule: c.schedule,
    assignments: c.assignments.map(a => ({
      title: a.title,
      dueDate: new Date(a.dueDate).toLocaleDateString(),
    })),
  }));

  return `You are an AI assistant helping ${student.name} with their academic schedule.
Current classes: ${JSON.stringify(classes, null, 2)}
Please provide helpful and accurate information based on this schedule.`;
}

export async function getChatResponse(prompt: string, student?: Student): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({
      history: student ? [{ role: 'user', parts: generateSystemPrompt(student) }] : [],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(API_ERROR_MESSAGE);
  }
}