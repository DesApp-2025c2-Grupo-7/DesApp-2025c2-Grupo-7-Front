import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ListaPrestadores.css";
import Button from "../genericos/Button";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import MultipleInput from "../genericos/MultipleInput";
import CardEspecialidades from "./CardEspecialidades";
import ModalDireccion from "./ModalDireccion";
import Modal from "../genericos/Modal";
import type { Direccion, HorarioAtencion, Especialidad, Prestador } from "../../types/prestadores";
import { getApiUrl } from "../../config/env";

/* --- Funciones auxiliares --- */
const horaAMinutos = (hora?: string) => {
  if (!hora) return 0;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

const calcularTurnos = (horario: HorarioAtencion) => {
  if (!horario.desde || !horario.hasta || !horario.duracionTurno) return 0;
  const inicio = horaAMinutos(horario.desde);
  const fin = horaAMinutos(horario.hasta);
  let duracion = horario.duracionTurno.includes(":") ? horaAMinutos(horario.duracionTurno) : Number(horario.duracionTurno);
  if (duracion <= 0) return 0;
  return Math.floor((fin - inicio) / duracion);
};

/* --- Componente principal --- */
interface PrestadoresFormEditProps {
  prestador?: Prestador | null;
}

const PrestadoresFormEdit: React.FC<PrestadoresFormEditProps> = ({ prestador }) => {
  const navigate = useNavigate();

  /* --- Estado de formulario --- */
  const [isEditing, setIsEditing] = useState(!prestador);
  const [modalBajaOpen, setModalBajaOpen] = useState(false);
  const [fechaBaja, setFechaBaja] = useState(prestador?.fechaBaja || "");
  const [nombre, setNombre] = useState(prestador?.nombreCompleto || "");
  const [cuil, setCuil] = useState(prestador?.numeroCUIL || "");
  const [tipoPrestador, setTipoPrestador] = useState(prestador?.esProfesionalIndependiente ? "Profesional Independiente" : "Centro Médico");
  const [telefonos, setTelefonos] = useState<string[]>(prestador?.telefono || [""]);
  const [emails, setEmails] = useState<string[]>(prestador?.email || [""]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<Especialidad[]>(prestador?.especialidades || []);
  const [listaDirecciones, setListaDirecciones] = useState<Direccion[]>(prestador?.direccion || []);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);

  const [centrosMedicos, setCentrosMedicos] = useState<Prestador[]>([]);
  const [centroAsignadoId, setCentroAsignadoId] = useState<number | null>(prestador?.centroAsignadoId || null);

  /* --- Cargar especialidades --- */
  useEffect(() => {
    fetch(getApiUrl("/especialidades"))
      .then((res) => res.json())
      .then((data: Especialidad[]) => setEspecialidades(data))
      .catch((err) => console.error("Error al cargar especialidades:", err));
  }, []);

  /* --- Cargar Centros Médicos --- */
  useEffect(() => {
    fetch(getApiUrl("/prestadores"))
      .then(res => res.json())
      .then((data: Prestador[]) => {
        const centros = data.filter(p => !p.esProfesionalIndependiente);
        setCentrosMedicos(centros);
      })
      .catch(err => console.error("Error cargando centros médicos:", err));
  }, []);

  /* --- Sincronizar especialidades desde horarios --- */
  useEffect(() => {
    // Extraer todas las especialidades únicas de los horarios
    const especialidadesEnHorarios = new Set<number>();
    listaDirecciones.forEach(dir => {
      dir.horariosAtencion?.forEach(hor => {
        if (hor.especialidadId) {
          especialidadesEnHorarios.add(hor.especialidadId);
        }
        if (hor.especialidad?.id) {
          especialidadesEnHorarios.add(hor.especialidad.id);
        }
      });
    });

    // Agregar especialidades que están en horarios pero no en seleccionadas
    const especialidadesAAgregar = especialidades.filter(esp => 
      especialidadesEnHorarios.has(esp.id) && 
      !seleccionadas.some(sel => sel.id === esp.id)
    );

    if (especialidadesAAgregar.length > 0) {
      setSeleccionadas(prev => [...prev, ...especialidadesAAgregar]);
    }
  }, [listaDirecciones, especialidades]);

  /* --- Funciones direcciones --- */
  const handleVerMas = (dir: Direccion) => setDireccionSeleccionada(dir);
  const handleCloseModal = () => setDireccionSeleccionada(null);

  const handleSaveDireccion = (dirActualizada: Direccion) => {
    // Enriquece los horarios con el objeto especialidad completo
    const dirConEspecialidades = {
      ...dirActualizada,
      horariosAtencion: dirActualizada.horariosAtencion.map(hor => ({
        ...hor,
        especialidad: hor.especialidadId 
          ? especialidades.find(esp => esp.id === hor.especialidadId) 
          : hor.especialidad
      }))
    };

    setListaDirecciones(prev => {
      const existe = prev.find(d => d.id === dirConEspecialidades.id);
      const nuevaLista = existe
        ? prev.map(d => (d.id === dirConEspecialidades.id ? dirConEspecialidades : d))
        : [...prev, dirConEspecialidades];
      return [...nuevaLista]; // Fuerza re-render inmediato
    });
    setDireccionSeleccionada(null);
  };

  const handleAgregarNuevaDireccion = () => {
    const nuevaDireccion: Direccion = {
      id: Date.now(),
      calle: "",
      numero: "",
      localidad: "",
      codigoPostal: "",
      horariosAtencion: [],
      esTemporal: true,
    };
    handleVerMas(nuevaDireccion);
  };

  const handleEliminarDireccion = (direccion: Direccion) => {
    if (!window.confirm("¿Deseas eliminar esta dirección y todos sus horarios?")) return;
    setListaDirecciones(prev => [...prev.filter(d => d.id !== direccion.id)]);
  };

  /* --- Guardar cambios --- */
  const handleGuardar = async () => {
    try {
      const prestadorData = {
        numeroCUIL: cuil,
        nombreCompleto: nombre,
        esProfesionalIndependiente: tipoPrestador === "Profesional Independiente",
        telefono: telefonos,
        email: emails,
        especialidadIds: seleccionadas.map(e => e.id),
        fechaBaja: fechaBaja || null,
        centroAsignadoId: centroAsignadoId,
      };

      let url = getApiUrl("/prestadores");
      let method: "POST" | "PUT" = "POST";
      if (prestador) {
        url += `/${prestador.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prestadorData),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      for (const dir of listaDirecciones) {
        const { id, esTemporal, ...dirParaBackend } = dir;
        const dirUrl = prestador
          ? getApiUrl(`/prestadores/${prestador.id}/direcciones${dir.esTemporal ? "" : `/${id}`}`)
          : getApiUrl(`/prestadores/${data.id}/direcciones`);
        const dirMethod: "POST" | "PUT" = prestador && !dir.esTemporal ? "PUT" : "POST";

        const dirRes = await fetch(dirUrl, {
          method: dirMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dirParaBackend),
        });

        if (!dirRes.ok) console.error("Error guardando dirección", await dirRes.text());
        else {
          const nuevaDir = await dirRes.json();
          for (const hor of dir.horariosAtencion) {
            const horRes = await fetch(
              getApiUrl(`/prestadores/${prestador?.id || data.id}/direcciones/${nuevaDir.id}/horarios`),
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(hor),
              }
            );
            if (!horRes.ok) console.error("Error creando horario", await horRes.text());
          }
        }
      }

      alert(`Prestador ${prestador ? "actualizado" : "creado"} correctamente`);
      setIsEditing(false);
      setListaDirecciones([...listaDirecciones]); // Fuerza refresco visual
      if (!prestador) navigate(`/prestadores/${data.id}`);
    } catch (err) {
      console.error("🔥 Error guardando prestador:", err);
      alert("Hubo un error al guardar el prestador");
    }
  };

  const handleDarDeBaja = () => {
    if (!fechaBaja) {
      alert("Selecciona una fecha de baja válida");
      return;
    }
    setModalBajaOpen(false);
    handleGuardar();
  };

  /* --- Render --- */
  return (
    <div className="prestador-form">
      <div className="form-row">
        <label>Tipo de prestador</label>
        {isEditing ? (
          <Select
            options={[
              { value: "Centro Médico", label: "Centro Médico" },
              { value: "Profesional Independiente", label: "Profesional Independiente" },
            ]}
            value={tipoPrestador}
            onChange={setTipoPrestador}
          />
        ) : (
          <span>{tipoPrestador}</span>
        )}
      </div>

      {isEditing && tipoPrestador === "Profesional Independiente" && (
        <div className="form-row">
          <label>Asignar a Centro Médico</label>
          <Select
            options={centrosMedicos.map(c => ({ value: String(c.id), label: c.nombreCompleto }))}
            value={centroAsignadoId ? String(centroAsignadoId) : ""}
            onChange={(val: string) => setCentroAsignadoId(val ? Number(val) : null)}
          />
        </div>
      )}

      <div className="form-row">
        <label>Especialidades</label>
        {isEditing ? (
          <CardEspecialidades
            especialidades={especialidades}
            seleccionadas={seleccionadas}
            onChange={(nuevas) => {
              setSeleccionadas(nuevas);
              setListaDirecciones([...listaDirecciones]); // refresca al instante
            }}
          />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
            {seleccionadas.length > 0 ? seleccionadas.map(e => <span key={e.id}>{e.nombre}</span>) : <span>No posee especialidades</span>}
          </div>
        )}
      </div>

      <div className="form-row">
        <label>CUIL/CUIT</label>
        {isEditing ? <Input type="text" value={cuil} onChange={setCuil} /> : <span>{cuil}</span>}
      </div>

      <div className="form-row">
        <label>Nombre completo</label>
        {isEditing ? <Input type="text" value={nombre} onChange={setNombre} /> : <span>{nombre}</span>}
      </div>

      <div className="form-row">
        <label>Teléfonos</label>
        {isEditing ? <MultipleInput type="tel" name="telefono" onChange={setTelefonos} values={telefonos} /> : telefonos.map((t, i) => <span key={i}>{t}</span>)}
      </div>

      <div className="form-row">
        <label>Emails</label>
        {isEditing ? <MultipleInput type="email" name="email" onChange={setEmails} values={emails} /> : emails.map((e, i) => <span key={i}>{e}</span>)}
      </div>

      <div className="schedules">
        <h4>Direcciones y Horarios de atención</h4>
        <div className="schedules-container">
          {listaDirecciones.map((dir, i) => (
            <div className="schedule-card" key={dir.id || i}>
              <div className="schedule-header">
                <h4>
                {dir.calle} {dir.numero}, {dir.localidad} ({dir.codigoPostal || "—"})
                </h4>
              </div>
              <div className="schedule-list">
                {dir.horariosAtencion?.map((hor, j) => (
                  <div className="schedule-item" key={j}>
                    <strong>{hor.dia}</strong> - {hor.desde} a {hor.hasta}
                    <span className="schedule-badge">
                      Duración: {hor.duracionTurno} | Turnos: {calcularTurnos(hor)}
                    </span>
                    {hor.especialidad?.nombre && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#646b72ff",
                          fontStyle: "italic",
                          paddingLeft: "0.25rem",
                        }}
                      >
                        Especialidad: {hor.especialidad.nombre}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="schedule-actions">
                  <Button variant="primary" size="small" onClick={() => handleVerMas(dir)}>Editar</Button>
                  <Button variant="danger" size="small" onClick={() => handleEliminarDireccion(dir)}>Eliminar</Button>
                </div>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
          <div className="fixed-add-button">
            <Button className="add-schedule" onClick={handleAgregarNuevaDireccion}>+ Agregar nueva dirección</Button>
          </div>
        )}
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <Button variant="cancel" onClick={() => navigate("/prestadores")}>Cancelar</Button>
        {isEditing ? (
          <>
            <Button variant="primary" onClick={handleGuardar}>{prestador ? "Guardar cambios" : "Dar de alta"}</Button>
            {prestador && (
              <Button variant="danger" onClick={() => setModalBajaOpen(true)}>Dar de baja</Button>
            )}
          </>
        ) : (
          <Button variant="primary" onClick={() => setIsEditing(true)}>Editar</Button>
        )}
      </div>

      {direccionSeleccionada && (
        <ModalDireccion
          prestadorId={prestador?.id || 0}
          direccion={direccionSeleccionada}
          todasDirecciones={listaDirecciones}
          especialidadesPrestador={seleccionadas}
          onClose={handleCloseModal}
          onSave={handleSaveDireccion}
        />
      )}

      {modalBajaOpen && (
        <Modal
          isOpen={modalBajaOpen}
          onClose={() => setModalBajaOpen(false)}
          titulo="Dar de baja prestador"
          mensaje="Selecciona la fecha de baja:"
          contenidoExtra={
            <input
              type="date"
              value={fechaBaja}
              onChange={(e) => setFechaBaja(e.target.value)}
            />
          }
          tipo="warning"
          textoBotonConfirmar="Confirmar baja"
          onConfirm={handleDarDeBaja}
        />
      )}
    </div>
  );
};

export default PrestadoresFormEdit;