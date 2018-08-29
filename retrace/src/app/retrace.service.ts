import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RetraceService {

  constructor(
    private http: HttpClient
  ) {

  }

  retrace(stacktrace: string) {
    return this.http.post('https://europe-west1-aerial-rush-113616.cloudfunctions.net/retrace', {
      stacktrace: stacktrace
    });
  }

}
