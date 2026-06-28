// app.js - Core Logic for Japanese 9-Key Flick Typing Practice
import { KANA_ROWS, COMMON_WORDS, COMMON_PHRASES } from './vocabulary.js';

// --- State Variables ---
let currentMode = 'row'; // 'row' | 'built-in' | 'custom'
let selectedRows = ['あ行']; // Rows selected for Fifty-sound practice
let selectedCategory = 'ALL'; // Vocabulary category ('ALL', 'N5', 'N4', 'N3', 'Phrases')
let customWordList = []; // Array of user-inputted kana phrases
let testSessionWords = []; // Words chosen for the current 10-word round
let currentWordIndex = 0; // 0 to 9
let currentWord = null; // Current target word object: { kanji, kana, english }
let inputBuffer = ''; // Typed characters for the current word
let isKatakana = false; // Toggle Kana mode (Hiragana vs Katakana)

// --- Stats & Timing ---
let sessionStartTime = null;
let sessionTimerInterval = null;
let totalKeystrokes = 0;
let correctKeystrokes = 0;
let errorKeystrokes = 0;
let sessionActive = false;

// --- Key Error Tracking (Persisted in localStorage) ---
let errorStats = JSON.parse(localStorage.getItem('flick_typer_errors')) || {};

// --- DOM Elements ---
const statusTimeEl = document.getElementById('statusTime');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const resultsPanel = document.getElementById('resultsPanel');
const restartBtn = document.getElementById('restartBtn');
const resultSettingsBtn = document.getElementById('resultSettingsBtn');
const resetStatsBtn = document.getElementById('resetStatsBtn');

const hudCpmEl = document.getElementById('hudCpm');
const hudAccuracyEl = document.getElementById('hudAccuracy');
const hudProgressEl = document.getElementById('hudProgress');
const sessionProgressBar = document.getElementById('sessionProgressBar');

const currentModeTag = document.getElementById('currentModeTag');
const targetReadingEl = document.getElementById('targetReading');
const targetWordEl = document.getElementById('targetWord');
const wordMeaningEl = document.getElementById('wordMeaning');
const inputGhostEl = document.getElementById('inputGhost');
const inputActiveEl = document.getElementById('inputActive');

const flickKeyboard = document.getElementById('flickKeyboard');
const flickOverlay = document.getElementById('flickOverlay');
const flickCenter = document.getElementById('flickCenter');
const flickLeft = document.getElementById('flickLeft');
const flickUp = document.getElementById('flickUp');
const flickRight = document.getElementById('flickRight');
const flickDown = document.getElementById('flickDown');

const modifierKeyBtn = document.getElementById('modifierKey');
const backspaceKeyBtn = document.getElementById('backspaceKey');
const spaceBtn = document.getElementById('spaceBtn');
const confirmBtn = document.getElementById('confirmBtn');
const kanaSwitchBtn = document.getElementById('kanaSwitchBtn');

const hintToggle = document.getElementById('hintToggle');

// --- Keyboard Flick Mappings (Hiragana / Katakana) ---
const KEY_MAPPINGS = {
  // Hiragana
  hiragana: {
    1: { center: "あ", left: "い", up: "う", right: "え", down: "お" },
    2: { center: "か", left: "き", up: "く", right: "け", down: "こ" },
    3: { center: "さ", left: "し", up: "す", right: "せ", down: "そ" },
    4: { center: "た", left: "ち", up: "つ", right: "て", down: "と" },
    5: { center: "な", left: "に", up: "ぬ", right: "ね", down: "の" },
    6: { center: "は", left: "ひ", up: "ふ", right: "へ", down: "ほ" },
    7: { center: "ま", left: "み", up: "む", right: "め", down: "も" },
    8: { center: "や", left: "ゃ", up: "ゆ", right: "ょ", down: "よ" }, // Left=ゃ, Right=ょ, Up=ゆ, Down=よ
    9: { center: "ら", left: "り", up: "る", right: "れ", down: "ろ" },
    11: { center: "わ", left: "を", up: "ん", right: "ー", down: "" }
  },
  // Katakana
  katakana: {
    1: { center: "ア", left: "イ", up: "ウ", right: "エ", down: "オ" },
    2: { center: "カ", left: "キ", up: "ク", right: "ケ", down: "コ" },
    3: { center: "サ", left: "シ", up: "ス", right: "セ", down: "ソ" },
    4: { center: "タ", left: "チ", up: "ツ", right: "テ", down: "ト" },
    5: { center: "ナ", left: "ニ", up: "ヌ", right: "ネ", down: "ノ" },
    6: { center: "ハ", left: "ヒ", up: "フ", right: "ヘ", down: "ホ" },
    7: { center: "マ", left: "ミ", up: "ム", right: "メ", down: "モ" },
    8: { center: "ヤ", left: "ャ", up: "ユ", right: "ョ", down: "ヨ" },
    9: { center: "ラ", left: "リ", up: "ル", right: "レ", down: "ロ" },
    11: { center: "ワ", left: "ヲ", up: "ン", right: "ー", down: "" }
  }
};

// --- Character Voiced/Voiceless/Small Modifiers Lookup ---
const MODIFIER_MAP = {
  // Hiragana
  "あ": "ぁ", "ぁ": "あ",
  "い": "ぃ", "ぃ": "い",
  "う": "ぅ", "ぅ": "ゔ", "ゔ": "う",
  "え": "ぇ", "ぇ": "え",
  "お": "ぉ", "ぉ": "お",
  "か": "加", // Dummy
  "か": "が", "が": "か",
  "き": "ぎ", "ぎ": "き",
  "く": "ぐ", "ぐ": "く",
  "け": "げ", "げ": "け",
  "こ": "ご", "ご": "こ",
  "さ": "ざ", "ざ": "さ",
  "し": "じ", "じ": "し",
  "す": "ず", "ず": "す",
  "せ": "ぜ", "ぜ": "せ",
  "そ": "ぞ", "ぞ": "そ",
  "た": "だ", "だ": "た",
  "ち": "ぢ", "ぢ": "ち",
  "つ": "づ", "づ": "っ", "っ": "つ",
  "て": "で", "で": "て",
  "と": "ど", "ど": "と",
  "は": "ば", "ば": "ぱ", "ぱ": "は",
  "ひ": "び", "び": "ぴ", "ぴ": "ひ",
  "ふ": "ぶ", "ぶ": "ぷ", "ぷ": "ふ",
  "へ": "べ", "べ": "ぺ", "ぺ": "へ",
  "ほ": "ぼ", "ぼ": "ぽ", "ぽ": "ほ",
  "や": "ゃ", "ゃ": "や",
  "ゆ": "ゅ", "ゅ": "ゆ",
  "よ": "ょ", "ょ": "よ",
  "わ": "ゎ", "ゎ": "わ",

  // Katakana
  "ア": "ァ", "ァ": "ア",
  "イ": "ィ", "ィ": "イ",
  "ウ": "ゥ", "ゥ": "ヴ", "ヴ": "ウ",
  "エ": "ェ", "ェ": "エ",
  "オ": "ォ", "ォ": "オ",
  "カ": "ガ", "ガ": "カ",
  "キ": "ギ", "ギ": "キ",
  "ク": "グ", "グ": "ク",
  "ケ": "ゲ", "ゲ": "ケ",
  "コ": "ゴ", "ゴ": "コ",
  "サ": "ザ", "ザ": "サ",
  "シ": "ジ", "ジ": "シ",
  "ス": "ズ", "ズ": "ス",
  "セ": "ゼ", "ゼ": "セ",
  "ソ": "ゾ", "ゾ": "ソ",
  "タ": "ダ", "ダ": "タ",
  "チ": "ヂ", "ヂ": "チ",
  "ツ": "ヅ", "ヅ": "ッ", "ッ": "ツ",
  "テ": "デ", "デ": "テ",
  "ト": "ド", "ド": "ト",
  "ハ": "バ", "バ": "パ", "パ": "ハ",
  "ヒ": "ビ", "ビ": "ピ", "ピ": "ヒ",
  "フ": "ブ", "ブ": "プ", "プ": "フ",
  "ヘ": "ベ", "ベ": "ペ", "ペ": "ヘ",
  "ホ": "ボ", "ボ": "ポ", "ポ": "ホ",
  "ヤ": "ャ", "ャ": "ヤ",
  "ユ": "ュ", "ュ": "ユ",
  "ヨ": "ョ", "ョ": "ヨ",
  "ワ": "ヮ", "ヮ": "ワ"
};

// --- Clock Simulator ---
function updateStatusTime() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  statusTimeEl.textContent = `${hours}:${minutes}`;
}
setInterval(updateStatusTime, 60000);
updateStatusTime();

// --- Theme Switcher ---
const savedTheme = localStorage.getItem('flick_typer_theme');
if (savedTheme === 'light') {
  document.body.classList.remove('dark-theme');
  document.body.classList.add('light-theme');
}

themeToggleBtn.addEventListener('click', () => {
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.replace('dark-theme', 'light-theme');
    localStorage.setItem('flick_typer_theme', 'light');
  } else {
    document.body.classList.replace('light-theme', 'dark-theme');
    localStorage.setItem('flick_typer_theme', 'dark');
  }
});

// --- Dynamic Settings UI Generation ---
function initSettingsUI() {
  // Generate row selection checkboxes for fifty-sound row practice
  const rowGrid = document.getElementById('kanaRowCheckboxes');
  rowGrid.innerHTML = '';
  
  const rows = Object.keys(KANA_ROWS.hiragana);
  rows.forEach(row => {
    const label = document.createElement('label');
    label.className = 'row-check-label';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = row;
    input.checked = selectedRows.includes(row);
    
    label.appendChild(input);
    label.appendChild(document.createTextNode(row.replace('行', '')));
    rowGrid.appendChild(label);
    
    input.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!selectedRows.includes(row)) selectedRows.push(row);
      } else {
        selectedRows = selectedRows.filter(r => r !== row);
        // Ensure at least one is selected
        if (selectedRows.length === 0) {
          selectedRows = [row];
          e.target.checked = true;
        }
      }
    });
  });

  // Settings Mode button switches
  const modeBtns = document.querySelectorAll('.mode-select-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      
      // Toggle visibility of sub-settings sections
      document.getElementById('rowSettingsSection').classList.add('hidden');
      document.getElementById('builtinSettingsSection').classList.add('hidden');
      document.getElementById('customSettingsSection').classList.add('hidden');
      
      if (currentMode === 'row') {
        document.getElementById('rowSettingsSection').classList.remove('hidden');
      } else if (currentMode === 'built-in') {
        document.getElementById('builtinSettingsSection').classList.remove('hidden');
      } else if (currentMode === 'custom') {
        document.getElementById('customSettingsSection').classList.remove('hidden');
      }
    });
  });

  // Category select buttons for built-in list
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.category;
    });
  });

  // Settings Panel actions
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('show');
    pauseTimer();
  });
  
  closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('show');
    startNewRound();
  });

  // Custom vocabulary save
  const saveCustomBtn = document.getElementById('saveCustomBtn');
  const customInput = document.getElementById('customVocabularyInput');
  
  // Load saved custom text if exists
  customInput.value = localStorage.getItem('flick_typer_custom_text') || '';
  
  saveCustomBtn.addEventListener('click', () => {
    const text = customInput.value.trim();
    if (!text) {
      alert('請輸入一些日文字元！');
      return;
    }
    // Simple filter: split by spaces/lines, filter out non-kana characters if possible, or just keep words
    // We split by standard whitespace and filter out empty items
    customWordList = text.split(/[\s,，、。.]+/).filter(word => word.length > 0);
    localStorage.setItem('flick_typer_custom_text', text);
    
    settingsPanel.classList.remove('show');
    startNewRound();
  });

  // Reset local stats
  resetStatsBtn.addEventListener('click', () => {
    if (confirm('確定要清除所有打字錯誤紀錄嗎？這將重設熱力圖。')) {
      errorStats = {};
      localStorage.removeItem('flick_typer_errors');
      alert('統計資料已清除！');
    }
  });
}

// --- Flick Interaction Core Engine ---
let activeKeyIndex = null;
let touchStartX = 0;
let touchStartY = 0;
const FLICK_THRESHOLD = 26; // Drag distance threshold in pixels
let selectedDirection = 'center'; // 'center' | 'left' | 'up' | 'right' | 'down'

function setupKeyboardInteraction() {
  const keys = document.querySelectorAll('.flick-keyboard .keyboard-key');
  
  keys.forEach(key => {
    const keyIndex = parseInt(key.dataset.keyIndex);
    // Bind both mouse and touch events
    key.addEventListener('mousedown', (e) => handleDragStart(e, keyIndex, e.clientX, e.clientY));
    key.addEventListener('touchstart', (e) => {
      // Prevent browser default gesture zoom/scrolling
      e.preventDefault();
      const touch = e.touches[0];
      handleDragStart(e, keyIndex, touch.clientX, touch.clientY);
    }, { passive: false });
  });

  // Global move and release handlers
  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('touchmove', (e) => {
    if (activeKeyIndex !== null) {
      const touch = e.touches[0];
      handleDragMove(touch);
    }
  }, { passive: false });

  window.addEventListener('mouseup', handleDragEnd);
  window.addEventListener('touchend', (e) => {
    if (activeKeyIndex !== null) {
      handleDragEnd();
    }
  });

  // Connect bottom control bar actions
  modifierKeyBtn.addEventListener('click', applyCharacterModifier);
  backspaceKeyBtn.addEventListener('click', handleBackspace);
  spaceBtn.addEventListener('click', handleSpace);
  confirmBtn.addEventListener('click', handleConfirm);
  kanaSwitchBtn.addEventListener('click', toggleKanaSwitch);
}

function handleDragStart(e, keyIndex, clientX, clientY) {
  // If functional key, do not activate flick overlay
  if (keyIndex === 10 || keyIndex === 12) {
    activeKeyIndex = keyIndex;
    selectedDirection = 'center';
    const activeKey = document.querySelector(`.keyboard-key[data-key-index="${keyIndex}"]`);
    activeKey.classList.add('active-press');
    return;
  }

  activeKeyIndex = keyIndex;
  touchStartX = clientX;
  touchStartY = clientY;
  selectedDirection = 'center';

  const activeKey = document.querySelector(`.keyboard-key[data-key-index="${keyIndex}"]`);
  activeKey.classList.add('active-press');

  // Trigger visual flick overlay
  showFlickOverlay(activeKey, keyIndex);
}

function showFlickOverlay(keyElement, keyIndex) {
  const rect = keyElement.getBoundingClientRect();
  const phoneRect = document.querySelector('.phone-screen').getBoundingClientRect();
  
  // Calculate relative coordinates to place overlay centered on top of key
  const left = rect.left - phoneRect.left + rect.width / 2;
  const top = rect.top - phoneRect.top + rect.height / 2;
  
  flickOverlay.style.left = `${left}px`;
  flickOverlay.style.top = `${top}px`;
  flickOverlay.style.display = 'block';

  // Load correct layout characters
  const layout = isKatakana ? KEY_MAPPINGS.katakana : KEY_MAPPINGS.hiragana;
  const mapping = layout[keyIndex];

  // Map text to nodes
  flickCenter.textContent = mapping.center || '';
  flickLeft.textContent = mapping.left || '';
  flickUp.textContent = mapping.up || '';
  flickRight.textContent = mapping.right || '';
  flickDown.textContent = mapping.down || '';

  // Reset directional states
  document.querySelectorAll('.flick-arrow, .flick-circle').forEach(el => el.classList.remove('active-dir'));
  flickCenter.classList.add('active-dir');
}

function handleDragMove(e) {
  if (activeKeyIndex === null || activeKeyIndex === 10 || activeKeyIndex === 12) return;

  const clientX = e.clientX;
  const clientY = e.clientY;

  const dx = clientX - touchStartX;
  const dy = clientY - touchStartY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  document.querySelectorAll('.flick-arrow, .flick-circle').forEach(el => el.classList.remove('active-dir'));

  if (dist > FLICK_THRESHOLD) {
    // Determine 4-way quadrant direction
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && flickLeft.textContent) {
        selectedDirection = 'left';
        flickLeft.classList.add('active-dir');
      } else if (dx > 0 && flickRight.textContent) {
        selectedDirection = 'right';
        flickRight.classList.add('active-dir');
      } else {
        selectedDirection = 'center';
        flickCenter.classList.add('active-dir');
      }
    } else {
      if (dy < 0 && flickUp.textContent) {
        selectedDirection = 'up';
        flickUp.classList.add('active-dir');
      } else if (dy > 0 && flickDown.textContent) {
        selectedDirection = 'down';
        flickDown.classList.add('active-dir');
      } else {
        selectedDirection = 'center';
        flickCenter.classList.add('active-dir');
      }
    }
  } else {
    selectedDirection = 'center';
    flickCenter.classList.add('active-dir');
  }
}

function handleDragEnd() {
  if (activeKeyIndex === null) return;

  const keyIndex = activeKeyIndex;
  
  // Clean styling states
  const activeKey = document.querySelector(`.keyboard-key[data-key-index="${keyIndex}"]`);
  if (activeKey) activeKey.classList.remove('active-press');

  flickOverlay.style.display = 'none';
  activeKeyIndex = null;

  // Key action execution
  if (keyIndex === 10) {
    applyCharacterModifier();
  } else if (keyIndex === 12) {
    handleBackspace();
  } else {
    const layout = isKatakana ? KEY_MAPPINGS.katakana : KEY_MAPPINGS.hiragana;
    const mapping = layout[keyIndex];
    const char = mapping[selectedDirection];
    
    if (char) {
      inputChar(char, keyIndex);
    }
  }
}

// --- Dynamic Kana Switch (Hiragana / Katakana) ---
function toggleKanaSwitch() {
  isKatakana = !isKatakana;
  kanaSwitchBtn.textContent = isKatakana ? 'カナ' : 'かな';
  
  // Dynamically update base keyboard layout labels
  const layout = isKatakana ? KEY_MAPPINGS.katakana : KEY_MAPPINGS.hiragana;
  
  for (let i = 1; i <= 11; i++) {
    if (i === 10) continue; // Modifier key
    const key = document.querySelector(`.keyboard-key[data-key-index="${i}"]`);
    if (!key) continue;
    
    const mapping = layout[i];
    key.querySelector('.center').textContent = mapping.center || '';
    key.querySelector('.left-label').textContent = mapping.left || '';
    key.querySelector('.up-label').textContent = mapping.up || '';
    key.querySelector('.right-label').textContent = mapping.right || '';
    if (key.querySelector('.down-label')) {
      key.querySelector('.down-label').textContent = mapping.down || '';
    }
  }
  
  // Update visual visualizer highlights
  renderVisualHints();
}

// --- Typing Input Processing & Game Rules ---

function inputChar(char, keyIndex) {
  if (!sessionActive) startSessionTimer();

  totalKeystrokes++;
  const targetReading = currentWord.kana;
  const currentPos = inputBuffer.length;
  const targetChar = targetReading[currentPos];

  // Determine correctness using transition base checking
  const isCorrect = isInputValid(char, targetChar);
  
  if (isCorrect) {
    inputBuffer += char;
    correctKeystrokes++;
    updateInputDisplay();
    
    // Auto advance if input matches target reading exactly
    if (inputBuffer === targetReading) {
      setTimeout(advanceWord, 180);
    } else {
      renderVisualHints();
    }
  } else {
    errorKeystrokes++;
    recordKeyError(keyIndex);
    
    // Animate error flash on target card
    const card = document.querySelector('.word-card');
    card.classList.add('error-shake');
    setTimeout(() => card.classList.remove('error-shake'), 300);

    // Provide temporary visual input failure display
    const tempBuffer = inputBuffer + `<span class="char-incorrect">${char}</span>`;
    inputActiveEl.innerHTML = tempBuffer;
  }
  
  updateHUDStats();
}

function isInputValid(typedChar, targetChar) {
  if (!targetChar) return false;
  if (typedChar === targetChar) return true;
  
  // Voiced/voiceless prefix checks: Is the typed character a valid transition base for target character?
  // e.g. target is "が", but typed is "か", which is a valid transient base state (awaiting modifier)
  const bases = getBaseCharacters(targetChar);
  return bases.includes(typedChar);
}

function getBaseCharacters(char) {
  const bases = [char];
  // Trace modifiers table backwards to find parent characters
  for (const [base, mod] of Object.entries(MODIFIER_MAP)) {
    if (mod === char) {
      bases.push(base);
      for (const [innerBase, innerMod] of Object.entries(MODIFIER_MAP)) {
        if (innerMod === base && !bases.includes(innerBase)) {
          bases.push(innerBase);
        }
      }
    }
  }
  return bases;
}

function applyCharacterModifier() {
  if (inputBuffer.length === 0) return;
  
  const lastChar = inputBuffer[inputBuffer.length - 1];
  const modifiedChar = MODIFIER_MAP[lastChar];
  
  // Every press of the modifier key counts as a keystroke
  totalKeystrokes++;
  
  if (modifiedChar) {
    // Validate if the modified transition matches target character at this position
    const targetReading = currentWord.kana;
    const currentPos = inputBuffer.length - 1;
    const targetChar = targetReading[currentPos];
    
    if (isInputValid(modifiedChar, targetChar)) {
      // Replace last character
      inputBuffer = inputBuffer.slice(0, -1) + modifiedChar;
      correctKeystrokes++;
      
      updateInputDisplay();
      
      if (inputBuffer === targetReading) {
        setTimeout(advanceWord, 180);
      } else {
        renderVisualHints();
      }
    } else {
      // Modification is invalid for target character
      errorKeystrokes++;
      recordKeyError(10); // Modifier key index
      
      // Trigger card shake animation
      const card = document.getElementById('wordCard');
      if (card) {
        card.classList.add('error-shake');
        setTimeout(() => card.classList.remove('error-shake'), 300);
      }
      
      // Provide temporary visual input failure display
      const tempBuffer = inputBuffer.slice(0, -1) + `<span class="char-incorrect">${lastChar}</span>`;
      inputActiveEl.innerHTML = tempBuffer;
    }
  } else {
    // Modifier pressed on non-modifiable character counts as minor input error
    errorKeystrokes++;
    recordKeyError(10); // Modifier key index
    
    // Trigger card shake animation
    const card = document.getElementById('wordCard');
    if (card) {
      card.classList.add('error-shake');
      setTimeout(() => card.classList.remove('error-shake'), 300);
    }
  }
  
  updateHUDStats();
}

function handleBackspace() {
  if (inputBuffer.length > 0) {
    inputBuffer = inputBuffer.slice(0, -1);
    updateInputDisplay();
    renderVisualHints();
  }
}

function handleSpace() {
  // Can be mapped to skip current word or trigger manual confirmation if needed
  if (inputBuffer === currentWord.kana) {
    advanceWord();
  } else {
    // Clear buffer as utility
    inputBuffer = '';
    updateInputDisplay();
    renderVisualHints();
  }
}

function handleConfirm() {
  if (inputBuffer === currentWord.kana) {
    advanceWord();
  } else {
    // Visual flash showing mismatch
    const card = document.querySelector('.word-card');
    card.classList.add('error-shake');
    setTimeout(() => card.classList.remove('error-shake'), 300);
  }
}

function updateInputDisplay() {
  let displayHtml = '';
  const targetReading = currentWord.kana;
  
  for (let i = 0; i < inputBuffer.length; i++) {
    const char = inputBuffer[i];
    const targetChar = targetReading[i];
    
    if (char === targetChar) {
      displayHtml += `<span class="char-correct">${char}</span>`;
    } else if (i === inputBuffer.length - 1 && getBaseCharacters(targetChar).includes(char)) {
      displayHtml += `<span class="char-pending">${char}</span>`;
    } else {
      displayHtml += `<span class="char-incorrect">${char}</span>`;
    }
  }
  
  inputActiveEl.innerHTML = displayHtml;
}

// --- Key Visual Hints Rendering ---
function renderVisualHints() {
  // Clean all previous hints
  document.querySelectorAll('.keyboard-key').forEach(key => {
    key.classList.remove('hint-key', 'hint-left', 'hint-up', 'hint-right', 'hint-down');
  });

  if (!hintToggle.checked) return;

  const targetReading = currentWord.kana;
  if (inputBuffer === targetReading) return;

  let currentPos = inputBuffer.length;
  let nextChar = null;
  let isWaitingForModifier = false;

  if (currentPos >= targetReading.length) {
    // Input is the same length but doesn't match target, which means the last character needs modification
    currentPos = targetReading.length - 1;
    nextChar = targetReading[currentPos];
    isWaitingForModifier = true;
  } else {
    nextChar = targetReading[currentPos];
    
    // Check if the character before currentPos needs modification
    const lastPos = currentPos - 1;
    const lastTyped = lastPos >= 0 ? inputBuffer[lastPos] : null;
    const lastTarget = lastPos >= 0 ? targetReading[lastPos] : null;
    
    if (lastTyped && lastTarget && lastTyped !== lastTarget && getBaseCharacters(lastTarget).includes(lastTyped)) {
      isWaitingForModifier = true;
    }
  }
  
  // Find which key and direction nextChar belongs to
  let foundKeyIndex = null;
  let foundDirection = null;
  
  // Check standard mappings
  const layout = isKatakana ? KEY_MAPPINGS.katakana : KEY_MAPPINGS.hiragana;
  
  for (const [keyIdx, mapping] of Object.entries(layout)) {
    for (const [dir, char] of Object.entries(mapping)) {
      if (char === nextChar) {
        foundKeyIndex = parseInt(keyIdx);
        foundDirection = dir;
        break;
      }
    }
    if (foundKeyIndex) break;
  }
  
  // If not found in standard map, it might be a modified character (e.g. が, ぱ, っ)
  if (!foundKeyIndex) {
    const bases = getBaseCharacters(nextChar);
    // Find the base character in the mapping
    for (const base of bases) {
      for (const [keyIdx, mapping] of Object.entries(layout)) {
        for (const [dir, char] of Object.entries(mapping)) {
          if (char === base) {
            foundKeyIndex = parseInt(keyIdx);
            foundDirection = dir;
            break;
          }
        }
        if (foundKeyIndex) break;
      }
      if (foundKeyIndex) break;
    }
  }

  // If we found the key & direction, show indicators
  if (foundKeyIndex) {
    if (isWaitingForModifier) {
      // Highlight modifier key
      modifierKeyBtn.classList.add('hint-key');
    } else {
      // Highlight base key
      const keyElement = document.querySelector(`.keyboard-key[data-key-index="${foundKeyIndex}"]`);
      if (keyElement) {
        keyElement.classList.add('hint-key');
        if (foundDirection !== 'center') {
          keyElement.classList.add(`hint-${foundDirection}`);
        }
      }
    }
  }
}

// --- Session & Round Management ---

function startNewRound() {
  currentIndexReset();
  generateTestWordList();
  loadCurrentWord();
  resetHUDStats();
  stopTimer();
}

function currentIndexReset() {
  currentWordIndex = 0;
  testSessionWords = [];
  inputBuffer = '';
}

function generateTestWordList() {
  if (currentMode === 'row') {
    // Generate 10 random characters selected from KANA_ROWS
    const rowSource = isKatakana ? KANA_ROWS.katakana : KANA_ROWS.hiragana;
    let pool = [];
    selectedRows.forEach(row => {
      if (rowSource[row]) pool = pool.concat(rowSource[row]);
    });
    
    if (pool.length === 0) pool = ['あ', 'い', 'う', 'え', 'お']; // Fallback
    
    for (let i = 0; i < 10; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      const char = pool[idx];
      testSessionWords.push({
        kanji: char,
        kana: char,
        english: '單音字元練習'
      });
    }
    
    currentModeTag.textContent = `五十音模式 (${selectedRows.map(r => r.replace('行', '')).join(',')})`;
  } 
  else if (currentMode === 'built-in') {
    // Filter words/phrases by category
    let pool = [];
    if (selectedCategory === 'ALL') {
      pool = COMMON_WORDS.concat(COMMON_PHRASES);
    } else if (selectedCategory === 'Phrases') {
      pool = COMMON_PHRASES;
    } else {
      pool = COMMON_WORDS.filter(w => w.level === selectedCategory);
    }
    
    // Shuffle pool and select 10
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    testSessionWords = shuffled.slice(0, 10);
    
    currentModeTag.textContent = `精選詞庫 (${selectedCategory})`;
  } 
  else if (currentMode === 'custom') {
    if (customWordList.length === 0) {
      // Fallback if empty
      customWordList = ['わたし', 'にほんご', 'がっこう', 'べんきょう'];
    }
    
    // Choose 10 items randomly from custom list (allowing repeats if list < 10)
    for (let i = 0; i < 10; i++) {
      const idx = Math.floor(Math.random() * customWordList.length);
      const word = customWordList[idx];
      testSessionWords.push({
        kanji: word,
        kana: word,
        english: '自訂詞庫練習'
      });
    }
    currentModeTag.textContent = '自訂詞庫模式';
  }
}

function loadCurrentWord() {
  currentWord = testSessionWords[currentWordIndex];
  inputBuffer = '';
  
  targetReadingEl.textContent = currentWord.kana;
  targetWordEl.textContent = currentWord.kanji;
  wordMeaningEl.textContent = currentWord.english || '';
  
  inputGhostEl.textContent = currentWord.kana;
  inputActiveEl.innerHTML = '';
  
  hudProgressEl.textContent = `${currentWordIndex + 1}/10`;
  sessionProgressBar.style.width = `${(currentWordIndex / 10) * 100}%`;
  
  renderVisualHints();
}

function advanceWord() {
  currentWordIndex++;
  if (currentWordIndex < 10) {
    loadCurrentWord();
  } else {
    completeSession();
  }
}

// --- Stats Recording & Timing ---

function startSessionTimer() {
  sessionActive = true;
  sessionStartTime = Date.now();
  sessionTimerInterval = setInterval(updateHUDStats, 500);
}

function pauseTimer() {
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
  }
}

function stopTimer() {
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
  }
  sessionActive = false;
  sessionStartTime = null;
}

function getElapsedTime() {
  if (!sessionStartTime) return 0;
  return (Date.now() - sessionStartTime) / 1000;
}

function updateHUDStats() {
  const time = getElapsedTime();
  const cpm = calculateCPM(time);
  const accuracy = calculateAccuracy();

  hudCpmEl.textContent = cpm;
  hudAccuracyEl.textContent = `${accuracy}%`;
}

function resetHUDStats() {
  hudCpmEl.textContent = '0';
  hudAccuracyEl.textContent = '100%';
  hudProgressEl.textContent = '1/10';
  sessionProgressBar.style.width = '0%';
  totalKeystrokes = 0;
  correctKeystrokes = 0;
  errorKeystrokes = 0;
}

function calculateCPM(seconds) {
  if (seconds < 0.5 || correctKeystrokes === 0) return 0;
  const minutes = seconds / 60;
  return Math.round(correctKeystrokes / minutes);
}

function calculateAccuracy() {
  if (totalKeystrokes === 0) return 100;
  return Math.round((correctKeystrokes / totalKeystrokes) * 100);
}

function recordKeyError(keyIndex) {
  errorStats[keyIndex] = (errorStats[keyIndex] || 0) + 1;
  localStorage.setItem('flick_typer_errors', JSON.stringify(errorStats));
}

// --- Session End & Heatmap Generation ---

function completeSession() {
  const finalTime = getElapsedTime().toFixed(1);
  stopTimer();
  
  const finalCpm = calculateCPM(parseFloat(finalTime));
  const finalAccuracy = calculateAccuracy();

  // Populate results modal
  document.getElementById('resultCpm').textContent = finalCpm;
  document.getElementById('resultAccuracy').textContent = `${finalAccuracy}%`;
  document.getElementById('resultTime').textContent = `${finalTime}s`;

  // Draw Heatmap Keyboard
  renderHeatmapKeyboard();

  resultsPanel.classList.add('show');
}

function renderHeatmapKeyboard() {
  const container = document.getElementById('heatmapKeyboard');
  container.innerHTML = '';

  // Get max error count to calculate intensity levels
  const counts = Object.values(errorStats);
  const maxErrors = counts.length > 0 ? Math.max(...counts) : 0;

  // We mirror the 12 keys Gboard structure
  const layout = isKatakana ? KEY_MAPPINGS.katakana : KEY_MAPPINGS.hiragana;
  
  for (let i = 1; i <= 12; i++) {
    const keyEl = document.createElement('div');
    keyEl.className = 'keyboard-key';
    
    // Assign labels
    let label = '';
    if (i === 10) label = '小';
    else if (i === 12) label = '⌫';
    else label = layout[i] ? layout[i].center : '';

    keyEl.innerHTML = `<span class="key-label center">${label}</span>`;

    // Apply error intensity classes
    const errors = errorStats[i] || 0;
    let heatLevel = 0;
    
    if (errors > 0 && maxErrors > 0) {
      heatLevel = Math.ceil((errors / maxErrors) * 5); // 1 to 5 scale
    }
    
    keyEl.classList.add(`heatmap-level-${heatLevel}`);
    container.appendChild(keyEl);
  }
}

// --- App Initialization Bindings ---
document.addEventListener('DOMContentLoaded', () => {
  initSettingsUI();
  setupKeyboardInteraction();
  startNewRound();
  
  // Results panel options triggers
  restartBtn.addEventListener('click', () => {
    resultsPanel.classList.remove('show');
    startNewRound();
  });

  resultSettingsBtn.addEventListener('click', () => {
    resultsPanel.classList.remove('show');
    settingsPanel.classList.add('show');
  });

  // Settings hint toggle updates hints
  hintToggle.addEventListener('change', renderVisualHints);

  // Register Service Worker for PWA offline capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('Service Worker registered:', reg.scope))
        .catch(err => console.error('Service Worker registration failed:', err));
    });
  }
});

