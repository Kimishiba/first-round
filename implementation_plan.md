# FirstRound - Tailored CV Generator

FirstRound is a web application that takes a user's base professional experience and a job description link, and uses AI to generate a highly tailored, beautiful HTML CV optimized for passing ATS and initial screenings.

## Proposed Changes

### Project Initialization
- Create a new Next.js project in the `/Users/alessandro.longoni/.gemini/antigravity/scratch/first-round` directory.
- Use Vanilla CSS for styling to ensure a premium, customized look (dark mode, glassmorphism, dynamic animations) per our design guidelines.

### Frontend Architecture
- **Master Profile Builder**: A dedicated setup flow where you paste your raw CV. The app uses Gemini to refine and structure it into a comprehensive "Master Profile", which is then saved to your browser's Local Storage.
- **Generator Dashboard**: The main interface where you can:
  - Input a link to a job description (with a fallback text area in case scraping fails).
  - Submit to generate a tailored CV, featuring a dynamic micro-animation loading state.
- **Resume Viewer**: A dedicated component that displays the generated tailored CV.
  - Formatted beautifully using HTML/CSS.
  - Includes a "Print / Save as PDF" button that leverages the browser's native print functionality (which outputs the HTML to a clean PDF).

### Backend (Next.js API Routes)
- **`/api/refine-profile`**: 
  - Receives the raw CV text.
  - Calls the Gemini API to analyze and structure the experience into a comprehensive JSON format.
- **`/api/scrape-job`**:
  - Receives a URL, fetches the HTML, and extracts the main text content using a basic scraper (e.g., Cheerio).
- **`/api/generate-cv`**: 
  - Receives the Master Profile (from local storage) and the job description text.
  - Constructs a prompt for Gemini to extract key skills and rewrite bullet points to align with the job description.
  - Returns structured JSON representing the tailored CV sections (Summary, Experience, Skills, Education).

## Verification Plan

### Manual Verification
- Run the Next.js development server locally.
- Test the Master Profile Builder by providing a sample raw CV and ensuring it saves correctly to Local Storage.
- Test the URL scraper with a sample job description URL.
- Verify Gemini generates a tailored CV that accurately reflects the target role.
- Test the HTML layout to ensure it looks premium on screen and prints perfectly to a single or double-page PDF without awkward page breaks.
