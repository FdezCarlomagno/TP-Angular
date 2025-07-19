import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryInfo } from '../../../interfaces/country.interface';

/**
 * Componente para mostrar información completa de un país en tarjetas organizadas
 * Muestra capital, moneda, población y otros detalles del país
 * Demuestra composición de componentes y presentación de datos
 */
@Component({
  selector: 'app-country-info-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./country-info-card.component.html"
})
export class CountryInfoCardComponent {
  // Propiedad de entrada para recibir la información del país desde el componente padre
  @Input() countryInfo!: CountryInfo;

  /**
   * Obtiene el valor de población más reciente de los datos de población
   * @returns Número de población más reciente o 0 si no hay datos disponibles
   */
  getLatestPopulation(): number {
    if (!this.countryInfo.population?.data?.populationCounts) return 0;
    
    const populationCounts = this.countryInfo.population.data.populationCounts;
    const latest = populationCounts.reduce((latest, current) => 
      current.year > latest.year ? current : latest
    );
    
    return latest.value;
  }

  /**
   * Obtiene el año del dato de población más reciente
   * @returns Año más reciente o el año actual si no hay datos disponibles
   */
  getLatestYear(): number {
    if (!this.countryInfo.population?.data?.populationCounts) return new Date().getFullYear();
    
    const populationCounts = this.countryInfo.population.data.populationCounts;
    const latest = populationCounts.reduce((latest, current) => 
      current.year > latest.year ? current : latest
    );
    
    return latest.year;
  }

  /**
   * Formatea valores de población para mostrarlos con unidades apropiadas
   * @param value - Valor de población a formatear
   * @returns Cadena formateada con unidades (K, M, B)
   */
  formatPopulation(value: number): string {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  }
}
