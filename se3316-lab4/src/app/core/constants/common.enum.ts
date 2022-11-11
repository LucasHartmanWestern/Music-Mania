export interface Genre {
  genre_id: number,
  parent: number,
  title: string,
  top_level: number,
  '#tracks': number
}

export interface Track {
  trackID: number,
  albumId: number,
  albumTitle: string,
  artistName: string,
  tags: string,
  trackDateCreated: string,
  trackDateRecorded: string,
  trackDuration: string,
  trackGenres: string,
  trackNumber: number,
  trackTitle: string,
  trackImage: string
}

export interface Artist {

}

export interface Playlist {

}
