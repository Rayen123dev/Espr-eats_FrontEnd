import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BadWordService {private bannedWords: string[] = [
  'badword1',
  'badword2',
  'profanity'
  
];

getBannedWords(): string[] {
  return [...this.bannedWords]; // Return a copy
}

addBannedWord(word: string): void {
  if (!this.bannedWords.includes(word.toLowerCase())) {
    this.bannedWords.push(word.toLowerCase());
    this.saveToLocalStorage();
  }
}

removeBannedWord(word: string): void {
  this.bannedWords = this.bannedWords.filter(w => w !== word.toLowerCase());
  this.saveToLocalStorage();
}

private saveToLocalStorage(): void {
  localStorage.setItem('bannedWords', JSON.stringify(this.bannedWords));
}

private loadFromLocalStorage(): void {
  const saved = localStorage.getItem('bannedWords');
  if (saved) {
    this.bannedWords = JSON.parse(saved);
  }
}

constructor() {
  this.loadFromLocalStorage();
}
}

