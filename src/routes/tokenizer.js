import express from 'express';
import { FunctionalTokenizer } from '../tokenizer.js';

const router = express.Router();

// Initialize tokenizer instance
const tokenizer = new FunctionalTokenizer();

// POST /api/learn - Learn vocabulary from text
router.post('/learn', async (req, res) => {
  try {
    const { text, minFrequency = 1 } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    const vocabSize = tokenizer.learnFromText(text, minFrequency);
    
    res.json({
      success: true,
      vocabSize,
      message: `Learned ${vocabSize} tokens from text`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/encode - Encode text to tokens
router.post('/encode', async (req, res) => {
  try {
    const { text, addSpecialTokens = true, useSubword = false, useTiktoken = false } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    const tokens = useSubword ? 
      tokenizer.encodeSubword(text, addSpecialTokens) : 
      tokenizer.encode(text, addSpecialTokens, useTiktoken);

    const decoded = tokenizer.decode(tokens, !addSpecialTokens, useTiktoken);
    
    res.json({
      success: true,
      tokens,
      decoded,
      tokenCount: tokens.length,
      method: useTiktoken ? 'tiktoken' : useSubword ? 'subword' : 'word-level'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/decode - Decode tokens to text
router.post('/decode', async (req, res) => {
  try {
    const { tokens, removeSpecialTokens = true, useTiktoken = false } = req.body;
    
    if (!tokens || !Array.isArray(tokens)) {
      return res.status(400).json({ error: 'Tokens array is required' });
    }

    const decoded = tokenizer.decode(tokens, removeSpecialTokens, useTiktoken);
    
    res.json({
      success: true,
      decoded,
      tokenCount: tokens.length,
      method: useTiktoken ? 'tiktoken' : 'custom'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/vocabulary - Get vocabulary statistics
router.get('/vocabulary', async (req, res) => {
  try {
    const vocabData = tokenizer.getVocabulary();
    
    res.json({
      success: true,
      ...vocabData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/add-special-token - Add custom special token
router.post('/add-special-token', async (req, res) => {
  try {
    const { token, id } = req.body;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required and must be a string' });
    }

    const tokenId = tokenizer.addSpecialToken(token, id);
    
    res.json({
      success: true,
      token,
      id: tokenId,
      message: `Added special token: ${token}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/save - Save vocabulary to JSON
router.post('/save', async (req, res) => {
  try {
    const data = tokenizer.save();
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/load - Load vocabulary from JSON
router.post('/load', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    tokenizer.load(data);
    
    res.json({
      success: true,
      message: 'Tokenizer loaded successfully',
      vocabSize: tokenizer.getVocabulary().vocabSize
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reset - Reset vocabulary to initial state
router.post('/reset', async (req, res) => {
  try {
    tokenizer.reset();
    
    res.json({
      success: true,
      message: 'Tokenizer reset successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
