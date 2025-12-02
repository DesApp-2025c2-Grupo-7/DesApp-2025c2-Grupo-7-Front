import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Prestador } from '../../types/prestadores';
import './GraficoPrestadoresPorCodigoPostal.css';

interface Props {
  prestadores: Prestador[];
  topN?: number;
}

const GraficoPrestadoresPorCodigoPostal: React.FC<Props> = ({ prestadores, topN = 10 }) => {
  // Contar prestadores por código postal y localidad
  const contadorPorCP: { [key: string]: { count: number, localidad: string, cp: string } } = {};

  prestadores.forEach(prestador => {
    if (prestador.direccion && prestador.direccion.length > 0) {
      // Crear un Set para evitar contar el mismo prestador más de una vez por localidad
      const localidadesContadas = new Set<string>();
      
      prestador.direccion.forEach(dir => {
        // Si es centro médico, solo contar direcciones originales (no las copiadas de profesionales)
        // Si es profesional independiente, solo contar direcciones que NO sean del centro médico
        const debeContar = prestador.esProfesionalIndependiente 
          ? !dir.esDireccionCentroMedico  // Profesional: solo sus direcciones propias
          : true;  // Centro médico: todas sus direcciones (las de profesionales ya están filtradas por el profesional)
        
        if (debeContar) {
          const cp = dir.codigoPostal || 'Sin CP';
          const localidad = dir.localidad || 'Sin localidad';
          const key = `${localidad}-${cp}`;
          
          // Solo contar una vez por prestador por localidad/CP
          if (!localidadesContadas.has(key)) {
            localidadesContadas.add(key);
            
            if (!contadorPorCP[key]) {
              contadorPorCP[key] = { count: 0, localidad, cp };
            }
            contadorPorCP[key].count++;
          }
        }
      });
    }
  });

  // Convertir a array y ordenar por cantidad (descendente)
  const dataArray = Object.values(contadorPorCP)
    .map(item => ({
      nombre: item.cp !== 'Sin CP' ? `${item.localidad} (CP ${item.cp})` : item.localidad,
      value: item.count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);

  const data = dataArray;

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
          <h3>Prestadores por Código Postal</h3>
          <p className="grafico-descripcion">Distribución de prestadores por zona geográfica</p>
        </div>
        <div className="grafico-sin-datos">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grafico-container">
      <div className="grafico-header">
        <h3>Prestadores por Código Postal</h3>
        <p className="grafico-descripcion">Cantidad de prestadores registrados por zona geográfica</p>
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
        <span className="grafico-total">Total de prestadores: {data.reduce((sum, item) => sum + item.value, 0)}</span>
      </div>
    </div>
  );
};

export default GraficoPrestadoresPorCodigoPostal;
