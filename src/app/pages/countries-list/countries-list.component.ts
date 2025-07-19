import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CountryService } from '../../../services/country.service';
import { FavoritesService } from '../../../services/favorites.service';
import { Country, CountryInfo } from '../../../interfaces/country.interface';
import { CountryCardComponent } from '../../components/country-card/country-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

/**
 * Componente principal para mostrar la lista de países
 * Incluye funcionalidad de búsqueda y tarjetas de países
 * Demuestra comunicación @Input/@Output y control de flujo en templates
 */
@Component({
  selector: 'app-countries-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CountryCardComponent, SearchBarComponent],
  templateUrl: "./countries-list.component.html" 
})
export class CountriesListComponent implements OnInit {
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private countryService: CountryService,
    public favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  /**
   * Carga la lista de países disponibles desde la API
   * Maneja estados de carga y gestión de errores
   */
  loadCountries(): void {
    this.loading = true;
    this.error = null;
    
    this.countryService.getAvailableCountries().subscribe({
      next: (countries) => {
        this.countries = countries.sort((a, b) => a.name.localeCompare(b.name));
        this.filteredCountries = [...this.countries];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando países:', error);
        this.error = 'Error al cargar países. Por favor intente nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Maneja cambios en el término de búsqueda desde el componente de búsqueda
   * Demuestra comunicación @Output desde componente hijo
   * @param searchTerm - El término de búsqueda desde la barra de búsqueda
   */
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filterCountries();
  }

  /**
   * Filtra países basado en el término de búsqueda actual
   * Usa coincidencia insensible a mayúsculas/minúsculas en nombres de países
   */
  private filterCountries(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCountries = [...this.countries];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredCountries = this.countries.filter(country =>
        country.name.toLowerCase().includes(term) ||
        country.countryCode.toLowerCase().includes(term)
      );
    }
  }

  /**
   * Maneja eventos de favoritos desde las tarjetas de país
   * Demuestra manejo de eventos entre componentes
   * @param event - Evento conteniendo datos del país y acción de favorito
   */
  onFavoriteToggle(event: { country: Country; isFavorite: boolean }): void {
    const { country, isFavorite } = event;

    // Obtener el objeto completo de CountryInfo
    this.countryService.getCountryInfo(country.countryCode).subscribe({
      next: (countryInfo: CountryInfo) => {
        const iso2 = countryInfo.codes?.data.Iso2;

        if (!iso2) {
          console.error('No se encontró el código ISO2 del país');
          return;
        }

        if (isFavorite) {
          // Agregar a favoritos usando Iso2 como ID
          const favorite = {
            countryId: iso2,
            countryName: countryInfo.commonName,
            description: `Información sobre ${countryInfo.commonName}`
          };

          this.favoritesService.addFavorite(favorite).subscribe({
            next: () => {
              console.log(`Agregado ${countryInfo.commonName} a favoritos`);
            },
            error: (error) => {
              console.error('Error agregando a favoritos:', error);
            }
          });

        } else {
          // Remover de favoritos usando Iso2
          const existingFavorite = this.favoritesService.getFavoriteByCountryId(iso2);
          if (existingFavorite && existingFavorite.id) {
            this.favoritesService.removeFavorite(existingFavorite.id).subscribe({
              next: () => {
                console.log(`Eliminado ${countryInfo.commonName} de favoritos`);
              },
              error: (error) => {
                console.error('Error eliminando de favoritos:', error);
              }
            });
          }
        }
      },
      error: (error) => {
        console.error('Error obteniendo información del país:', error);
      }
    });
  }
}