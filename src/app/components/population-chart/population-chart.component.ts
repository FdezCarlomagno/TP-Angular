import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { PopulationCount } from '../../../interfaces/country.interface';

// Registrar componentes de Chart.js
Chart.register(...registerables);

/**
 * Componente para mostrar datos de población en un gráfico interactivo
 * Usa la librería Chart.js para crear gráficos de líneas responsivos
 * Demuestra visualización de datos y gestión del ciclo de vida
 */
@Component({
  selector: 'app-population-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./population-chart.component.html`
})
export class PopulationChartComponent implements OnInit, OnDestroy, AfterViewInit {
  // Propiedades de entrada para los datos del gráfico
  @Input() populationData: PopulationCount[] = [];
  @Input() countryName: string = '';

  // ViewChild para acceder al elemento canvas
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  // Instancia del gráfico y configuración
  private chart: Chart | null = null;
  loading = true;
  chartType: 'line' | 'bar' = 'line';
  showAllData = false;

  // Propiedades calculadas para datos estadísticos
  populationStats: {
    earliest: PopulationCount;
    latest: PopulationCount;
    peak: PopulationCount;
    growth: number;
  } | null = null;

  insights: string[] = [];

  ngOnInit(): void {
    this.processData();  
  }

  ngAfterViewInit() : void {
    this.createChart();
    this.loading = false;
  }

  ngOnDestroy(): void {
    // Destruir el gráfico para evitar pérdidas de memoria
    if (this.chart) {
      this.chart.destroy();
    }
  }

  /**
   * Procesa los datos de población para generar estadísticas e insights
   */
  private processData(): void {
    if (this.populationData.length === 0) return;

    const sortedData = [...this.populationData].sort((a, b) => a.year - b.year);

    const earliest = sortedData[0];
    const latest = sortedData[sortedData.length - 1];
    const peak = sortedData.reduce((max, current) =>
      current.value > max.value ? current : max
    );

    const growth = ((latest.value - earliest.value) / earliest.value) * 100;

    this.populationStats = {
      earliest,
      latest,
      peak,
      growth
    };

    this.generateInsights(sortedData);
  }

  /**
   * Genera frases informativas basadas en la evolución de la población
   * @param data - Datos de población ordenados por año
   */
  private generateInsights(data: PopulationCount[]): void {
    this.insights = [];

    if (data.length < 2) return;

    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const growth = ((lastValue - firstValue) / firstValue) * 100;

    // Crecimiento poblacional
    if (growth > 50) {
      this.insights.push(`La población ha crecido significativamente en un ${growth.toFixed(1)}% durante el período registrado.`);
    } else if (growth < -10) {
      this.insights.push(`La población ha disminuido en un ${Math.abs(growth).toFixed(1)}% durante el período registrado.`);
    } else {
      this.insights.push(`La población se ha mantenido relativamente estable con un cambio del ${growth.toFixed(1)}%.`);
    }

    // Año de pico
    const peakYear = this.populationStats?.peak.year;
    const latestYear = data[data.length - 1].year;

    if (peakYear && peakYear < latestYear) {
      this.insights.push(`La población alcanzó su punto máximo en ${peakYear} y ha disminuido desde entonces.`);
    }

    // Períodos de crecimiento rápido
    let rapidGrowthPeriods = 0;
    for (let i = 1; i < data.length; i++) {
      const yearGrowth = ((data[i].value - data[i - 1].value) / data[i - 1].value) * 100;
      if (yearGrowth > 3) rapidGrowthPeriods++;
    }

    if (rapidGrowthPeriods > data.length * 0.3) {
      this.insights.push('El país experimentó varios períodos de rápido crecimiento poblacional.');
    }
  }

  /**
   * Crea y configura el gráfico con Chart.js
   */
  private createChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartData = this.getChartData();

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: this.chartType,
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Población',
          data: chartData.data,
          borderColor: '#3b82f6',
          backgroundColor: this.chartType === 'line' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.8)',
          borderWidth: 2,
          fill: this.chartType === 'line',
          tension: 0.1,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `Población: ${this.formatPopulation(value)}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Año'
            },
            grid: {
              display: false
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Población'
            },
            ticks: {
              callback: (value) => {
                return this.formatPopulation(Number(value));
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  /**
   * Prepara los datos para el gráfico según las configuraciones actuales
   * @returns Objeto con etiquetas y datos para Chart.js
   */
  private getChartData(): { labels: string[]; data: number[] } {
    let data = [...this.populationData].sort((a, b) => a.year - b.year);

    if (!this.showAllData && data.length > 10) {
      data = data.slice(-10);
    }

    return {
      labels: data.map(item => item.year.toString()),
      data: data.map(item => item.value)
    };
  }

  /**
   * Alterna entre gráfico de líneas y barras
   */
  toggleChartType(): void {
    this.chartType = this.chartType === 'line' ? 'bar' : 'line';
    this.createChart();
  }

  /**
   * Alterna entre mostrar todos los datos o solo los más recientes
   */
  toggleDataView(): void {
    this.showAllData = !this.showAllData;
    this.createChart();
  }

  /**
   * Da formato a los valores poblacionales para mostrarlos con unidades
   * @param value - Valor a formatear
   * @returns String con el número formateado
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
