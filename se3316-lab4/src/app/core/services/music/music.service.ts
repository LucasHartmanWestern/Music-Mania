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

  private trackSearchLim = 25;
  private artistSearchLimit = 25;

  previewSelection$: Subject <{ preview: Track | Artist | any, type: string }> = new Subject<{ preview: Track | Artist | any, type: string }>();
  searchParams$: Subject <{ trackTitle: string, artistTitle: string, albumTitle: string }> = new Subject<{ trackTitle: string, artistTitle: string, albumTitle: string }>();
  lists$: Subject <{ lists: Playlist[] | any }> = new Subject<{ lists: Playlist[] | any }>();
  updatedList$: Subject <{ list: Playlist | any, delete: boolean }> = new Subject<{ list: Playlist | any, delete: boolean }>();
  listTracks$: Subject <{ list: Playlist, tracks: Track[] | any }> = new Subject<{ list: Playlist, tracks: Track[] | any }>();

  constructor(private http: HttpClient) { }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(Constants.apiPaths.genres).pipe(
      map((data: Genre[]) => data),
      catchError(this.handleError)
    );
  }

  getTracks(trackTitle?: string, albumTitle?: string, genreTitle?: string, artistName?: string): Observable<Track[]> {
    return this.http.get<Track[]>(`${Constants.apiPaths.tracks}?limit=${this.trackSearchLim}${trackTitle ? '&track_title=' + trackTitle : ''}${albumTitle ? '&album_title=' + albumTitle : ''}${genreTitle ? '&genre_title=' + genreTitle : ''}${artistName ? '&artist_name=' + artistName : ''}`).pipe(
      map((data: Track[]) => data),
      catchError(this.handleError)
    );
  }

  getArtists(artistName: string): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${Constants.apiPaths.artists}?limit=${this.artistSearchLimit}&name=${artistName}`).pipe(
      tap(data => data),
      catchError(this.handleError)
    );
  }

  getLists(listName?: string): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${Constants.apiPaths.playlists}${listName ? '/' + listName + '/tracks' : ''}`).pipe(
      tap(data => data),
      catchError(this.handleError)
    );
  }

  createList(listName: string): Observable<Playlist[]> {
    return this.http.put(`${Constants.apiPaths.playlists}/${listName}`, null).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateList(list: Playlist, tracks: any[]): Observable<Playlist[]> {
    return this.http.put(`${Constants.apiPaths.playlists}/${list.listName}/tracks`, {
      "tracks": [...tracks]
      }
    ).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteList(listName: string): Observable<Playlist[]> {
    return this.http.delete(`${Constants.apiPaths.playlists}/${listName}`).pipe(
      map((res: any) => res)
    ).pipe(
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
