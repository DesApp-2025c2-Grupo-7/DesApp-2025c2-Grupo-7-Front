import React, { useState, useEffect } from "react";
import Button from "../genericos/Button";
import type { Direccion, HorarioAtencion, Prestador } from "../../types/prestadores";
import "./ModalDireccion.css";
import { getApiUrl } from "../../config/env";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import { AlertTriangle } from "lucide-react";

interface Especialidad {
  id: number;
  nombre: string;
}

interface ModalDireccionProps {
  prestadorId: number;
  direccion: Direccion | null;
  onClose: () => void;
  onSave: (direccion: Direccion) => void;
  todasDirecciones?: Direccion[];
  especialidadesPrestador?: Especialidad[];
  profesionalesDisponibles?: Prestador[]; // 🆕 Lista de profesionales del centro
  esCentroMedico?: boolean; // 🆕 Indica si es centro médico
}

const ModalDireccion: React.FC<ModalDireccionProps> = ({
  prestadorId,
  direccion,
  onClose,
  onSave,
  todasDirecciones = [],
  especialidadesPrestador = [],
}) => {
  const [form, setForm] = useState<Direccion>(
    direccion || {
      id: 0,
      calle: "",
      numero: "",
      localidad: "",
      codigoPostal: "",
      horariosAtencion: [],
      esTemporal: true,
    }
  );
  const [errores, setErrores] = useState<{ [key: number]: string[] }>({});
  const [advertencias, setAdvertencias] = useState<{ [key: number]: string[] }>({});
  const [prestadorActual, setPrestadorActual] = useState<Prestador | null>(null);
  const [centrosMedicos, setCentrosMedicos] = useState<Prestador[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const normalizarHora = (valor: string) => {
    if (!valor) return "";
    const partes = valor.split(":");
    if (partes.length === 2) return valor;
    if (partes.length === 3) return partes.slice(0, 2).join(":");
    return "";
  };

  // 🔄 Cargar datos del prestador y sus centros médicos
  useEffect(() => {
    const cargarDatos = async () => {
      if (!prestadorId) {
        setCargandoDatos(false);
        return;
      }

      try {
        // Cargar datos del prestador actual
        const resPrestador = await fetch(getApiUrl(`/prestadores/${prestadorId}`));
        if (resPrestador.ok) {
          const dataPrestador = await resPrestador.json();
          setPrestadorActual(dataPrestador);

          // Si es profesional independiente, cargar sus centros médicos
          if (dataPrestador.esProfesionalIndependiente) {
            const resTodosP = await fetch(getApiUrl("/prestadores"));
            if (resTodosP.ok) {
              const todosPrestadores = await resTodosP.json();
              
              // Filtrar centros médicos que tienen este profesional asociado
              const centros = todosPrestadores.filter(
                (p: Prestador) => 
                  !p.esProfesionalIndependiente && 
                  p.profesionales?.some(prof => prof.id === prestadorId)
              );
              setCentrosMedicos(centros);
            }
          }
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarDatos();
  }, [prestadorId]);

  useEffect(() => {
    setForm(
      direccion
        ? {
            ...direccion,
            horariosAtencion: direccion.horariosAtencion.map((h) => ({
              ...h,
              especialidadId: h.especialidad ? h.especialidad.id : undefined,
              desde: normalizarHora(h.desde),
              hasta: normalizarHora(h.hasta),
              duracionTurno: normalizarHora(h.duracionTurno),
            })),
          }
        : {
            id: 0,
            calle: "",
            numero: "",
            localidad: "",
            codigoPostal: "",
            horariosAtencion: [],
            esTemporal: true,
          }
    );
    setErrores({});
    setAdvertencias({});
  }, [direccion]);

  const horaAMinutos = (hora: string) => {
    if (!hora) return 0;
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  };

  const verificarSolapamiento = (
    inicio1: number,
    fin1: number,
    inicio2: number,
    fin2: number
  ): boolean => {
    return !(fin1 <= inicio2 || inicio1 >= fin2);
  };

  const validarHorario = (horario: HorarioAtencion, index: number): { errores: string[]; advertencias: string[] } => {
    const errores: string[] = [];
    const advertencias: string[] = [];

    if (!horario.desde || !horario.hasta || !horario.duracionTurno) {
      return { errores, advertencias };
    }

    const inicio = horaAMinutos(horario.desde);
    const fin = horaAMinutos(horario.hasta);

    // ❌ ERROR: Validación básica de horarios
    if (inicio >= fin) {
      errores.push("La hora de inicio debe ser anterior a la hora de fin");
    }

    // ❌ ERROR: Validación de duración
    const duracionPartes = horario.duracionTurno.split(":");
    const duracionHoras = Number(duracionPartes[0]) || 0;
    const duracionMinutos = Number(duracionPartes[1]) || 0;
    const duracionTotal = duracionHoras * 60 + duracionMinutos;
    
    if (duracionTotal <= 0) {
      errores.push("La duración del turno debe ser mayor a 0");
    }

    if (duracionTotal > (fin - inicio)) {
      errores.push("La duración del turno no puede ser mayor al rango horario");
    }

    // ❌ ERROR: Superposición dentro de la misma dirección (horarios propios)
    form.horariosAtencion.forEach((hI, i) => {
      if (i === index) return;
      if (hI.dia === horario.dia) {
        const inicioI = horaAMinutos(hI.desde);
        const finI = horaAMinutos(hI.hasta);
        
        if (verificarSolapamiento(inicio, fin, inicioI, finI)) {
          // Si tienen la misma especialidad, es error crítico
          if (hI.especialidadId === horario.especialidadId) {
            errores.push(
              `Se superpone con otro horario ${i + 1} de la misma especialidad en esta dirección`
            );
          } else {
            // Si son especialidades diferentes, solo advertencia
            advertencias.push(
              `Se superpone con horario ${i + 1} (diferente especialidad) en esta dirección`
            );
          }
        }
      }
    });

    // ❌ ERROR: Superposición con otras direcciones del mismo prestador
    todasDirecciones.forEach((dir) => {
      if (dir.id === form.id) return; // Misma dirección, ya validada arriba
      
      dir.horariosAtencion?.forEach((hO) => {
        if (hO.dia === horario.dia) {
          const inicioO = horaAMinutos(hO.desde);
          const finO = horaAMinutos(hO.hasta);
          
          if (verificarSolapamiento(inicio, fin, inicioO, finO)) {
            const especialidadOtra = hO.especialidad?.id || hO.especialidadId;
            
            if (especialidadOtra === horario.especialidadId) {
              errores.push(
                `Se superpone con horario en ${dir.calle} ${dir.numero} (misma especialidad)`
              );
            } else {
              advertencias.push(
                `Se superpone con horario en ${dir.calle} ${dir.numero} (diferente especialidad)`
              );
            }
          }
        }
      });
    });

    // ⚠️ ADVERTENCIA: Si es profesional independiente, verificar horarios en centros médicos
    if (prestadorActual?.esProfesionalIndependiente && centrosMedicos.length > 0) {
      centrosMedicos.forEach((centro) => {
        centro.direccion?.forEach((dirCentro) => {
          // Solo verificar direcciones que fueron copiadas del centro (marcadas especialmente)
          if (dirCentro.esDireccionCentroMedico && dirCentro.centroMedicoId === centro.id) {
            dirCentro.horariosAtencion?.forEach((hCentro) => {
              if (hCentro.dia === horario.dia) {
                const inicioCentro = horaAMinutos(hCentro.desde);
                const finCentro = horaAMinutos(hCentro.hasta);
                
                if (verificarSolapamiento(inicio, fin, inicioCentro, finCentro)) {
                  advertencias.push(
                    `⚠️ Se superpone con horario en el Centro Médico "${centro.nombreCompleto}" (${dirCentro.calle} ${dirCentro.numero})`
                  );
                }
              }
            });
          }
        });
      });
    }

    // ⚠️ ADVERTENCIA: Validar horarios razonables
    if (inicio < horaAMinutos("06:00")) {
      advertencias.push("El horario comienza antes de las 6:00 AM");
    }
    if (fin > horaAMinutos("23:00")) {
      advertencias.push("El horario termina después de las 23:00 PM");
    }

    // ⚠️ ADVERTENCIA: Jornada muy larga
    const duracionJornada = fin - inicio;
    if (duracionJornada > 12 * 60) {
      advertencias.push("La jornada laboral es mayor a 12 horas");
    }

    return { errores, advertencias };
  };

  const handleChange = (e: { target: { name?: string; value: string } }) => {
    const { name, value } = e.target;
    if (!name) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHorarioChange = (
    index: number,
    field: keyof HorarioAtencion,
    value: any
  ) => {
    const nuevosHorarios = form.horariosAtencion.map((h, i) =>
      i === index ? { ...h, [field]: value } : h
    );
    setForm((prev) => ({ ...prev, horariosAtencion: nuevosHorarios }));

    // ✅ Revalidar todos los horarios
    const erroresTotales: { [key: number]: string[] } = {};
    const advertenciasTotales: { [key: number]: string[] } = {};
    
    nuevosHorarios.forEach((h, i) => {
      const { errores, advertencias } = validarHorario(h, i);
      if (errores.length > 0) erroresTotales[i] = errores;
      if (advertencias.length > 0) advertenciasTotales[i] = advertencias;
    });
    
    setErrores(erroresTotales);
    setAdvertencias(advertenciasTotales);
  };

  const handleAddHorario = () => {
    const nuevo: HorarioAtencion = {
      id: 0,
      dia: "",
      desde: "",
      hasta: "",
      duracionTurno: "",
      especialidadId: especialidadesPrestador.length > 0 ? especialidadesPrestador[0].id : undefined,
    };
    setForm((prev) => ({
      ...prev,
      horariosAtencion: [...prev.horariosAtencion, nuevo],
    }));
  };

  const handleDeleteHorario = async (index: number) => {
    const horario = form.horariosAtencion[index];
    
    // Si el horario ya está guardado en el backend, hacer DELETE
    if (horario.id && horario.id > 0 && horario.id < 1000000 && prestadorId) {
      if (!window.confirm("¿Deseas eliminar este horario de forma permanente?")) return;
      
      try {
        const res = await fetch(
          getApiUrl(`/prestadores/${prestadorId}/direcciones/${form.id}/horarios/${horario.id}`),
          { method: "DELETE" }
        );
        
        if (!res.ok) {
          alert("Error al eliminar el horario del servidor");
          return;
        }
      } catch (err) {
        console.error("Error eliminando horario:", err);
        alert("Error al eliminar el horario");
        return;
      }
    } else {
      if (!window.confirm("¿Deseas eliminar este horario?")) return;
    }
    
    const nuevos = form.horariosAtencion.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, horariosAtencion: nuevos }));

    // ✅ Revalidar
    const erroresTotales: { [key: number]: string[] } = {};
    const advertenciasTotales: { [key: number]: string[] } = {};
    
    nuevos.forEach((h, i) => {
      const { errores, advertencias } = validarHorario(h, i);
      if (errores.length > 0) erroresTotales[i] = errores;
      if (advertencias.length > 0) advertenciasTotales[i] = advertencias;
    });
    
    setErrores(erroresTotales);
    setAdvertencias(advertenciasTotales);
  };

  const handleSave = async () => {
  // 1️⃣ Validar campos de dirección
  if (!form.calle || !form.numero || !form.localidad) {
    alert("Debes completar al menos: Calle, Número y Localidad");
    return;
  }

  // 2️⃣ Validar que no haya campos vacíos en los horarios
  const tieneHorariosIncompletos = form.horariosAtencion.some(
    h => !h.dia || !h.desde || !h.hasta || !h.duracionTurno
  );

  if (tieneHorariosIncompletos) {
    alert("Todos los horarios deben tener día, hora de inicio, hora de fin y duración completados");
    return;
  }

  // 3️⃣ Verificar errores críticos
  if (Object.keys(errores).length > 0) {
    alert("Corrige los errores antes de guardar");
    return;
  }

  // 4️⃣ Si hay advertencias, pedir confirmación
  if (Object.keys(advertencias).length > 0) {
    const confirmar = window.confirm(
      "Se detectaron advertencias en los horarios. ¿Deseas continuar de todas formas?"
    );
    if (!confirmar) return;
  }

  // 5️⃣ Confirmación final
  if (!window.confirm("¿Deseas guardar los cambios realizados?")) return;

  // 6️⃣ Si no hay prestadorId válido, guardar temporal
  if (!prestadorId || prestadorId === 0) {
    console.log("Guardando dirección temporal (sin prestadorId)");
    onSave({ ...form, esTemporal: true });
    onClose();
    return;
  }

  try {
    // 7️⃣ Determinar si es nueva dirección
    const esIdTemporal = form.id >= 1000000;
    const esNuevaDireccion = form.id === 0 || esIdTemporal || form.esTemporal === true;

    console.log("Guardando dirección:", {
      prestadorId,
      direccionId: form.id,
      esNuevaDireccion,
      esIdTemporal
    });

    // 8️⃣ Guardar/actualizar dirección
    const method = esNuevaDireccion ? "POST" : "PUT";
    const url = esNuevaDireccion
      ? getApiUrl(`/prestadores/${prestadorId}/direcciones`)
      : getApiUrl(`/prestadores/${prestadorId}/direcciones/${form.id}`);

    console.log(`${method} ${url}`);

    const resDir = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calle: form.calle,
        numero: form.numero,
        localidad: form.localidad,
        codigoPostal: form.codigoPostal,
      }),
    });

    if (!resDir.ok) {
      const errorText = await resDir.text();
      console.error("Error del servidor:", errorText);
      throw new Error(`Error al guardar dirección: ${resDir.status} - ${errorText}`);
    }

    const dirGuardada: Direccion = await resDir.json();
    console.log("Dirección guardada:", dirGuardada);

    // 9️⃣ Guardar/actualizar horarios
    const horariosActualizados: HorarioAtencion[] = [];

    for (const hor of form.horariosAtencion) {
      const horData = {
        dia: hor.dia,
        desde: normalizarHora(hor.desde),
        hasta: normalizarHora(hor.hasta),
        duracionTurno: normalizarHora(hor.duracionTurno),
        especialidadId: hor.especialidadId || null,
      };

      const esHorarioTemporal = !hor.id || hor.id === 0 || hor.id >= 1000000;
      const methodHorario = esHorarioTemporal ? "POST" : "PUT";
      const endpoint = esHorarioTemporal
        ? getApiUrl(`/prestadores/${prestadorId}/direcciones/${dirGuardada.id}/horarios`)
        : getApiUrl(`/prestadores/${prestadorId}/direcciones/${dirGuardada.id}/horarios/${hor.id}`);

      console.log(`${methodHorario} ${endpoint}`, horData);

      const resHor = await fetch(endpoint, {
        method: methodHorario,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horData),
      });

      if (!resHor.ok) {
        const errorText = await resHor.text();
        console.error("Error guardando horario:", errorText);
        throw new Error(`Error al guardar horario: ${resHor.status} - ${errorText}`);
      }

      const dataHor = await resHor.json();
      horariosActualizados.push({ 
        ...hor, 
        id: dataHor.id,
        especialidad: hor.especialidadId ? 
          especialidadesPrestador.find(e => e.id === hor.especialidadId) : 
          undefined
      });
    }

    console.log("✅ Todos los horarios guardados correctamente");

    // 🔟 Notificar éxito
    const direccionCompleta = { 
      ...dirGuardada, 
      horariosAtencion: horariosActualizados,
      esTemporal: false 
    };
    
    onSave(direccionCompleta);
    onClose();
    
  } catch (err) {
    console.error("Error completo:", err);
    alert(`Error al guardar: ${(err as Error).message}`);
  }
};

  const calcularTurnos = (horario: HorarioAtencion): number => {
    if (!horario.desde || !horario.hasta || !horario.duracionTurno) return 0;
    const inicio = horaAMinutos(horario.desde);
    const fin = horaAMinutos(horario.hasta);
    const duracionPartes = horario.duracionTurno.split(":");
    const duracionMinutos = (Number(duracionPartes[0]) || 0) * 60 + (Number(duracionPartes[1]) || 0);
    if (duracionMinutos <= 0) return 0;
    return Math.floor((fin - inicio) / duracionMinutos);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="section-title">
          {form.id === 0 ? "Nueva Dirección" : "Editar Dirección"}
        </h3>

        {cargandoDatos && (
          <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
            Cargando datos del prestador...
          </div>
        )}

        {/* Mostrar errores críticos */}
        {Object.keys(errores).length > 0 && (
          <div
            style={{
              color: "#721c24",
              backgroundColor: "#f8d7da",
              padding: "0.75rem",
              marginBottom: "1rem",
              borderRadius: "6px",
              border: "1px solid #f5c6cb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <AlertTriangle size={18} />
              <strong>Errores que deben corregirse:</strong>
            </div>
            {Object.entries(errores).map(([idx, errs]) => (
              <div key={idx} style={{ marginLeft: "1.5rem", marginTop: "0.25rem" }}>
                <strong>Horario {Number(idx) + 1}:</strong>
                <ul style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>
                  {errs.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Mostrar advertencias */}
        {Object.keys(advertencias).length > 0 && (
          <div
            style={{
              color: "#856404",
              backgroundColor: "#fff3cd",
              padding: "0.75rem",
              marginBottom: "1rem",
              borderRadius: "6px",
              border: "1px solid #ffeeba",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <AlertTriangle size={18} />
              <strong>Advertencias:</strong>
            </div>
            {Object.entries(advertencias).map(([idx, advs]) => (
              <div key={idx} style={{ marginLeft: "1.5rem", marginTop: "0.25rem" }}>
                <strong>Horario {Number(idx) + 1}:</strong>
                <ul style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>
                  {advs.map((adv, i) => (
                    <li key={i}>{adv}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="modal-content" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <label>
            Calle:
            <Input
              type="text"
              name="calle"
              value={form.calle}
              onChange={(value) =>
                handleChange({ target: { name: "calle", value } })
              }
              required
            />
          </label>

          <label>
            Número:
            <Input
              type="text"
              name="numero"
              value={form.numero}
              onChange={(value) =>
                handleChange({ target: { name: "numero", value } })
              }
              required
            />
          </label>

          <label>
            Localidad:
            <Input
              type="text"
              name="localidad"
              value={form.localidad}
              onChange={(value) =>
                handleChange({ target: { name: "localidad", value } })
              }
              required
            />
          </label>

          <label>
            Código Postal:
            <Input
              type="text"
              name="codigoPostal"
              value={form.codigoPostal}
              onChange={(value) =>
                handleChange({ target: { name: "codigoPostal", value } })
              }
            />
          </label>

          <h4 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
            Horarios de Atención
          </h4>

          {form.horariosAtencion.length === 0 && (
            <p style={{ color: "#666", fontStyle: "italic", marginBottom: "1rem" }}>
              No hay horarios agregados. Haz clic en "Agregar nuevo horario" para comenzar.
            </p>
          )}

          {form.horariosAtencion.map((hor, i) => {
            const turnos = calcularTurnos(hor);
            const tieneErrores = errores[i] && errores[i].length > 0;
            const tieneAdvertencias = advertencias[i] && advertencias[i].length > 0;

            return (
              <div
                key={i}
                style={{
                  marginBottom: "1.5rem",
                  padding: "1.25rem",
                  backgroundColor: tieneErrores ? "#fff5f5" : tieneAdvertencias ? "#fffbf0" : "#f8f9fa",
                  borderRadius: "8px",
                  border: `2px solid ${tieneErrores ? "#fc8181" : tieneAdvertencias ? "#fbd38d" : "#dee2e6"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h5 style={{ margin: 0, color: "#495057" }}>
                    Horario {i + 1}
                    {turnos > 0 && (
                      <span style={{ 
                        marginLeft: "0.5rem", 
                        fontSize: "0.85rem", 
                        color: "#28a745",
                        fontWeight: "normal" 
                      }}>
                        ({turnos} turnos disponibles)
                      </span>
                    )}
                  </h5>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <label>
                    Día:
                    <Select
                      value={hor.dia}
                      onChange={(value) => handleHorarioChange(i, "dia", value)}
                      options={[
                        { value: "", label: "Seleccionar día..." },
                        { value: "Lunes", label: "Lunes" },
                        { value: "Martes", label: "Martes" },
                        { value: "Miércoles", label: "Miércoles" },
                        { value: "Jueves", label: "Jueves" },
                        { value: "Viernes", label: "Viernes" },
                        { value: "Sábado", label: "Sábado" },
                        { value: "Domingo", label: "Domingo" },
                      ]}
                    />
                  </label>

                  {especialidadesPrestador.length > 0 && (
                    <label>
                      Especialidad:
                      <Select
                        value={hor.especialidadId?.toString() || ""}
                        onChange={(value) =>
                          handleHorarioChange(i, "especialidadId", Number(value) || undefined)
                        }
                        options={[
                          { value: "", label: "Seleccionar..." },
                          ...especialidadesPrestador.map((esp) => ({
                            value: esp.id.toString(),
                            label: esp.nombre,
                          }))
                        ]}
                      />
                    </label>
                  )}

                  <label>
                    Desde:
                    <Input
                      type="time"
                      value={normalizarHora(hor.desde)}
                      onChange={(value) => handleHorarioChange(i, "desde", value)}
                    />
                  </label>

                  <label>
                    Hasta:
                    <Input
                      type="time"
                      value={normalizarHora(hor.hasta)}
                      onChange={(value) => handleHorarioChange(i, "hasta", value)}
                    />
                  </label>

                  <label style={{ gridColumn: "1 / -1" }}>
                    Duración del turno:
                    <Input
                      type="time"
                      value={normalizarHora(hor.duracionTurno)}
                      onChange={(value) =>
                        handleHorarioChange(i, "duracionTurno", value)
                      }
                    />
                    <small style={{ color: "#666", fontSize: "0.85rem" }}>
                      Formato HH:MM (ejemplo: 00:30 para 30 minutos, 01:00 para 1 hora)
                    </small>
                  </label>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDeleteHorario(i)}
                  >
                    Eliminar horario
                  </Button>
                </div>
              </div>
            );
          })}

          <Button variant="primary" onClick={handleAddHorario}>
            + Agregar nuevo horario
          </Button>
        </div>

        <div
          className="modal-actions"
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
            paddingTop: "1rem",
            paddingBottom: "0.5rem",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            borderTop: "1px solid #ccc",
            marginTop: "1rem",
          }}
        >
          <Button variant="cancel" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={Object.keys(errores).length > 0}
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalDireccion;