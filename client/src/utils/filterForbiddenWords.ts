export function filterForbiddenWords(text: string, forbiddenWords: string[]): string {
  let result = text;
  forbiddenWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, '***');
  });
  return result;
}