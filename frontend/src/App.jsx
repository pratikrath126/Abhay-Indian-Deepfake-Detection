import { useEffect, useMemo, useState } from 'react';
import { analyzeImage, checkHealth } from './api';
import UploadZone from './components/UploadZone';
import ResultCard from './components/ResultCard';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ node_server: 'offline', ml_engine: 'offline' });

  useEffect(() => {
    let active = true;
    const runHealthCheck = async () => {
      const status = await checkHealth();
      if (active) setBackendStatus(status);
    };
    runHealthCheck();
    const timer = setInterval(runHealthCheck, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const serviceOnline = backendStatus.node_server === 'online' && backendStatus.ml_engine === 'online';
  const statusView = useMemo(() => serviceOnline
    ? { text: 'System ready', hindi: 'सिस्टम तैयार', className: 'online' }
    : { text: 'Checking system', hindi: 'जांच जारी', className: 'checking' }, [serviceOnline]);

  const onFilePicked = (picked) => {
    if (!picked) return;
    if (!ALLOWED_TYPES.includes(picked.type)) {
      setError('Please choose a JPG, PNG, or WebP image. कृपया JPG, PNG या WebP image चुनें।');
      return;
    }
    if (picked.size > MAX_FILE_SIZE) {
      setError('This image is over 20 MB. कृपया 20 MB से छोटी image चुनें।');
      return;
    }
    setError('');
    setResult(null);
    if (preview) URL.revokeObjectURL(preview);
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const handleFileChange = (event) => onFilePicked(event.target.files?.[0]);
  const handleDragOver = (event) => { event.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (event) => { event.preventDefault(); setIsDragging(false); };
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    onFilePicked(event.dataTransfer.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    try {
      setResult(await analyzeImage(file));
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Analysis failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    const input = document.getElementById('fileInput');
    if (input) input.value = '';
  };

  return (
    <div className="abhay-app min-h-screen">
      <div className="top-ribbon"><span>सतर्क रहें · सोच-समझकर साझा करें</span><span>Look closer. Share with care.</span></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Abhay home">
          <span className="brand-mark" aria-hidden="true">अ</span>
          <span className="brand-copy"><strong>ABHAY</strong><small>अभय · DIGITAL TRUST LAB</small></span>
        </a>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#how-it-works">कैसे काम करता है <span>How it works</span></a>
          <a href="#about-project">परियोजना <span>About</span></a>
        </nav>
        <div className={`service-pill ${statusView.className}`} title={`${statusView.hindi} · ${statusView.text}`}>
          <span className="status-dot" />
          <span><b>{statusView.text}</b><small>{statusView.hindi}</small></span>
        </div>
      </header>

      <main id="top">
        <section className="hero-shell">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> AI चेहरे की पहचान <span>/</span> FACE AUTHENTICITY CHECK</div>
            <h1>हर चेहरे के पीछे,<br /><em>एक सच्चाई।</em></h1>
            <p className="hero-english">A thoughtful first check for faces that may be made by AI.</p>
            <p className="hero-description">एक तस्वीर अपलोड करें। Abhay चेहरे के visual signals और image metadata की जांच करके आपको एक आसान-सा संकेत देता है।</p>
            <div className="hero-note"><span aria-hidden="true">✳</span><p><strong>सिर्फ एक संकेत, अंतिम फैसला नहीं।</strong><br />Detection results को context के साथ समझें और ज़रूरत पड़ने पर दूसरे sources से भी verify करें।</p></div>
            <div className="hero-byline"><span className="mini-seal">अ</span><span>एक student project from <b>KIIT, Bhubaneswar</b></span><span className="byline-divider" /><span>IMAGE FORENSICS · 01</span></div>
          </div>

          <div className="upload-card" aria-label="Upload an image for analysis">
            <div className="card-topline"><span><b>01</b> &nbsp; तस्वीर चुनें / SELECT IMAGE</span><span className="card-corner">✳</span></div>
            <UploadZone
              file={file}
              preview={preview}
              isDragging={isDragging}
              loading={loading}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onBrowse={() => document.getElementById('fileInput')?.click()}
              onFileChange={handleFileChange}
            />
            <div className="upload-meta"><span>JPG · PNG · WEBP</span><span>अधिकतम 20 MB / MAX 20 MB</span></div>
            <button type="button" disabled={!file || loading || !serviceOnline} onClick={handleAnalyze} className="analyze-button">
              <span>{loading ? 'जांच हो रही है · ANALYZING' : 'तस्वीर की जांच करें · ANALYZE IMAGE'}</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </button>
            {!serviceOnline && <p className="service-hint">जांच सेवा से जुड़ रहे हैं… / Connecting to detection service…</p>}
            <p className="privacy-note"><span aria-hidden="true">⌑</span> आपकी image केवल analysis के लिए भेजी जाती है। / Image is used for analysis only.</p>
          </div>
        </section>

        {error && (
          <div className="error-panel" role="alert">
            <div><strong>जांच पूरी नहीं हो सकी / Could not complete analysis</strong><p>{error}</p></div>
            <button type="button" onClick={() => setError('')} aria-label="Dismiss error">×</button>
          </div>
        )}

        {result && <ResultCard result={result} preview={preview} onReset={handleReset} />}

        <section id="how-it-works" className="signals-section">
          <div className="section-heading"><div><span className="section-kicker">WHAT ABHAY LOOKS AT</span><h2>दो नज़रिए। <em>एक बेहतर संकेत।</em></h2></div><p>हर जांच में image के अलग-अलग clues देखे जाते हैं।<br />No single clue tells the whole story.</p></div>
          <div className="signal-grid">
            <article className="signal-card signal-saffron"><span className="signal-number">01</span><span className="signal-icon" aria-hidden="true">◉</span><h3>Visual signals <small>दृश्य संकेत</small></h3><p>EfficientNet-B0 model चेहरे के image patterns को classify करता है और real या AI-generated होने का estimate देता है।</p><span className="signal-foot">IMAGE PATTERN REVIEW <b>↗</b></span></article>
            <article className="signal-card signal-green"><span className="signal-number">02</span><span className="signal-icon" aria-hidden="true">⌑</span><h3>Image details <small>तस्वीर की जानकारी</small></h3><p>EXIF metadata में camera, software और दूसरे file details के clues देखे जाते हैं।</p><span className="signal-foot">METADATA REVIEW <b>↗</b></span></article>
            <article className="signal-card signal-cream"><span className="signal-number">03</span><span className="signal-icon" aria-hidden="true">✳</span><h3>Read with care <small>समझदारी से देखें</small></h3><p>Confidence score एक model estimate है। Metadata हटाया या बदला जा सकता है, इसलिए नतीजे को अकेला सबूत न मानें।</p><span className="signal-foot">CONTEXT MATTERS <b>↗</b></span></article>
          </div>
        </section>

        <section id="about-project" className="about-strip"><div className="about-stamp">अ<br /><small>ABHAY</small></div><div><span className="section-kicker">A STUDENT RESEARCH PROJECT · KIIT, BHUBANESWAR</span><h2>Technology for a more thoughtful internet.</h2><p>Abhay brings machine learning and image metadata analysis together to make face-image checks easier to understand. Built as a three-part system with a React interface, Node.js API gateway, and Python inference engine.</p></div><a href="#top" className="back-top">शुरुआत पर जाएं <span>BACK TO TOP ↑</span></a></section>
      </main>

      <footer className="site-footer"><span>ABHAY <b>·</b> अभय</span><span>DEEPFAKE FACE DETECTION SYSTEM</span><span>Made for careful looking <b>✳</b></span></footer>
    </div>
  );
}
