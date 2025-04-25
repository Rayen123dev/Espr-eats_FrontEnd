import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError as rxjsThrowError, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post } from '../core/models/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private baseUrl = 'http://localhost:8081/post'; // Backend URL

  private postsUpdated = new Subject<void>();

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/get-all-posts`);
  }

  addPost(postData: any, file?: File, token?: string): Observable<Post> {
    const formData = new FormData();
    formData.append('post', JSON.stringify(postData));
    
    if (file) {
      formData.append('file', file, file.name);
    }
  
    // Set the authorization header if token is provided
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  
    return this.http.post<Post>(`${this.baseUrl}/add-post`, formData, { headers }).pipe(
      catchError(error => {
        console.error('Full error:', error);
        
        let errorMessage = 'Failed to add post';
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.statusText) {
          errorMessage += ` (${error.statusText})`;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updatePost(postId: number, postData: any, file?: File): Observable<Post> {
    const formData = new FormData();
    
    // Stringify the post data and append
    formData.append('post', JSON.stringify({
      content: postData.content,
      // Include other fields you want to update
      mediaUrl: postData.mediaUrl // If you want to update the URL separately
    }));
    
    // Append file if provided
    if (file) {
      formData.append('file', file, file.name);
    }
  
    return this.http.put<Post>(`${this.baseUrl}/update/${postId}`, formData).pipe(
      catchError(error => {
        console.error('Update error:', error);
        
        let errorMessage = 'Failed to update post';
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.statusText) {
          errorMessage += ` (${error.statusText})`;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deletePost(postId: number, currentUserId: number): Observable<any> {
    // Double validation
    if (isNaN(postId)) {
      return throwError(() => new Error('Invalid post ID'));
    }
  
    if (currentUserId === 1) {
      return this.http.delete(`${this.baseUrl}/delete/${postId}`, {
        responseType: 'text' // or 'json' if returning JSON
      });
    } else {
      return throwError(() => new Error('You are not authorized to delete this post'));
    }
  }

  getAllPostsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/get-all-posts-by-user/${userId}`);
  }

   // Notify other components when a post is added
   notifyPostsUpdated() {
    this.postsUpdated.next();
  }

  getPostsUpdatedListener(): Observable<void> {
    return this.postsUpdated.asObservable();
  }

  getBaseUrl(): string {

    // Replace with your actual base URL logic

    return this.baseUrl; // Example base URL

  }

  getPostDetails(postId: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/display-post/${postId}`);
  }

  getReplies(postId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}/get-replies/${postId}`);
  }

  
  getPosts(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/get-posts?page=${page}&size=${size}`);
  }
  
  getPostsByUser(userId: number, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}?authorId=${userId}&page=${page}&size=${size}`);
  }
  
  

}

