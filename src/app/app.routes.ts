import { Routes } from '@angular/router';
import { MovieDetail } from './features/movies/movie-detail/movie-detail';
import { MovieList } from './features/movies/movie-list/movie-list';

export const routes: Routes = [
  { path: '', component: MovieList },
  { path: 'movie/:id', component: MovieDetail },
  /* { path: '', redirectTo: '/movies', pathMatch: 'full' }, */
];
