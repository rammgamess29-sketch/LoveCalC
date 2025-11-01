// Configuration
const GOOGLE_SHEETS_URL = ' https://script.google.com/macros/s/AKfycbyEs5ygL1mnPSzCmsc_emwHQV-Vg_qL7c9CjFbifymaH_kbA3CwDKLB1SYQVZ9mFPSUXg/exec '; // Replace with your actual URL

// DOM Elements
let firstName, secondName, calculateBtn, loadingSection, resultSection;
let percentageNumber, displayName1, displayName2, loveMessage, emojiReaction;
let progressCircle;

// Store calculated results for consistency
const calculationCache = new Map();

// Initialize DOM elements when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get all DOM elements
    firstName = document.getElementById('firstName');
    secondName = document.getElementById('secondName');
    calculateBtn = document.getElementById('calculateBtn');
    loadingSection = document.getElementById('loadingSection');
    resultSection = document.getElementById('resultSection');
    percentageNumber = document.getElementById('percentageNumber');
    displayName1 = document.getElementById('displayName1');
    displayName2 = document.getElementById('displayName2');
    loveMessage = document.getElementById('loveMessage');
    emojiReaction = document.getElementById('emojiReaction');
    progressCircle = document.getElementById('progressCircle');

    // Add enter key support
    firstName.addEventListener('keypress', handleEnterKey);
    secondName.addEventListener('keypress', handleEnterKey);

    // Add SVG gradient
    addSVGGradient();
});

// Add gradient to SVG
function addSVGGradient() {
    const svg = document.querySelector('.percentage-circle svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.id = 'gradient';
    gradient.innerHTML = `
        <stop offset="0%" stop-color="#FF6B6B"/>
        <stop offset="100%" stop-color="#4ECDC4"/>
    `;
    defs.appendChild(gradient);
    svg.appendChild(defs);
}

// Handle Enter key press
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        if (event.target.id === 'firstName') {
            secondName.focus();
        } else {
            startCalculation();
        }
    }
}

// Start calculation
function startCalculation() {
    const name1 = firstName.value.trim();
    const name2 = secondName.value.trim();

    // Validation
    if (!name1 || !name2) {
        showError('Please enter both names! 💕');
        return;
    }

    if (name1.length < 2 || name2.length < 2) {
        showError('Names should be at least 2 characters long! 📝');
        return;
    }

    // Show loading
    showLoading();

    // Calculate love percentage
    setTimeout(() => {
        const percentage = calculateLovePercentage(name1, name2);
        displayResults(name1, name2, percentage);
        
        // Save to Google Sheets (if URL is configured)
        if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL !== 'YOUR_GOOGLE_SHEETS_WEB_APP_URL') {
            saveToGoogleSheets(name1, name2, percentage);
        }
    }, 2000);
}

// Calculate love percentage - DETERMINISTIC (Same input = Same output always)
function calculateLovePercentage(name1, name2) {
    // Normalize names (lowercase and remove spaces)
    const normalizedName1 = name1.toLowerCase().replace(/\s+/g, '');
    const normalizedName2 = name2.toLowerCase().replace(/\s+/g, '');
    
    // Create a unique key for this combination
    const cacheKey = `${normalizedName1}_${normalizedName2}`;
    
    // Check if we've already calculated this combination
    if (calculationCache.has(cacheKey)) {
        return calculationCache.get(cacheKey);
    }
    
    // Special combinations for fun (optional - you can remove this)
    const specialCombos = {
        'romeo_juliet': 100,
        'juliet_romeo': 100,
        'ram_sita': 100,
        'sita_ram': 100,
        'radha_krishna': 100,
        'krishna_radha': 100,
        'adam_eve': 95,
        'eve_adam': 95,
    };
    
    if (specialCombos[cacheKey]) {
        const result = specialCombos[cacheKey];
        calculationCache.set(cacheKey, result);
        return result;
    }
    
    // DETERMINISTIC CALCULATION - Will always give same result for same names
    const combined = normalizedName1 + normalizedName2;
    
    // Create a hash value from the combined names
    let hash = 0;
    let prime1 = 31;
    let prime2 = 37;
    
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = (hash * prime1 + char * prime2) & 0x7FFFFFFF; // Keep it positive
    }
    
    // Add more complexity to the hash for better distribution
    let hash2 = 0;
    for (let i = 0; i < normalizedName1.length; i++) {
        hash2 += normalizedName1.charCodeAt(i) * (i + 1);
    }
    for (let i = 0; i < normalizedName2.length; i++) {
        hash2 += normalizedName2.charCodeAt(i) * (i + 1) * 2;
    }
    
    // Combine both hashes
    const finalHash = (hash + hash2) & 0x7FFFFFFF;
    
    // Generate percentage between 40-99 (no one gets less than 40% for better UX)
    let percentage = (finalHash % 60) + 40;
    
    // Bonus points for certain patterns
    // Names with same first letter get +5
    if (normalizedName1[0] === normalizedName2[0]) {
        percentage = Math.min(percentage + 5, 99);
    }
    
    // Names with similar length get +3
    if (Math.abs(normalizedName1.length - normalizedName2.length) <= 2) {
        percentage = Math.min(percentage + 3, 99);
    }
    
    // Store in cache for consistency
    calculationCache.set(cacheKey, percentage);
    
    return percentage;
}

// Alternative simpler calculation (if you prefer more predictable results)
function calculateLovePercentageSimple(name1, name2) {
    // Normalize names
    const n1 = name1.toLowerCase().replace(/\s+/g, '');
    const n2 = name2.toLowerCase().replace(/\s+/g, '');
    
    // Create cache key
    const cacheKey = `${n1}_${n2}`;
    
    // Return cached result if exists
    if (calculationCache.has(cacheKey)) {
        return calculationCache.get(cacheKey);
    }
    
    // Simple character-based calculation
    let score = 50; // Base score
    
    // Add points for common letters
    const letters1 = new Set(n1);
    const letters2 = new Set(n2);
    let commonLetters = 0;
    
    letters1.forEach(letter => {
        if (letters2.has(letter)) {
            commonLetters++;
        }
    });
    
    score += commonLetters * 5;
    
    // Add points based on name lengths
    const lengthDiff = Math.abs(n1.length - n2.length);
    score += Math.max(0, 10 - lengthDiff);
    
    // Add points for total characters (up to 20 points)
    const totalChars = n1.length + n2.length;
    score += Math.min(totalChars, 20);
    
    // Ensure score is between 40 and 99
    score = Math.max(40, Math.min(99, score));
    
    // Cache the result
    calculationCache.set(cacheKey, score);
    
    return score;
}

// Show loading animation
function showLoading() {
    loadingSection.classList.add('active');
    resultSection.classList.remove('active');
    calculateBtn.disabled = true;
}

// Display results
function displayResults(name1, name2, percentage) {
    // Hide loading
    loadingSection.classList.remove('active');
    calculateBtn.disabled = false;
    
    // Set names
    displayName1.textContent = name1;
    displayName2.textContent = name2;
    
    // Animate percentage
    animatePercentage(percentage);
    
    // Set message and emojis
    const { message, emojis } = getMessageAndEmojis(percentage);
    loveMessage.textContent = message;
    
    // Add emojis with animation
    emojiReaction.innerHTML = '';
    emojis.forEach((emoji, index) => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.style.animationDelay = `${index * 0.1}s`;
        emojiReaction.appendChild(span);
    });
    
    // Show result section
    resultSection.classList.add('active');
}

// Animate percentage counter and circle
function animatePercentage(targetPercentage) {
    let currentPercentage = 0;
    const increment = targetPercentage / 50;
    const circumference = 2 * Math.PI * 90;
    
    const timer = setInterval(() => {
        currentPercentage += increment;
        if (currentPercentage >= targetPercentage) {
            currentPercentage = targetPercentage;
            clearInterval(timer);
        }
        
        // Update counter
        percentageNumber.textContent = Math.floor(currentPercentage);
        
        // Update circle
        const offset = circumference - (currentPercentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }, 30);
}

// Get message and emojis based on percentage
function getMessageAndEmojis(percentage) {
    if (percentage >= 90) {
        return {
            message: "Perfect Match! 🎉 You two are absolutely meant for each other! Your love is written in the stars!",
            emojis: ['💜', '💖', '💑', '💍', '✨']
        };
    } else if (percentage >= 75) {
        return {
            message: "Amazing Chemistry! 💕 You have a beautiful connection that can grow into something magical!",
            emojis: ['❤️', '💕', '🌹', '💗']
        };
    } else if (percentage >= 60) {
        return {
            message: "Good Compatibility! 💝 With love and understanding, you can build something wonderful together!",
            emojis: ['💖', '🌸', '💞']
        };
    } else if (percentage >= 45) {
        return {
            message: "Decent Match! 💗 There's potential here! Work on your connection and watch it bloom!",
            emojis: ['💓', '🌺', '⭐']
        };
    } else {
        return {
            message: "Keep Trying! 💪 Every love story is unique. With effort, anything is possible!",
            emojis: ['💙', '🌟', '🤗']
        };
    }
}

// Try again
function tryAgain() {
    // Reset form
    firstName.value = '';
    secondName.value = '';
    
    // Hide results
    resultSection.classList.remove('active');
    
    // Focus first input
    firstName.focus();
    
    // Add animation
    const card = document.querySelector('.love-card');
    card.style.animation = 'none';
    setTimeout(() => {
        card.style.animation = 'cardEntrance 0.8s ease-out';
    }, 10);
}

// Share results
function shareResults() {
    const name1 = displayName1.textContent;
    const name2 = displayName2.textContent;
    const percentage = percentageNumber.textContent;
    
    const shareText = `💕 Love Calculator Result!\n${name1} ❤️ ${name2}\nLove Compatibility: ${percentage}%\n\nTry it yourself!`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Love Calculator Result',
            text: shareText,
            url: window.location.href
        }).catch(err => {
            // User cancelled share
            console.log('Share cancelled');
        });
    } else {
        // Fallback - copy to clipboard
        copyToClipboard(shareText);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showSuccess('Result copied to clipboard! 📋');
    } catch (err) {
        showError('Failed to copy to clipboard');
    }
    
    document.body.removeChild(textarea);
}

// Save to Google Sheets
function saveToGoogleSheets(name1, name2, percentage) {
    const data = {
        timestamp: new Date().toLocaleString(),
        name1: name1,
        name2: name2,
        percentage: percentage,
        userAgent: navigator.userAgent,
        platform: navigator.platform
    };
    
    // Send data to Google Sheets
    fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(() => {
        console.log('Data saved successfully');
    }).catch(error => {
        console.error('Error saving data:', error);
    });
}

// Show error message
function showError(message) {
    createNotification(message, 'error');
}

// Show success message
function showSuccess(message) {
    createNotification(message, 'success');
}

// Create notification
function createNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style based on type
    const colors = {
        error: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
        success: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        padding: 16px 32px;
        background: ${colors[type]};
        color: white;
        border-radius: 50px;
        font-weight: 600;
        font-size: 14px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: notificationSlide 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'notificationSlide 0.5s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Add notification animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes notificationSlide {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(styleSheet);

// Prevent form submission on enter
document.addEventListener('submit', function(e) {
    e.preventDefault();
    return false;
});

// Debug function to clear cache (optional - for testing)
function clearCache() {
    calculationCache.clear();
    console.log('Calculation cache cleared');
}

// Optional: Store cache in localStorage for persistence across page reloads
function saveToLocalStorage() {
    const cacheArray = Array.from(calculationCache.entries());
    localStorage.setItem('loveCalculatorCache', JSON.stringify(cacheArray));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('loveCalculatorCache');
    if (stored) {
        const cacheArray = JSON.parse(stored);
        cacheArray.forEach(([key, value]) => {
            calculationCache.set(key, value);
        });
    }
}

// Load cache from localStorage on page load
window.addEventListener('load', loadFromLocalStorage);

// Save cache to localStorage before page unload
window.addEventListener('beforeunload', saveToLocalStorage);
