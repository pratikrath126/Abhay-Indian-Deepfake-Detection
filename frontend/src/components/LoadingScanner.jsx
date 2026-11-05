import { useEffect, useState } from 'react';

export default function LoadingScanner() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const timer = setInterval(() => setDots((previous) => (previous.length >= 3 ? '' : `${previous}.`)), 350);
    return () => clearInterval(timer);
  }, []);
  return <div className="loading-label">तस्वीर पढ़ी जा रही है / READING IMAGE{dots}</div>;
}
