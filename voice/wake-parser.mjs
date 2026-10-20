/**
 * Safe, dependency-free wake-word parser for Jay AI.
 * This module does not access the microphone or customer data.
 * The app must import it explicitly; merely adding this file does not change production.
 */
export function normaliseSpeech(input) {
  return String(input ?? '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseWakeCommand(transcript, assistantName = 'Jay AI') {
  const utterance = normaliseSpeech(transcript);
  const name = normaliseSpeech(assistantName) || 'jay ai';
  // Keep "Jay" as a convenience alias only for the default assistant name.
  // For renamed assistants, require the actual chosen name.
  const aliases = name === 'jay ai' ? ['jay ai', 'jay'] : [name];
  const padded = ' ' + utterance + ' ';
  for (const alias of aliases) {
    const offset = padded.indexOf(' ' + alias + ' ');
    if (offset !== -1) {
      return { activated: true, command: utterance.slice(offset + alias.length).trim(), matchedName: alias };
    }
  }
  return { activated: false, command: '', matchedName: null };
}
