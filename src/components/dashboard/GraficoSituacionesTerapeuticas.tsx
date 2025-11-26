import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SituacionTerapeutica } from '../../types/afiliados';
import './GraficoSituacionesTerapeuticas.css';

interface Props {
  situaciones: SituacionTerapeutica[];
  topN?: number;
}

const GraficoSituacionesTerapeuticas: React.FC<Props> = ({ situaciones, topN = 10 }) => {
  // Contar frecuencia de cada diagnóstico
  const contarDiagnosticos = () => {
    const conteo = new Map<string, number>();
    
    situaciones.forEach((situacion) => {
      const diagnostico = situacion.diagnostico || 'Sin diagnóstico';
      conteo.set(diagnostico, (conteo.get(diagnostico) || 0) + 1);
    });

    // Convertir a array y ordenar por frecuencia
    return Array.from(conteo.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, topN);
  };

  const data = contarDiagnosticos();

  // Colores para las barras
  const colors = ['#4B81D8', '#8196c7', '#ff9d0a', '#5cb85c', '#f0ad4e', '#d9534f', '#5bc0de', '#292b2c', '#0275d8', '#5cb85c'];

  if (data.length === 0) {
    return (
      <div className="grafico-container">
        <div className="grafico-header">
          <h3>Diagnósticos Más Frecuentes</h3>
          <p className="grafico-descripcion">Top {topN} situaciones terapéuticas</p>
        </div>
        <div className="grafico-sin-datos">
          <p>No hay situaciones terapéuticas registradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grafico-container">
      <div className="grafico-header">
        <h3>Diagnósticos Más Frecuentes</h3>
        <p className="grafico-descripcion">Top {topN} situaciones terapéuticas activas y finalizadas</p>
      </div>
      <div className="grafico-content">
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
      <div className="grafico-footer">
        <span className="grafico-total">Total de situaciones: {situaciones.length}</span>
      </div>
    </div>
  );
};

export default GraficoSituacionesTerapeuticas;
