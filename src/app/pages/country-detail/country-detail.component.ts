import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CountryService } from '../../../services/country.service';
import { FavoritesService } from '../../../services/favorites.service';
import { CountryInfo } from '../../../interfaces/country.interface';
import { PopulationChartComponent } from '../../components/population-chart/population-chart.component';
import { CountryInfoCardComponent } from '../../components/country-info-card/country-info-card.component';
import { Favourite } from '../../../interfaces/country.interface';

/**
 * Componente para mostrar información detallada de un país
 * Muestra datos completos incluyendo gráficos de población y países relacionados
 * Demuestra composición de múltiples componentes e integración de datos API
 */

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PopulationChartComponent, CountryInfoCardComponent],
  templateUrl: "./country-detail.component.html"
})
export class CountryDetailComponent implements OnInit {
  countryInfo: CountryInfo | null = null;
  countryCodeParam: string = "";
  loading = true;
  error: string | null = null;
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private countryService: CountryService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    // Suscripción a cambios en los parámetros de ruta para manejar navegación entre países
    this.route.params.subscribe(params => {
      const countryCode = params['code'];
      this.countryCodeParam = countryCode;
      console.log(this.countryCodeParam)
      if (countryCode) {
        this.loadCountryData(countryCode);
      }
    });
    
    // Suscripción a cambios en favoritos para actualizar el estado
    this.favoritesService.favorites$.subscribe(() => {
      if (this.countryInfo) {
        this.isFavorite = this.favoritesService.isFavorite(this.countryInfo.countryCode);
      }
    });
  }

  /**
   * Carga datos completos del país desde múltiples APIs
   * Combina información básica del país con datos de población, capital, moneda y bandera
   * @param countryCode - Código opcional del país, usa parámetro de ruta si no se proporciona
   */
  loadCountryData(countryCode?: string): void {
    this.loading = true;
    this.error = null;

    const code = countryCode || this.route.snapshot.params['code'];
    
    this.countryService.getCountryInfo(code).subscribe({
      next: (countryInfo) => {
        this.countryInfo = countryInfo;
        this.isFavorite = this.favoritesService.isFavorite(code);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando detalles del país:', error);
        this.error = 'Error al cargar información del país. Por favor intente nuevamente.';
        this.loading = false;
      }
    });
  }

  /**
   * Alterna el estado de favorito para el país actual
   * Agrega o elimina el país de favoritos usando el servicio
   */
  toggleFavorite(): void {
    if (!this.countryInfo) return;
    console.log(this.countryInfo.countryCode || "no hay código");

    if (this.isFavorite) {
      // Eliminar de favoritos
      const existingFavorite = this.favoritesService.getFavoriteByCountryId(this.countryInfo.countryCode);
      if (existingFavorite && existingFavorite.countryId) {
        this.favoritesService.removeFavorite(existingFavorite.id as string).subscribe({
          next: () => {
            console.log(`Eliminado ${this.countryInfo?.commonName} de favoritos`);
          },
          error: (error) => {
            console.error('Error eliminando de favoritos:', error);
          }
        });
      }
    } else if(!this.isFavorite) {
      // Agregar a favoritos
      console.log("entrando en else")
      const favorite = {
        countryId: this.countryInfo.countryCode,
        countryName: this.countryInfo.commonName,
        description: `Información detallada sobre ${this.countryInfo.commonName}`
      };

      console.log("Favorito a agregar:", favorite)
      this.favoritesService.addFavorite(favorite as Favourite).subscribe({
        next: () => {
          console.log(`Agregado ${this.countryInfo?.commonName} a favoritos`);
        },
        error: (error) => {
          console.error('Error agregando a favoritos:', error);
        }
      });
    }
  }
}