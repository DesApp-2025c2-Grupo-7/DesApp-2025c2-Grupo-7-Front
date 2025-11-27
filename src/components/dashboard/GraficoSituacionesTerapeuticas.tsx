import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
      .map(([nombre, value]) => ({ nombre, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, topN);
  };

  const data = contarDiagnosticos();

  // Colores para el gráfico
  const colors = ['#4B81D8', '#8196c7', '#ff9d0a', '#5cb85c', '#f0ad4e', '#d9534f', '#5bc0de', '#292b2c', '#0275d8', '#5a6268'];

  // Custom label para mostrar porcentaje
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // No mostrar label si es menos del 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              nameKey="nombre"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              itemStyle={{ color: '#606060' }}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value: string) => <span style={{ color: '#424242', fontSize: '0.9rem' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grafico-footer">
        <span className="grafico-total">Total de situaciones: {situaciones.length}</span>
      </div>
    </div>
  );
};

export default GraficoSituacionesTerapeuticas;
