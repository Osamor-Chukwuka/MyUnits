'use server';

export type UsageUnit = 'minutes' | 'hours';

export type ApplianceUnitCalculationInput = {
  applianceName: string;
  watts: number;
  usageAmount: number;
  usageUnit: UsageUnit;
};

export type ApplianceUnitCalculation = {
  applianceName: string;
  watts: number;
  usageMinutes: number;
  unitsPerMinute: number;
  unitsPerHour: number;
  unitsForUsage: number;
};

export type ApplianceWattageLookupInput = {
  applianceName: string;
  brand: string;
  model: string;
};

export type ApplianceWattageLookupResult = {
  ok: boolean;
  message: string;
  applianceName?: string;
  estimatedWatts?: number;
  wattageRange?: string;
  confidence?: 'low' | 'medium' | 'high';
  sourceSummary?: string;
  sources?: { title: string; url: string }[];
};

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    groundingMetadata?: {
      groundingChunks?: { web?: { title?: string; uri?: string } }[];
    };
  }[];
};

type WattageEstimatePayload = {
  applianceName?: unknown;
  estimatedWatts?: unknown;
  wattageRange?: unknown;
  confidence?: unknown;
  sourceSummary?: unknown;
};

type GeminiCallResult = ApplianceWattageLookupResult & {
  retryWithoutSearch?: boolean;
};

const wattageResponseSchema = {
  type: 'OBJECT',
  properties: {
    applianceName: { type: 'STRING' },
    estimatedWatts: { type: 'NUMBER' },
    wattageRange: { type: 'STRING' },
    confidence: { type: 'STRING', enum: ['low', 'medium', 'high'] },
    sourceSummary: { type: 'STRING' },
  },
  required: ['applianceName', 'estimatedWatts', 'wattageRange', 'confidence', 'sourceSummary'],
  propertyOrdering: ['applianceName', 'estimatedWatts', 'wattageRange', 'confidence', 'sourceSummary'],
};

// Keep the Gemini model configurable so we can change models without editing code.
// Structured output + Google Search requires a Gemini 3-series model in the
// current Gemini API docs, so the default needs to be a supported model.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

export async function calculateApplianceUnitsAction(
  input: ApplianceUnitCalculationInput,
): Promise<ApplianceUnitCalculation> {
  // This is the primary path: when the user provides watts, we do the math ourselves.
  // Gemini is not involved in this calculation.
  const applianceName = input.applianceName.trim() || 'Appliance';
  const watts = Number(input.watts);
  const usageAmount = Number(input.usageAmount);

  if (!Number.isFinite(watts) || watts <= 0) {
    throw new Error('Enter a valid wattage greater than 0.');
  }

  if (!Number.isFinite(usageAmount) || usageAmount <= 0) {
    throw new Error('Enter how long you use the appliance.');
  }

  // The app works in electricity units only for now because we do not receive
  // a live meter tariff/rate from the provider.
  const usageMinutes = input.usageUnit === 'hours' ? usageAmount * 60 : usageAmount;

  // 1 electricity unit = 1 kWh.
  // watts / 1000 gives kWh for one hour of usage.
  const unitsPerHour = watts / 1000;

  // Divide hourly units by 60 to get a per-minute usage rate.
  const unitsPerMinute = unitsPerHour / 60;

  // For custom usage time, multiply the per-minute units by minutes used.
  const unitsForUsage = unitsPerMinute * usageMinutes;

  return {
    applianceName,
    watts,
    usageMinutes,
    unitsPerMinute,
    unitsPerHour,
    unitsForUsage,
  };
}

export async function lookupApplianceWattageAction(
  input: ApplianceWattageLookupInput,
): Promise<ApplianceWattageLookupResult> {
  // This is the fallback path only: use it when the user does not know the wattage.
  // The result is just an estimated wattage, not a final electricity calculation.
  const applianceName = input.applianceName.trim();
  const brand = input.brand.trim();
  const model = input.model.trim();

  if (!applianceName || !brand || !model) {
    return {
      ok: false,
      message: 'Enter the appliance, brand, and model so we can estimate the wattage.',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Keep the manual calculator usable even if Gemini has not been configured.
    return {
      ok: false,
      message: 'Wattage lookup is not configured yet. Add GEMINI_API_KEY to the server environment.',
    };
  }

  const response = await requestGeminiEstimate(apiKey, { applianceName, brand, model });

  if (!response.ok) {
    return response;
  }

  const estimatedWatts = Number(response.estimatedWatts);

  // Even with structured output, validate the model response before trusting it.
  if (!Number.isFinite(estimatedWatts) || estimatedWatts <= 0) {
    return {
      ok: false,
      message: 'We could not find a reliable wattage estimate for that appliance.',
    };
  }

  return {
    ...response,
    applianceName: response.applianceName || applianceName,
    estimatedWatts: Math.round(estimatedWatts),
    wattageRange: response.wattageRange || `${Math.round(estimatedWatts)}W`,
    confidence: response.confidence || 'low',
  };
}

function buildWattageLookupPrompt(input: ApplianceWattageLookupInput, useWebSearch: boolean) {
  // The prompt asks for running watts because startup/surge watts would overstate
  // normal electricity usage for appliances like fridges, freezers, or ACs.
  return `
You estimate appliance electricity wattage for a simple consumer electricity calculator.

${useWebSearch ? 'Find the typical running wattage for this appliance using web search:' : 'Estimate the typical running wattage for this appliance from your general product knowledge. You do not have live web search in this fallback attempt.'}
Appliance: ${input.applianceName}
Brand: ${input.brand}
Model: ${input.model}

Return only JSON matching this shape:
{
  "applianceName": "short human readable appliance name",
  "estimatedWatts": 0,
  "wattageRange": "short range like 900-1200W when available",
  "confidence": "low | medium | high",
  "sourceSummary": "one short sentence explaining what the estimate is based on"
}

Rules:
- Use running watts, not surge/startup watts.
- If exact model data is not available, use a realistic estimate for the closest matching model and set confidence to low or medium.
- If you are estimating without web search, say that clearly in sourceSummary and do not claim you verified live sources.
- Do not include naira, tariff rates, or electricity provider details.
- Do not wrap JSON in markdown.
`;
}

async function requestGeminiEstimate(
  apiKey: string,
  input: ApplianceWattageLookupInput,
): Promise<ApplianceWattageLookupResult> {
  // Best path: source-backed lookup using Gemini Google Search grounding.
  const groundedResult = await callGemini(apiKey, buildWattageLookupPrompt(input, true), {
    structuredOutput: true,
    useGoogleSearch: true,
  });

  if (groundedResult.ok || !groundedResult.retryWithoutSearch) {
    return groundedResult;
  }

  console.warn('Retrying Gemini wattage lookup without Google Search because Search quota is exhausted.');

  // Fallback path: no live web search. This is cheaper/more available, but the
  // result should be treated as a rough estimate and confirmed by the user.
  return callGemini(apiKey, buildWattageLookupPrompt(input, false), {
    structuredOutput: true,
    useGoogleSearch: false,
  });
}

async function callGemini(
  apiKey: string,
  prompt: string,
  options: {
    structuredOutput: boolean;
    useGoogleSearch: boolean;
  },
): Promise<GeminiCallResult> {
  try {
    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      ...(options.useGoogleSearch ? { tools: [{ google_search: {} }] } : {}),
      generationConfig: {
        temperature: 0.2,
        // Ask Gemini for JSON using the REST API fields documented under
        // GenerationConfig. The previous nested responseFormat shape rejected
        // "application/json" because that field expects enum-style values.
        ...(options.structuredOutput
          ? {
              responseMimeType: 'application/json',
              responseSchema: wattageResponseSchema,
            }
          : {}),
      },
    };

    const response = await fetch(getGeminiEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini wattage lookup failed', {
        status: response.status,
        model: GEMINI_MODEL,
        structuredOutput: options.structuredOutput,
        useGoogleSearch: options.useGoogleSearch,
        errorBody,
      });

      return {
        ok: false,
        message: 'We could not look up the wattage right now. Please try again or enter the wattage manually.',
        retryWithoutSearch: options.useGoogleSearch && response.status === 429,
      };
    }

    const data = (await response.json()) as GeminiResponse;

    // Gemini can split text across parts, so join all returned text chunks.
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();

    if (!text) {
      return {
        ok: false,
        message: 'We could not find a wattage estimate for that appliance.',
      };
    }

    const parsed = parseGeminiJson(text);

    // Grounding sources are optional, but when present they help users judge
    // whether the estimated wattage is believable before confirming it.
    const sources = getGroundingSources(data);

    return {
      ok: true,
      message: 'Confirm this wattage before calculating.',
      applianceName: getString(parsed.applianceName),
      estimatedWatts: getNumber(parsed.estimatedWatts),
      wattageRange: getString(parsed.wattageRange),
      confidence: getConfidence(parsed.confidence),
      sourceSummary: getString(parsed.sourceSummary),
      sources,
    };
  } catch {
    return {
      ok: false,
      message: 'We could not look up the wattage right now. Please try again or enter the wattage manually.',
    };
  }
}

function getGeminiEndpoint() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
}

function parseGeminiJson(text: string): WattageEstimatePayload {
  // Handle the common case where a model accidentally wraps JSON in markdown.
  const cleanedText = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(cleanedText) as WattageEstimatePayload;
}

function getGroundingSources(data: GeminiResponse) {
  // Keep only a few sources so the confirmation card stays readable.
  return (
    data.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk) => ({
        title: chunk.web?.title?.trim() ?? '',
        url: chunk.web?.uri?.trim() ?? '',
      }))
      .filter((source) => source.title && source.url)
      .slice(0, 3) ?? []
  );
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function getNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getConfidence(value: unknown): ApplianceWattageLookupResult['confidence'] {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }

  return 'low';
}
