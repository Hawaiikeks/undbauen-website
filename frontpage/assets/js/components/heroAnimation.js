// Hero Animation mit rotierenden architektonischen Wörtern
export const heroAnimation = {
  words: [
    'Planen',
    'Entwerfen',
    'Digitalisieren',
    'Vernetzen',
    'Innovieren',
    'Gestalten',
    'Transformieren',
    'Konzipieren',
    'Optimieren',
    'Revolutionieren'
  ],
  currentIndex: 0,
  isAnimating: false,
  intervalId: null,
  
  init() {
    const headlineWrapper = document.querySelector('.headline-wrapper');
    if (!headlineWrapper) return;
    
    // Erstelle das erste Wort-Element
    const firstWord = document.createElement('span');
    firstWord.className = 'word word-rotating';
    firstWord.textContent = this.words[0];
    firstWord.style.opacity = '1';
    
    // Füge "und" und "bauen" hinzu - diese bleiben immer sichtbar und schweben
    const wordUnd = document.createElement('span');
    wordUnd.className = 'word word-und';
    wordUnd.textContent = 'und';
    wordUnd.style.opacity = '1';
    wordUnd.style.transition = 'transform 0.3s ease-out';
    
    const wordBauen = document.createElement('span');
    wordBauen.className = 'word word-bauen';
    wordBauen.textContent = 'bauen';
    wordBauen.style.opacity = '1';
    wordBauen.style.transition = 'transform 0.3s ease-out';
    
    // Leere den Wrapper und füge die Elemente hinzu
    headlineWrapper.innerHTML = '';
    headlineWrapper.appendChild(firstWord);
    headlineWrapper.appendChild(wordUnd);
    headlineWrapper.appendChild(wordBauen);
    
    // Starte die Rotation nach 3 Sekunden
    setTimeout(() => {
      this.startRotation();
    }, 3000);
  },
  
  startRotation() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.rotateWord();
    }, 2000); // Wechsel alle 2 Sekunden
  },
  
  rotateWord() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const rotatingWord = document.querySelector('.word-rotating');
    if (!rotatingWord) {
      this.isAnimating = false;
      return;
    }
    
    // Fade out
    rotatingWord.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    rotatingWord.style.opacity = '0';
    rotatingWord.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      // Wechsle zum nächsten Wort
      this.currentIndex = (this.currentIndex + 1) % this.words.length;
      rotatingWord.textContent = this.words[this.currentIndex];
      
      // Fade in
      rotatingWord.style.transform = 'translateY(20px)';
      setTimeout(() => {
        rotatingWord.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        rotatingWord.style.opacity = '1';
        rotatingWord.style.transform = 'translateY(0)';
        
        setTimeout(() => {
          this.isAnimating = false;
        }, 500);
      }, 50);
    }, 500);
  },
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
};

