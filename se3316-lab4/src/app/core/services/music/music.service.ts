import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Genre, Track, Artist, Playlist, Reviews, Dmca } from "../../constants/common.enum";
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
  selectList$: Subject <{ list: any }> = new Subject<{ list: any }>();

  httpHeaders = new HttpHeaders({
    'Authorization': localStorage.getItem('token') || 'N/A'
  });

  constructor(private http: HttpClient) { }

  // Return list of genres
  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(Constants.apiPaths.genres, {headers: this.httpHeaders}).pipe(
      map((data: Genre[]) => data),
      catchError(this.handleError)
    );
  }

  // Return list of tracks
  getTracks(trackTitle?: string, albumTitle?: string, genreTitle?: string, artistName?: string): Observable<Track[]> {
    return this.http.get<Track[]>(`${Constants.apiPaths.tracks}?limit=${this.trackSearchLim}${trackTitle ? '&track_title=' + trackTitle : ''}${albumTitle ? '&album_title=' + albumTitle : ''}${genreTitle ? '&genre_title=' + genreTitle : ''}${artistName ? '&artist_name=' + artistName : ''}`, {headers: this.httpHeaders}).pipe(
      map((data: Track[]) => data),
      catchError(this.handleError)
    );
  }

  // Return list of DMCA records
  getDmca(recordType?: string, recievedDate?: Date, contentType?: string, contentName?: string, username?: string, ownerName?: string, ownerEmail?: string ): Observable<Dmca[]> {
    return this.http.get<Dmca[]>(`${Constants.apiPaths.dmca}?limit=${this.trackSearchLim}${recordType ? '&record_type=' + recordType : ''}${recievedDate ? '&recieved_date=' + recievedDate : ''}${contentType ? '&content_type=' + contentType : ''}${contentName ? '&content_name=' + contentName : ''}${username ? '&username=' + username : ''}${ownerName ? '&owner_name=' + ownerName : ''}${ownerEmail ? '&owner_email=' + ownerEmail : ''}`, {headers: this.httpHeaders}).pipe(
      map((data: Dmca[]) => data),
      catchError(this.handleError)
    );

  }

  // Return list of artists
  getArtists(artistName: string): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${Constants.apiPaths.artists}?limit=${this.artistSearchLimit}&name=${artistName}`, {headers: this.httpHeaders}).pipe(
      tap(data => data),
      catchError(this.handleError)
    );
  }

  // Return list of playlists
  getLists(listName?: string): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${Constants.apiPaths.playlists}${listName ? '/' + listName + '/tracks' : ''}`, {headers: this.httpHeaders}).pipe(
      tap(data => data),
      catchError(this.handleError)
    );
  }

  // Create new DMCA record
  createDmca(recordType?: string, receivedDate?: Date, contentType?: string, contentName?: string, username?: string, ownerName?: string, ownerEmail?: string, id?: number ): Observable<Dmca[]> {
    return this.http.put<Dmca[]>(`${Constants.apiPaths.dmca}`, {
      record_type: recordType,
      received_date: receivedDate,
      content_type: contentType,
      content_name: contentName,
      username: username,
      owner_name: ownerName,
      owner_email: ownerEmail,
      id: id
    }, {headers: this.httpHeaders}).pipe(
      map((data: Dmca[]) => data),
      catchError(this.handleError)
    );
  }

  // Create new playlist
  createList(listName: string): Observable<Playlist[]> {
    return this.http.put(`${Constants.apiPaths.playlists}/${listName}`, null, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update existing playlist tracks
  updateList(list: Playlist, tracks: any[]): Observable<Playlist[]> {
    return this.http.put(`${Constants.apiPaths.playlists}/${list.listName}/tracks`, {
      "tracks": [...tracks]
      }, {headers: this.httpHeaders}
    ).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Delete playlist
  deleteList(listName: string): Observable<Playlist[]> {
    return this.http.delete(`${Constants.apiPaths.playlists}/${listName}`, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get reviews for playlist or track
  getReviews(name: string, type: string): Observable<Reviews[]> {
    return this.http.get(`${Constants.apiPaths.reviews}/${type}/${name}`, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Create new review for playlist or track
  addReview(name: string, type: string, review: Reviews): Observable<Reviews[]> {
    return this.http.post(`${Constants.apiPaths.reviews}/${type}/${name}`, { newReview: review }, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Toggle review visibility
  toggleReview(name: string, type: string, review: Reviews, visibility: string): Observable<Reviews[]> {
    return this.http.post(`${Constants.apiPaths.reviews}/${type}/toggle/${name}`, { newReview: review, visibility: visibility }, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Toggle playlist visibility
  playlistVisibility(listName: string, visibility: string): Observable<Reviews[]> {
    return this.http.put(`${Constants.apiPaths.playlists}/visibility/${listName}/${visibility}`, {}, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Rename playlist
  renameList(oldName: string, newName: string): Observable<Reviews[]> {
    return this.http.put(`${Constants.apiPaths.playlists}/rename/renameList/rename`, { oldName: oldName, newName: newName }, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update playlist description
  updateDescription(listName: string, description: string): Observable<Reviews[]> {
    return this.http.put(`${Constants.apiPaths.playlists}/description/update/${listName}`, { description: description }, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Get policy
  getPolicy(policyType: string): Observable<any> {
    return this.http.get(`${Constants.apiPaths.policy}?policy=${policyType}`, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Update policy
  updatePolicy(policyType: string, body: any): Observable<any> {
    return this.http.put(`${Constants.apiPaths.policy}`, {
      policyType: policyType,
      body: body
    }, {headers: this.httpHeaders}).pipe(
      map((res: any) => res)
    ).pipe(
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
