import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Api } from '../../../core/services/api';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Movie } from '../../shared/models/movie';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.scss',
})
export class MovieList implements OnInit {
  movies: Movie[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private apiService: Api,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchMovies();
  }

  //suscribir para obtener la lista de 
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
        console.error('Failed to load movies', err);
        this.loading = false;
        this.cdr.detectChanges(); 
      }
    });
  }
}
