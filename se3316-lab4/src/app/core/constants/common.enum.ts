export interface Genre {
  genre_id: number,
  parent: number,
  title: string,
  top_level: number,
  '#tracks': number
}

export interface Track {
  trackID: string,
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
  artist_id: number,
  artist_name: string,
  artist_website: string,
  artist_active_year_begin?: string,
  artist_members?: string,
  artist_handle?: string,
}

export interface Playlist {
  listName: string,
  trackCount: number,
  trackList: any[],
  totalPlayTime: number
}

export interface Credentials {
  result?: string;
  jwt?: string | null;
  access_level?: number | null,
  user?: string | null,
  pass?: string | null
  username?: string | null,
  email?: string | null,
  status?: string | null
}
