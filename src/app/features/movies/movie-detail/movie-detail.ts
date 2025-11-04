import { ChangeDetectorRef, Component } from '@angular/core';
import { Api } from '../../../core/services/api';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Movie } from '../../shared/models/movie';
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

  constructor(private route: ActivatedRoute, private apiService: Api, private cdr: ChangeDetectorRef) {  }

  ngOnInit(): void {
  this.movieId = Number(this.route.snapshot.paramMap.get('id'));
   if (this.movieId) {
    console.log('Movie id test here', this.movieId);
     this.fetchMovieDetails(this.movieId);
    } 
     /* this.fetchMovieDetails(this.movieId); */
  }

  fetchMovieDetails(id: number): void {
    this.apiService.getMovieDetails(id).subscribe(
      (data) => {
        console.log('data before set', data);
        this.movie = data as Movie;
        console.log('movie after set', this.movie.title);
        this.cdr.detectChanges();

      },
      (error) => {
        console.error('Error fetching movie details:', error);
        this.cdr.detectChanges();
      }
    );
  }
   
}
