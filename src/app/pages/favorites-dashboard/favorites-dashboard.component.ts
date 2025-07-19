import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FavoritesService } from '../../../services/favorites.service';
import { Favourite } from '../../../interfaces/country.interface';

/**
 * Componente para gestionar países favoritos
 * Demuestra formularios reactivos, operaciones CRUD e interacciones con modales
 * Incluye validación de formularios y retroalimentación al usuario
 */

@Component({
  selector: 'app-favorites-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: "./dashboard.component.html",
})

export class FavoritesDashboardComponent implements OnInit {
  favorites: Favourite[] = [];
  loading = true;
  showModal = false;
  isEditMode = false;
  submitting = false;
  currentEditingFavorite: Favourite | null = null;

  // Formulario reactivo con reglas de validación
  favoriteForm: FormGroup;

  constructor(
    private favoritesService: FavoritesService,
    private fb: FormBuilder
  ) {
    // Inicialización del formulario reactivo con validadores
    this.favoriteForm = this.fb.group({
      countryName: ['', [Validators.required, Validators.minLength(2)]],
      countryId: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadFavorites();
  }

  /**
   * Propiedad calculada para contar favoritos con descripciones significativas
   */
  get favoritesWithDescriptions(): number {
    return this.favorites.filter(fav =>
      fav.description && fav.description.length > 1
    ).length;
  }

  /**
   * Carga todos los favoritos desde el servicio
   */
  loadFavorites(): void {
    this.loading = true;
    this.favoritesService.getFavorites().subscribe({
      next: (favorites) => {
        this.favorites = favorites;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando favoritos:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Abre el modal para agregar un nuevo favorito
   */
  openAddModal(): void {
    this.isEditMode = false;
    this.currentEditingFavorite = null;
    this.favoriteForm.reset();
    this.showModal = true;
  }

  /**
   * Abre el modal para editar un favorito existente
   * @param favorite - El favorito a editar
   */
  openEditModal(favorite: Favourite): void {
    this.isEditMode = true;
    this.currentEditingFavorite = favorite;

    // Rellena el formulario con los datos existentes
    this.favoriteForm.patchValue({
      countryName: favorite.countryName,
      countryId: favorite.countryId,
      description: favorite.description
    });

    this.showModal = true;
  }

  /**
   * Cierra el modal y reinicia el estado del formulario
   */
  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.currentEditingFavorite = null;
    this.submitting = false;
    this.favoriteForm.reset();
  }

  /**
   * Maneja el envío del formulario para operaciones de agregar y editar
   * Demuestra validación de formularios reactivos y operaciones HTTP
   */
  onSubmit(): void {
    if (this.favoriteForm.invalid) {
      // Marca todos los campos como tocados para mostrar errores de validación
      this.favoriteForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.favoriteForm.value;

    if (this.isEditMode && this.currentEditingFavorite?.id) {
      // Actualiza un favorito existente
      this.favoritesService.updateFavorite(this.currentEditingFavorite.id, formValue).subscribe({
        next: () => {
          this.closeModal();
          this.loadFavorites();
        },
        error: (error) => {
          console.error('Error actualizando favorito:', error);
          this.submitting = false;
        }
      });
    } else {
      // Agrega un nuevo favorito
      this.favoritesService.addFavorite(formValue).subscribe({
        next: () => {
          this.closeModal();
          this.loadFavorites();
        },
        error: (error) => {
          console.error('Error agregando favorito:', error);
          this.submitting = false;
        }
      });
    }
  }

  /**
   * Elimina un favorito con confirmación del usuario
   * @param favorite - El favorito a eliminar
   */
  deleteFavorite(favorite: Favourite): void {
    if (!favorite.id) return;

    const confirmed = confirm(`¿Estás seguro que deseas eliminar ${favorite.countryName} de tus favoritos?`);

    if (confirmed) {
      this.favoritesService.removeFavorite(favorite.id).subscribe({
        next: () => {
          this.loadFavorites();
        },
        error: (error) => {
          console.error('Error eliminando favorito:', error);
        }
      });
    }
  }
}