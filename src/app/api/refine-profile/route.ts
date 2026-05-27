import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { rawCv } = await req.json();

    if (!rawCv) {
      return new Response(JSON.stringify({ error: 'rawCv is required' }), { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      You are an expert career counselor and resume writer. 
      I will provide you with a raw CV or professional experience text.
      Please analyze it and extract a structured "Master Profile" that represents this person's complete professional history, skills, and education.

      Return the result as a raw JSON object with the following structure. Do not include markdown code blocks or any other text outside the JSON.
      {
        "name": "Full Name (if found, else empty string)",
        "summary": "A strong, comprehensive professional summary based on the experience",
        "skills": ["Skill 1", "Skill 2"],
        "experience": [
          {
            "company": "Company Name",
            "title": "Job Title",
            "duration": "Start Date - End Date",
            "responsibilities": [
              "Detailed bullet point of responsibility/achievement 1",
              "Detailed bullet point 2"
            ]
          }
        ],
        "education": [
          {
            "institution": "School Name",
            "degree": "Degree",
            "year": "Year"
          }
        ]
      }

      Here is the raw experience:
      ${rawCv}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    const text = response.text || '';
    
    // Attempt to parse JSON. We'll strip any potential markdown formatting the model might mistakenly include.
    const jsonString = text.replace(/```json\n?|```/g, '').trim();
    const profileData = JSON.parse(jsonString);

    return new Response(JSON.stringify(profileData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error refining profile:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to refine profile' }), { status: 500 });
  }
}
