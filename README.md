# Advanced Tokenizer with Tiktoken

A powerful, modern tokenizer built in JavaScript using ES modules, functional programming principles, and tiktoken integration. Features a beautiful web interface with multiple tokenization methods and comprehensive comparison tools.

## Features

### 🧠 **Vocabulary Learning**
- Learn vocabulary from any text input
- Configurable minimum frequency threshold
- Automatic word frequency counting
- Case-insensitive processing

### 🔄 **Encoding & Decoding**
- **Encode**: Convert text to token IDs using multiple methods
- **Decode**: Convert token IDs back to text
- **Tiktoken Integration**: Use OpenAI's tiktoken for GPT-3.5 compatible tokenization
- **Word-level Tokenization**: Traditional word-based approach
- **Subword Tokenization**: Advanced subword splitting for unknown words
- Support for special tokens (BOS, EOS, PAD, UNK, SEP)
- Configurable special token handling

### ⭐ **Special Tokens**
- Built-in special tokens: `<PAD>`, `<UNK>`, `<BOS>`, `<EOS>`, `<SEP>`
- Add custom special tokens with optional ID assignment
- Visual distinction between regular and special tokens

### 💾 **Vocabulary Management**
- Save vocabulary to JSON file
- Load vocabulary from JSON file
- Reset vocabulary to initial state
- Real-time vocabulary statistics

### 🎨 **Modern Web Interface**
- Beautiful, responsive design with gradient backgrounds
- Real-time token visualization with color-coded tokens
- Interactive vocabulary display with special token highlighting
- Loading states and animations
- Error handling and user feedback
- **Method Comparison**: Side-by-side comparison of different tokenization approaches

## Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd Tokenizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Learning Vocabulary

1. **Enter training text** in the "Learn Vocabulary" section
2. **Set minimum frequency** (default: 1)
3. **Click "Learn Vocabulary"** to build the tokenizer's vocabulary

Example training text:
```
The quick brown fox jumps over the lazy dog. This is a sample text for training the tokenizer. The tokenizer will learn new words and build its vocabulary.
```

### Encoding Text

1. **Enter text to encode** in the "Encode Text" section
2. **Choose options**:
   - ✅ Add Special Tokens (adds BOS/EOS tokens)
   - ✅ Use Subword Tokenization (breaks unknown words into subwords)
3. **Click "Encode"** to convert text to tokens

### Decoding Tokens

1. **Enter token IDs** (comma-separated) in the "Decode Tokens" section
2. **Choose options**:
   - ✅ Remove Special Tokens (filters out special tokens from output)
3. **Click "Decode"** to convert tokens back to text

### Managing Special Tokens

1. **Enter new special token** (e.g., `<MASK>`, `<CLS>`)
2. **Optionally specify token ID** (auto-assigned if left empty)
3. **Click "Add Special Token"** to add it to the vocabulary

### Vocabulary Management

- **Save Vocabulary**: Downloads current vocabulary as JSON file
- **Load Vocabulary**: Upload previously saved vocabulary file
- **Reset**: Clears all learned vocabulary (keeps built-in special tokens)

## API Endpoints

The tokenizer provides a REST API for programmatic access:

### Learning
```http
POST /api/learn
Content-Type: application/json

{
  "text": "Training text here",
  "minFrequency": 1
}
```

### Encoding
```http
POST /api/encode
Content-Type: application/json

{
  "text": "Text to encode",
  "addSpecialTokens": true,
  "useSubword": false,
  "useTiktoken": false
}
```

### Decoding
```http
POST /api/decode
Content-Type: application/json

{
  "tokens": [2, 15, 8, 3],
  "removeSpecialTokens": true,
  "useTiktoken": false
}
```

### Vocabulary
```http
GET /api/vocabulary
```

### Special Tokens
```http
POST /api/add-special-token
Content-Type: application/json

{
  "token": "<MASK>",
  "id": 10
}
```

### Save/Load
```http
POST /api/save
POST /api/load
POST /api/reset
```

## Technical Details

### Tokenizer Algorithm

The tokenizer uses a simple but effective approach:

1. **Text Preprocessing**: Lowercase conversion, punctuation removal, whitespace normalization
2. **Word Tokenization**: Split text into words by whitespace
3. **Frequency Counting**: Count word occurrences in training data
4. **Vocabulary Building**: Add words that meet minimum frequency threshold
5. **Encoding**: Map words to token IDs, use `<UNK>` for unknown words
6. **Subword Support**: Break unknown words into character n-grams

### Special Tokens

- `<PAD>` (ID: 0): Padding token for batch processing
- `<UNK>` (ID: 1): Unknown word token
- `<BOS>` (ID: 2): Beginning of sequence
- `<EOS>` (ID: 3): End of sequence
- `<SEP>` (ID: 4): Separator token

### File Structure

```
Tokenizer/
├── src/
│   ├── tokenizer.js     # Core tokenizer with functional programming
│   └── routes/
│       └── tokenizer.js # Express router for API endpoints
├── server.js            # Express server with ES modules
├── package.json         # Dependencies and scripts
├── README.md           # This file
└── public/             # Web interface files
    ├── index.html      # Main HTML page
    ├── styles.css      # CSS styling
    └── script.js       # Frontend JavaScript
```

## Examples

### Basic Usage

```javascript
import { FunctionalTokenizer } from './src/tokenizer.js';

// Create tokenizer
const tokenizer = new FunctionalTokenizer();

// Learn from text
tokenizer.learnFromText("The quick brown fox jumps over the lazy dog");

// Encode text (word-level)
const tokens = tokenizer.encode("The quick brown fox");
console.log(tokens); // [2, 15, 8, 3] (with special tokens)

// Encode with tiktoken
const tiktokenTokens = tokenizer.encode("The quick brown fox", true, true);
console.log(tiktokenTokens); // GPT-3.5 compatible tokens

// Decode tokens
const text = tokenizer.decode(tokens);
console.log(text); // "the quick brown fox"
```

### Advanced Usage

```javascript
// Add custom special token
tokenizer.addSpecialToken('<MASK>', 10);

// Use subword tokenization
const subwordTokens = tokenizer.encodeSubword("unknownword");

// Use tiktoken for GPT-3.5 compatibility
const tiktokenTokens = tokenizer.encode("Hello world", true, true);

// Save/load vocabulary
const savedData = tokenizer.save();
tokenizer.load(savedData);

// Compare different methods
const wordTokens = tokenizer.encode("test", false, false);
const subwordTokens = tokenizer.encodeSubword("test", false);
const tiktokenTokens = tokenizer.encode("test", false, true);
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Running in Development Mode
```bash
npm run dev
```

### Dependencies
- **Express**: Web server framework
- **CORS**: Cross-origin resource sharing
- **Nodemon**: Development server with auto-reload

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- Built with modern web technologies
- Inspired by popular NLP tokenizers like BERT and GPT
- Designed for educational and practical use
