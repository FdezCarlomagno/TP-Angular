// Interfaz genérica para respuestas de API
export interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
}

// Interfaz para país básico
export interface Country {
  countryCode: string;
  name: string;
}

// Interfaz para información detallada de país
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

// Interfaz para datos de población
export interface PopulationData {
  data?: {
    country: string;
    code: string;
    populationCounts: PopulationCount[];
  };
}

export interface PopulationCount {
  year: number;
  value: number;
}

// Interfaz para respuesta de población de la API
export interface PopulationResponse {
  error: boolean;
  msg: string;
  data: {
    country: string;
    code: string;
    populationCounts: PopulationCount[];
  };
}

// Interfaz para datos de capital
export interface CapitalData {
  data?: {
    name: string;
    capital: string;
    iso2: string;
    iso3: string;
  };
}

// Interfaz para respuesta de capital
export interface CapitalResponse {
  error: boolean;
  msg: string;
  data: {
    name: string;
    capital: string;
    iso2: string;
    iso3: string;
  };
}

// Interfaz para datos de moneda
export interface CurrencyData {
  data?: {
    name: string;
    currency: string;
    iso2: string;
    iso3: string;
  };
}

// Interfaz para respuesta de moneda
export interface CurrencyResponse {
  error: boolean;
  msg: string;
  data: {
    name: string;
    currency: string;
    iso2: string;
    iso3: string;
  };
}

// Interfaz para datos de bandera
export interface FlagData {
  data?: {
    name: string;
    flag: string;
    iso2: string;
    iso3: string;
  };
}

// Interfaz para respuesta de bandera
export interface FlagResponse {
  error: boolean;
  msg: string;
  data: {
    name: string;
    flag: string;
    iso2: string;
    iso3: string;
  };
}

// Interfaz para códigos ISO
export interface IsoData {
  data?: {
    name: string;
    Iso2: string;
    Iso3: string;
  };
}

// Interfaz para respuesta de ISO
export interface IsoResponse {
  error: boolean;
  msg: string;
  data: {
    name: string;
    Iso2: string;
    Iso3: string;
  };
}

// Interfaces para estados
export interface State {
  name: string;
  state_code: string;
}

export interface StateData {
  name: string;
  iso3: string;
  iso2: string;
  states: State[];
}

export interface StateResponse {
  error: boolean;
  msg: string;
  data: StateData;
}

// Interface para favoritos
export interface Favourite {
  id?: string;
  countryId: string;
  countryName: string;
  description: string;
}

// Interface para ciudades
export interface CitiesResponse {
  error: boolean;
  msg: string;
  data: string[];
}