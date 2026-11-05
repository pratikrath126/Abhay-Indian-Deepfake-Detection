function getStatusInfo(status) {
  if (status === 'Likely Real') return { icon: '✓', className: 'meta-positive', hindi: 'असली होने के संकेत' };
  if (status === 'Suspicious' || status === 'Likely Fake') return { icon: '!', className: 'meta-caution', hindi: 'ध्यान देने योग्य संकेत' };
  return { icon: '·', className: 'meta-neutral', hindi: 'स्पष्ट संकेत नहीं' };
}

export default function MetadataPanel({ metadata = {} }) {
  const status = metadata.status || 'Inconclusive';
  const reason = metadata.reason || 'No metadata analysis available.';
  const details = metadata.details || {};
  const statusInfo = getStatusInfo(status);
  const rows = [
    ['Camera make', details.camera_make || 'Not found'],
    ['Camera model', details.camera_model || 'Not found'],
    ['Software', details.software || 'Not found'],
    ['GPS data', details.has_gps ? 'Present' : 'Not found'],
  ];

  return (
    <article className="metadata-card">
      <div className="result-card-heading"><span>तस्वीर के विवरण / IMAGE METADATA</span><span>02</span></div>
      <div className={`metadata-status ${statusInfo.className}`}><span>{statusInfo.icon}</span><div><small>EXIF REVIEW · {statusInfo.hindi}</small><strong>{status}</strong></div></div>
      <p className="metadata-reason">{reason}</p>
      <div className="metadata-rows">{rows.map(([label, value]) => <div className="metadata-row" key={label}><span>{label}</span><b>{value}</b></div>)}</div>
      <p className="metadata-footnote">Metadata एक सहायक clue है। इसका न होना अपने आप में fake होने का प्रमाण नहीं।</p>
    </article>
  );
}
