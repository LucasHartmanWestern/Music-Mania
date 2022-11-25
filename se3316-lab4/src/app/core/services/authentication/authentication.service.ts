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

  login(username: string, password: string): Observable<Credentials> {
    return this.http.post<Credentials>(`${Constants.apiPaths.credentials}`, {
      "username": username,
      "password": password
    }, {headers: this.httpHeaders}).pipe(
      map((data: Credentials) => data),
      catchError(this.handleError)
    );
  }

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

  getUsers(): Observable<Credentials[]> {
    return this.http.get<Credentials[]>(`${Constants.apiPaths.credentials}/all`,{headers: this.httpHeaders}).pipe(
      map((data: Credentials[]) => data),
      catchError(this.handleError)
    );
  }

  updateUser(user: Credentials, newValue: string, att: string): Observable<any> {
    return this.http.post<any>(`${Constants.apiPaths.credentials}/update`,{user: user, newValue: newValue, att: att},{headers: this.httpHeaders}).pipe(
      map((data: any) => data),
      catchError(this.handleError)
    );
  }

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