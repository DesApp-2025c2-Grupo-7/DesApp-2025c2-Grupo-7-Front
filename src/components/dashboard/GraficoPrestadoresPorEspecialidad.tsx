import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import type { Prestador } from '../../types/prestadores';
import './GraficoPrestadoresPorEspecialidad.css';

interface Props {
  prestadores: Prestador[];
}

const GraficoPrestadoresPorEspecialidad: React.FC<Props> = ({ prestadores }) => {
  // Contar prestadores por especialidad
  const contarPorEspecialidad = () => {
    const conteo = new Map<string, number>();
    
    prestadores.forEach((prestador) => {
      if (prestador.especialidades && prestador.especialidades.length > 0) {
        prestador.especialidades.forEach((esp: any) => {
          const nombre = typeof esp === 'string' ? esp : esp.nombre;
          conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
        });
      } else {
        conteo.set('Sin especialidad', (conteo.get('Sin especialidad') || 0) + 1);
      }
    });

    return Array.from(conteo.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  };

  const data = contarPorEspecialidad();

  // Paleta de colores
  const colors = [
    '#4B81D8', '#8196c7', '#ff9d0a', '#5cb85c', '#f0ad4e', 
    '#d9534f', '#5bc0de', '#292b2c', '#0275d8', '#5a6268',
    '#17a2b8', '#6c757d', '#28a745', '#ffc107', '#dc3545'
  ];

  if (data.length === 0) {
    return (
      <div className="grafico-pie-container">
        <div className="grafico-pie-header">
          <h3>Distribución de Prestadores por Especialidad</h3>
          <p className="grafico-pie-descripcion">Cantidad de prestadores por área</p>
        </div>
        <div className="grafico-sin-datos">
          <p>No hay prestadores registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grafico-pie-container">
      <div className="grafico-pie-header">
        <h3>Distribución de Prestadores por Especialidad</h3>
        <p className="grafico-pie-descripcion">Total: {prestadores.length} prestadores</p>
      </div>
      <div className="grafico-pie-content">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart 
            data={data}
            margin={{ top: 5, right: 10, left: 5, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
            <XAxis 
              dataKey="nombre" 
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
              tick={{ fill: '#606060', fontSize: 12 }}
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fill: '#606060', fontSize: 12 }}
              label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', fill: '#424242' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: '#424242', fontWeight: 600 }}
              itemStyle={{ color: '#606060' }}
            />
            <Bar 
              dataKey="cantidad" 
              radius={[8, 8, 0, 0]}
              maxBarSize={80}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraficoPrestadoresPorEspecialidad;
