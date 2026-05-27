import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'url is required' }), { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch URL: ${res.statusText}` }), { status: res.status });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove unnecessary elements
    $('script, style, noscript, iframe, img, svg, video, audio, nav, footer, header').remove();

    // Extract text from body
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error scraping job:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to scrape job description' }), { status: 500 });
  }
}
