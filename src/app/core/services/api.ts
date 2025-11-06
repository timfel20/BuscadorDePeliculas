import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { Movie, GenresStructure } from '../../features/shared/models/movie';
import { Injectable } from "@angular/core";
import { environment } from "../../environment";

@Injectable({ providedIn: 'root' })


export class Api {
  private baseUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  constructor(private http: HttpClient) {}

  // El metodo GET para una pelicula en specifico usando su id
  getMovieDetails(movieId: number): Observable<Movie> {
    const params = new HttpParams().set('api_key', this.apiKey);
    return this.http.get<Movie>(`${this.baseUrl}/movie/${movieId}`, { params })
      .pipe(catchError(this.handleError));
  }

  // Funcion para peliculas segun la pagina
  discoverMovies(page: number): Observable<Movie[]> {
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
  discoverRaw(page: number): Observable<any> {
    let params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', String(page))
      

    return this.http.get<any>(`${this.baseUrl}/discover/movie`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener los datos de los generos de las peliculas
  getGenres(): Observable<GenresStructure[]> {
    return this.http.get<{ genres: GenresStructure[] }>(`${this.baseUrl}/genre/movie/list`, {
      params: new HttpParams().set('api_key', this.apiKey)
    }).pipe(
      map(resp => resp.genres),
      catchError(this.handleError)
    );
  }

  // Buscar peliculas con generos, rating minimo, y fecha de lanzamiento
searchMoviesWithFilters(filters: { query?: string; genres?: number[]; minRating?: number; releaseDate?: string | null }): Observable<Movie[]> {
  let params = new HttpParams().set('api_key', this.apiKey);

  const hasNonQueryFilters = (filters.genres && filters.genres.length) || filters.minRating || filters.releaseDate;
  
  if (filters.query && !hasNonQueryFilters) {
    params = params.set('query', filters.query);
    return this.http.get<{ results: Movie[] }>(`${this.baseUrl}/search/movie`, { params })
      .pipe(
        map(res => res.results),
        catchError(this.handleError)
      );
  } else {

    if (filters.genres && filters.genres.length) {
      params = params.set('with_genres', filters.genres.join(','));
    }
    if (filters.minRating) {
      params = params.set('vote_average.gte', String(filters.minRating));
    }
    if (filters.releaseDate) {
      params = params.set('primary_release_date.gte', filters.releaseDate);
    }

    return this.http.get<{ results: Movie[] }>(`${this.baseUrl}/discover/movie`, { params })
      .pipe(
        map(res => res.results),
        catchError(this.handleError)
      );
  }
}


  //Funcion reutilizable para manejar los errores de las solicitudes HTTP
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
