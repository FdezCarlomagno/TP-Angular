import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, catchError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { 
  Country, 
  CountryInfo, 
  PopulationResponse, 
  CapitalResponse, 
  CurrencyResponse, 
  FlagResponse, 
  IsoResponse,
  StateResponse,
  CitiesResponse
} from '../interfaces/country.interface';

/**
 * Servicio para manejar todas las operaciones API relacionadas con países
 * Integra múltiples APIs externas para proveer datos completos de países
 */
@Injectable({
  providedIn: 'root'
})
export class CountryService {
  // Endpoints de API para diferentes fuentes de datos
  private readonly AVAILABLE_COUNTRIES_URL = 'https://date.nager.at/api/v3/AvailableCountries';
  private readonly COUNTRY_INFO_URL = 'https://date.nager.at/api/v3/CountryInfo';
  private readonly POPULATION_URL = 'https://countriesnow.space/api/v0.1/countries/population';
  private readonly CAPITAL_URL = 'https://countriesnow.space/api/v0.1/countries/capital';
  private readonly CURRENCY_URL = 'https://countriesnow.space/api/v0.1/countries/currency';
  private readonly FLAG_URL = 'https://countriesnow.space/api/v0.1/countries/flag/images';
  private readonly ISO_URL = 'https://countriesnow.space/api/v0.1/countries/iso';
  private readonly STATES_URL = 'https://countriesnow.space/api/v0.1/countries/states';
  private readonly CITIES_URL = 'https://countriesnow.space/api/v0.1/countries/state/cities';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todos los países disponibles
   * @returns Observable<Country[]> Array de objetos país con info básica
   */
  getAvailableCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.AVAILABLE_COUNTRIES_URL).pipe(
      catchError(error => {
        console.error('Error al obtener países:', error);
        return [];
      })
    );
  }

  /**
   * Obtiene información completa sobre un país específico
   * Combina datos de múltiples APIs para proveer detalles completos
   * @param countryCode - Código del país (ej: 'US', 'CA')
   * @returns Observable<CountryInfo> Información completa del país
   */
  getCountryInfo(countryCode: string): Observable<CountryInfo> {
    const countryInfoUrl = `${this.COUNTRY_INFO_URL}/${countryCode}`;
    
    return this.http.get<CountryInfo>(countryInfoUrl).pipe(
      switchMap(basicInfo => {
        // Obtiene datos adicionales en paralelo
        const additionalData$ = forkJoin({
          population: this.getPopulationData(basicInfo.commonName),
          capital: this.getCapitalData(basicInfo.commonName),
          currency: this.getCurrencyData(basicInfo.commonName),
          codes: this.getIsoCode(basicInfo.commonName),
        }).pipe(
          switchMap(data => {
            // Obtiene datos de bandera usando código ISO
            return this.getFlagData(data.codes?.data?.Iso2 || '').pipe(
              map(flag => ({ ...data, flag }))
            );
          })
        );

        // Combina la info básica con los datos adicionales
        return additionalData$.pipe(
          map(additionalData => ({
            ...basicInfo,
            population: additionalData.population,
            capital: additionalData.capital,
            currency: additionalData.currency,
            codes: additionalData.codes,
            flag: additionalData.flag
          })),
          catchError(error => {
            console.error('Error al obtener datos adicionales del país:', error);
            return of(basicInfo); // Retorna info básica si falla obtener datos adicionales
          })
        );
      }),
      catchError(error => {
        console.error('Error al obtener info del país:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene datos de población para un país
   * @param countryName - Nombre del país
   * @returns Observable con datos de población
   */
  private getPopulationData(countryName: string): Observable<PopulationResponse | null> {
    return this.http.post<PopulationResponse>(this.POPULATION_URL, { 
      country: countryName 
    }).pipe(
      catchError(error => {
        console.error('Error al obtener datos de población:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene datos de la capital para un país
   * @param countryName - Nombre del país
   * @returns Observable con datos de la capital
   */
  private getCapitalData(countryName: string): Observable<CapitalResponse | null> {
    return this.http.post<CapitalResponse>(this.CAPITAL_URL, { 
      country: countryName 
    }).pipe(
      catchError(error => {
        console.error('Error al obtener datos de la capital:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene datos de la moneda para un país
   * @param countryName - Nombre del país
   * @returns Observable con datos de la moneda
   */
  private getCurrencyData(countryName: string): Observable<CurrencyResponse | null> {
    return this.http.post<CurrencyResponse>(this.CURRENCY_URL, { 
      country: countryName 
    }).pipe(
      catchError(error => {
        console.error('Error al obtener datos de moneda:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene códigos ISO para un país
   * @param countryName - Nombre del país
   * @returns Observable con datos de código ISO
   */
  private getIsoCode(countryName: string): Observable<IsoResponse | null> {
    return this.http.post<IsoResponse>(this.ISO_URL, { 
      country: countryName 
    }).pipe(
      catchError(error => {
        console.error('Error al obtener código ISO:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene URL de la imagen de la bandera para un país usando código ISO2
   * @param iso2Code - Código ISO2 del país
   * @returns Observable con datos de la bandera
   */
  private getFlagData(iso2Code: string): Observable<FlagResponse | null> {
    if (!iso2Code) return of(null);
    
    return this.http.post<FlagResponse>(this.FLAG_URL, { 
      iso2: iso2Code 
    }).pipe(
      catchError(error => {
        console.error('Error al obtener datos de la bandera:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene estados/provincias de un país
   * @param countryName - Nombre del país
   * @returns Observable con datos de estados
   */
  getStatesData(countryName: string): Observable<StateResponse | null> {
    return this.http.post<StateResponse>(this.STATES_URL, { 
      country: countryName 
    }).pipe(
      catchError(error => {
        console.error('Error al obtener datos de estados:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene ciudades para un estado específico de un país
   * @param countryName - Nombre del país
   * @param stateName - Nombre del estado
   * @returns Observable con datos de ciudades
   */
  getCitiesData(countryName: string, stateName: string): Observable<CitiesResponse | null> {
    return this.http.post<CitiesResponse>(this.CITIES_URL, { 
      country: countryName,
      state: stateName
    }).pipe(
      catchError(error => {
        console.error('Error al obtener datos de ciudades:', error);
        return of(null);
      })
    );
  }
}
