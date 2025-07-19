import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, of } from 'rxjs';
import { Favourite } from '../interfaces/country.interface';

/**
 * Servicio para gestionar países favoritos
 * Maneja operaciones CRUD con el endpoint MockAPI
 */

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_API_URL = 'https://6864719c5b5d8d03397d3b5a.mockapi.io/api/v1/favourites';

  // BehaviorSubject para rastrear favoritos y notificar cambios a los componentes
  private favoritesSubject = new BehaviorSubject<Favourite[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {
    // Carga los favoritos al inicializar el servicio
    this.loadFavorites();
  }

  showCurrentFavorites(): void {
    this.favorites$.subscribe(favs => {
      favs.forEach(fav => {
        console.log({ countryName: fav.countryName, countryId: fav.countryId });
      });
    });
  }

  /**
   * Carga todos los favoritos desde la API
   * Actualiza el BehaviorSubject local con los datos obtenidos
   */
  loadFavorites(): void {
    this.http.get<Favourite[]>(this.FAVORITES_API_URL).pipe(
      tap(favorites => {
        this.favoritesSubject.next(favorites);
      }),
      catchError(error => {
        console.error('Error loading favorites:', error);
        return of([]);
      })
    ).subscribe();

    //debugging
    this.showCurrentFavorites()
  }

  /**
   * Obtiene todos los países favoritos
   * @returns Observable<Favourite[]> Array de países favoritos
   */
  getFavorites(): Observable<Favourite[]> {

    const favs: Observable<Favourite[]> = this.http.get<Favourite[]>(this.FAVORITES_API_URL).pipe(
      tap(favorites => {
        this.favoritesSubject.next(favorites);
      }),
      catchError(error => {
        console.error('Error fetching favorites:', error);
        return of([]);
      })
    );
    this.showCurrentFavorites();

    return favs;
  }

  /**
   * Agrega un nuevo país favorito
   * @param favorite - Objeto del país favorito a agregar
   * @returns Observable<Favourite> El favorito creado
   */
  addFavorite(favorite: Favourite): Observable<Favourite> {
    console.log(favorite.countryId)
    return this.http.post<Favourite>(this.FAVORITES_API_URL, {
      countryId: favorite.countryId,
      countryName: favorite.countryName,
      description: favorite.description || ""
    }).pipe(
      tap(() => {
        // Recarga los favoritos para actualizar el estado local
        this.loadFavorites();
      }),
      catchError(error => {
        console.error('Error adding favorite:', error);
        throw error;
      })
    );
  }

  /**
   * Actualiza un país favorito existente
   * @param id - ID del favorito a actualizar
   * @param favorite - Datos actualizados del favorito
   * @returns Observable<Favourite> El favorito actualizado
   */
  updateFavorite(id: string, favorite: Partial<Favourite>): Observable<Favourite> {
    return this.http.put<Favourite>(`${this.FAVORITES_API_URL}/${id}`, {
      countryId: favorite.countryId,
      countryName: favorite.countryName,
      description: favorite.description || ""
    }).pipe(
      tap(() => {
        // Recarga los favoritos para actualizar el estado local
        this.loadFavorites();
      }),
      catchError(error => {
        console.error('Error updating favorite:', error);
        throw error;
      })
    );
  }

  /**
   * Elimina un país favorito
   * @param id - ID del favorito a eliminar
   * @returns Observable<any> Confirmación de eliminación
   */
  removeFavorite(id: string): Observable<any> {
    return this.http.delete(`${this.FAVORITES_API_URL}/${id}`).pipe(
      tap(() => {
        // Recarga los favoritos para actualizar el estado local
        this.loadFavorites();
      }),
      catchError(error => {
        console.error('Error removing favorite:', error);
        throw error;
      })
    );
  }

  /**
   * Verifica si un país ya está en favoritos
   * @param countryId - Código del país a verificar
   * @returns boolean indicando si el país está en favoritos
   */
  isFavorite(countryId: string): boolean {
    const currentFavorites = this.favoritesSubject.value;
    return currentFavorites.some(fav => fav.countryId === countryId);
  }

  /**
   * Obtiene un favorito específico por código de país
   * @param countryId - Código del país a buscar
   * @returns Objeto Favourite o undefined
   */
  getFavoriteByCountryId(countryId: string): Favourite | undefined {
    const currentFavorites = this.favoritesSubject.value;
    return currentFavorites.find(fav => fav.countryId === countryId);
  }
}
