export interface Genre {
  genre_id: number,
  parent: number,
  title: string,
  top_level: number,
  '#tracks': number
}

export interface Track {
  track_id: string,
  album_id: number,
  album_title: string,
  artist_name: string,
  tags: string,
  track_date_created: string,
  track_date_recorded: string,
  track_duration: string,
  track_genres: string,
  track_number: number,
  track_title: string,
  track_image_file: string
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
  description?: string,
  tracks: any[],
  totalPlayTime: number,
  lastModified: string,
  visibility: string,
  owner: string
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

export interface Reviews {
  review_type?: string | null,
  parent?: string | null,
  author?: string | null,
  submitted_date_time?: string | null,
  body?: string | null,
  rating?: number | null,
  visibility?: string | null
}
