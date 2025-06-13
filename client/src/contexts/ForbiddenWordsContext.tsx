'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const ForbiddenWordsContext = createContext<string[]>([]);

type ForbiddenWord = { id: string; word: string; added_at?: string };

export const ForbiddenWordsProvider = ({ children }: { children: React.ReactNode }) => {
  const [words, setWords] = useState<string[]>([]);
  useEffect(() => {
    const fetchWords = async () => {
      const res = await fetch('/api/forbidden_words');
      const data = await res.json();
      if (data.success) setWords((data.forbiddenWords as ForbiddenWord[]).map(w => w.word.toLowerCase()));
    };
    fetchWords();
  }, []);
  return (
    <ForbiddenWordsContext.Provider value={words}>
      {children}
    </ForbiddenWordsContext.Provider>
  );
};

export const useForbiddenWords = () => useContext(ForbiddenWordsContext);