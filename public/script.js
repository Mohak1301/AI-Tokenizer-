// API base URL - use relative paths for same-origin requests
const API_BASE = '';

// DOM elements
const elements = {
    // Learning section
    trainingText: document.getElementById('trainingText'),
    minFrequency: document.getElementById('minFrequency'),
    learnBtn: document.getElementById('learnBtn'),
    learningResult: document.getElementById('learningResult'),
    
    // Encoding section
    encodeText: document.getElementById('encodeText'),
    addSpecialTokens: document.getElementById('addSpecialTokens'),
    useSubword: document.getElementById('useSubword'),
    useTiktoken: document.getElementById('useTiktoken'),
    encodeBtn: document.getElementById('encodeBtn'),
    encodeResult: document.getElementById('encodeResult'),
    
    // Decoding section
    decodeTokens: document.getElementById('decodeTokens'),
    removeSpecialTokens: document.getElementById('removeSpecialTokens'),
    useTiktokenDecode: document.getElementById('useTiktokenDecode'),
    decodeBtn: document.getElementById('decodeBtn'),
    decodeResult: document.getElementById('decodeResult'),
    
    // Special tokens section
    newSpecialToken: document.getElementById('newSpecialToken'),
    specialTokenId: document.getElementById('specialTokenId'),
    addSpecialTokenBtn: document.getElementById('addSpecialTokenBtn'),
    specialTokensResult: document.getElementById('specialTokensResult'),
    
    // Vocabulary section
    loadVocabBtn: document.getElementById('loadVocabBtn'),
    saveVocabBtn: document.getElementById('saveVocabBtn'),
    resetVocabBtn: document.getElementById('resetVocabBtn'),
    vocabSize: document.getElementById('vocabSize'),
    specialTokensCount: document.getElementById('specialTokensCount'),
    vocabularyDisplay: document.getElementById('vocabularyDisplay'),
    
    // Comparison section
    compareText: document.getElementById('compareText'),
    compareBtn: document.getElementById('compareBtn'),
    comparisonResult: document.getElementById('comparisonResult'),
    
    // Modal
    fileModal: document.getElementById('fileModal'),
    fileInput: document.getElementById('fileInput'),
    loadFileBtn: document.getElementById('loadFileBtn'),
    closeModal: document.querySelector('.close')
};

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Learning
    elements.learnBtn.addEventListener('click', handleLearn);
    
    // Encoding
    elements.encodeBtn.addEventListener('click', handleEncode);
    
    // Decoding
    elements.decodeBtn.addEventListener('click', handleDecode);
    
    // Special tokens
    elements.addSpecialTokenBtn.addEventListener('click', handleAddSpecialToken);
    
    // Vocabulary management
    elements.loadVocabBtn.addEventListener('click', showFileModal);
    elements.saveVocabBtn.addEventListener('click', handleSaveVocabulary);
    elements.resetVocabBtn.addEventListener('click', handleResetVocabulary);
    elements.loadFileBtn.addEventListener('click', handleLoadFile);
    elements.closeModal.addEventListener('click', hideFileModal);
    
    // Comparison
    elements.compareBtn.addEventListener('click', handleCompare);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === elements.fileModal) {
            hideFileModal();
        }
    });
    
    // Load initial vocabulary stats
    loadVocabularyStats();
});

// API functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Learning functionality
async function handleLearn() {
    const text = elements.trainingText.value.trim();
    const minFreq = parseInt(elements.minFrequency.value) || 1;
    
    if (!text) {
        showResult(elements.learningResult, 'Please enter training text', 'error');
        return;
    }
    
    // Clear previous results
    elements.learningResult.classList.remove('show');
    
    setButtonLoading(elements.learnBtn, true);
    
    try {
        const result = await apiCall('/api/learn', 'POST', {
            text,
            minFrequency: minFreq
        });
        
        showResult(elements.learningResult, 
            `Successfully learned vocabulary! New vocabulary size: ${result.vocabSize}`, 
            'success'
        );
        
        // Update vocabulary stats
        await loadVocabularyStats();
        
    } catch (error) {
        showResult(elements.learningResult, `Error: ${error.message}`, 'error');
    } finally {
        setButtonLoading(elements.learnBtn, false);
    }
}

// Encoding functionality
async function handleEncode() {
    const text = elements.encodeText.value.trim();
    const addSpecialTokens = elements.addSpecialTokens.checked;
    const useSubword = elements.useSubword.checked;
    const useTiktoken = elements.useTiktoken.checked;
    
    if (!text) {
        showResult(elements.encodeResult, 'Please enter text to encode', 'error');
        return;
    }
    
    // Clear previous results
    elements.encodeResult.classList.remove('show');
    
    setButtonLoading(elements.encodeBtn, true);
    
    try {
        const result = await apiCall('/api/encode', 'POST', {
            text,
            addSpecialTokens,
            useSubword,
            useTiktoken
        });
        
        const tokenVisualization = createTokenVisualization(result.tokens);
        const resultHtml = `
            <div>
                <p><strong>Method:</strong> ${result.method}</p>
                <p><strong>Token Count:</strong> ${result.tokenCount}</p>
                <p><strong>Decoded Text:</strong> ${result.decoded}</p>
                <p><strong>Tokens:</strong></p>
                <div class="token-list">${tokenVisualization}</div>
            </div>
        `;
        
        showResult(elements.encodeResult, resultHtml, 'success');
        
    } catch (error) {
        showResult(elements.encodeResult, `Error: ${error.message}`, 'error');
    } finally {
        setButtonLoading(elements.encodeBtn, false);
    }
}

// Decoding functionality
async function handleDecode() {
    const tokensText = elements.decodeTokens.value.trim();
    const removeSpecialTokens = elements.removeSpecialTokens.checked;
    const useTiktoken = elements.useTiktokenDecode.checked;
    
    if (!tokensText) {
        showResult(elements.decodeResult, 'Please enter tokens to decode', 'error');
        return;
    }
    
    // Parse tokens
    const tokens = tokensText.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t));
    
    if (tokens.length === 0) {
        showResult(elements.decodeResult, 'Please enter valid token IDs', 'error');
        return;
    }
    
    // Clear previous results
    elements.decodeResult.classList.remove('show');
    
    setButtonLoading(elements.decodeBtn, true);
    
    try {
        const result = await apiCall('/api/decode', 'POST', {
            tokens,
            removeSpecialTokens,
            useTiktoken
        });
        
        const resultHtml = `
            <div>
                <p><strong>Method:</strong> ${result.method}</p>
                <p><strong>Decoded Text:</strong> ${result.decoded}</p>
                <p><strong>Token Count:</strong> ${result.tokenCount}</p>
            </div>
        `;
        
        showResult(elements.decodeResult, resultHtml, 'success');
        
    } catch (error) {
        showResult(elements.decodeResult, `Error: ${error.message}`, 'error');
    } finally {
        setButtonLoading(elements.decodeBtn, false);
    }
}

// Special tokens functionality
async function handleAddSpecialToken() {
    const token = elements.newSpecialToken.value.trim();
    const id = elements.specialTokenId.value.trim();
    
    if (!token) {
        showResult(elements.specialTokensResult, 'Please enter a special token', 'error');
        return;
    }
    
    setButtonLoading(elements.addSpecialTokenBtn, true);
    
    try {
        const data = { token };
        if (id) {
            data.id = parseInt(id);
        }
        
        const result = await apiCall('/api/add-special-token', 'POST', data);
        
        showResult(elements.specialTokensResult, 
            `Successfully added special token: ${result.token} (ID: ${result.id})`, 
            'success'
        );
        
        // Clear inputs
        elements.newSpecialToken.value = '';
        elements.specialTokenId.value = '';
        
        // Update vocabulary stats
        await loadVocabularyStats();
        
    } catch (error) {
        showResult(elements.specialTokensResult, `Error: ${error.message}`, 'error');
    } finally {
        setButtonLoading(elements.addSpecialTokenBtn, false);
    }
}

// Vocabulary management
async function loadVocabularyStats() {
    try {
        const result = await apiCall('/api/vocabulary');
        
        elements.vocabSize.textContent = result.vocabSize;
        elements.specialTokensCount.textContent = Object.keys(result.specialTokens).length;
        
        // Update vocabulary display
        updateVocabularyDisplay(result.vocabulary, result.specialTokens);
        
    } catch (error) {
        console.error('Failed to load vocabulary stats:', error);
    }
}

function updateVocabularyDisplay(vocabulary, specialTokens) {
    const vocabArray = Object.entries(vocabulary).sort((a, b) => a[1] - b[1]);
    
    const vocabHtml = vocabArray.map(([token, id]) => {
        const isSpecial = specialTokens.hasOwnProperty(token);
        const className = isSpecial ? 'vocab-item special-token' : 'vocab-item';
        
        return `
            <div class="${className}">
                <span class="vocab-token">${escapeHtml(token)}</span>
                <span class="vocab-id">${id}</span>
            </div>
        `;
    }).join('');
    
    elements.vocabularyDisplay.innerHTML = vocabHtml || '<p>No vocabulary items yet. Start by learning from some text!</p>';
}

async function handleSaveVocabulary() {
    try {
        const result = await apiCall('/api/save', 'POST');
        
        // Create and download file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'tokenizer-vocabulary.json';
        link.click();
        
        showResult(elements.specialTokensResult, 'Vocabulary saved successfully!', 'success');
        
    } catch (error) {
        showResult(elements.specialTokensResult, `Error saving vocabulary: ${error.message}`, 'error');
    }
}

async function handleResetVocabulary() {
    if (!confirm('Are you sure you want to reset the vocabulary? This action cannot be undone.')) {
        return;
    }
    
    try {
        await apiCall('/api/reset', 'POST');
        
        showResult(elements.specialTokensResult, 'Vocabulary reset successfully!', 'success');
        await loadVocabularyStats();
        
    } catch (error) {
        showResult(elements.specialTokensResult, `Error resetting vocabulary: ${error.message}`, 'error');
    }
}

// File modal functionality
function showFileModal() {
    elements.fileModal.style.display = 'block';
}

function hideFileModal() {
    elements.fileModal.style.display = 'none';
    elements.fileInput.value = '';
}

async function handleLoadFile() {
    const file = elements.fileInput.files[0];
    
    if (!file) {
        alert('Please select a file');
        return;
    }
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        await apiCall('/api/load', 'POST', { data });
        
        showResult(elements.specialTokensResult, 'Vocabulary loaded successfully!', 'success');
        await loadVocabularyStats();
        hideFileModal();
        
    } catch (error) {
        alert(`Error loading file: ${error.message}`);
    }
}

// Utility functions
function showResult(element, message, type = 'success') {
    // Add close button for success messages
    const closeButton = type === 'success' ? 
        '<button class="close-result" onclick="this.parentElement.classList.remove(\'show\')" title="Close">×</button>' : '';
    
    element.innerHTML = `
        <div class="result-content">
            ${message}
        </div>
        ${closeButton}
    `;
    element.className = `result-box show ${type}`;
    
    // Only auto-hide error messages after 8 seconds
    if (type === 'error') {
        setTimeout(() => {
            element.classList.remove('show');
        }, 8000);
    }
    // Success messages will stay visible until user manually closes them
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.innerHTML = '<div class="loading"></div> Loading...';
    } else {
        button.disabled = false;
        // Restore original button content based on button type
        const buttonId = button.id;
        if (buttonId === 'learnBtn') {
            button.innerHTML = '<i class="fas fa-brain"></i> Learn Vocabulary';
        } else if (buttonId === 'encodeBtn') {
            button.innerHTML = '<i class="fas fa-encode"></i> Encode';
        } else if (buttonId === 'decodeBtn') {
            button.innerHTML = '<i class="fas fa-decode"></i> Decode';
        } else if (buttonId === 'addSpecialTokenBtn') {
            button.innerHTML = '<i class="fas fa-plus"></i> Add Special Token';
        } else if (buttonId === 'compareBtn') {
            button.innerHTML = '<i class="fas fa-chart-bar"></i> Compare Methods';
        } else if (buttonId === 'addSpecialTokenBtn') {
            button.innerHTML = '<i class="fas fa-plus"></i> Add Special Token';
        }
    }
}

function createTokenVisualization(tokens) {
    return tokens.map(tokenId => {
        // Determine token type for styling
        let className = 'token-item';
        let icon = '';
        
        if (tokenId <= 4) { // Special tokens
            className += ' special';
            icon = '<i class="fas fa-star"></i>';
        } else if (tokenId === 1) { // UNK token
            className += ' unknown';
            icon = '<i class="fas fa-question"></i>';
        }
        
        return `<span class="${className}">${icon}${tokenId}</span>`;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Comparison functionality
async function handleCompare() {
    const text = elements.compareText.value.trim();
    
    if (!text) {
        showResult(elements.comparisonResult, 'Please enter text to compare', 'error');
        return;
    }
    
    // Clear previous results
    elements.comparisonResult.classList.remove('show');
    
    setButtonLoading(elements.compareBtn, true);
    
    try {
        // Test different methods
        const methods = [
            { name: 'Word-level', useSubword: false, useTiktoken: false },
            { name: 'Subword', useSubword: true, useTiktoken: false },
            { name: 'Tiktoken', useSubword: false, useTiktoken: true }
        ];
        
        const results = [];
        
        for (const method of methods) {
            try {
                const result = await apiCall('/api/encode', 'POST', {
                    text,
                    addSpecialTokens: false,
                    useSubword: method.useSubword,
                    useTiktoken: method.useTiktoken
                });
                
                results.push({
                    method: method.name,
                    tokenCount: result.tokenCount,
                    tokens: result.tokens.slice(0, 10), // Show first 10 tokens
                    success: true
                });
            } catch (error) {
                results.push({
                    method: method.name,
                    error: error.message,
                    success: false
                });
            }
        }
        
        const comparisonHtml = `
            <div>
                <h4>Tokenization Method Comparison</h4>
                <div class="comparison-grid">
                    ${results.map(result => `
                        <div class="comparison-item ${result.success ? 'success' : 'error'}">
                            <h5>${result.method}</h5>
                            ${result.success ? `
                                <p><strong>Token Count:</strong> ${result.tokenCount}</p>
                                <p><strong>Sample Tokens:</strong> [${result.tokens.join(', ')}]</p>
                            ` : `
                                <p><strong>Error:</strong> ${result.error}</p>
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        showResult(elements.comparisonResult, comparisonHtml, 'success');
        
    } catch (error) {
        showResult(elements.comparisonResult, `Error: ${error.message}`, 'error');
    } finally {
        setButtonLoading(elements.compareBtn, false);
    }
}

// Add some sample text for demonstration
window.addEventListener('load', function() {
    // Add sample training text
    if (!elements.trainingText.value) {
        elements.trainingText.value = `The quick brown fox jumps over the lazy dog. This is a sample text for training the tokenizer. The tokenizer will learn new words and build its vocabulary. Natural language processing is an exciting field of artificial intelligence. Machine learning models often use tokenization as a preprocessing step.`;
    }
    
    // Add sample encode text
    if (!elements.encodeText.value) {
        elements.encodeText.value = 'The quick brown fox jumps over the lazy dog';
    }
    
    // Add sample comparison text
    if (!elements.compareText.value) {
        elements.compareText.value = 'The quick brown fox jumps over the lazy dog. This is a test sentence for comparing different tokenization methods.';
    }
});
