export default function ConfidenceBar({ confidence, isFake }) {
  const value = Math.max(0, Math.min(Number(confidence) || 0, 100));
  return <div className={`confidence-track${isFake ? ' confidence-fake' : ' confidence-real'}`} role="meter" aria-label="Model confidence" aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>;
}
