import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { masterProfile, jobDescription } = await req.json();

    if (!masterProfile || !jobDescription) {
      return new Response(JSON.stringify({ error: 'masterProfile and jobDescription are required' }), { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      You are an expert resume writer. I am giving you a "Master Profile" of a candidate and a "Job Description".
      Your task is to tailor the Master Profile to perfectly match the Job Description.
      Highlight the most relevant skills, rewrite the summary to target this specific role, and reorder/rewrite the experience bullet points to emphasize achievements and responsibilities that align with the job description. Do NOT invent new experience, just reframe the existing experience.

      Return the result as a raw JSON object with the exact same structure as the Master Profile:
      {
        "name": "Full Name",
        "summary": "Tailored summary",
        "skills": ["Tailored Skill 1", "Tailored Skill 2"],
        "experience": [
          {
            "company": "Company Name",
            "title": "Job Title",
            "duration": "Start Date - End Date",
            "responsibilities": [
              "Tailored bullet point 1",
              "Tailored bullet point 2"
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

      Master Profile (JSON):
      ${JSON.stringify(masterProfile, null, 2)}

      Job Description:
      ${jobDescription}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });

    const text = response.text || '';
    
    // Attempt to parse JSON.
    const jsonString = text.replace(/```json\n?|```/g, '').trim();
    const tailoredProfile = JSON.parse(jsonString);

    return new Response(JSON.stringify(tailoredProfile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating tailored CV:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate CV' }), { status: 500 });
  }
}
