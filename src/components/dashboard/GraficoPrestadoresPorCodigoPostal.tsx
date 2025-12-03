import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Prestador } from '../../types/prestadores';
import './GraficoPrestadoresPorCodigoPostal.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet } from 'lucide-react';

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

  const descargarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('Reporte Detallado de Prestadores por Código Postal', 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 22);
    doc.text(`Total de prestadores: ${prestadores.length}`, 14, 27);

    let yPos = 35;

    // Agrupar prestadores por localidad-CP
    const prestadoresPorCP = new Map<string, Prestador[]>();
    
    prestadores.forEach(prestador => {
      if (prestador.direccion && prestador.direccion.length > 0) {
        const localidadesContadas = new Set<string>();
        
        prestador.direccion.forEach(dir => {
          const debeContar = prestador.esProfesionalIndependiente 
            ? !dir.esDireccionCentroMedico
            : true;
          
          if (debeContar) {
            const cp = dir.codigoPostal || 'Sin CP';
            const localidad = dir.localidad || 'Sin localidad';
            const key = `${localidad} (CP ${cp})`;
            
            if (!localidadesContadas.has(key)) {
              localidadesContadas.add(key);
              
              if (!prestadoresPorCP.has(key)) {
                prestadoresPorCP.set(key, []);
              }
              prestadoresPorCP.get(key)?.push(prestador);
            }
          }
        });
      }
    });

    // Ordenar por cantidad
    const localizacionesOrdenadas = Array.from(prestadoresPorCP.entries())
      .sort((a, b) => b[1].length - a[1].length);

    localizacionesOrdenadas.forEach(([localizacion, prestadoresLoc], index) => {
      if (index > 0) {
        doc.addPage();
        yPos = 20;
      }

      // Título de localización
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${localizacion} (${prestadoresLoc.length} prestadores)`, 14, yPos);
      yPos += 7;

      // Tabla de prestadores
      const datosPrestadores: any[] = [];
      
      prestadoresLoc.forEach(prest => {
        const especialidades = prest.especialidades?.map(e => e.nombre).join(', ') || 'Sin especialidad';
        
        const direcciones = prest.direccion
          ?.filter(dir => !dir.esDireccionCentroMedico)
          .map(dir => `${dir.calle} ${dir.numero}`)
          .join('; ') || 'Sin direcciones';

        const horarios = prest.direccion
          ?.filter(dir => !dir.esDireccionCentroMedico)
          .flatMap(dir => dir.horariosAtencion || [])
          .map(hor => `${hor.dia} ${hor.desde}-${hor.hasta}`)
          .slice(0, 3)
          .join('; ') || 'Sin horarios';

        datosPrestadores.push([
          prest.nombreCompleto,
          prest.esProfesionalIndependiente ? 'Profesional' : 'Centro Médico',
          especialidades,
          prest.telefono?.[0] || '-',
          direcciones,
          horarios
        ]);
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Nombre', 'Tipo', 'Especialidades', 'Teléfono', 'Direcciones', 'Horarios']],
        body: datosPrestadores,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [75, 129, 216] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 20 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 }
        }
      });
    });

    doc.save(`prestadores_por_codigo_postal_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const descargarExcel = () => {
    const datosExcel: any[] = [];

    prestadores.forEach(prestador => {
      const especialidades = prestador.especialidades?.map(e => e.nombre).join(', ') || 'Sin especialidad';
      const telefonos = prestador.telefono?.join(', ') || '-';
      const emails = prestador.email?.join(', ') || '-';

      // Direcciones propias (no del centro médico si es profesional)
      const direccionesPropias = prestador.direccion?.filter(dir => !dir.esDireccionCentroMedico) || [];

      if (direccionesPropias.length > 0) {
        // Una fila por cada dirección
        direccionesPropias.forEach(dir => {
          // Construir string de horarios para esta dirección
          const horarios = dir.horariosAtencion || [];
          const horariosTexto = horarios.length > 0
            ? horarios.map(hor => 
                `${hor.dia} ${hor.desde}-${hor.hasta} (${hor.duracionTurno}min${hor.especialidad?.nombre ? `, ${hor.especialidad.nombre}` : ''})`
              ).join(' | ')
            : 'Sin horarios';

          datosExcel.push({
            'Nombre': prestador.nombreCompleto,
            'Tipo': prestador.esProfesionalIndependiente ? 'Profesional Independiente' : 'Centro Médico',
            'CUIL': prestador.numeroCUIL,
            'Especialidades': especialidades,
            'Teléfonos': telefonos,
            'Emails': emails,
            'Estado': prestador.fechaBaja ? 'Inactivo' : 'Activo',
            'Dirección': `${dir.calle || ''} ${dir.numero || ''}`.trim() || '-',
            'Localidad': dir.localidad || '-',
            'Código Postal': dir.codigoPostal || '-',
            'Horarios': horariosTexto
          });
        });
      } else {
        // Si no tiene direcciones, una fila con datos del prestador
        datosExcel.push({
          'Nombre': prestador.nombreCompleto,
          'Tipo': prestador.esProfesionalIndependiente ? 'Profesional Independiente' : 'Centro Médico',
          'CUIL': prestador.numeroCUIL,
          'Especialidades': especialidades,
          'Teléfonos': telefonos,
          'Emails': emails,
          'Estado': prestador.fechaBaja ? 'Inactivo' : 'Activo',
          'Dirección': '-',
          'Localidad': '-',
          'Código Postal': '-',
          'Horarios': '-'
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Prestadores');

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 30 }, // Nombre
      { wch: 25 }, // Tipo
      { wch: 15 }, // CUIL
      { wch: 30 }, // Especialidades
      { wch: 20 }, // Teléfonos
      { wch: 25 }, // Emails
      { wch: 10 }, // Estado
      { wch: 30 }, // Dirección
      { wch: 20 }, // Localidad
      { wch: 12 }, // CP
      { wch: 80 }  // Horarios
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `prestadores_por_codigo_postal_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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
        <div>
          <h3>Prestadores por Código Postal</h3>
          <p className="grafico-descripcion">Cantidad de prestadores registrados por zona geográfica</p>
        </div>
        <div className="grafico-acciones">
          <button 
            className="btn-descarga-grafico"
            onClick={descargarPDF}
            title="Descargar reporte detallado en PDF"
          >
            <Download size={16} />
            PDF
          </button>
          <button 
            className="btn-descarga-grafico"
            onClick={descargarExcel}
            title="Descargar reporte detallado en Excel"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
        </div>
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
