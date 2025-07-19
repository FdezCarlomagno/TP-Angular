import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Country } from '../../../interfaces/country.interface';

/**
 * Componente reutilizable para mostrar información de un país en formato de tarjeta
 * Demuestra el patrón de comunicación @Input/@Output
 * Utilizado en la lista de países con funcionalidad de favoritos
 */
@Component({
  selector: 'app-country-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: `./country-card.component.html`
})
export class CountryCardComponent {
  // Propiedad de entrada con los datos del país desde el componente padre
  @Input() country!: Country;
  
  // Propiedad de entrada que indica si el país está marcado como favorito
  @Input() isFavorite: boolean = false;
  
  // Evento de salida para notificar cambios en el estado de favorito
  @Output() favoriteToggle = new EventEmitter<{ country: Country; isFavorite: boolean }>();

  /**
   * Maneja los clics en el botón de favorito
   * Previene la propagación del evento y emite el cambio al componente padre
   * @param event - El evento de clic
   */
  onFavoriteClick(event: Event): void {
    // Previene que el evento burbujee y dispare otros manejadores
    event.preventDefault();
    event.stopPropagation();
    
    // Emite el evento de cambio de favorito con los datos del país y el nuevo estado
    this.favoriteToggle.emit({
      country: this.country,
      isFavorite: !this.isFavorite
    });
  }
}
