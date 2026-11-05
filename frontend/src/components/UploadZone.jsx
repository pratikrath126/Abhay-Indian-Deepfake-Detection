import LoadingScanner from './LoadingScanner';

export default function UploadZone({ file, preview, isDragging, loading, onDragOver, onDragLeave, onDrop, onBrowse, onFileChange }) {
  return (
    <div
      className={`drop-zone${isDragging ? ' is-dragging' : ''}${file ? ' has-file' : ''}${loading ? ' is-loading' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onBrowse}
      role="button"
      tabIndex={0}
      aria-label={file ? `Selected image: ${file.name}. Choose another image` : 'Choose or drop a face image'}
      onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onBrowse()}
    >
      {file ? (
        <>
          <img src={preview} alt="Selected image preview" className="image-preview" />
          <div className="selected-file"><span className="file-check">✓</span><span><b>{file.name}</b><small>तस्वीर तैयार है / IMAGE READY</small></span><span className="replace-label">बदलें ↗</span></div>
        </>
      ) : (
        <>
          <div className="upload-illustration" aria-hidden="true"><span className="upload-sun" /><span className="upload-frame"><span>↑</span></span><span className="upload-spark">✳</span></div>
          <strong className="drop-title">तस्वीर यहां छोड़ें</strong>
          <span className="drop-subtitle">Drop a face image here, or <b>browse files</b></span>
          <span className="drop-small">एक साफ़, सामने से ली गई तस्वीर से बेहतर परिणाम मिल सकते हैं</span>
        </>
      )}
      {loading && <div className="loading-wrap"><LoadingScanner /></div>}
      <input type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden-input" id="fileInput" onClick={(event) => event.stopPropagation()} onChange={onFileChange} />
    </div>
  );
}
