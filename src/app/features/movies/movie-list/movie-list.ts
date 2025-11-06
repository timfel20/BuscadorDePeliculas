import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Api } from '../../../core/services/api';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Movie, GenresStructure } from '../../shared/models/movie';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule,
  ],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.scss',
})
export class MovieList implements OnInit {
  movies: Movie[] = [];
  loading = false;
  error: string | null = null;
  searchQuery = '';
  selectedGenres: number[] = [];
  minRating = 0;
  releaseDate: string | null = null;

  genres: GenresStructure[] = [];

  private searchSubject = new Subject<string>();

  constructor(
    private apiService: Api,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.searchWithFilters();
    });
  }

  ngOnInit(): void {
    this.loadGenres();
    this.fetchMovies();
  }

  //Suscribir al funcion para obtener los datos de generos
  loadGenres(): void {
    this.apiService.getGenres().subscribe({
      next: (g) => {
        console.log('Genres loaded after sub', g);
        this.genres = g || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load genres', err);
      }
    });
  }

  //Para detectar el input de busqueda
  onSearchInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchSubject.next(this.searchQuery);
  }

  //Seleccionar y deseleccionar generos
  toggleGenre(genreId: number): void {
    const index = this.selectedGenres.indexOf(genreId);
    if (index === -1) {
      this.selectedGenres = [genreId];
    } else {
      this.selectedGenres = [];
    }
    this.searchWithFilters();
  }

  //Para determinar si un genero esta seleccionado
  isGenreSelected(genreId: number): boolean {
    return this.selectedGenres.includes(genreId);
  }

  //Para determinar el cambio en el rating minimo
  onRatingChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.minRating = Number(target.value);
    this.searchWithFilters();
  }

  //Para determinar el cambio en la fecha de lanzamiento
  onDateChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.releaseDate = target.value || null;
    this.searchWithFilters();
  }

  //Funcionalidad de busqueda y filtros
  searchWithFilters(): void {
    const hasFilters = !!(this.searchQuery || (this.selectedGenres && this.selectedGenres.length) || this.minRating || this.releaseDate);
    if (!hasFilters) {
      this.fetchMovies();
      return;
    }

    this.loading = true;
    this.error = null;
    this.movies = [];
    this.cdr.detectChanges();

    const filters = {
      query: this.searchQuery || undefined,
      genres: this.selectedGenres,
      minRating: this.minRating || undefined,
      releaseDate: this.releaseDate || null,
    };

    this.apiService.searchMoviesWithFilters(filters).subscribe({
      next: (list) => {
        this.movies = list || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = String(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  //Subscribir para obtener las primeras 20 peliculas
  fetchMovies(page: number = 1): void {
    this.loading = true;
    this.error = null;
    this.movies = [];
    this.cdr.detectChanges();

    this.apiService.getFirst20Movies().subscribe({
      next: (list) => {
        this.movies = list || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = String(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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
