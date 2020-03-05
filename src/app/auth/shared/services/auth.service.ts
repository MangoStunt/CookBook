import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {FirebaseAuthResponse, User} from '../interfaces';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {catchError, tap} from 'rxjs/operators';
import {createAttribute} from '@angular/compiler/src/core';

@Injectable({providedIn: 'root'})
export class AuthService {

  public error$: Subject<string> = new Subject<string>()

  constructor(private http: HttpClient) { }

  get token(): string {
    const expDate = new Date(localStorage.getItem('fb-token-exp'))
    if (new Date() > expDate) {
      this.logout()
      return null
    }
    return localStorage.getItem('fb-token')
  }

  login(user: User): Observable<any> {
    user.returnSecureToken = true
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
      .pipe(
        tap(this.setToken),
        catchError(this.handleError.bind(this))
      );
  }

  logout() {
      this.setToken(null)
  }

  private handleError(error: HttpErrorResponse) {
    const {message} = error.error.error

    switch (message) {
      case 'EMAIL_NOT_FOUND':
        this.error$.next('Email not found')
        break
      case 'INVALID_EMAIL':
        this.error$.next('Wrong Email')
        break
      case 'INVALID_PASSWORD':
        this.error$.next('Wrong Password')
        break
    }
    return throwError(error)
  }

  isAuth(): boolean {
    return !!this.token
  }

  private setToken(res: FirebaseAuthResponse | null) {
    if (res) {
    const expiresDate = new Date(new Date().getTime() + +res.expiresIn * 1000)
    localStorage.setItem('fb-token', res.idToken)
    localStorage.setItem('fb-token-exp', expiresDate.toString())
    } else {
      localStorage.clear()
    }
  }
}
