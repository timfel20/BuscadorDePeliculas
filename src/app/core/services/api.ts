import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { Movie } from '../../features/shared/models/movie';
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })


export class Api {
  private baseUrl: string = 'https://api.themoviedb.org/3';
  private apiKey: string = 'b2ad4b37aef953d6f70ed15d54ab47bf';

  constructor(private http: HttpClient) {
    console.log('Api Service initialized');
  }
  
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    let p = params ? params.set('api_key', this.apiKey) : new HttpParams().set('api_key', this.apiKey);
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: p })
      .pipe(
        catchError(this.handleError)
      );
  }
  //buscador de peliculas
   searchMovies(query: string, releaseDate?: string): Observable<Movie[]> {
    let params = new HttpParams().set('api_key', this.apiKey).set('query', query);
    if (releaseDate) {
      params = params.set('release_date.gte', releaseDate);
    }
    return this.http.get<{ results: Movie[] }>(`${this.baseUrl}/search/movie`, { params })
      .pipe(map(response => response.results));
  }

  // El metodo GET para una pelicula en specifico usando su id
  getMovieDetails(movieId: number): Observable<Movie> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get<Movie>(`${this.baseUrl}/movie/${movieId}`, { params })
      .pipe(catchError(this.handleError));
  }

  // Funcion para peliculas segun la pagina
  discoverMovies(page: number = 1): Observable<Movie[]> {
    return this.discoverRaw(page)
      .pipe(
        map((response: any) => response.results)
      );
  }

  // returnar la funcion de las primeras 20 peliculas
  getFirst20Movies(): Observable<Movie[]> {
    return this.discoverMovies(1);
  }

// Todas las peliculas
  discoverRaw(page: number = 1): Observable<any> {
    let params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', String(page))
      

    return this.http.get<any>(`${this.baseUrl}/discover/movie`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // El metodo POST para solicitudes HTTP
  post<T>(endpoint: string, body: any): Observable<T> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Para manejar los errores de las solicitudes HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '¡Ha ocurrido un error desconocido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}