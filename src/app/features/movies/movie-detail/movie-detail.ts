import { ChangeDetectorRef, Component } from '@angular/core';
import { Api } from '../../../core/services/api';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GenresStructure, Movie } from '../../shared/models/movie';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.scss'
}
)
export class MovieDetail {
  movieId: number | null = null;
  movie: Movie | null = null;

  genres: GenresStructure[] = [];
  

  constructor(private route: ActivatedRoute, private apiService: Api, private cdr: ChangeDetectorRef) {  }

  ngOnInit(): void {
  this.movieId = Number(this.route.snapshot.paramMap.get('id'));
   if (this.movieId) {
     this.fetchMovieDetails(this.movieId);
    } 
     /* this.fetchMovieDetails(this.movieId); */
  }

  //Suscribir al metodo para obtener los detalles de la pelicula
  fetchMovieDetails(id: number): void {
    this.apiService.getMovieDetails(id).subscribe(
      (data) => {
        this.movie = data as Movie;
        this.cdr.detectChanges();

      },
      (error) => {
        console.error('Error fetching movie details:', error);
        this.cdr.detectChanges();
      }
    );
  }

  //Returnar un array de generos separodos por coma, si viene con la id, buscar el correspondiente en el array de generos
  genreNamesForMovie(m: Movie | any): string {
    if (!m) return '';

    //SI hay un objeto de generos, usar eso
    if (Array.isArray(m.genres) && m.genres.length) {
      return m.genres.map((g: any) => g.name).join(', ');
    }

    //si no buscar con las ids
    if (Array.isArray(m.genre_ids) && this.genres && this.genres.length) {
      const names = m.genre_ids.map((id: number) => {
        const found = this.genres.find(g => g.id === id);
        return found ? found.name : null;
      }).filter(Boolean);
      return names.join(', ');
    }
    return '';
  }
   
}
