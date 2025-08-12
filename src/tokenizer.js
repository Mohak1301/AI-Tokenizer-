import { encoding_for_model } from 'tiktoken';

// Pure functions for text processing
export const cleanText = (text) => 
  text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const splitIntoWords = (text) => 
  text.split(/\s+/).filter(word => word.length > 0);

export const countWordFrequencies = (words) => 
  words.reduce((acc, word) => {
    acc.set(word, (acc.get(word) || 0) + 1);
    return acc;
  }, new Map());

// Special tokens configuration
export const SPECIAL_TOKENS = {
  PAD: '<PAD>',
  UNK: '<UNK>',
  BOS: '<BOS>',
  EOS: '<EOS>',
  SEP: '<SEP>'
};

export const SPECIAL_TOKEN_IDS = {
  [SPECIAL_TOKENS.PAD]: 0,
  [SPECIAL_TOKENS.UNK]: 1,
  [SPECIAL_TOKENS.BOS]: 2,
  [SPECIAL_TOKENS.EOS]: 3,
  [SPECIAL_TOKENS.SEP]: 4
};

// Vocabulary management functions
export const createVocabulary = () => new Map(Object.entries(SPECIAL_TOKEN_IDS));

export const addWordToVocabulary = (vocab, word, id) => {
  const newVocab = new Map(vocab);
  newVocab.set(word, id);
  return newVocab;
};

export const buildReverseVocabulary = (vocab) => {
  const reverse = new Map();
  for (const [token, id] of vocab) {
    reverse.set(id, token);
  }
  return reverse;
};

// Learning functions
export const learnFromText = (vocab, text, minFrequency = 1) => {
  const cleanedText = cleanText(text);
  const words = splitIntoWords(cleanedText);
  const wordCounts = countWordFrequencies(words);
  
  let newVocab = new Map(vocab);
  let nextId = Math.max(...Array.from(newVocab.values())) + 1;
  
  for (const [word, count] of wordCounts) {
    if (count >= minFrequency && !newVocab.has(word)) {
      newVocab.set(word, nextId++);
    }
  }
  
  return {
    vocabulary: newVocab,
    reverseVocabulary: buildReverseVocabulary(newVocab),
    vocabSize: newVocab.size
  };
};

// Encoding functions
export const encodeText = (vocab, reverseVocab, text, addSpecialTokens = true) => {
  const tokens = [];
  
  if (addSpecialTokens) {
    tokens.push(SPECIAL_TOKEN_IDS[SPECIAL_TOKENS.BOS]);
  }
  
  const cleanedText = cleanText(text);
  const words = splitIntoWords(cleanedText);
  
  for (const word of words) {
    const tokenId = vocab.get(word);
    if (tokenId !== undefined) {
      tokens.push(tokenId);
    } else {
      tokens.push(SPECIAL_TOKEN_IDS[SPECIAL_TOKENS.UNK]);
    }
  }
  
  if (addSpecialTokens) {
    tokens.push(SPECIAL_TOKEN_IDS[SPECIAL_TOKENS.EOS]);
  }
  
  return tokens;
};

// Decoding functions
export const decodeTokens = (reverseVocab, tokens, removeSpecialTokens = true) => {
  const words = [];
  
  for (const tokenId of tokens) {
    const token = reverseVocab.get(tokenId);
    if (token !== undefined) {
      if (removeSpecialTokens && Object.values(SPECIAL_TOKENS).includes(token)) {
        continue;
      }
      words.push(token);
    }
  }
  
  return words.join(' ');
};

// Tiktoken integration
export const createTiktokenEncoder = (model = 'gpt-3.5-turbo') => {
  try {
    return encoding_for_model(model);
  } catch (error) {
    console.warn(`Failed to load tiktoken for model ${model}, falling back to custom tokenizer`);
    return null;
  }
};

export const encodeWithTiktoken = (encoder, text) => {
  if (!encoder) return null;
  try {
    return Array.from(encoder.encode(text));
  } catch (error) {
    console.error('Tiktoken encoding failed:', error);
    return null;
  }
};

export const decodeWithTiktoken = (encoder, tokens) => {
  if (!encoder) return null;
  try {
    return encoder.decode(tokens);
  } catch (error) {
    console.error('Tiktoken decoding failed:', error);
    return null;
  }
};

// Subword tokenization functions
export const breakIntoSubwords = (word, vocab, maxLength = 8) => {
  const subwords = [];
  
  for (let len = Math.min(word.length, maxLength); len >= 1; len--) {
    for (let i = 0; i <= word.length - len; i++) {
      const subword = word.substring(i, i + len);
      if (vocab.has(subword)) {
        subwords.push(subword);
        i += len - 1;
      }
    }
  }
  
  return subwords.length > 0 ? subwords : word.split('');
};

export const encodeSubword = (vocab, reverseVocab, text, addSpecialTokens = true) => {
  const tokens = [];
  
  if (addSpecialTokens) {
    tokens.push(SPECIAL_TOKEN_IDS[SPECIAL_TOKENS.BOS]);
  }
  
  const words = splitIntoWords(cleanText(text));
  
  for (const word of words) {
    if (word.length === 0) continue;
    
    let tokenId = vocab.get(word);
    if (tokenId !== undefined) {
      tokens.push(tokenId);
      continue;
    }
    
    const subwords = breakIntoSubwords(word, vocab);
    for (const subword of subwords) {
      tokenId = vocab.get(subword);
      if (tokenId !== undefined) {
        tokens.push(tokenId);
      } else {
        tokens.push(SPECIAL_TOKEN_IDS[SPECIAL_TOKENS.UNK]);
      }
    }
  }
  
  if (addSpecialTokens) {
    tokens.push(SPECIAL_TOKEN_IDS[SPECIAL_TOKENS.EOS]);
  }
  
  return tokens;
};

// Special token management
export const addSpecialToken = (vocab, token, id = null) => {
  const newVocab = new Map(vocab);
  const tokenId = id ?? Math.max(...Array.from(newVocab.values())) + 1;
  newVocab.set(token, tokenId);
  
  return {
    vocabulary: newVocab,
    reverseVocabulary: buildReverseVocabulary(newVocab),
    tokenId
  };
};

// Serialization functions
export const serializeVocabulary = (vocab) => ({
  vocab: Object.fromEntries(vocab),
  specialTokens: Object.fromEntries(
    Object.entries(SPECIAL_TOKEN_IDS).filter(([token]) => vocab.has(token))
  ),
  nextTokenId: Math.max(...Array.from(vocab.values())) + 1
});

export const deserializeVocabulary = (data) => {
  const vocab = new Map(Object.entries(data.vocab));
  return {
    vocabulary: vocab,
    reverseVocabulary: buildReverseVocabulary(vocab)
  };
};

// Utility functions
export const getVocabularyStats = (vocab) => ({
  vocabSize: vocab.size,
  specialTokensCount: Object.keys(SPECIAL_TOKENS).length,
  vocabulary: Object.fromEntries(vocab),
  specialTokens: SPECIAL_TOKEN_IDS
});

export const resetVocabulary = () => ({
  vocabulary: createVocabulary(),
  reverseVocabulary: buildReverseVocabulary(createVocabulary())
});

// Main tokenizer class using functional composition
export class FunctionalTokenizer {
  constructor() {
    this.state = resetVocabulary();
    this.tiktokenEncoder = createTiktokenEncoder();
  }
  
  learnFromText(text, minFrequency = 1) {
    const result = learnFromText(this.state.vocabulary, text, minFrequency);
    this.state = {
      vocabulary: result.vocabulary,
      reverseVocabulary: result.reverseVocabulary
    };
    return result.vocabSize;
  }
  
  encode(text, addSpecialTokens = true, useTiktoken = false) {
    if (useTiktoken && this.tiktokenEncoder) {
      const tiktokenTokens = encodeWithTiktoken(this.tiktokenEncoder, text);
      if (tiktokenTokens) return tiktokenTokens;
    }
    
    return encodeText(this.state.vocabulary, this.state.reverseVocabulary, text, addSpecialTokens);
  }
  
  decode(tokens, removeSpecialTokens = true, useTiktoken = false) {
    if (useTiktoken && this.tiktokenEncoder) {
      const tiktokenText = decodeWithTiktoken(this.tiktokenEncoder, tokens);
      if (tiktokenText) return tiktokenText;
    }
    
    return decodeTokens(this.state.reverseVocabulary, tokens, removeSpecialTokens);
  }
  
  encodeSubword(text, addSpecialTokens = true) {
    return encodeSubword(this.state.vocabulary, this.state.reverseVocabulary, text, addSpecialTokens);
  }
  
  addSpecialToken(token, id = null) {
    const result = addSpecialToken(this.state.vocabulary, token, id);
    this.state = {
      vocabulary: result.vocabulary,
      reverseVocabulary: result.reverseVocabulary
    };
    return result.tokenId;
  }
  
  getVocabulary() {
    return getVocabularyStats(this.state.vocabulary);
  }
  
  save() {
    return serializeVocabulary(this.state.vocabulary);
  }
  
  load(data) {
    const result = deserializeVocabulary(data);
    this.state = result;
  }
  
  reset() {
    this.state = resetVocabulary();
  }
}
