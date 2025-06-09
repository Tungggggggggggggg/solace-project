'use client';

import { useEffect } from 'react';

export default function VisitTracker() {
  useEffect(() => {
    fetch('http://localhost:5000/api/visits', { method: 'POST' });
  }, []);

  return null;
}
