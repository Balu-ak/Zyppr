import { GoogleGenAI } from "@google/genai";
import { ZodError } from 'zod';
import type { ZypprResponse, Business, Service, User } from '../types';
import { ZypprResponseSchema } from '../lib/schemas';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Added a mapping function to convert the business 'type' (e.g., "Yoga Studio")
// to the 'category' expected by the AI model (e.g., "Yoga").
const mapBusinessTypeToCategory = (type: Business['type']): 'Yoga' | 'Fitness' | 'Yoga & Fitness Center' => {
    switch (type) {
        case 'Yoga Studio':
            return 'Yoga';
        case 'Gym Center':
            return 'Fitness';
        case 'Yoga & Fitness Center':
            return 'Yoga & Fitness Center';
    }
};

const ZYPPR_USER_SYSTEM_INSTRUCTION = `You are **Zyppr**, the in-business AI Assistant for a multi-tenant Wellness & Fitness SaaS (Yoga Studio, Gym Center, or Yoga & Fitness Center).
You are ONLY active when the customer is inside a specific business.

YOUR JOB
1) List the business’s services. When you do, you MUST include the full \`Service\` object from the "Business Data" context, including the \`weekly_schedule\`, so the user can see available times and book.
2) List available appointment slots (date/time).
3) Book appointments for the user and reflect them in the user’s account.

CRITICAL RELIABILITY RULES (Fixes Zod errors)
- Return EXACTLY ONE JSON object. No prose outside JSON.
- Top-level "response" is REQUIRED and MUST be an object (never null/undefined). If nothing to return, use: "response": { "assistant_reply": "…" }.
- Top-level "status" MUST be "success" or "failure".
- **Nullable Fields**: Fields marked as \`"string | null"\` or similar MUST ALWAYS be present in the JSON. If a value is not available, you MUST explicitly return \`null\`. DO NOT omit the key.
- If required info is missing, still return "response": { … } and set:
  • response.missing_fields: string[]
  • response.clarifying_questions: string[]
- Initialize lists as [] and optional singletons as null; never leave "response" undefined.

STRICT DATETIME FORMAT (prevents invalid ISO errors)
- ALL datetimes MUST be UTC with trailing Z in the exact shape: YYYY-MM-DDTHH:mm:ssZ
  Examples: "2025-09-14T13:30:00Z", "2025-12-01T08:00:00Z"
- If you think in local business time, CONVERT to UTC and OUTPUT with "Z".
- Always include seconds.
- For slots and bookings: end_time = start_time + duration_minutes (also UTC "Z").

TONE & INTERACTION
- Always be polite and respectful.
- Put a short friendly message in "response.assistant_reply" on every turn (including failures).
- Confirm with the user before committing a booking.

CONTEXT SCOPE
- You operate ONLY inside one business. If business context is missing, DO NOT list or book; instead return clarifying questions (but keep "response" present).

CORE FUNCTIONS
A) LIST_SERVICES
- When asked for services, you MUST return the full service objects provided in the "Business Data" context, including their name, description, price, and crucially, the 'weekly_schedule'. This allows the user interface to display interactive booking cards.

B) LIST_APPOINTMENTS (available slots)
- When asked for availability, you MUST use the pre-calculated list of slots provided in the "Pre-Calculated Upcoming Slots" section of the context. This is the definitive source of truth for bookable times.
- From that list, select the slots that are relevant to the user's request (e.g., for a specific service or day).
- Present these slots to the user.
- All times in the pre-calculated list are already in the correct UTC "…Z" format. Simply return them as they are.

C) CREATE_APPOINTMENT
- Require: service_id OR service_name, user contact (email or phone), start_time (UTC "Z").
- If ambiguous/missing, ask clarifying questions. Confirm, then commit.
- On success, add the appointment to response.appointments (status="confirmed") and emit response.notification for the owner.

OUTPUT CONTRACT (MUST follow exactly; NEVER omit "response")
{
  "operation": "ASSIST" | "LIST_SERVICES" | "LIST_APPOINTMENTS" | "CREATE_APPOINTMENT",
  "role": "user",
  "status": "success" | "failure",

  "business": {
    "id": "string | null",
    "name": "string | null",
    "category": "Yoga" | "Fitness" | "Yoga & Fitness Center" | null,
    "address": "string | null",
    "zipcode": "string | null",
    "timezone": "string | null"   // informational; ALL output times are UTC Z
  } | null,

  "request": {
    "service": {
      "id": "string | null",
      "name": "string | null",
      "description": "string | null",
      "duration_minutes": "number | null",
      "price": { "amount": "number | null", "currency": "string | null" } | null,
      "category": "string | null",
      "tags": ["string", "..."] | null
    } | null,
    "appointment": {
      "id": "string | null",
      "service_id": "string | null",
      "service_name": "string | null",
      "customer": { "name": "string | null", "email": "string | null", "phone": "string | null" } | null,
      "start_time": "string | null",   // MUST be "YYYY-MM-DDTHH:mm:ssZ"
      "end_time": "string | null",     // MUST be "YYYY-MM-DDTHH:mm:ssZ"
      "notes": "string | null",
      "status": "pending" | "confirmed" | "cancelled" | null
    } | null
  } | null,

  "response": {
    "assistant_reply": "string | null",

    "services": [
      {
        "id": "string | null",
        "name": "string",
        "description": "string",
        "duration_minutes": "number",
        "price": { "amount": "number", "currency": "string" },
        "category": "string",
        "tags": ["string", "..."] | null,
        "weekly_schedule": [{ "day": "string", "time": "string" }]
      }
    ] | null,

    "available_slots": [
      { "service_name": "string", "start_time": "string", "end_time": "string" }  // UTC "…Z"
    ] | null,

    "appointments": [
      {
        "id": "string",
        "service_id": "string | null",
        "service_name": "string",
        "customer": { "name": "string", "email": "string | null", "phone": "string | null" },
        "start_time": "string",  // UTC "…Z"
        "end_time": "string",    // UTC "…Z"
        "notes": "string | null",
        "status": "pending" | "confirmed" | "cancelled"
      }
    ] | null,

    "notification": {
      "type": "APPOINTMENT_CREATED" | "SERVICE_CREATED" | "SERVICE_UPDATED" | "SERVICE_DELETED" | null,
      "channels": ["dashboard", "email", "sms", "whatsapp"] | null,
      "message": "string | null",
      "data": { "appointment_id": "string | null", "service_id": "string | null" } | null
    } | null,

    "missing_fields": ["string", "..."] | null,
    "clarifying_questions": ["string", "..."] | null,
    "errors": ["string", "..."] | null
  }
}

DECISION LOGIC
- General greeting/FAQ inside a business → operation="ASSIST", status="success"; include response.assistant_reply.
- Ask for services → operation="LIST_SERVICES"; return response.services.
- Ask for availability → operation="LIST_APPOINTMENTS"; return response.available_slots based on the pre-calculated context.
- Book request:
  • If info missing/ambiguous → status="failure"; fill response.missing_fields and/or response.clarifying_questions.
  • If info present and user confirms → operation="CREATE_APPOINTMENT", status="success"; append to response.appointments (status="confirmed") and emit response.notification.
`;

const ZYPPR_ADMIN_SYSTEM_INSTRUCTION = `You are **Zyppr**, the AI orchestrator for a multi-tenant SaaS serving Wellness & Fitness businesses.
You MUST return EXACTLY ONE JSON object per reply that conforms to the ZYPPR CONTRACT BELOW.
NEVER omit the top-level "response" key. If you have nothing to return, return an empty object \`{}\` for "response" with safe defaults.

====================================================================
0) RELIABILITY & VALIDATION GUARDRAILS
- Deterministic: ONE JSON object only; no prose outside JSON.
- "response" MUST ALWAYS be an object (not null/undefined).
- If required inputs are missing, set \`status="failure"\`, include \`response.missing_fields\` and \`response.clarifying_questions\`. Keep \`response\` present.
- Use ISO-8601 datetimes with timezone (e.g., 2025-09-14T11:30:00-04:00).
- Polite, respectful tone in any free-form \`assistant_reply\`.

====================================================================
1) ROLES & OPERATIONS
- role: "user" or "business_owner".
- operation (examples):
  "LOGIN", "SIGNUP", "VIEW_PROFILE", "UPDATE_PROFILE", "RESET_PASSWORD",
  "LIST_BUSINESSES", "LIST_SERVICES", "LIST_APPOINTMENTS",
  "CREATE_SERVICE", "UPDATE_SERVICE", "DELETE_SERVICE",
  "CREATE_APPOINTMENT", "GENERATE_POST", "BROADCAST_MESSAGE",
  "ASSIST"  ← Use for general questions and greetings. For a simple greeting like "Hi", "Hello", or "Hey", your only task is to provide a friendly reply in \`response.assistant_reply\` and ensure other fields in the response object are empty arrays or null. DO NOT return errors or clarifying questions for a simple greeting.

====================================================================
2) SERVICE & APPOINTMENT DEFAULTS (when missing and demo is allowed)
Yoga services:
- Vinyasa Flow (60 min, $20), Hatha Yoga (45 min, $15), Meditation Circle (30 min, $10)
Gym services:
- Strength Training (60 min, $25), Cardio Blast (45 min, $20), Personal Training (30 min, $30)

Available slots: return 3–4 future times between 08:00–17:00 business-local.

====================================================================
3) EMPTY-STATE / DEMO SEEDING
- If no real businesses for a user’s zipcode → include \`response.demo_businesses\` (2–3 entries) and set \`"response.is_demo": true\`.
- If new owner without data → include \`response.demo_services\`, \`response.demo_appointments\`, \`response.demo_photos\` (and \`response.demo_broadcasts\` for Fitness/Both) with \`"response.is_demo": true\`.

====================================================================
4) OUTPUT CONTRACT (STRICT)
You MUST produce this shape. Use \`null\` or empty arrays where appropriate, but NEVER omit "response".
// ... [The full contract from previous prompts would be here] ...

====================================================================
5) ERROR-PROOFING RULES (to prevent Zod failures)
- NEVER return \`"response": undefined\`. If you have nothing to return, set \`"response": { "assistant_reply": "...", "missing_fields": [], "errors": [] }\`.
- Initialize absent collections as empty arrays: \`[]\`.
- For optional objects with no data, use \`null\`.
- On failure: \`status="failure"\`, keep \`"response"\` present and include \`errors\` with human-readable messages.
- For general questions, use \`operation="ASSIST"\` and place the polite answer in \`"response.assistant_reply"\` while keeping the rest of the response valid.
`;

const getNextDateForDay = (dayOfWeek: string, time: string): Date => {
    const dayMapping: { [key: string]: number } = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDay = dayMapping[dayOfWeek];
    
    if (targetDay === undefined) {
        // Fallback for invalid day
        return new Date();
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    const resultDate = new Date();
    resultDate.setHours(hours, minutes, 0, 0);
    
    const currentDay = resultDate.getDay();
    let dayDifference = targetDay - currentDay;

    if (dayDifference < 0 || (dayDifference === 0 && resultDate.getTime() < new Date().getTime())) {
        dayDifference += 7;
    }
    
    resultDate.setDate(resultDate.getDate() + dayDifference);
    
    return resultDate;
};


// Pre-calculates available appointment slots for the next two weeks.
const calculateUpcomingSlots = (services: Service[]): string => {
    if (!services || services.length === 0) {
        return "No services with scheduled times are available.";
    }

    const allSlots: { service_name: string; start_time: string; end_time: string }[] = [];
    const now = new Date();

    services.forEach(service => {
        if (service.weekly_schedule && service.weekly_schedule.length > 0) {
            // Check for the next two weeks
            for (let i = 0; i < 14; i++) {
                const checkDate = new Date(now);
                checkDate.setDate(now.getDate() + i);
                const checkDayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });

                service.weekly_schedule.forEach(slot => {
                    if (slot.day === checkDayName) {
                        const [hours, minutes] = slot.time.split(':').map(Number);
                        const startTime = new Date(checkDate);
                        startTime.setHours(hours, minutes, 0, 0);

                        // Only include slots that are in the future
                        if (startTime > now) {
                             const endTime = new Date(startTime.getTime() + service.duration_minutes * 60000);
                             allSlots.push({
                                 service_name: service.name,
                                 start_time: startTime.toISOString(),
                                 end_time: endTime.toISOString(),
                             });
                        }
                    }
                });
            }
        }
    });

    if (allSlots.length === 0) {
        return "No upcoming appointment slots found in the next two weeks.";
    }
    
    // Sort slots chronologically
    allSlots.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    // Format for the AI prompt
    return allSlots.map(s => `- ${s.service_name}: Starts ${s.start_time}, Ends ${s.end_time}`).join('\n');
};


export const callZypprAPI = async (
    message: string,
    role: 'user' | 'business_owner',
    business: Business,
    user: User | null
): Promise<ZypprResponse> => {
    try {
        
        const upcomingSlotsSummary = calculateUpcomingSlots(business.services || []);

        const fullPrompt = `
Context:
- Role: ${role}
- User Profile: ${user ? JSON.stringify(user.profile) : 'Anonymous'}
- Business Data (includes full service details for listing): ${JSON.stringify({
    id: business.id,
    name: business.name,
    category: mapBusinessTypeToCategory(business.type),
    address: business.address,
    zipcode: business.zipcode,
    timezone: business.timezone,
    services: business.services // This includes weekly_schedule for the AI to return in LIST_SERVICES
})}
- Pre-Calculated Upcoming Slots (for finding and booking appointments):
${upcomingSlotsSummary}
- Current Date/Time: ${new Date().toISOString()}

User Request: "${message}"

Please process this request and return the appropriate JSON response according to the contract.
`;

        const systemInstruction = role === 'user' 
            ? ZYPPR_USER_SYSTEM_INSTRUCTION 
            : ZYPPR_ADMIN_SYSTEM_INSTRUCTION;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
            },
        });

        const rawText = response.text;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("No valid JSON object found in the AI's response.");
        }
        
        const jsonText = jsonMatch[0];
        const parsedJson = JSON.parse(jsonText);

        const validatedData = ZypprResponseSchema.parse(parsedJson);
        return validatedData;

    } catch (error) {
        console.error("Error calling or parsing Zyppr API:", error);
        
        const fallbackResponse: ZypprResponse = {
            operation: 'ASSIST',
            role: role,
            status: 'failure',
            business: {
              id: business.id,
              name: business.name,
              category: mapBusinessTypeToCategory(business.type),
              address: business.address,
              zipcode: business.zipcode,
              timezone: business.timezone,
            },
            request: null,
            response: {
                assistant_reply: "I'm sorry, an unexpected error occurred. Please try again in a moment.",
                errors: ["An unexpected error occurred while processing your request. The AI may be offline or have returned an invalid response."],
            }
        };

        if (error instanceof ZodError) {
             console.error("Zod validation errors:", error.issues);
             fallbackResponse.response.errors = ["The AI returned data in an unexpected format. Please try again."];
             fallbackResponse.response.clarifying_questions = ["Could you please rephrase your request?"];
        }

        return fallbackResponse;
    }
};

export const generateMarketingPost = async (
    businessType: string,
    platform: string,
    tone: string
): Promise<{ text: string, imageUrl: string }> => {
    try {
        // 1. Generate text for the post
        const textPrompt = `Create a short, engaging social media post for a ${businessType} to be published on ${platform}. The tone should be ${tone}. Include relevant hashtags.`;
        const textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: textPrompt,
        });
        const text = textResponse.text;

        // 2. Generate an image for the post
        const imagePrompt = `A vibrant, high-quality photograph for a social media post about a ${businessType}. The image should be inspiring and relevant to ${tone.toLowerCase()} marketing. Aspect ratio for ${platform}.`;
        
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

        return { text, imageUrl };

    } catch (error) {
        console.error("Error generating marketing post:", error);
        throw new Error("Failed to generate marketing post. Please check the console for details.");
    }
};

export const generateDescription = async (serviceName: string, businessType: string): Promise<string> => {
    try {
        const prompt = `Write a brief, appealing one-sentence description for a service called "${serviceName}" at a ${businessType}.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating description:", error);
        return "";
    }
};