// image-description.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class ImageDescriptionService {
 
    constructor(private http: HttpClient) {}

  getImageDescription(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<{ description: string }>('http://localhost:5000/describe', formData);
  }

describeImageFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post<any>('http://localhost:8081/describe', formData);
}
  
  
}