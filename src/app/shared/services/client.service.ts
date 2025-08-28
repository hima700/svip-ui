/** @Author Justin Jantzi */

import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  public showLogin: boolean = false;
  private readonly SERVER_URL: string = 'http://localhost:8080/svip/';
  private loggedIn: boolean = false;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:4200',
    }),
    params: new HttpParams(),
  };

  constructor(private http: HttpClient) {
  }

  setAPIKey(key: string) {
    this.httpOptions.headers.set('apiKey', key);
  }

  get(path: string, params: HttpParams = new HttpParams()) {
    this.httpOptions.params = params;
    return this.http.get(this.SERVER_URL + path, this.httpOptions);
  }

  delete(path: string, params: HttpParams = new HttpParams()) {
    this.httpOptions.params = params;
    return this.http.delete(this.SERVER_URL + path, this.httpOptions);
  }

  post(path: string, body: any, params: HttpParams = new HttpParams()) {
    this.httpOptions.params = params;
    return this.http.post(this.SERVER_URL + path, body, this.httpOptions);
  }

  postFile(path: string, body: any, params: HttpParams = new HttpParams()) {
    let headers = new HttpHeaders({
      'Access-Control-Allow-Origin': 'http://localhost:4200'
    });

    return this.http.post(this.SERVER_URL + path, body, {headers: headers, params: params});
  }

  put(path: string, params: HttpParams = new HttpParams()) {
    this.httpOptions.params = params;
    return this.http.put(this.SERVER_URL + path, null, this.httpOptions);
  }
}
