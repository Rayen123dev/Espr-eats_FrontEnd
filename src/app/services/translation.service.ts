// translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private apiUrl = 'https://api.mymemory.translated.net/get';

  constructor(private http: HttpClient) {}

  async translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text) return text;
    
    const params = {
      q: text,
      langpair: `${sourceLang}|${targetLang}`,
      de: 'your-email@example.com' // Required but not validated
    };

    try {
      const response = await this.http.get<any>(this.apiUrl, { params }).toPromise();
      if (response.responseStatus === 200) {
        return response.responseData.translatedText;
      }
      throw new Error(response.responseDetails || 'Translation failed');
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on failure
    }
  }

  detectLanguage(text: string): Promise<string> {
    // Simple language detection (for common languages)
    return Promise.resolve(this.guessLanguage(text));
  }

  private guessLanguage(text: string): string {
    // Basic language detection - expand as needed
    const commonLanguages = [
      { code: 'en', regex: /[a-z]/i },
      { code: 'es', regex: /[áéíóúñ]/i },
      { code: 'fr', regex: /[àâçéèêëîïôûùüÿœæ]/i },
      { code: 'de', regex: /[äöüß]/i }
    ];

    for (const lang of commonLanguages) {
      if (lang.regex.test(text)) {
        return lang.code;
      }
    }
    return 'en'; // Default to English
  }

  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ar', name: 'Arabic' }
    ];
  }
}