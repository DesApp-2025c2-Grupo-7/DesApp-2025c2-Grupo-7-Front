import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import type { Prestador } from '../../types/prestadores';
import './GraficoPrestadoresPorEspecialidad.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet } from 'lucide-react';

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

  const descargarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('Reporte Detallado de Prestadores por Especialidad', 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 22);
    doc.text(`Total de prestadores: ${prestadores.length}`, 14, 27);

    let yPos = 35;

    // Agrupar prestadores por especialidad
    const prestadoresPorEspecialidad = new Map<string, Prestador[]>();
    
    prestadores.forEach(prestador => {
      if (prestador.especialidades && prestador.especialidades.length > 0) {
        prestador.especialidades.forEach(esp => {
          const nombre = esp.nombre;
          if (!prestadoresPorEspecialidad.has(nombre)) {
            prestadoresPorEspecialidad.set(nombre, []);
          }
          prestadoresPorEspecialidad.get(nombre)?.push(prestador);
        });
      } else {
        if (!prestadoresPorEspecialidad.has('Sin especialidad')) {
          prestadoresPorEspecialidad.set('Sin especialidad', []);
        }
        prestadoresPorEspecialidad.get('Sin especialidad')?.push(prestador);
      }
    });

    // Ordenar por cantidad
    const especialidadesOrdenadas = Array.from(prestadoresPorEspecialidad.entries())
      .sort((a, b) => b[1].length - a[1].length);

    especialidadesOrdenadas.forEach(([especialidad, prestadoresEsp], index) => {
      if (index > 0) {
        doc.addPage();
        yPos = 20;
      }

      // Título de especialidad
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${especialidad} (${prestadoresEsp.length} prestadores)`, 14, yPos);
      yPos += 7;

      // Tabla de prestadores
      const datosPrestadores: any[] = [];
      
      prestadoresEsp.forEach(prest => {
        const direcciones = prest.direccion
          ?.filter(dir => !dir.esDireccionCentroMedico)
          .map(dir => `${dir.calle} ${dir.numero}, ${dir.localidad} (${dir.codigoPostal})`)
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
          prest.numeroCUIL,
          prest.telefono?.[0] || '-',
          prest.email?.[0] || '-',
          direcciones,
          horarios
        ]);
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Nombre', 'Tipo', 'CUIL', 'Teléfono', 'Email', 'Direcciones', 'Horarios']],
        body: datosPrestadores,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [75, 129, 216] },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 35 },
          6: { cellWidth: 30 }
        }
      });
    });

    doc.save(`prestadores_por_especialidad_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const descargarExcel = () => {
    const datosExcel: any[] = [];

    prestadores.forEach(prestador => {
      const especialidades = prestador.especialidades?.map(e => e.nombre).join(', ') || 'Sin especialidad';
      const telefonos = prestador.telefono?.join(', ') || '-';
      const emails = prestador.email?.join(', ') || '-';

      // Direcciones propias (no del centro médico si es profesional)
      const direccionesPropias = prestador.direccion?.filter(dir => !dir.esDireccionCentroMedico) || [];

      // Construir string de direcciones
      const direccionesTexto = direccionesPropias.length > 0
        ? direccionesPropias.map(dir => `${dir.calle} ${dir.numero}, ${dir.localidad} (CP: ${dir.codigoPostal})`).join(' | ')
        : '-';

      // Construir string completo de horarios con toda la información
      const horariosTexto = direccionesPropias.length > 0
        ? direccionesPropias.map(dir => {
            const dirLabel = `${dir.calle} ${dir.numero}`;
            const horarios = dir.horariosAtencion || [];
            if (horarios.length > 0) {
              return horarios.map(hor => 
                `${dirLabel}: ${hor.dia} ${hor.desde}-${hor.hasta} (${hor.duracionTurno}min${hor.especialidad?.nombre ? `, ${hor.especialidad.nombre}` : ''})`
              ).join(' | ');
            }
            return `${dirLabel}: Sin horarios`;
          }).join(' | ')
        : '-';

      datosExcel.push({
        'Nombre': prestador.nombreCompleto,
        'Tipo': prestador.esProfesionalIndependiente ? 'Profesional Independiente' : 'Centro Médico',
        'CUIL': prestador.numeroCUIL,
        'Especialidades': especialidades,
        'Teléfonos': telefonos,
        'Emails': emails,
        'Estado': prestador.fechaBaja ? 'Inactivo' : 'Activo',
        'Direcciones': direccionesTexto,
        'Horarios': horariosTexto
      });
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
      { wch: 50 }, // Direcciones
      { wch: 80 }  // Horarios
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `prestadores_por_especialidad_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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
        <div>
          <h3>Distribución de Prestadores por Especialidad</h3>
          <p className="grafico-pie-descripcion">Total: {prestadores.length} prestadores</p>
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
