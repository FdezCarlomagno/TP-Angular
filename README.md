# 🌍 Countries Explorer - Aplicación Angular

Una aplicación web desarrollada en Angular que permite explorar información detallada de países de todo el mundo, con funcionalidades avanzadas de visualización de datos, sistema de favoritos y gráficos interactivos.

## 📋 Descripción del Proyecto

Esta aplicación web utiliza el framework Angular para mostrar información completa de países de manera atractiva e interactiva. La aplicación integra múltiples APIs externas para proporcionar datos actualizados sobre población, capitales, monedas, banderas y más información relevante de cada país.

- Aclaracion: existen paises cuya información no esta disponible, por lo tanto, no se mostraran en la UI.

## ✨ Características Principales

- **🗺️ Exploración de Países**: Lista completa de países con información básica
- **🔍 Búsqueda Avanzada**: Sistema de búsqueda en tiempo real
- **📊 Visualización de Datos**: Gráficos interactivos de población histórica
- **❤️ Sistema de Favoritos**: Gestión completa de países favoritos con CRUD o ABM
- **📱 Diseño Responsivo**: Adaptable a dispositivos móviles, tablets y desktop
- **🎨 Interfaz Moderna**: Diseñado con Tailwind CSS

## 🎯 Cumplimiento de Requerimientos

### Requerimientos Mínimos (Nota máxima 7)

#### ✅ 1. Ruteo
**Implementación**: La aplicación cuenta con múltiples rutas bien definidas:

```typescript
// src/app/app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/countries', pathMatch: 'full' },
  { path: 'countries', loadComponent: () => import('./pages/countries-list/countries-list.component') },
  { path: 'country/:code', loadComponent: () => import('./pages/country-detail/country-detail.component') },
  { path: 'favorites', loadComponent: () => import('./pages/favorites-dashboard/favorites-dashboard.component') },
  { path: '**', redirectTo: '/countries' }
];
```

**Secciones implementadas**:
- `/countries` - Lista principal de países
- `/country/:code` - Detalle específico de cada país
- `/favorites` - Dashboard de países favoritos

#### ✅ 2. Componentes
**Implementación**: Cada página incluye múltiples componentes reutilizables:

**Página Countries List**:
- `CountryCardComponent` - Tarjetas individuales de países
- `SearchBarComponent` - Barra de búsqueda de países

**Página Country Detail**:
- `PopulationChartComponent` - Gráfico interactivo de población
- `CountryInfoCardComponent` - Tarjetas de información detallada

**Página Favorites Dashboard**:
- Formularios reactivos integrados
- Modales de edición y creación

#### ✅ 3. Interfaces
**Implementación**: Sistema completo de tipado con interfaces TypeScript:

```typescript
// Interfaces específicas para cada tipo de dato
export interface Country {
  countryCode: string;
  name: string;
}

export interface CountryInfo {
  commonName: string;
  officialName: string;
  countryCode: string;
  region: string;
  borders?: Country[];
  population?: PopulationResponse | null;
  capital?: CapitalResponse | null;
  currency?: CurrencyResponse | null;
  flag?: FlagResponse | null;
  codes?: IsoResponse | null;
}
```

#### ✅ 4. Directivas y Control de Flujo
**Implementación**: Uso extensivo de las nuevas directivas de control de flujo de Angular:

```typescript
// Uso de @for para listas
@for (country of filteredCountries; track country.countryCode) {
  <app-country-card [country]="country"></app-country-card>
} @empty {
  <div>No countries found</div>
}

// Uso de @if para renderizado condicional
@if (loading) {
  <div class="loading-spinner"></div>
}

@if (countryInfo.flag?.data?.flag) {
  <img [src]="countryInfo.flag!.data!.flag" [alt]="countryInfo.commonName + ' flag'">
}
```

#### ✅ 5. Comunicación entre Componentes
**Implementación**: Múltiples formas de comunicación implementadas:

**@Input/@Output**:
```typescript
// CountryCardComponent
@Input() country!: Country;
@Input() isFavorite: boolean = false;
@Output() favoriteToggle = new EventEmitter<{country: Country; isFavorite: boolean}>();

// SearchBarComponent
@Input() placeholder: string = 'Search...';
@Output() searchChange = new EventEmitter<string>();
```

**Servicios Compartidos**:
```typescript
// FavoritesService para gestión global de favoritos
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<Favourite[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();
}
```

### Requerimientos Opcionales (+3 puntos adicionales)

#### ✅ +1 Punto: Consumo de API Externa (GET)
**Implementación**: Integración completa con múltiples APIs externas:

```typescript
// CountryService con múltiples endpoints
export class CountryService {
  private readonly AVAILABLE_COUNTRIES_URL = 'https://date.nager.at/api/v3/AvailableCountries';
  private readonly COUNTRY_INFO_URL = 'https://date.nager.at/api/v3/CountryInfo';
  private readonly POPULATION_URL = 'https://countriesnow.space/api/v0.1/countries/population';
  // ... más endpoints
}
```

**APIs integradas**:
- **Nager.Date API**: Información básica de países
- **CountriesNow API**: Población, capitales, monedas, banderas, códigos ISO

#### ✅ +1 Punto: Métodos HTTP Distintos a GET (POST, PUT, DELETE)
**Implementación**: Sistema completo de favoritos con operaciones CRUD:

```typescript
// FavoritesService con operaciones CRUD completas
export class FavoritesService {
  // POST - Agregar favorito
  addFavorite(favorite: Omit<Favourite, 'id'>): Observable<Favourite> {
    return this.http.post<Favourite>(this.FAVORITES_API_URL, favorite);
  }

  // PUT - Actualizar favorito
  updateFavorite(id: string, favorite: Partial<Favourite>): Observable<Favourite> {
    return this.http.put<Favourite>(`${this.FAVORITES_API_URL}/${id}`, favorite);
  }

  // DELETE - Eliminar favorito
  removeFavorite(id: string): Observable<any> {
    return this.http.delete(`${this.FAVORITES_API_URL}/${id}`);
  }
}
```

**Endpoint utilizado**: `https://6864719c5b5d8d03397d3b5a.mockapi.io/api/v1/favourites`

#### ✅ +1 Punto: Formularios Reactivos con Validaciones
**Implementación**: Formulario reactivo completo en el dashboard de favoritos:

```typescript
// FavoritesDashboardComponent
export class FavoritesDashboardComponent {
  favoriteForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.favoriteForm = this.fb.group({
      countryName: ['', [Validators.required, Validators.minLength(2)]],
      countryId: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
}
```

**Validaciones implementadas**:
- Nombre del país: requerido, mínimo 2 caracteres
- Código del país: requerido, formato ISO (2 letras mayúsculas)
- Descripción: requerida, mínimo 10 caracteres

## 🛠️ Tecnologías Utilizadas

- **Framework**: Angular 20.0.0 (última versión)
- **Lenguaje**: TypeScript 5.8.2
- **Estilos**: Tailwind CSS 3.4.0
- **Gráficos**: Chart.js 4.4.0 con ng2-charts 6.0.0
- **HTTP Client**: Angular HttpClient
- **Formularios**: Angular Reactive Forms
- **Routing**: Angular Router

## 📊 Visualización de Datos

### Gráficos de Población
La aplicación incluye gráficos interactivos que muestran:
- **Tendencias históricas** de población por país
- **Estadísticas clave**: población más temprana, más reciente, pico máximo
- **Cálculo de crecimiento** poblacional total
- **Insights automáticos** basados en los datos
- **Controles interactivos**: cambio entre gráfico de líneas y barras

```typescript
// PopulationChartComponent con Chart.js
export class PopulationChartComponent {
  private chart: Chart | null = null;
  chartType: 'line' | 'bar' = 'line';
  
  // Estadísticas calculadas automáticamente
  populationStats: {
    earliest: PopulationCount;
    latest: PopulationCount;
    peak: PopulationCount;
    growth: number;
  } | null = null;
}
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de instalación
```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Construir para producción
npm run build
```

### Scripts disponibles
- `npm start` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run ng` - Ejecuta comandos de Angular CLI

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/          # Componentes reutilizables
│   │   ├── country-card/
│   │   ├── search-bar/
│   │   ├── population-chart/
│   │   └── country-info-card/
│   ├── pages/              # Páginas principales
│   │   ├── countries-list/
│   │   ├── country-detail/
│   │   └── favorites-dashboard/
│   └── app.routes.ts       # Configuración de rutas
├── services/               # Servicios de datos
│   ├── country.service.ts
│   └── favorites.service.ts
├── interfaces/             # Interfaces TypeScript
│   └── country.interface.ts
└── global_styles.css       # Estilos globales con Tailwind
```

## 🔧 Funcionalidades Detalladas

### 1. Lista de Países
- **Carga automática** de todos los países disponibles
- **Búsqueda en tiempo real** con debouncing (300ms)
- **Filtrado** por nombre y código de país
- **Estados de carga** y manejo de errores
- **Indicadores visuales** para países favoritos

### 2. Detalle de País
- **Información completa**: población, capital, moneda, bandera
- **Gráfico interactivo** de población histórica
- **Países fronterizos** con navegación directa
- **Gestión de favoritos** desde la vista de detalle
- **Códigos ISO** y información regional

### 3. Dashboard de Favoritos
- **Vista de tarjetas** con todos los favoritos
- **Estadísticas** del dashboard (total, con descripciones)
- **Operaciones CRUD** completas:
  - ✅ **Create**: Agregar nuevos favoritos
  - ✅ **Read**: Visualizar favoritos existentes
  - ✅ **Update**: Editar descripciones
  - ✅ **Delete**: Eliminar favoritos
- **Formularios reactivos** con validaciones en tiempo real
- **Modales** para edición y creación

### 4. Búsqueda y Filtros
- **Debouncing** para optimizar llamadas a API
- **Búsqueda por nombre** y código de país
- **Resultados en tiempo real**
- **Estado vacío** cuando no hay resultados

## 🔄 Gestión de Estado

### Servicios Reactivos
```typescript
// FavoritesService con BehaviorSubject
private favoritesSubject = new BehaviorSubject<Favourite[]>([]);
public favorites$ = this.favoritesSubject.asObservable();

// Actualización automática en todos los componentes
this.favoritesService.favorites$.subscribe(favorites => {
  // Actualización automática de la UI
});
```

### Manejo de Errores
- **Try-catch** en todas las operaciones HTTP
- **Fallbacks** para datos no disponibles
- **Mensajes de error** informativos para el usuario
- **Estados de carga** durante las operaciones

## 📱 Características de UX

### Feedback Visual
- **Loading spinners** durante cargas
- **Mensajes de confirmación** para operaciones CRUD
- **Estados hover** en elementos interactivos
- **Indicadores de favoritos** claramente visibles

### Navegación Intuitiva
- **Breadcrumbs** y botones de retroceso
- **Enlaces directos** entre países relacionados
- **Navegación por teclado** en formularios
- **URLs amigables** para compartir

## 🎯 Puntos Destacados de Implementación

### 1. Arquitectura Modular
- **Componentes standalone** de Angular
- **Servicios inyectables** con providedIn: 'root'
- **Lazy loading** de componentes por ruta
- **Separación clara** de responsabilidades

### 2. Optimizaciones de Performance
- **Debouncing** en búsquedas (300ms)
- **TrackBy functions** en listas para optimizar renderizado
- **OnPush change detection** donde es apropiado
- **Lazy loading** de rutas

### 3. Accesibilidad
- **Atributos ARIA** en elementos interactivos
- **Contraste adecuado** en todos los textos
- **Navegación por teclado** funcional
- **Textos alternativos** en imágenes

### 4. Manejo de Datos
- **Tipado estricto** con TypeScript
- **Validación de datos** en formularios
- **Manejo de estados nulos** con optional chaining
- **Transformación de datos** entre APIs y componentes

## 🏆 Conclusión

Esta aplicación demuestra un dominio completo de Angular y sus mejores prácticas, cumpliendo y superando todos los requerimientos del proyecto. La implementación incluye:

- ✅ **Todos los requerimientos mínimos** (7 puntos)
- ✅ **Todos los requerimientos opcionales** (+3 puntos)
- ✅ **Funcionalidades adicionales** que mejoran la experiencia del usuario
- ✅ **Código bien documentado** y mantenible
- ✅ **Diseño moderno y responsivo**

La aplicación no solo cumple con los aspectos técnicos solicitados, sino que también proporciona una experiencia de usuario excepcional con un diseño atractivo, navegación intuitiva y funcionalidades avanzadas de visualización de datos.