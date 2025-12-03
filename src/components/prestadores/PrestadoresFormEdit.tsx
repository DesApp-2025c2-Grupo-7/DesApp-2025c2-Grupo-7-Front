import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Users,
  Trash2,
  Plus,
  Clock,
  MapPin,
  Building2,
  Eye,
  Edit2,
} from "lucide-react";
import "./ListaPrestadores.css";
import Button from "../genericos/Button";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import MultipleInput from "../genericos/MultipleInput";
import CardEspecialidades from "./CardEspecialidades";
import ModalDireccion from "./ModalDireccion";
import ModalConfirmacion from "../genericos/ModalConfirmacion";
import Modal from "../genericos/Modal";
import { useModal } from "../../hooks/useModal";
import type {
  Direccion,
  HorarioAtencion,
  Especialidad,
  Prestador,
} from "../../types/prestadores";
import { getApiUrl } from "../../config/env";
import MedicosIndependientesAccordion from "./MedicosIndependientesAccordion";
import Paginacion from "../genericos/Paginacion";

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
  let duracion = horario.duracionTurno.includes(":")
    ? horaAMinutos(horario.duracionTurno)
    : Number(horario.duracionTurno);
  if (duracion <= 0) return 0;
  return Math.floor((fin - inicio) / duracion);
};

const validarFechas = (
  fechaAlta?: string | null,
  fechaBaja?: string | null
): string[] => {
  const errores: string[] = [];

  if (fechaAlta && fechaBaja) {
    const alta = new Date(fechaAlta);
    const baja = new Date(fechaBaja);

    if (alta > baja) {
      errores.push(
        "La fecha de alta no puede ser posterior a la fecha de baja"
      );
    }
  }

  return errores;
};

/* --- Componente principal --- */
interface PrestadoresFormEditProps {
  prestador?: Prestador | null;
  onPrestadorActualizado?: () => void;
}

const PrestadoresFormEdit: React.FC<PrestadoresFormEditProps> = ({
  prestador,
  onPrestadorActualizado,
}) => {
  const navigate = useNavigate();
  const modal = useModal();

  /* --- Estado de formulario --- */
  const [isEditing, setIsEditing] = useState(!prestador);
  const [modalBajaOpen, setModalBajaOpen] = useState(false);
  const [tipoBaja, setTipoBaja] = useState<"inmediata" | "diferida">(
    "inmediata"
  );
  const [fechaBajaSeleccionada, setFechaBajaSeleccionada] = useState("");
  const [fechaAlta, setFechaAlta] = useState(prestador?.fechaAlta || "");
  const [fechaBaja, setFechaBaja] = useState(prestador?.fechaBaja || "");
  const [nombre, setNombre] = useState(prestador?.nombreCompleto || "");
  const [cuil, setCuil] = useState(prestador?.numeroCUIL || "");
  const [tipoPrestador, setTipoPrestador] = useState(
    prestador?.esProfesionalIndependiente
      ? "Profesional Independiente"
      : "Centro Médico"
  );
  const [telefonos, setTelefonos] = useState<string[]>(
    prestador?.telefono || [""]
  );
  const [emails, setEmails] = useState<string[]>(prestador?.email || [""]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<Especialidad[]>(
    prestador?.especialidades || []
  );
  const [listaDirecciones, setListaDirecciones] = useState<Direccion[]>(
    prestador?.direccion || []
  );
  const [direccionSeleccionada, setDireccionSeleccionada] =
    useState<Direccion | null>(null);

  // Estado para profesionales (cuando es Centro Médico)
  const [profesionalesIndependientes, setProfesionalesIndependientes] =
    useState<Prestador[]>([]);
  const [profesionalesAsociados, setProfesionalesAsociados] = useState<
    Prestador[]
  >([]);
  const [profesionalSeleccionado, setProfesionalSeleccionado] =
    useState<string>("");
  const [loadingProfesionales, setLoadingProfesionales] = useState(false);

  // Estado para centros médicos (cuando es Profesional Independiente)
  const [centrosMedicos, setCentrosMedicos] = useState<Prestador[]>([]);
  const [loadingCentros, setLoadingCentros] = useState(false);

  //Estado para la búsqueda de médicos asociados de un centro médico.
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const profesionalsPerPage = 2;
  const handleChangePage = (currentPage: number) => {
    setPaginaActual(currentPage);
  };

  const [profesionalesAsociadosFiltrados, setProfesionalesAsociadosFiltrados] =
    useState(profesionalesAsociados);

  const totalPages = Math.ceil(
    profesionalesAsociadosFiltrados.length / profesionalsPerPage
  );

  // 🔹 Cuando cambia la lista original, se actualiza el filtrado
  useEffect(() => {
    setProfesionalesAsociadosFiltrados(profesionalesAsociados);
  }, [profesionalesAsociados]);

  // 🔹 Cuando el usuario escribe en el buscador, filtra en vivo
  useEffect(() => {
    const filtro = busqueda.toLowerCase().trim();

    if (filtro === "") {
      setProfesionalesAsociadosFiltrados(profesionalesAsociados);
      return;
    }

    const filtrados = profesionalesAsociados.filter(
      (prof) =>
        prof.nombreCompleto.toLowerCase().includes(filtro) ||
        prof.numeroCUIL.includes(filtro)
    );

    setProfesionalesAsociadosFiltrados(filtrados);
  }, [busqueda, profesionalesAsociados]);

  const profesionalesPaginados = profesionalesAsociadosFiltrados.slice(
    (paginaActual - 1) * profesionalsPerPage,
    paginaActual * profesionalsPerPage
  );

  /* --- Resetear formulario cuando cambie el prestador --- */
  useEffect(() => {
    if (prestador) {
      setIsEditing(false);
      setNombre(prestador.nombreCompleto || "");
      setCuil(prestador.numeroCUIL || "");
      setTipoPrestador(
        prestador.esProfesionalIndependiente
          ? "Profesional Independiente"
          : "Centro Médico"
      );
      setTelefonos(prestador.telefono || [""]);
      setEmails(prestador.email || [""]);
      setSeleccionadas(prestador.especialidades || []);
      setListaDirecciones(prestador.direccion || []);
      setFechaAlta(prestador.fechaAlta || "");
      setFechaBaja(prestador.fechaBaja || "");
      setProfesionalesAsociados([]);
      setProfesionalSeleccionado("");
      setCentrosMedicos([]);
    }
  }, [prestador]);

  /* --- Cargar especialidades --- */
  useEffect(() => {
    fetch(getApiUrl("/especialidades"))
      .then((res) => res.json())
      .then((data: Especialidad[]) => setEspecialidades(data))
      .catch((err) => console.error("Error al cargar especialidades:", err));
  }, []);

  /* --- Cargar profesionales asociados cuando es Centro Médico --- */
  useEffect(() => {
    if (prestador?.id && !prestador.esProfesionalIndependiente) {
      fetch(getApiUrl(`/prestadores/${prestador.id}/profesionales`))
        .then((res) => res.json())
        .then((data: Prestador[]) => setProfesionalesAsociados(data))
        .catch((err) =>
          console.error("Error cargando profesionales asociados:", err)
        );
    } else {
      setProfesionalesAsociados([]);
    }
  }, [prestador]);

  /* --- Cargar centros médicos cuando es Profesional Independiente --- */
  useEffect(() => {
    if (prestador?.id && prestador.esProfesionalIndependiente) {
      setLoadingCentros(true);
      fetch(getApiUrl("/prestadores"))
        .then((res) => res.json())
        .then((data: Prestador[]) => {
          // Filtrar centros que tienen este profesional asociado
          const centrosAsociados = data.filter(
            (p: Prestador) =>
              !p.esProfesionalIndependiente &&
              p.profesionales?.some((prof) => prof.id === prestador.id)
          );
          setCentrosMedicos(centrosAsociados);
        })
        .catch((err) => console.error("Error cargando centros médicos:", err))
        .finally(() => setLoadingCentros(false));
    } else {
      setCentrosMedicos([]);
    }
  }, [prestador]);

  /* --- Cargar todos los profesionales independientes disponibles --- */
  useEffect(() => {
    if (isEditing && tipoPrestador === "Centro Médico") {
      fetch(getApiUrl("/prestadores"))
        .then((res) => res.json())
        .then((data: Prestador[]) => {
          const profesionales = data.filter(
            (p) => p.esProfesionalIndependiente
          );
          setProfesionalesIndependientes(profesionales);
        })
        .catch((err) => console.error("Error cargando profesionales:", err));
    }
  }, [isEditing, tipoPrestador]);

  /* --- Sincronizar especialidades desde horarios --- */
  useEffect(() => {
    const especialidadesEnHorarios = new Set<number>();
    listaDirecciones.forEach((dir) => {
      dir.horariosAtencion?.forEach((hor) => {
        if (hor.especialidadId) {
          especialidadesEnHorarios.add(hor.especialidadId);
        }
        if (hor.especialidad?.id) {
          especialidadesEnHorarios.add(hor.especialidad.id);
        }
      });
    });

    const especialidadesAAgregar = especialidades.filter(
      (esp) =>
        especialidadesEnHorarios.has(esp.id) &&
        !seleccionadas.some((sel) => sel.id === esp.id)
    );

    if (especialidadesAAgregar.length > 0) {
      setSeleccionadas((prev) => [...prev, ...especialidadesAAgregar]);
    }
  }, [listaDirecciones, especialidades]);

  /* --- Funciones direcciones --- */
  const handleVerMas = (dir: Direccion) => setDireccionSeleccionada(dir);
  const handleCloseModal = () => setDireccionSeleccionada(null);

  const handleSaveDireccion = (dirActualizada: Direccion) => {
    const dirConEspecialidades = {
      ...dirActualizada,
      horariosAtencion: dirActualizada.horariosAtencion.map((hor) => ({
        ...hor,
        especialidad: hor.especialidadId
          ? especialidades.find((esp) => esp.id === hor.especialidadId)
          : hor.especialidad,
      })),
    };

    setListaDirecciones((prev) => {
      const existe = prev.find((d) => d.id === dirConEspecialidades.id);
      const nuevaLista = existe
        ? prev.map((d) =>
            d.id === dirConEspecialidades.id ? dirConEspecialidades : d
          )
        : [...prev, dirConEspecialidades];
      return [...nuevaLista];
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
    modal.mostrarModal({
      titulo: "Eliminar dirección",
      mensaje: "¿Desea eliminar esta dirección?",
      submensaje: "Todos los horarios asociados a esta dirección también serán eliminados",
      tipo: "warning",
      textoBotonConfirmar: "Eliminar",
      textoBotonCancelar: "Cancelar",
      onConfirmar: () => {
        setListaDirecciones((prev) => [
          ...prev.filter((d) => d.id !== direccion.id),
        ]);
      },
    });
  };

  /* --- Funciones de profesionales (para Centro Médico) --- */
  const handleAgregarProfesional = async () => {
    if (!profesionalSeleccionado || !prestador?.id) return;

    setLoadingProfesionales(true);
    try {
      const res = await fetch(
        getApiUrl(
          `/prestadores/${prestador.id}/profesionales/${profesionalSeleccionado}`
        ),
        { method: "POST" }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const profesionalAgregado = profesionalesIndependientes.find(
        (p) => p.id === Number(profesionalSeleccionado)
      );

      if (profesionalAgregado) {
        setProfesionalesAsociados((prev) => [...prev, profesionalAgregado]);
        setProfesionalSeleccionado("");

        modal.mostrarModal({
          titulo: "✅ Profesional agregado",
          mensaje: `Se ha asociado ${profesionalAgregado.nombreCompleto} al centro médico exitosamente.`,
          submensaje:
            "Las direcciones del centro han sido agregadas al profesional.",
          tipo: "success",
          textoBotonConfirmar: "Aceptar",
          soloInformacion: true,
        });
      }
    } catch (error: any) {
      console.error("Error agregando profesional:", error);

      let mensajeError = "No se pudo asociar el profesional al centro médico";
      let detalles: string[] = [];

      try {
        const errorObj = JSON.parse(error.message);
        mensajeError = errorObj.message || mensajeError;
      } catch {
        mensajeError = error.message || mensajeError;
      }

      if (mensajeError.includes("especialidad en común")) {
        detalles = [
          "El profesional debe tener al menos una especialidad que coincida con las del centro médico.",
        ];
      } else if (mensajeError.includes("ya está asociado")) {
        detalles = ["Este profesional ya forma parte del centro médico."];
      }

      modal.mostrarError(
        "Error al agregar profesional",
        mensajeError,
        detalles
      );
    } finally {
      setLoadingProfesionales(false);
    }
  };

  const handleEliminarProfesional = async (profesionalId: number) => {
    if (!prestador?.id) return;

    const profesional = profesionalesAsociados.find(
      (p) => p.id === profesionalId
    );

    modal.mostrarModal({
      titulo: "Desvincular profesional",
      mensaje: `¿Está seguro que desea desvincular a ${
        profesional?.nombreCompleto || "este profesional"
      } del centro médico?`,
      submensaje:
        "Se eliminarán las direcciones del centro médico del profesional.",
      tipo: "warning",
      textoBotonConfirmar: "Desvincular",
      textoBotonCancelar: "Cancelar",
      onConfirmar: async () => {
        setLoadingProfesionales(true);
        try {
          const res = await fetch(
            getApiUrl(
              `/prestadores/${prestador.id}/profesionales/${profesionalId}`
            ),
            { method: "DELETE" }
          );

          if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
          }

          setProfesionalesAsociados((prev) =>
            prev.filter((p) => p.id !== profesionalId)
          );

          modal.mostrarModal({
            titulo: "✅ Profesional desvinculado",
            mensaje:
              "Se ha desvinculado el profesional del centro médico exitosamente.",
            tipo: "success",
            textoBotonConfirmar: "Aceptar",
            soloInformacion: true,
          });
        } catch (error: any) {
          console.error("Error eliminando profesional:", error);
          modal.mostrarError(
            "Error al desvincular profesional",
            "No se pudo desvincular el profesional del centro médico",
            [error.message || "Error desconocido"]
          );
        } finally {
          setLoadingProfesionales(false);
        }
      },
    });
  };

  /* --- Guardar cambios --- */
  const handleGuardar = async () => {
    const erroresFechas = validarFechas(fechaAlta, fechaBaja);
    if (erroresFechas.length > 0) {
      modal.mostrarError(
        "Errores en las fechas",
        "Por favor corrige los siguientes errores:",
        erroresFechas
      );
      return;
    }

    try {
      const prestadorData = {
        numeroCUIL: cuil,
        nombreCompleto: nombre,
        esProfesionalIndependiente:
          tipoPrestador === "Profesional Independiente",
        telefono: telefonos,
        email: emails,
        especialidadIds: seleccionadas.map((e) => e.id),
        fechaAlta: fechaAlta || null,
        fechaBaja: fechaBaja || null,
      };

      let url = getApiUrl("/prestadores");
      let method = "POST";
      if (prestador) {
        url += `/${prestador.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method: method as "POST" | "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prestadorData),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      for (const dir of listaDirecciones) {
        const { id, esTemporal, horariosAtencion, ...dirParaBackend } = dir;
        const dirUrl = prestador
          ? getApiUrl(
              `/prestadores/${prestador.id}/direcciones${
                dir.esTemporal ? "" : `/${id}`
              }`
            )
          : getApiUrl(`/prestadores/${data.id}/direcciones`);
        const dirMethod = prestador && !dir.esTemporal ? "PUT" : "POST";

        const dirRes = await fetch(dirUrl, {
          method: dirMethod as "POST" | "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dirParaBackend),
        });

        if (!dirRes.ok)
          console.error("Error guardando dirección", await dirRes.text());
        else {
          const nuevaDir = await dirRes.json();
          for (const hor of dir.horariosAtencion) {
            const horRes = await fetch(
              getApiUrl(
                `/prestadores/${prestador?.id || data.id}/direcciones/${
                  nuevaDir.id
                }/horarios`
              ),
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(hor),
              }
            );
            if (!horRes.ok)
              console.error("Error creando horario", await horRes.text());
          }
        }
      }

      modal.mostrarModal({
        titulo: "¡Prestador guardado exitosamente!",
        mensaje: `Se ha ${
          prestador ? "actualizado" : "creado"
        } el prestador ${nombre} correctamente.`,
        tipo: "success",
        textoBotonConfirmar: "Aceptar",
        soloInformacion: true,
        onConfirmar: () => {
          setIsEditing(false);
          setListaDirecciones([...listaDirecciones]);
          if (!prestador) navigate(`/prestadores/${data.id}`);
        },
      });
    } catch (err) {
      console.error("🔥 Error guardando prestador:", err);
      modal.mostrarError(
        "Error al guardar",
        "Hubo un error al guardar el prestador",
        [(err as Error).message || "Error desconocido"]
      );
    }
  };

  const handleAbrirModalBaja = () => {
    setTipoBaja("inmediata");
    setFechaBajaSeleccionada(new Date().toISOString().split("T")[0]);
    setModalBajaOpen(true);
  };

  const handleConfirmarBaja = async () => {
    const fechaFinal =
      tipoBaja === "inmediata"
        ? new Date().toISOString().split("T")[0]
        : fechaBajaSeleccionada;

    if (tipoBaja === "diferida" && !fechaBajaSeleccionada) {
      modal.mostrarError(
        "Fecha de baja requerida",
        "Debe seleccionar una fecha de baja válida",
        ["Por favor, seleccione una fecha para dar de baja al prestador"]
      );
      return;
    }

    if (!prestador?.id) return;

    setModalBajaOpen(false);

    try {
      const res = await fetch(getApiUrl(`/prestadores/${prestador.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroCUIL: cuil,
          nombreCompleto: nombre,
          esProfesionalIndependiente:
            tipoPrestador === "Profesional Independiente",
          telefono: telefonos,
          email: emails,
          especialidadIds: seleccionadas.map((e) => e.id),
          fechaAlta: fechaAlta || null,
          fechaBaja: fechaFinal,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setFechaBaja(fechaFinal);

      modal.mostrarModal({
        titulo: "¡Prestador dado de baja!",
        mensaje: `Se ha dado de baja a ${nombre} correctamente.`,
        submensaje:
          tipoBaja === "diferida"
            ? `El prestador estará inactivo desde el ${new Date(
                fechaFinal
              ).toLocaleDateString()}`
            : "El prestador ha sido dado de baja inmediatamente",
        tipo: "success",
        textoBotonConfirmar: "Aceptar",
        soloInformacion: true,
        onConfirmar: () => {
          if (onPrestadorActualizado) {
            onPrestadorActualizado();
          } else {
            window.location.reload();
          }
        },
      });
    } catch (err) {
      console.error("Error dando de baja:", err);
      modal.mostrarError(
        "Error al dar de baja",
        "No se pudo dar de baja el prestador",
        [(err as Error).message || "Error desconocido"]
      );
    }
  };

  const handleReactivar = async () => {
    if (!prestador?.id) return;

    modal.mostrarModal({
      titulo: "Reactivar prestador",
      mensaje: "¿Desea reactivar este prestador?",
      submensaje: "El prestador volverá a estar activo en el sistema",
      tipo: "info",
      textoBotonConfirmar: "Reactivar",
      textoBotonCancelar: "Cancelar",
      onConfirmar: async () => {
        try {
          const res = await fetch(getApiUrl(`/prestadores/${prestador.id}`), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              numeroCUIL: cuil,
              nombreCompleto: nombre,
              esProfesionalIndependiente:
                tipoPrestador === "Profesional Independiente",
              telefono: telefonos,
              email: emails,
              especialidadIds: seleccionadas.map((e) => e.id),
              fechaAlta: fechaAlta || null,
              fechaBaja: null,
            }),
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          setFechaBaja("");

          modal.mostrarModal({
            titulo: "¡Prestador reactivado!",
            mensaje: `Se ha reactivado a ${nombre} correctamente.`,
            submensaje: "El prestador está activo nuevamente en el sistema",
            tipo: "success",
            textoBotonConfirmar: "Aceptar",
            soloInformacion: true,
            onConfirmar: () => {
              if (onPrestadorActualizado) {
                onPrestadorActualizado();
              } else {
                window.location.reload();
              }
            },
          });
        } catch (err) {
          console.error("Error reactivando:", err);
          modal.mostrarError(
            "Error al reactivar",
            "No se pudo reactivar el prestador",
            [(err as Error).message || "Error desconocido"]
          );
        }
      },
    });
  };

  const profesionalesDisponibles = profesionalesIndependientes.filter(
    (prof) => !profesionalesAsociados.some((pa) => pa.id === prof.id)
  );

  const estaActivo = () => {
    const hoy = new Date().toISOString().split("T")[0];
    if (fechaBaja && fechaBaja <= hoy) return false;
    if (fechaAlta && fechaAlta > hoy) return false;
    return true;
  };

  /* --- Render --- */
  return (
    <>
      <div className="prestador-form">
        <div className="form-row">
          <label>Tipo de prestador</label>
          {isEditing ? (
            <Select
              options={[
                { value: "Centro Médico", label: "Centro Médico" },
                {
                  value: "Profesional Independiente",
                  label: "Profesional Independiente",
                },
              ]}
              value={tipoPrestador}
              onChange={setTipoPrestador}
            />
          ) : (
            <span>{tipoPrestador}</span>
          )}
        </div>

        {/* Vista de centros médicos (solo para Profesionales Independientes) */}
        {tipoPrestador === "Profesional Independiente" &&
          prestador &&
          centrosMedicos.length > 0 && (
            <div
              className="form-row"
              style={{ flexDirection: "column", gap: "1rem" }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Building2 size={20} />
                Centros Médicos Asociados
              </label>

              {loadingCentros ? (
                <p style={{ color: "#666", fontStyle: "italic" }}>
                  Cargando centros médicos...
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {centrosMedicos.map((centro) => (
                    <div
                      key={centro.id}
                      style={{
                        border: "2px solid #e3f2fd",
                        borderRadius: "8px",
                        padding: "1rem",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.75rem",
                          paddingBottom: "0.75rem",
                          borderBottom: "1px solid #dee2e6",
                        }}
                      >
                        <Building2 size={18} color="#1565c0" />
                        <strong
                          style={{ fontSize: "1.05rem", color: "#1565c0" }}
                        >
                          {centro.nombreCompleto}
                        </strong>
                      </div>

                      {/* Direcciones y horarios del centro */}
                      {centro.direccion && centro.direccion.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                          }}
                        >
                          {centro.direccion.map((dir, idx) => (
                            <div
                              key={idx}
                              style={{
                                backgroundColor: "white",
                                padding: "0.75rem",
                                borderRadius: "6px",
                                border: "1px solid #e0e0e0",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                <MapPin size={16} color="#666" />
                                <strong style={{ fontSize: "0.95rem" }}>
                                  {dir.calle} {dir.numero}, {dir.localidad}
                                </strong>
                              </div>

                              {dir.horariosAtencion &&
                              dir.horariosAtencion.length > 0 ? (
                                <div
                                  style={{
                                    marginLeft: "1.5rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.35rem",
                                  }}
                                >
                                  {dir.horariosAtencion.map((hor, hidx) => (
                                    <div
                                      key={hidx}
                                      style={{
                                        fontSize: "0.85rem",
                                        color: "#495057",
                                        padding: "0.4rem 0.6rem",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "4px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "0.5rem",
                                        }}
                                      >
                                        <Clock size={14} />
                                        <span>
                                          <strong>{hor.dia}</strong>:{" "}
                                          {hor.desde} - {hor.hasta}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "0.75rem",
                                          fontSize: "0.8rem",
                                        }}
                                      >
                                        {hor.especialidad && (
                                          <span
                                            style={{
                                              backgroundColor: "#e3f2fd",
                                              color: "#1565c0",
                                              padding: "2px 8px",
                                              borderRadius: "10px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {hor.especialidad.nombre}
                                          </span>
                                        )}
                                        <span style={{ color: "#666" }}>
                                          Duración: {hor.duracionTurno} |
                                          Turnos: {calcularTurnos(hor)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#999",
                                    fontStyle: "italic",
                                    marginLeft: "1.5rem",
                                  }}
                                >
                                  Sin horarios definidos
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#999",
                            fontStyle: "italic",
                          }}
                        >
                          Sin direcciones registradas
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                setListaDirecciones([...listaDirecciones]);
              }}
            />
          ) : (
            <div className="prestador-especialidades-list">
              {seleccionadas.length > 0 ? (
                <>
                  {seleccionadas.map((especialidad) => (
                    <span
                      key={especialidad.id}
                      className="prestador-especialidad"
                    >
                      {especialidad.nombre}
                    </span>
                  ))}
                </>
              ) : (
                <span style={{ color: "#666", fontSize: "0.9rem" }}>
                  No posee especialidades
                </span>
              )}
            </div>
          )}
        </div>

        <div className="form-row">
          <label>CUIL/CUIT</label>
          {isEditing ? (
            <Input type="text" value={cuil} onChange={setCuil} />
          ) : (
            <span>{cuil}</span>
          )}
        </div>

        <div className="form-row">
          <label>Nombre completo</label>
          {isEditing ? (
            <Input type="text" value={nombre} onChange={setNombre} />
          ) : (
            <span>{nombre}</span>
          )}
        </div>

        <div className="form-row">
          <label>Teléfonos</label>
          {isEditing ? (
            <MultipleInput
              type="tel"
              name="telefono"
              onChange={setTelefonos}
              values={telefonos}
            />
          ) : (
            telefonos.map((t, i) => <span key={i}>{t}</span>)
          )}
        </div>

        <div className="form-row">
          <label>Emails</label>
          {isEditing ? (
            <MultipleInput
              type="email"
              name="email"
              onChange={setEmails}
              values={emails}
            />
          ) : (
            emails.map((e, i) => <span key={i}>{e}</span>)
          )}
        </div>

        {/* Fechas de alta y baja */}
        <div className="form-row">
          <label>Fecha de alta</label>
          {isEditing ? (
            <Input type="date" value={fechaAlta} onChange={setFechaAlta} />
          ) : (
            <span>{fechaAlta || "No especificada"}</span>
          )}
        </div>

        <div className="form-row">
          <label>Fecha de baja</label>
          {isEditing ? (
            <Input type="date" value={fechaBaja} onChange={setFechaBaja} />
          ) : (
            <span>{fechaBaja || "Activo"}</span>
          )}
        </div>

        {/* Horarios de Atención */}
        <div className="schedules">
          <h4>Direcciones y Horarios de atención</h4>
          <div className="schedules-container">
            {listaDirecciones.map((dir, i) => (
              <div className="schedule-card" key={dir.id || i}>
                <div className="schedule-header">
                  <h4>
                    {dir.calle} {dir.numero}, {dir.localidad} (
                    {dir.codigoPostal || "—"})
                    {dir.esDireccionCentroMedico && (
                      <span
                        style={{
                          marginLeft: "0.5rem",
                          fontSize: "0.7rem",
                          background: "#e3f2fd",
                          color: "#1565c0",
                          padding: "3px 8px",
                          borderRadius: "10px",
                          border: "1px solid #90caf9",
                        }}
                      >
                        Dirección del Centro
                      </span>
                    )}
                  </h4>
                </div>
                <div className="schedule-list">
                  {dir.horariosAtencion?.map((hor, j) => (
                    <div className="schedule-item" key={j}>
                      <strong>{hor.dia}</strong> - {hor.desde} a {hor.hasta}
                      <span className="schedule-badge">
                        Duración: {hor.duracionTurno} | Turnos:{" "}
                        {calcularTurnos(hor)}
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
                      {hor.profesional?.nombreCompleto && (
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#1565c0",
                            fontWeight: "500",
                            paddingLeft: "0.25rem",
                          }}
                        >
                          Profesional: {hor.profesional.nombreCompleto}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && !dir.esDireccionCentroMedico && (
                  <div className="schedule-actions">
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => handleVerMas(dir)}
                    >
                      <Edit2 size={16} style={{ marginRight: "8px" }} />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleEliminarDireccion(dir)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="fixed-add-button">
              <Button
                className="add-schedule"
                onClick={handleAgregarNuevaDireccion}
              >
                + Agregar nueva dirección
              </Button>
            </div>
          )}
        </div>

        {/* Gestión de profesionales (solo para Centros Médicos) */}
        {tipoPrestador === "Centro Médico" && prestador && (
          <div
            className="form-row"
            style={{ flexDirection: "column", gap: "1rem" }}
          >
            {profesionalesAsociados.length > 0 ? (
              <MedicosIndependientesAccordion
                title="Profesionales Independientes Ascociados"
                icon={<Users size={20} />}
              >
                <div className="busqueda-contenedor-input">
                  <Input
                    type="text"
                    placeholder={"Buscar profesional por nombre o CUIL"}
                    value={busqueda}
                    onChange={(value) => {
                      setBusqueda(value);
                      setPaginaActual(1);
                    }}
                    variant="search"
                  />
                </div>
                {profesionalesPaginados.map((prof) => (
                  <div
                    key={prof.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <div>
                        <strong>{prof.nombreCompleto}</strong>
                        {prof.especialidades?.length > 0 && (
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "#666",
                              marginTop: "0.25rem",
                            }}
                          >
                            Especialidad:
                            {prof.especialidades
                              .map((e) => " " + e.nombre)
                              .join(",")}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => navigate("/prestadores/" + prof.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          background: "#4B81D8",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#3a6bc7";
                          e.currentTarget.style.transform = "translateY(-1px)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 4px rgba(75,129,216,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#4B81D8";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <Eye size={16} />
                        Ver más
                      </button>
                    </div>
                    {isEditing && (
                      <Button
                        variant="danger"
                        size="small"
                        icon={Trash2}
                        onClick={() => handleEliminarProfesional(prof.id)}
                        disabled={loadingProfesionales}
                      >
                        Desvincular
                      </Button>
                    )}
                  </div>
                ))}
                <Paginacion
                  totalPages={totalPages}
                  currentPage={paginaActual}
                  onPageChange={handleChangePage}
                ></Paginacion>
              </MedicosIndependientesAccordion>
            ) : (
              <p style={{ color: "#666", fontStyle: "italic" }}>
                No hay profesionales asociados
              </p>
            )}

            {isEditing && profesionalesDisponibles.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Select
                    options={[
                      { value: "", label: "Seleccionar profesional..." },
                      ...profesionalesDisponibles.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.nombreCompleto} - ${
                          p.especialidades?.map((e) => e.nombre).join(", ") ||
                          "Sin especialidades"
                        }`,
                      })),
                    ]}
                    value={profesionalSeleccionado}
                    onChange={setProfesionalSeleccionado}
                  />
                </div>
                <Button
                  variant="primary"
                  size="small"
                  icon={Plus}
                  onClick={handleAgregarProfesional}
                  disabled={!profesionalSeleccionado || loadingProfesionales}
                >
                  {loadingProfesionales ? "Agregando..." : "Agregar"}
                </Button>
              </div>
            )}

            {isEditing &&
              profesionalesDisponibles.length === 0 &&
              profesionalesIndependientes.length > 0 && (
                <p
                  style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    fontStyle: "italic",
                  }}
                >
                  Todos los profesionales disponibles ya están asociados
                </p>
              )}

            {isEditing && profesionalesIndependientes.length === 0 && (
              <p
                style={{
                  color: "#666",
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                }}
              >
                No hay profesionales independientes disponibles en el sistema
              </p>
            )}
          </div>
        )}
        <div className="form-row"></div>
        <div className="form-row"></div>
        <div className="botones-acciones">
          <Button
            size="large"
            variant="cancel"
            onClick={() => navigate("/prestadores")}
          >
            Cancelar
          </Button>
          {isEditing ? (
            <>
              <Button size="large" variant="primary" onClick={handleGuardar}>
                {prestador ? "Guardar cambios" : "Dar de alta"}
              </Button>
              {prestador && estaActivo() && (
                <Button
                  size="large"
                  variant="danger"
                  onClick={handleAbrirModalBaja}
                >
                  Dar de baja
                </Button>
              )}
              {prestador && !estaActivo() && (
                <Button
                  size="large"
                  variant="primary"
                  onClick={handleReactivar}
                >
                  Reactivar
                </Button>
              )}
            </>
          ) : (
            <Button
              size="large"
              variant="primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={16} style={{ marginRight: "8px" }} />
              Editar
            </Button>
          )}
        </div>

        {direccionSeleccionada && (
          <ModalDireccion
            prestadorId={prestador?.id || 0}
            direccion={direccionSeleccionada}
            todasDirecciones={listaDirecciones}
            especialidadesPrestador={seleccionadas}
            profesionalesDisponibles={profesionalesAsociados}
            esCentroMedico={tipoPrestador === "Centro Médico"}
            onClose={handleCloseModal}
            onSave={handleSaveDireccion}
          />
        )}


        {/* Modal para seleccionar tipo de baja */}
        {modalBajaOpen && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              zIndex: 10001,
              minWidth: "300px",
            }}
          >
            <h4 style={{ marginBottom: "1rem" }}>Seleccionar fecha de baja</h4>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="radio"
                  value="inmediata"
                  checked={tipoBaja === "inmediata"}
                  onChange={() => {
                    setTipoBaja("inmediata");
                    setFechaBajaSeleccionada(
                      new Date().toISOString().split("T")[0]
                    );
                  }}
                />
                Baja inmediata (hoy)
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="radio"
                  value="diferida"
                  checked={tipoBaja === "diferida"}
                  onChange={() => setTipoBaja("diferida")}
                />
                Baja diferida
              </label>
            </div>
            {tipoBaja === "diferida" && (
              <Input
                type="date"
                value={fechaBajaSeleccionada}
                onChange={setFechaBajaSeleccionada}
              />
            )}
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="cancel"
                size="small"
                onClick={() => setModalBajaOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={handleConfirmarBaja}
              >
                Confirmar baja
              </Button>
            </div>
          </div>
        )}

        {/* Modal universal */}
        <Modal
          isOpen={modal.isOpen}
          onClose={modal.cerrarModal}
          onConfirm={modal.confirmarModal}
          titulo={modal.config?.titulo || ""}
          mensaje={modal.config?.mensaje || ""}
          submensaje={modal.config?.submensaje}
          tipo={modal.config?.tipo || "info"}
          textoBotonConfirmar={modal.config?.textoBotonConfirmar}
          textoBotonCancelar={modal.config?.textoBotonCancelar}
          icono={modal.config?.icono}
          contenidoExtra={modal.config?.contenidoExtra}
          soloInformacion={modal.config?.soloInformacion}
          listaErrores={modal.config?.listaErrores}
        />
      </div>
    </>
  );
};

export default PrestadoresFormEdit;
