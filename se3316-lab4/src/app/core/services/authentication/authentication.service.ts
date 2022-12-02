import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Credentials } from "../../constants/common.enum";
import { Constants } from "../../constants/constants";
import { NgxSpinnerService } from "ngx-spinner";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  httpHeaders = new HttpHeaders({
    'Authorization': localStorage.getItem('token') || 'N/A'
  });

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {
  }

  // Get guest jwt
  continueAsGuest(): Observable<any> {
    return this.http.get<any>(`${Constants.apiPaths.credentials}/guest`, {headers: this.httpHeaders}).pipe(
      map((data: Credentials) => data),
      catchError(this.handleError)
    );
  }

  // Authenticate user
  login(username: string, password: string, reset?: boolean, newPassword?: string, verify?: boolean): Observable<Credentials> {
    return this.http.post<Credentials>(`${Constants.apiPaths.credentials}`, {
      "username": username,
      "password": password,
      "reset": reset || null,
      "newPassword": newPassword || null,
      "verify": verify || null
    }, {headers: this.httpHeaders}).pipe(
      map((data: Credentials) => data),
      catchError(this.handleError)
    );
  }

  // Create new account
  createAccount(username: string, email: string, password: string): Observable<Credentials> {
    return this.http.put<Credentials>(`${Constants.apiPaths.credentials}`, {
      "username": username,
      "email": email,
      "password": password
    }, {headers: this.httpHeaders}).pipe(
      map((data: Credentials) => data),
      catchError(this.handleError)
    );
  }

  // Get list of users
  getUsers(): Observable<Credentials[]> {
    return this.http.get<Credentials[]>(`${Constants.apiPaths.credentials}/all`,{headers: this.httpHeaders}).pipe(
      map((data: Credentials[]) => data),
      catchError(this.handleError)
    );
  }

  // Update user details
  updateUser(user: Credentials, newValue: string, att: string): Observable<any> {
    return this.http.post<any>(`${Constants.apiPaths.credentials}/update`,{user: user, newValue: newValue, att: att},{headers: this.httpHeaders}).pipe(
      map((data: any) => data),
      catchError(this.handleError)
    );
  }

  // Reset password of existing user
  resetPassword(email: string): Observable<any> {
    return this.http.post<any>(`${Constants.apiPaths.credentials}/reset`, {
      "email": email
    }, {headers: this.httpHeaders}).pipe(
      map((data: Credentials) => data),
      catchError(this.handleError)
    );
  }

  // Resent validation email
  resendValidation(email: string): Observable<any> {
    return this.http.post<any>(`${Constants.apiPaths.credentials}/resend`, {
      "email": email
    }, {headers: this.httpHeaders}).pipe(
      map((data: Credentials) => data),
      catchError(this.handleError)
    );
  }

  // Handle errors
  private handleError(err: HttpErrorResponse) {


    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {

      errorMessage = `An error occurred: ${err.error.message}`;
    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    return throwError(err.error);
  }
}
