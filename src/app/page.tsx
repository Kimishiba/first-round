'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [masterProfile, setMasterProfile] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Setup State
  const [rawCv, setRawCv] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Dashboard State
  const [jobUrl, setJobUrl] = useState('');
  const [jobTextFallback, setJobTextFallback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  
  // Result State
  const [tailoredCv, setTailoredCv] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    const savedProfile = localStorage.getItem('masterProfile');
    if (savedProfile) {
      try {
        setMasterProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Failed to parse master profile from local storage');
      }
    }
  }, []);

  const handleRefineProfile = async () => {
    if (!rawCv.trim()) {
      setSetupError('Please paste your raw CV or professional experience.');
      return;
    }
    
    setIsRefining(true);
    setSetupError('');

    try {
      const res = await fetch('/api/refine-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawCv })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to refine profile');

      setMasterProfile(data);
      localStorage.setItem('masterProfile', JSON.stringify(data));
    } catch (err: any) {
      setSetupError(err.message);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateCv = async () => {
    if (!jobUrl.trim() && !jobTextFallback.trim()) {
      setGenerateError('Please provide a job URL or paste the job description text.');
      return;
    }

    setIsGenerating(true);
    setGenerateError('');

    try {
      let jobDescription = jobTextFallback;

      if (jobUrl.trim() && !jobTextFallback.trim()) {
        const scrapeRes = await fetch('/api/scrape-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: jobUrl })
        });
        const scrapeData = await scrapeRes.json();
        
        if (!scrapeRes.ok) throw new Error(scrapeData.error || 'Failed to scrape job URL');
        jobDescription = scrapeData.text;
      }

      const generateRes = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterProfile, jobDescription })
      });

      const generateData = await generateRes.json();
      
      if (!generateRes.ok) throw new Error(generateData.error || 'Failed to generate CV');

      setTailoredCv(generateData);
    } catch (err: any) {
      setGenerateError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetProfile = () => {
    localStorage.removeItem('masterProfile');
    setMasterProfile(null);
    setRawCv('');
    setTailoredCv(null);
  };

  if (!isClient) return null;

  // View: Resume Viewer
  if (tailoredCv) {
    return (
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            .no-print { display: none !important; }
            body { background: white; color: black; }
            .glass-panel.cv-document { box-shadow: none; border: none; padding: 0; }
          }
        `}} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }} className="no-print">
          <button className="btn btn-outline" onClick={() => setTailoredCv(null)}>← Back to Dashboard</button>
          <button className="btn btn-primary" onClick={handlePrint}>Print / Save PDF</button>
        </div>

        <div className="glass-panel cv-document animate-fade-in" style={{ backgroundColor: 'white', color: 'black' }}>
          <div style={{ padding: '40px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>{tailoredCv.name || 'Your Name'}</h1>
            
            <div style={{ marginBottom: '24px' }}>
              <p>{tailoredCv.summary}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px' }}>Skills</h3>
              <p>{tailoredCv.skills?.join(', ')}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px' }}>Experience</h3>
              {tailoredCv.experience?.map((exp: any, i: number) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>{exp.title} at {exp.company}</span>
                    <span>{exp.duration}</span>
                  </div>
                  <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    {exp.responsibilities?.map((resp: string, j: number) => (
                      <li key={j} style={{ marginBottom: '4px' }}>{resp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px' }}>Education</h3>
              {tailoredCv.education?.map((edu: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span><strong>{edu.degree}</strong>, {edu.institution}</span>
                  <span>{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View: Generator Dashboard
  if (masterProfile) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '80px', maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>FirstRound Generator</h1>
          <p style={{ opacity: 0.8 }}>Paste a job description link, and we'll tailor your Master Profile to it.</p>
        </div>

        <div className="glass-panel">
          <div className="input-group">
            <label className="input-label">Job Description URL (Recommended)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="https://example.com/job/123"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>

          <div style={{ textAlign: 'center', margin: '16px 0', opacity: 0.6 }}>— OR —</div>

          <div className="input-group">
            <label className="input-label">Raw Job Description Text (Fallback)</label>
            <textarea 
              className="input-field" 
              placeholder="Paste the job description text here if the URL scraper fails..."
              value={jobTextFallback}
              onChange={(e) => setJobTextFallback(e.target.value)}
            />
          </div>

          {generateError && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{generateError}</div>}

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
            onClick={handleGenerateCv}
            disabled={isGenerating}
          >
            {isGenerating ? 'Analyzing & Tailoring CV...' : 'Generate Tailored CV'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn btn-outline" onClick={handleResetProfile} style={{ fontSize: '0.8rem' }}>
            Reset Master Profile
          </button>
        </div>
      </div>
    );
  }

  // View: Setup Master Profile Builder
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '80px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Welcome to FirstRound</h1>
        <p style={{ opacity: 0.8 }}>Let's build your Master Profile. Paste your raw CV or professional experience below.</p>
      </div>

      <div className="glass-panel">
        <div className="input-group">
          <label className="input-label">Your Raw Professional Experience</label>
          <textarea 
            className="input-field" 
            placeholder="Paste your current resume, LinkedIn profile text, or just a list of your past roles and achievements..."
            value={rawCv}
            onChange={(e) => setRawCv(e.target.value)}
            style={{ minHeight: '300px' }}
          />
        </div>

        {setupError && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{setupError}</div>}

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}
          onClick={handleRefineProfile}
          disabled={isRefining}
        >
          {isRefining ? 'Refining Your Profile...' : 'Build Master Profile'}
        </button>
      </div>
    </div>
  );
}
