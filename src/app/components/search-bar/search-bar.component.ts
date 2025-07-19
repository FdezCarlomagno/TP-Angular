import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

/**
 * Componente reutilizable de barra de búsqueda con debounce
 * Demuestra comunicación @Input/@Output y operadores de RxJS
 * Proporciona funcionalidad optimizada para reducir llamadas a la API
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: `./search-bar.component.html`
})
export class SearchBarComponent implements OnInit, OnDestroy {
  // Propiedad de entrada para texto de placeholder personalizado
  @Input() placeholder: string = 'Buscar...';
  
  // Evento de salida para cambios en el término de búsqueda
  @Output() searchChange = new EventEmitter<string>();

  // Modelo interno del término de búsqueda
  searchTerm: string = '';
  
  // Subject para manejar la entrada con debounce
  private searchSubject = new Subject<string>();
  
  // Subject para limpiar suscripciones al destruir el componente
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Configurar búsqueda con debounce usando operadores RxJS
    this.searchSubject.pipe(
      debounceTime(300), // Espera 300ms después de que el usuario deje de escribir
      distinctUntilChanged(), // Solo emite si el término realmente cambió
      takeUntil(this.destroy$) // Limpia la suscripción al destruir el componente
    ).subscribe(searchTerm => {
      // Emitir el término de búsqueda al componente padre
      this.searchChange.emit(searchTerm);
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar fugas de memoria
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Maneja los eventos de entrada en la búsqueda
   * Dispara la búsqueda con debounce a través del Subject de RxJS
   */
  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /**
   * Limpia el campo de búsqueda y notifica al componente padre
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.searchChange.emit('');
  }
}
