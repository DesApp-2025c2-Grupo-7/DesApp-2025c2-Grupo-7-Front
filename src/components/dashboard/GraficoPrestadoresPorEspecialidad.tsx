import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const data = contarPorEspecialidad();

  // Paleta de colores
  const COLORS = [
    '#4B81D8', '#8196c7', '#ff9d0a', '#5cb85c', '#f0ad4e', 
    '#d9534f', '#5bc0de', '#292b2c', '#0275d8', '#5a6268',
    '#17a2b8', '#6c757d', '#28a745', '#ffc107', '#dc3545'
  ];

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
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
    </div>
  );
};

export default GraficoPrestadoresPorEspecialidad;
