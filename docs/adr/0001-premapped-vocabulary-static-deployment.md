# ADR 0001: Pre-mapped Vocabulary for Static Deployment

## Context
The application needs to be deployed as a static website on GitHub Pages so that anyone can use it without running a server. 
To support word and sentence practice, the application needs to show Kanji (e.g. 「日本」) but check typing against Hiragana (e.g. 「にほん」). 
Converting arbitrary Japanese text containing Kanji to Hiragana (morphological analysis) requires complex dictionaries (like Mecab or Kuromoji) which are large (several megabytes) and slow down initial page loads in a client-only environment.

## Decision
We decided to pre-map the Kanji and Hiragana pairs for all built-in vocabulary directly in our source files (e.g. `{ kanji: "学校", kana: "がっこう" }`). 
For the "Custom Vocabulary" mode, we will require the user to paste text directly in Hiragana/Katakana or filter the input to only accept kana, rather than attempting client-side morphological analysis.

## Consequences
- **Pros**:
  - The page load time is extremely fast (minimal JS footprint).
  - Deploys effortlessly as a static site on GitHub Pages with zero server backend dependencies.
  - 100% accurate kana mappings for all built-in words (no morphological analyzer edge-case bugs).
- **Cons**:
  - Custom vocabulary mode cannot automatically extract readings from arbitrary Kanji sentences; users must input kana directly.
