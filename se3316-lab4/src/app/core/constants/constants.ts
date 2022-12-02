const serverPrefix = `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;

export const Constants = {
  apiPaths: {
    dmca: `${serverPrefix}/music/dmca`,
    genres: `${serverPrefix}/music/genres`,
    tracks: `${serverPrefix}/music/tracks`,
    artists: `${serverPrefix}/music/artists`,
    playlists: `${serverPrefix}/music/lists`,
    reviews: `${serverPrefix}/music/reviews`,
    credentials: `${serverPrefix}/login/credentials`
  }
}
