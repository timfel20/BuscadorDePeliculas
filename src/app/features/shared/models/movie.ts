export interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  genres: GenresStructure[];
  runtime: number;
  popularity: number;
}

//Possibkly...
//represent popularity with the condition of number, representing each range with certain visual indicators
// apply a button to show more i.e getting the page param for the corresponding  next pages until the third page

export interface GenresStructure {
    id: number;
    name: string;
}