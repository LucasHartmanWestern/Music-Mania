import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Genre, Track, Artist, Playlist } from "../../constants/common.enum";
import { Constants } from "../../constants/constants";

@Injectable({
  providedIn: 'root'
})
export class MusicService {

  private trackSearchLim = 5;
  private artistSearchLimit = 5;

  previewSelection$: Subject <{ preview: Track | Artist, type: string }> = new Subject<{ preview: Track | Artist, type: string }>();

  constructor(private http: HttpClient) { }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(Constants.apiPaths.genres).pipe(
      tap(data => data),
      catchError(this.handleError)
    );
  }

  getTracks(trackTitle?: string, albumTitle?: string, genreTitle?: string, artistName?: string): Observable<Track[]> {
    return this.http.get<Track[]>(`${Constants.apiPaths.tracks}?limit=${this.trackSearchLim}${trackTitle ? '&track_title=' + trackTitle : ''}${albumTitle ? '&album_title=' + albumTitle : ''}${genreTitle ? '&genre_title=' + genreTitle : ''}${artistName ? '&artist_name=' + artistName : ''}`).pipe(
      tap(data => data),
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
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
