import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// High limit for base64 encoded wildlife photography
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy/safe Gemini AI initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `You are an expert microstock photography assistant and professional wildlife photographer, specializing in birds of prey and nature photography. 

Your task is to analyze the provided image of wildlife/nature and generate metadata optimized for stock photography platforms (such as Shutterstock, Adobe Stock, and Freepik).

You must respond ONLY with a valid JSON object in the exact structure specified below, without any markdown formatting blocks around it (no \`\`\`json), just the raw JSON text:

{
  "title": "A descriptive, engaging title in English, between 5 to 15 words, highlighting the subject, behavior, and environment.",
  "description": "A detailed description in English explaining the subject, action, lighting, composition, and potential commercial use of the image, between 25 to 50 words.",
  "keywords": "Comma-separated list of 30 to 45 highly relevant, specific English keywords and phrases. Include scientific and common names of the species, behavior (e.g., soaring, hunting, perched), environment, lighting, and commercial concepts. Avoid generic filler words."
}

Guidelines:
1. Accuracy: Identify the exact species (or closest accurate classification) of birds or animals if visible.
2. Commercial Viability: Focus keywords on terms that buyers actually search for (e.g., wildlife, nature, predator, freedom, wilderness).
3. Language: Everything (title, description, keywords) must be strictly in professional English.`;

// Helper to sanitize raw JSON from Gemini
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// Helper to fetch external image to base64 if needed
async function resolveImageBase64(imageBase64?: string, imageUrl?: string): Promise<{ data: string; mimeType: string }> {
  if (imageBase64) {
    let mimeType = 'image/jpeg';
    let data = imageBase64;
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      data = match[2];
    }
    return { data, mimeType };
  }

  if (imageUrl) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`Failed to fetch image from URL: ${imageUrl} (Status: ${res.status})`);
      }
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return { data: base64, mimeType: contentType.split(';')[0] };
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      throw new Error(`Unable to download image from URL: ${fetchErr.message}`);
    }
  }

  throw new Error('Neither imageBase64 nor imageUrl was provided.');
}

// Extraction logic to compute validation and structured metadata
function parseMicrostockResult(rawJsonText: string, fileName: string, thumbnailUrl: string, durationMs: number) {
  const cleaned = cleanJsonOutput(rawJsonText);
  let parsed: { title: string; description: string; keywords: string };

  try {
    parsed = JSON.parse(cleaned);
  } catch (err: any) {
    // If strict JSON parse failed, attempt regex extraction fallback
    const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/);
    const descMatch = cleaned.match(/"description"\s*:\s*"([^"]+)"/);
    const kwMatch = cleaned.match(/"keywords"\s*:\s*"([^"]+)"/);

    if (!titleMatch || !descMatch || !kwMatch) {
      throw new Error(`Failed to parse AI JSON response: ${err.message}. Raw text: ${cleaned.slice(0, 200)}...`);
    }

    parsed = {
      title: titleMatch[1],
      description: descMatch[1],
      keywords: kwMatch[1],
    };
  }

  const titleWords = parsed.title ? parsed.title.trim().split(/\s+/).filter(Boolean).length : 0;
  const descWords = parsed.description ? parsed.description.trim().split(/\s+/).filter(Boolean).length : 0;
  const keywordsList = parsed.keywords
    ? parsed.keywords.split(',').map((k) => k.trim()).filter((k) => k.length > 0)
    : [];
  const keywordCount = keywordsList.length;

  // Extract identified species clue from title or keywords
  let speciesCommon = 'Wildlife Subject';
  let speciesScientific = '';

  const scientificPattern = keywordsList.find((k) => /^[A-Z][a-z]+\s+[a-z]+$/.test(k));
  if (scientificPattern) {
    speciesScientific = scientificPattern;
  }

  // Common raptors heuristic detection from title/keywords
  const raptorNames = [
    'Bald Eagle', 'Golden Eagle', 'Peregrine Falcon', 'Red-Tailed Hawk', 'Western Barn Owl',
    'Great Horned Owl', 'Osprey', 'Harris Hawk', 'Coopers Hawk', 'Kestrel', 'Harrier',
    'Goshawk', 'Sparrowhawk', 'Sea Eagle', 'Owl', 'Falcon', 'Hawk', 'Eagle', 'Buzzard', 'Vulture'
  ];
  for (const name of raptorNames) {
    if (new RegExp(name, 'i').test(parsed.title) || new RegExp(name, 'i').test(parsed.keywords)) {
      speciesCommon = name;
      break;
    }
  }

  return {
    id: `ms-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    rawJson: {
      title: parsed.title || '',
      description: parsed.description || '',
      keywords: parsed.keywords || '',
    },
    species: {
      commonName: speciesCommon,
      scientificName: speciesScientific || 'Identified in keywords',
      confidence: speciesScientific ? ('High' as const) : ('Medium' as const),
    },
    technical: {
      lighting: parsed.description.toLowerCase().includes('golden')
        ? 'Golden Hour / Natural Sunlight'
        : parsed.description.toLowerCase().includes('soft')
        ? 'Soft Ambient Daylight'
        : 'High-Contrast Natural Light',
      composition: parsed.description.toLowerCase().includes('close-up') || parsed.description.toLowerCase().includes('portrait')
        ? 'Telephoto Macro / Portrait'
        : 'Action Wildlife Capture',
      behavior: parsed.title.toLowerCase().includes('soaring') || parsed.title.toLowerCase().includes('flight')
        ? 'In Flight / Soaring'
        : parsed.title.toLowerCase().includes('perch')
        ? 'Perched / Alert'
        : parsed.title.toLowerCase().includes('hunting')
        ? 'Hunting / Feeding'
        : 'Active Natural Behavior',
      commercialConcepts: keywordsList.slice(0, 6),
    },
    stats: {
      titleWordCount: titleWords,
      isTitleValid: titleWords >= 5 && titleWords <= 15,
      descriptionWordCount: descWords,
      isDescriptionValid: descWords >= 25 && descWords <= 50,
      keywordCount: keywordCount,
      isKeywordCountValid: keywordCount >= 30 && keywordCount <= 45,
      keywordsList: keywordsList,
    },
    platformCompliance: {
      shutterstock: {
        valid: titleWords <= 200 && keywordCount >= 20 && keywordCount <= 50,
        recommendation: 'Shutterstock prefers 25-50 relevant keywords and concise titles.',
      },
      adobeStock: {
        valid: titleWords <= 200 && keywordCount <= 49,
        topKeywords: keywordsList.slice(0, 5),
        recommendation: 'Adobe Stock algorithm prioritizes the first 5 keywords heavily.',
      },
      freepik: {
        valid: keywordCount >= 10,
        recommendation: 'Freepik accepts comma-separated standard tags with high search intent.',
      },
    },
    fileName,
    thumbnailUrl,
    timestamp: new Date().toISOString(),
    processingTimeMs: durationMs,
  };
}

// Core API endpoint for analyzing an image
app.post('/api/analyze', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { imageBase64, imageUrl, fileName = 'wildlife_image.jpg', speciesHint, focusArea } = req.body;

    if (!imageBase64 && !imageUrl) {
      res.status(400).json({ error: 'Missing imageBase64 or imageUrl in request body.' });
      return;
    }

    const { data: base64Data, mimeType } = await resolveImageBase64(imageBase64, imageUrl);
    const ai = getGeminiClient();

    let userPromptText = 'Analyze this wildlife/nature photograph and produce the exact JSON microstock metadata according to the strict guidelines.';
    if (speciesHint) {
      userPromptText += ` Species clue or context provided by photographer: ${speciesHint}.`;
    }
    if (focusArea) {
      userPromptText += ` Priority theme / focus: ${focusArea}.`;
    }

    console.log('[WildStock] Calling Gemini API for', fileName, 'Mime:', mimeType, 'Data len:', base64Data.length);
    
    let textOutput = '';
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[WildStock] Attempting model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: userPromptText,
              },
            ],
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });
        textOutput = response.text || '';
        if (textOutput) {
          console.log(`[WildStock] Model ${modelName} succeeded!`);
          break;
        }
      } catch (modelErr: any) {
        console.warn(`[WildStock] Model ${modelName} failed or timed out:`, modelErr.message);
        lastError = modelErr;
      }
    }

    if (!textOutput) {
      throw lastError || new Error('All AI vision models failed to produce metadata.');
    }
    const duration = Date.now() - startTime;
    const thumb = imageUrl || (imageBase64 ? (imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${imageBase64}`) : '');

    const result = parseMicrostockResult(textOutput, fileName, thumb, duration);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(500).json({
      error: error.message || 'Internal error while analyzing wildlife image.',
    });
  }
});

// Automation Webhook endpoint (compatible with n8n HTTP Request / Webhook node)
app.post('/api/webhook/process', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { imageBase64, imageUrl, fileName = 'automation_capture.jpg' } = req.body;

    if (!imageBase64 && !imageUrl) {
      res.status(400).json({
        success: false,
        error: 'n8n Automation Trigger Error: Payload must contain either imageBase64 or imageUrl.',
      });
      return;
    }

    const { data: base64Data, mimeType } = await resolveImageBase64(imageBase64, imageUrl);
    const ai = getGeminiClient();

    let textOutput = '';
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: 'Analyze this wildlife/nature photograph and produce the exact JSON microstock metadata according to the strict guidelines.',
              },
            ],
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        });
        textOutput = response.text || '';
        if (textOutput) break;
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!textOutput) {
      throw lastError || new Error('All AI vision models failed to produce metadata.');
    }
    const cleaned = cleanJsonOutput(textOutput);
    const parsed = JSON.parse(cleaned);
    const duration = Date.now() - startTime;

    // Return the exact raw JSON object as strictly required by the prompt
    res.json(parsed);
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      error: error.message || 'Error executing automation pipeline',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'WildStock Microstock Automation Engine',
    model: 'gemini-3.8-flash',
    uptime: process.uptime(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WildStock Engine] Automation Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
