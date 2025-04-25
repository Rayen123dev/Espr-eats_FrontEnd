import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ReactionServiceService {

 /* private baseUrl = 'http://localhost:8089/forum/reaction';

  constructor(private http: HttpClient) {}

  addReaction(reaction: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/add-reaction`, reaction);
  }

removeReaction(reactionId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/delete-reaction/${reactionId}`).pipe(
    catchError(error => {
      console.error('Error removing reaction:', error);
      throw error;
    })
  );
}

updateReaction(reactionId: number, newEmojiType: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/update/${reactionId}`, { 
    emoji: newEmojiType 
  }).pipe(
    catchError(error => {
      console.error('Error updating reaction:', error);
      throw error;
    })
  );
}*/

private apiUrl = 'http://localhost:8089/forum/reaction';

constructor(private http: HttpClient) {}

// Returns Observable with basic reaction info or removal status
toggleReaction(postId: number, userId: number, emojiType: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/toggle?postId=${postId}&userId=${userId}&emojiType=${emojiType}`, {});
}

// Returns Observable with array of reaction objects
getPostReactions(postId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/by-post/${postId}`);
}

}


