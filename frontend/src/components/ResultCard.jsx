import ConfidenceBar from './ConfidenceBar';
import MetadataPanel from './MetadataPanel';

export default function ResultCard({ result, preview, onReset }) {
  const isFake = result.label === 'Fake';
  const verdict = isFake
    ? { className: 'verdict-fake', hindi: 'AI से बना चेहरा होने की संभावना', english: 'Possibly AI-generated', symbol: '!' }
    : { className: 'verdict-real', hindi: 'असली तस्वीर होने की संभावना', english: 'Likely a real photograph', symbol: '✓' };

  return (
    <section className="results-section" aria-live="polite">
      <div className={`verdict-banner ${verdict.className}`}><span className="verdict-symbol">{verdict.symbol}</span><div><span className="section-kicker">जांच का नतीजा / ANALYSIS RESULT</span><h2>{verdict.hindi}</h2><p>{verdict.english}</p></div><span className="verdict-index">ABHAY · 01</span></div>
      <div className="result-grid">
        <article className="result-image-card"><div className="result-card-heading"><span>तस्वीर / IMAGE</span><span>01 — 01</span></div><img src={preview} alt="Analyzed image" /><div className="confidence-heading"><span>MODEL CONFIDENCE <small>मॉडल का अनुमान</small></span><strong>{result.confidence}%</strong></div><ConfidenceBar confidence={result.confidence} isFake={isFake} /><div className="score-legend"><span><i className="legend-dot real-dot" />Real <b>{result?.scores?.real ?? 0}%</b></span><span><i className="legend-dot fake-dot" />AI-generated <b>{result?.scores?.fake ?? 0}%</b></span></div></article>
        <MetadataPanel metadata={result.metadata} />
      </div>
      <div className="result-disclaimer"><span>✳</span><p><b>ध्यान दें / A note on this result</b><br />AI detection is an estimate, not proof. Metadata can be missing from genuine images or altered in synthetic ones. Consider the image's source and context.</p></div>
      <button type="button" onClick={onReset} className="reset-button">दूसरी तस्वीर जांचें <span>ANALYZE ANOTHER IMAGE ↗</span></button>
    </section>
  );
}
