import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Chart, ChartConfiguration, ChartOptions, ChartType } from 'chart.js/auto';
@Component({
  selector: 'app-forecast-dialog',
  templateUrl: './forecast-dialog.component.html',
  styleUrls: ['./forecast-dialog.component.css']
})
export class ForecastDialogComponent {

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  constructor(
    public dialogRef: MatDialogRef<ForecastDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productName: string; forecast: any[];  seuil_alerte: number; }
  ) {
    console.log('Forecast Data:', this.data.forecast);
  }
  ngAfterViewInit() {
    // Format dates for better readability
    const labels = this.data.forecast.map(f => {
      const date = new Date(f.ds);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  
    const values = this.data.forecast.map(f => f.yhat);
    
    // Ensure valid values are present
    const validValues = values.filter(v => v != null && !isNaN(v)); // Filter out null or NaN values
    const minY = Math.min(...validValues);
    const maxY = Math.max(...validValues);
    const range = maxY - minY || 1;
    const padding = range * 0.15;
    
    // Get context for gradient and handle null case
    const ctx = this.canvas.nativeElement.getContext('2d');
    
    // Create gradients only if ctx is not null
    let gradientFill: CanvasGradient | string = 'rgba(25, 118, 210, 0.2)';
    let gradientStroke: CanvasGradient | string = '#1976d2';
  
    if (ctx) {
      // Create gradient for the background fill
      gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
      gradientFill.addColorStop(0, 'rgba(25, 118, 210, 0.2)');
      gradientFill.addColorStop(1, 'rgba(17, 82, 147, 0.05)');
    
      // Create gradient for the line stroke
      gradientStroke = ctx.createLinearGradient(0, 0, 800, 0);
      gradientStroke.addColorStop(0, '#1976d2');
      gradientStroke.addColorStop(1, '#115293');
    }
    
  
   
    const thresholdExceeded = values.some(v => v < this.data.seuil_alerte);
   /*  if (thresholdExceeded) {
      alert('Warning: Some values are below the threshold!');
    } */

    new Chart(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Predicted Quantity',
            data: values,
            borderColor: gradientStroke,
            backgroundColor: gradientFill,
            borderWidth: 3,
            pointBackgroundColor: values.map(y =>
              y < this.data.seuil_alerte ? '#e74c3c' : '#2ecc71' // Red for values below threshold
            ),
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: true,
            tension: 0.3,
            cubicInterpolationMode: 'monotone'
          },
          // Add the threshold line dataset
          {
            label: 'Threshold Alert',
            data: Array(labels.length).fill(this.data.seuil_alerte),  // Constant value for the threshold line
            borderColor: '#e74c3c', 
            borderWidth: 2,
            borderDash: [5, 5],  
            pointRadius: 0,      
            fill: false          
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, 
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        },
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleFont: {
              family: "'Poppins', sans-serif",
              size: 16,
              weight: 'bold'
            },
            bodyFont: {
              family: "'Poppins', sans-serif",
              size: 16
            },
            borderColor: '#1976d2',
            titleColor: '#0d47a1',
            bodyColor: '#115293',           
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            displayColors: false,
            caretSize: 6,
            callbacks: {
              title: function (tooltipItems) {
                return tooltipItems[0].label;
              },
              label: function (context) {
                return `Quantity: ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Poppins', sans-serif",
                size: 12
              },
              color: '#7f8c8d',
              maxRotation: 45,
              minRotation: 45
            },
            title: {
              display: true,
              text: 'Date',
              font: {
                family: "'Poppins', sans-serif",
                size: 16
              },
              color: '#2c3e50',
              padding: {
                top: 16
              }
            }
          },
          y: {
            beginAtZero: minY - padding < 0 ? true : false,
            suggestedMin: minY - padding,
            suggestedMax: maxY + padding,
            grid: {
              color: 'rgba(0, 0, 0, 0.03)',
            },
            ticks: {
              font: {
                family: "'Poppins', sans-serif",
                size: 16
              },
              color: '#7f8c8d',
              padding: 12,
              stepSize: Math.max(1, Math.ceil(range / 6)) 
            },
            title: {
              display: true,
              text: 'Quantity',
              font: {
                family: "'Poppins', sans-serif",
                size: 16
              },
              color: '#2c3e50',
              padding: {
                bottom: 12
              }
            }
          }
        },
        elements: {
          point: {
            hitRadius: 12,
            hoverBorderWidth: 3
          },
          line: {
            borderJoinStyle: 'round',
            capBezierPoints: true
          }
        },
        interaction: {
          intersect: false,
          mode: 'index' 
        }
      }
    });
  }
}