import React, { useEffect, useState, useMemo, useRef } from "react";
import Header from "../components/genericos/Header";
import "./PaginaEstilos.css";
import "./AgendaPage.css";
import Modal from "../components/genericos/Modal";
import { useModal } from "../hooks/useModal";
import { agendaService } from "../services/agendaService";
import { useNavigate } from "react-router-dom";
import SubHeader from "../components/genericos/SubHeader";
 
import {
  Calendar as RBCalendar,
  Views,
  dateFnsLocalizer,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Select from "../components/genericos/Select";

type Turno = {
  id?: number;
  prestadorId: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  duracion?: number; // minutes
  paciente?: any;
};

const diasSemanaEsp = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const stripDiacritics = (str: string) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
const locales = { es: es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const horaAMinutos = (h: string) => {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + (mm || 0);
};
const parseDuracion = (v: any): number => {
  if (v == null) return 30;
  if (typeof v === "number") return v;
  const s = String(v).trim();
  if (!s) return 30;
  if (s.includes(":")) return horaAMinutos(s);
  const m = s.match(/(\d+)/);
  if (m) return Number(m[1]);
  return 30;
};

const formatDateLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const generateSyntheticTurnos = (
  prestadoresList: any[],
  date: Date
): Turno[] => {
  const out: Turno[] = [];
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  for (const p of prestadoresList || []) {
    for (const d of p.direccion || []) {
      for (const h of d.horariosAtencion || []) {
        const diaIndex = diasSemanaEsp.findIndex(
          (dn) => stripDiacritics(dn) === stripDiacritics(h.dia)
        );
        if (diaIndex === -1) continue;
        const offset = diaIndex === 0 ? 6 : diaIndex - 1;
        const dateOfWeek = new Date(weekStart);
        dateOfWeek.setDate(weekStart.getDate() + offset);
        const startMin = horaAMinutos(h.desde || "00:00");
        let endMin = horaAMinutos(h.hasta || "");
        if (isNaN(endMin) || endMin <= startMin) endMin = startMin + 8 * 60;
        const dur = parseDuracion(h.duracionTurno || 30);
        for (let slot = startMin; slot + dur <= endMin; slot += dur) {
          const hh = Math.floor(slot / 60)
            .toString()
            .padStart(2, "0");
          const mm = (slot % 60).toString().padStart(2, "0");
          const fecha = formatDateLocal(dateOfWeek);
          const hora = `${hh}:${mm}`;
          out.push({
            id: undefined,
            prestadorId: p.id,
            fecha,
            hora,
            duracion: dur,
          });
        }
      }
    }
  }
  return out;
};

const AgendaPage: React.FC = () => {
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>("");
  const [filtroPrestador, setFiltroPrestador] = useState<string>("");
  const [view, setView] = useState<"month" | "week" | "day">("week");

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [backendTurnos, setBackendTurnos] = useState<Turno[]>([]);
  const [events, setEvents] = useState<any[]>([]); 
  const [showDisponibilidad, setShowDisponibilidad] = useState<boolean>(true);
  
  const modal = useModal();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const currentDateRef = useRef<Date>(currentDate);
  useEffect(() => {
    currentDateRef.current = currentDate;
  }, [currentDate]);
  
  const [pendingSlot, setPendingSlot] = useState<{
    start: Date;
    prestadorId: number;
  } | null>(null);
  const [pacienteNombre, setPacienteNombre] = useState<string>("");
  const [duracionSeleccionada, setDuracionSeleccionada] = useState<number>(30);
  const [notasTurno, setNotasTurno] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const presRaw = await agendaService.getPrestadores();
        const pres = Array.isArray(presRaw)
          ? presRaw
          : presRaw && Array.isArray((presRaw as any).data)
          ? (presRaw as any).data
          : [];
        setPrestadores(pres);
        const specs = Array.from(
          new Set(
            (pres || []).flatMap((p: any) => {
              if (!Array.isArray(p.especialidades)) return [];
              return p.especialidades
                .map((s: any) =>
                  typeof s === "string"
                    ? s
                    : s && s.nombre
                    ? s.nombre
                    : String(s)
                )
                .filter(Boolean);
            })
          )
        );
        setEspecialidades(specs as string[]);

        const t = await agendaService.getTurnos();
        setBackendTurnos(Array.isArray(t) ? t : []);
      } catch (e) {
        console.error("Error cargando datos de agenda", e);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (Array.isArray(backendTurnos) && backendTurnos.length > 0) {
      setTurnos(backendTurnos);
    } else {
      const synth = generateSyntheticTurnos(prestadores, currentDate);
      setTurnos(synth);
    }
  }, [backendTurnos, prestadores, currentDate]);
  useEffect(() => {
    const turnoEvents = (turnos || []).map((t: any, idx: number) => {
      const start = new Date(`${t.fecha}T${t.hora}:00`);
      const dur = t.duracion || 30;
      const endDate = new Date(start.getTime() + dur * 60000);
      return {
        id: t.id ?? `synth-${idx}-${t.prestadorId}`,
        title: t.paciente
          ? `${t.paciente.nombre} ${t.paciente.apellido}`
          : "Turno",
        start,
        end: endDate,
        resourceId: `p-${t.prestadorId}`,
        extendedProps: t,
      };
    });

    setEvents(turnoEvents);
  }, [turnos, currentDate]);

  const prestadoresFiltrados = useMemo(() => {
    return prestadores.filter((p) => {
      if (
        filtroEspecialidad &&
        !(p.especialidades || [])
          .map((s: any) => s.nombre)
          .includes(filtroEspecialidad)
      )
        return false;
      if (filtroPrestador && String(p.id) !== String(filtroPrestador))
        return false;
      return true;
    });
  }, [prestadores, filtroEspecialidad, filtroPrestador]);

  useEffect(() => {
    if (!filtroPrestador) return;
    const sel = prestadores.find((p) => String(p.id) === String(filtroPrestador));
    if (!sel) return;
    const hasDireccion = Array.isArray(sel.direccion) && sel.direccion.length > 0;
    if (!hasDireccion) {
      modal.mostrarAdvertencia(
        "Prestador sin dirección",
        `El prestador ${sel.nombreCompleto || sel.nombre} no tiene una dirección configurada. Por ese motivo no tiene horarios de atención ni turnos asociados.`
      );
    }
  }, [filtroPrestador, prestadores]);

  const validarContraHorario = (
    prest: any,
    fechaISO: string,
    duracionMinutos = 30
  ) => {
    const fechaObj = new Date(fechaISO);
    const dia = diasSemanaEsp[fechaObj.getDay()];
    const diaNorm = stripDiacritics(dia);
    const hora = `${String(fechaObj.getHours()).padStart(2, "0")}:${String(
      fechaObj.getMinutes()
    ).padStart(2, "0")}`;

    for (const dir of prest.direccion || []) {
      for (const h of dir.horariosAtencion || []) {
        if (stripDiacritics(h.dia) !== diaNorm) continue;
        const inicio = horaAMinutos(h.desde);
        const fin = horaAMinutos(h.hasta);
        const sel = horaAMinutos(hora);
        const dur =
          typeof h.duracionTurno === "string" && h.duracionTurno.includes(":")
            ? horaAMinutos(h.duracionTurno)
            : Number(h.duracionTurno || 0);
        const durToCheck = dur || duracionMinutos;
        if (sel >= inicio && sel + durToCheck <= fin)
          return { ok: true, horario: h };
      }
    }
    return { ok: false };
  };

  const handleSelectSlot = async (slotInfo: any) => {
    const start: Date = new Date(slotInfo.start);

    if (!filtroPrestador) {
      modal.mostrarAdvertencia(
        "Seleccione prestador",
        "Seleccione un prestador antes de elegir un slot en el calendario"
      );
      return;
    }
    const prest = prestadores.find(
      (p) => String(p.id) === String(filtroPrestador)
    );
    if (!prest) {
      modal.mostrarError(
        "Prestador no encontrado",
        "No se encontró el prestador seleccionado"
      );
      return;
    }

    const startISO = start.toISOString();
    const valid = validarContraHorario(prest, startISO);
    if (!valid.ok) {
      modal.mostrarAdvertencia(
        "Horario inválido",
        "La hora seleccionada está fuera del horario de atención del prestador"
      );
      return;
    }

    
    const collides = (turnos || []).some((t) => {
      if (String(t.prestadorId) !== String(prest.id)) return false;
      const tStart = new Date(`${t.fecha}T${t.hora}:00`);
      const tEnd = new Date(tStart.getTime() + (t.duracion || 30) * 60000);
      const selStart = start;
      const durMin = valid.horario
        ? parseDuracion(valid.horario.duracionTurno || 30)
        : 30;
      const selEnd = new Date(selStart.getTime() + durMin * 60000);
      return selStart < tEnd && selEnd > tStart;
    });

    if (collides) {
      modal.mostrarError(
        "Horario ocupado",
        "Ya existe un turno en ese horario para el prestador seleccionado"
      );
      return;
    }

    
    setPendingSlot({ start, prestadorId: prest.id });
    setPacienteNombre("");
    setNotasTurno("");
    setDuracionSeleccionada(
      valid.horario ? parseDuracion(valid.horario.duracionTurno || 30) : 30
    );

    const createTurnoFlow = async () => {
      if (!pendingSlot) return;
      const start = pendingSlot.start;
      setIsCreating(true);
      try {
        const turnoPayload = {
          prestadorId: pendingSlot.prestadorId,
          fecha: start.toISOString().split("T")[0],
          hora: start.toISOString().split("T")[1].slice(0, 5),
          duracion: duracionSeleccionada,
          paciente: { nombre: pacienteNombre },
          notas: notasTurno,
        };
        await agendaService.createTurno(turnoPayload);
        modal.mostrarExito("Turno creado", "El turno fue creado correctamente");
        const t = await agendaService.getTurnos();
        setBackendTurnos(Array.isArray(t) ? t : []);
        setPendingSlot(null);
      } catch (e: any) {
        console.error(e);
        modal.mostrarError("Error creando turno", e.message || String(e));
      } finally {
        setIsCreating(false);
      }
    };

    modal.mostrarModal({
      titulo: "Crear turno",
      mensaje: `Crear turno para ${
        prest.nombreCompleto || prest.nombre + " " + prest.apellido
      } el ${start.toLocaleString()}`,
      tipo: "confirmation",
      textoBotonConfirmar: "Crear",
      textoBotonCancelar: "Cancelar",
      contenidoExtra: (
        <div style={{ display: "grid", gap: 8 }}>
          <label>Paciente</label>
          <input
            value={pacienteNombre}
            onChange={(e) => setPacienteNombre(e.target.value)}
          />
          <label>Duración (min)</label>
          <select
            value={String(duracionSeleccionada)}
            onChange={(e) => setDuracionSeleccionada(Number(e.target.value))}
          >
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="45">45</option>
            <option value="60">60</option>
          </select>
          <label>Notas</label>
          <textarea
            value={notasTurno}
            onChange={(e) => setNotasTurno(e.target.value)}
          />
        </div>
      ),
      onConfirmar: createTurnoFlow,
    });
  };

  const renderCalendar = () => {
    const resources = prestadores.map((p) => ({
      resourceId: `p-${p.id}`,
      resourceTitle: p.nombreCompleto || p.nombre + " " + (p.apellido || ""),
      horariosAtencion:
        p.direccion?.flatMap((d: any) => d.horariosAtencion || []) || [],
      especialidades: Array.isArray(p.especialidades)
        ? p.especialidades.map((s: any) => s.nombre)
        : [],
    }));

    const minTime = 6; // 6:00
    const maxTime = 22; // 22:00

    
    
    const CustomToolbar = (toolbarProps: any) => {
      const { label, view: toolbarView, onView } = toolbarProps;

      const startOfWeekDate = startOfWeek(new Date(currentDate), {
        weekStartsOn: 1,
      });
      const endOfWeekDate = new Date(
        startOfWeekDate.getTime() + 6 * 24 * 60 * 60 * 1000
      );

      const formatRange = (d1: Date, d2: Date) => {
        const fmt = (d: Date) =>
          `${d.getDate()} ${d.toLocaleString("es-ES", { month: "short" })}`;
        return `${fmt(d1)} - ${fmt(d2)}`;
      };

      const goPrev = () => {
        if (toolbarView === "day") {
          setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
        } else if (toolbarView === "week") {
          setCurrentDate((prev) => {
            const s = startOfWeek(new Date(prev), { weekStartsOn: 1 });
            return new Date(s.getFullYear(), s.getMonth(), s.getDate() - 7);
          });
        } else if (toolbarView === "month") {
          setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        } else {
          setCurrentDate((prev) => {
            const s = startOfWeek(new Date(prev), { weekStartsOn: 1 });
            return new Date(s.getFullYear(), s.getMonth(), s.getDate() - 7);
          });
        }
      };
      const goNext = () => {
        if (toolbarView === "day") {
          setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
        } else if (toolbarView === "week") {
          setCurrentDate((prev) => {
            const s = startOfWeek(new Date(prev), { weekStartsOn: 1 });
            return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7);
          });
        } else if (toolbarView === "month") {
          setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        } else {
          setCurrentDate((prev) => {
            const s = startOfWeek(new Date(prev), { weekStartsOn: 1 });
            return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7);
          });
        }
      };

      const goToday = () => {
        if (toolbarView === "week") setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
        else setCurrentDate(new Date());
      };

      const centerLabel = (() => {
        if (toolbarView === "week") return formatRange(startOfWeekDate, endOfWeekDate);
        if (toolbarView === "day")
          return new Date(currentDate).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "short",
          });
        if (toolbarView === "month")
          return new Date(currentDate).toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric",
          });
        return label || "";
      })();

      return (
        <div className="rbc-custom-toolbar">
          <div className="rbc-toolbar-center" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <button className="rbc-btn" onClick={goPrev} aria-label="Anterior">
              ‹
            </button>
            <div
              role="button"
              tabIndex={0}
              onClick={goToday}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") goToday();
              }}
              style={{ minWidth: 180, textAlign: "center", fontWeight: 600, color: "#0b66d1", cursor: "pointer" }}
            >
              {centerLabel}
            </div>
            <button className="rbc-btn" onClick={goNext} aria-label="Siguiente">
              ›
            </button>
          </div>
          <div className="rbc-toolbar-right">
            <button className="rbc-btn small" onClick={() => onView && onView("month")}>Mes</button>
            <button className="rbc-btn small" onClick={() => onView && onView("week")}>Semana</button>
            <button className="rbc-btn small" onClick={() => onView && onView("day")}>Día</button>
          </div>
        </div>
      );
    };

    const showDetalleTurno = (prest?: any, turnoOrArr?: any) => {
      const arr = Array.isArray(turnoOrArr) ? turnoOrArr : turnoOrArr ? [turnoOrArr] : [];
      const turno = !Array.isArray(turnoOrArr) && turnoOrArr ? turnoOrArr : undefined;
      const p = prest || (turno ? prestadores.find((x) => String(x.id) === String(turno.prestadorId)) : undefined);

      const addresses = p && Array.isArray(p.direccion) && p.direccion.length > 0
        ? p.direccion.map((d: any) => `${d.calle || ''} ${d.numero || ''} ${d.localidad || ''}`.trim()).filter(Boolean).join(' — ')
        : 'No registrada';

      const specs = p && Array.isArray(p.especialidades)
        ? p.especialidades.map((s: any) => (s && s.nombre ? s.nombre : s)).filter(Boolean).join(', ')
        : '-';

      
      let rangeText = '-';
      if (arr.length > 0) {
        let minStart = Infinity;
        let maxEnd = -Infinity;
        for (const t of arr) {
          const s = horaAMinutos(t.hora);
          const dur = Number(t.duracion || 30);
          minStart = Math.min(minStart, s);
          maxEnd = Math.max(maxEnd, s + dur);
        }
        const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        rangeText = `${fmt(minStart)} - ${fmt(maxEnd)}`;
      } else if (turno) {
        const s = horaAMinutos(turno.hora);
        const dur = Number(turno.duracion || 30);
        const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        rangeText = `${fmt(s)} - ${fmt(s + dur)}`;
      }

      modal.mostrarModal({
        titulo: 'Detalle de turno',
        mensaje: p ? (p.nombreCompleto || `${p.nombre} ${p.apellido || ''}`) : 'Turno',
        tipo: 'info',
        contenidoExtra: (
          <div>
            {turno && (
              <>
                <p><strong>Inicio:</strong> {new Date(`${turno.fecha}T${turno.hora}:00`).toLocaleString()}</p>
                <p><strong>Duración:</strong> {Math.round((Number(turno.duracion || 30)))} min</p>
              </>
            )}
            <p><strong>Rango:</strong> {rangeText}</p>
            <p><strong>Turnos:</strong> {arr.length > 0 ? arr.length : (turno ? 1 : 0)}</p>
            <p><strong>Dirección(es):</strong> {addresses}</p>
            <p><strong>Especialidades:</strong> {specs}</p>
          </div>
        ),
        soloInformacion: true,
      });
    };

    const isCentroPrestador = (p: any) => {
      if (!p) return false;
      
      if (Object.prototype.hasOwnProperty.call(p, 'isProfesionalIndependiente')) {
        return !Boolean(p.isProfesionalIndependiente);
      }
      if (Object.prototype.hasOwnProperty.call(p, 'esProfesionalIndependiente')) {
        return !Boolean(p.esProfesionalIndependiente);
      }
      const tipo = p.tipoPrestacion || p.tipo || "";
      return /centro/i.test(String(tipo));
    };

    const getPrestadorTagColors = (p: any) => {
      if (isCentroPrestador(p)) {
        return { background: "#e6f7ff", border: "#9ad6ff", text: "#054a6a" };
      }
      return { background: "#e9fbe9", border: "#9be79b", text: "#0b5a2b" };
    };

    return (
      <div className="agenda-calendar" style={{ height: 650 }}>
        {view === "day" ? (
          <div>
            <CustomToolbar onView={(v: any) => setView(v)} view={"day"} />
            <div className="day-cards-view">
              {(() => {
                  const dayKey = formatDateLocal(currentDate);
                  const presToShow = prestadoresFiltrados;
                  if (!presToShow || presToShow.length === 0)
                    return <div className="muted">No hay prestadores</div>;
                  return presToShow.map((p: any) => {
                    const myTurnos = (turnos || [])
                      .filter(
                        (t: any) =>
                          String(t.prestadorId) === String(p.id) &&
                          t.fecha === dayKey
                      )
                      .sort(
                        (a: any, b: any) =>
                          horaAMinutos(a.hora) - horaAMinutos(b.hora)
                      );
                    let minStart = Infinity;
                    let maxEnd = -Infinity;
                    for (const t of myTurnos) {
                      const s = horaAMinutos(t.hora);
                      const dur = Number(t.duracion || 30);
                      minStart = Math.min(minStart, s);
                      maxEnd = Math.max(maxEnd, s + dur);
                    }
                    const fmt = (m: number) =>
                      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
                        m % 60
                      ).padStart(2, "0")}`;
                    const rangeText =
                      minStart === Infinity
                        ? "-"
                        : `${fmt(minStart)} - ${fmt(maxEnd)}`;
                    const todayNameNorm = stripDiacritics(
                      diasSemanaEsp[new Date(currentDate).getDay()]
                    );
                    const horariosForDay = (p.direccion || [])
                      .flatMap((d: any) => d.horariosAtencion || [])
                      .filter(
                        (h: any) => stripDiacritics(h.dia) === todayNameNorm
                      );
                    const durSet = Array.from(
                      new Set(
                        horariosForDay.map((h: any) =>
                          parseDuracion(h.duracionTurno || 30)
                        )
                      )
                    );
                    const durText =
                      durSet.length === 1
                        ? `${durSet[0]} min`
                        : durSet.length === 0
                        ? "N/A"
                        : `${durSet.join(", ")} min`;

                    const hasHorarios = horariosForDay.length > 0;
                    let firstAvailableHora: string | null = null;
                    for (const h of horariosForDay) {
                      const startMin = horaAMinutos(h.desde || "00:00");
                      let endMin = horaAMinutos(h.hasta || "");
                      if (isNaN(endMin) || endMin <= startMin) endMin = startMin + 8 * 60;
                      const dur = parseDuracion(h.duracionTurno || 30);
                      for (let slot = startMin; slot + dur <= endMin; slot += dur) {
                        const hh = String(Math.floor(slot / 60)).padStart(2, "0");
                        const mm = String(slot % 60).padStart(2, "0");
                        const candidate = `${hh}:${mm}`;
                        const collides = (turnos || []).some((t: any) =>
                          String(t.prestadorId) === String(p.id) && t.fecha === dayKey && t.hora === candidate
                        );
                        if (!collides) {
                          firstAvailableHora = candidate;
                          break;
                        }
                      }
                      if (firstAvailableHora) break;
                    }
                    const suggestedHora =
                      firstAvailableHora || (horariosForDay[0] && horariosForDay[0].desde) || "09:00";
                    const noHorarioReason = !p.direccion || p.direccion.length === 0
                      ? "Sin direcciones configuradas"
                      : horariosForDay.length === 0
                      ? "No tiene horarios para el día seleccionado"
                      : "";

                    return (
                      <div className="prestador-card" key={p.id}>
                        <h4 style={{ color: "#0b8f4a", display: "flex", alignItems: "center", gap: 8 }}>
                          <span>{p.nombreCompleto || p.nombre + " " + p.apellido}</span>
                          {!hasHorarios && (
                            <span title={noHorarioReason} aria-label={noHorarioReason} style={{
                              background: "#fff0f0",
                              color: "#a00",
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: noHorarioReason ? "help" : "default",
                            }}>
                              Sin horarios
                            </span>
                          )}
                        </h4>
                        <div
                          className="single-globo"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>
                              {rangeText}
                            </div>
                            <div style={{ fontSize: 13, color: "#333" }}>
                              {durText} • {myTurnos.length} turno
                              {myTurnos.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              className="rbc-btn"
                              onClick={() => showDetalleTurno(p, myTurnos)}
                            >
                              Detalle
                            </button>
                            {/** Crear turno rápido: habilitado sólo si tiene horarios para el día */}
                            <button
                              className="rbc-btn"
                              disabled={!hasHorarios}
                              onClick={() => {
                                const fecha = dayKey;
                                const hora = suggestedHora;
                                modal.mostrarModal({
                                  titulo: "Crear turno rápido",
                                  mensaje: `Crear turno para ${
                                    p.nombreCompleto || p.nombre + " " + p.apellido
                                  } el ${fecha} ${hora}`,
                                  tipo: "confirmation",
                                  textoBotonConfirmar: "Crear",
                                  textoBotonCancelar: "Cancelar",
                                  onConfirmar: async () => {
                                    try {
                                      await agendaService.createTurno({
                                        prestadorId: p.id,
                                        fecha,
                                        hora,
                                        duracion: parseDuracion(
                                          horariosForDay[0]?.duracionTurno || 30
                                        ),
                                        paciente: { nombre: "Paciente" },
                                      });
                                      modal.mostrarExito(
                                        "Turno creado",
                                        "Turno creado correctamente"
                                      );
                                      const t = await agendaService.getTurnos();
                                      setBackendTurnos(Array.isArray(t) ? t : []);
                                    } catch (e: any) {
                                      modal.mostrarError("Error", e?.message || String(e));
                                    }
                                  },
                                });
                              }}
                            >
                              Crear turno
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              }
            </div>
          </div>
        ) : view === "week" ? (
          <div>
            <CustomToolbar onView={(v: any) => setView(v)} view={"week"} />
            <div className="week-grid">
              {(() => {
                const start = startOfWeek(currentDate, { weekStartsOn: 1 });
                const days = Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(start);
                  d.setDate(start.getDate() + i);
                  return d;
                });
                const todayKey = formatDateLocal(new Date());
                return days.map((d) => {
                  const dayKey = formatDateLocal(d);
                  const dayTurnos = turnos.filter(
                    (t) =>
                      t.fecha === dayKey &&
                      (!filtroPrestador ||
                        String(t.prestadorId) === String(filtroPrestador)) &&
                      (!filtroEspecialidad ||
                        (
                          prestadores.find(
                            (p) => String(p.id) === String(t.prestadorId)
                          )?.especialidades || []
                        )
                          .map((s: any) => s.nombre)
                          .includes(filtroEspecialidad))
                  );
                  const isToday = dayKey === todayKey;
                  return (
                    <div
                      className={"week-day" + (isToday ? " today" : "")}
                      key={dayKey}
                    >
                      <div className="day-header">
                        {d.toLocaleDateString("es-ES", { weekday: "short" })}{" "}
                        <span className="day-num">{d.getDate()}</span>
                      </div>
                      <div className="day-body">
                        {dayTurnos.length === 0 ? (
                          <div className="muted small">Sin turnos</div>
                        ) : (
                          (() => {
                            const groups: { [k: string]: any[] } = {};
                            for (const dt of dayTurnos) {
                              const key = String(dt.prestadorId);
                              groups[key] = groups[key] || [];
                              groups[key].push(dt);
                            }
                            return Object.entries(groups).map(([pid, arr]) => {
                              const prest = prestadores.find(
                                (p) => String(p.id) === String(pid)
                              );
                              let minStart = Infinity;
                              let maxEnd = -Infinity;
                              for (const t of arr) {
                                const s = horaAMinutos(t.hora);
                                const dur = Number(t.duracion || 30);
                                minStart = Math.min(minStart, s);
                                maxEnd = Math.max(maxEnd, s + dur);
                              }
                              const fmt = (m: number) =>
                                `${String(Math.floor(m / 60)).padStart(
                                  2,
                                  "0"
                                )}:${String(m % 60).padStart(2, "0")}`;
                              const rangeText = `${fmt(minStart)} - ${fmt(
                                maxEnd
                              )}`;
                              const colors = getPrestadorTagColors(prest);
                              const bg = colors.background;
                              const border = colors.border;
                              return (
                                <div
                                  className="chip"
                                  key={pid}
                                  style={{
                                    background: bg,
                                    borderColor: border,
                                  }}
                                    onClick={() => showDetalleTurno(prest, arr)}
                                >
                                  <div className="chip-time">{rangeText}</div>
                                  <div className="chip-title">
                                    {prest
                                      ? prest.nombre || prest.nombreCompleto
                                      : "Prestador"}
                                  </div>
                                </div>
                              );
                            });
                          })()
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ) : view === "month" ? (
          <div>
            <CustomToolbar onView={(v: any) => setView(v)} view={"month"} />
            <div className="month-grid">
              {(() => {
                const start = startOfWeek(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    1
                  ),
                  { weekStartsOn: 1 }
                );
                const end = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  0
                );
                const days: Date[] = [];
                let cursor = new Date(start);
                while (cursor <= end || getDay(cursor) !== 1) {
                  days.push(new Date(cursor));
                  cursor.setDate(cursor.getDate() + 1);
                }
                const weeks: Date[][] = [];
                for (let i = 0; i < days.length; i += 7)
                  weeks.push(days.slice(i, i + 7));
                return weeks.map((week, wi) => (
                  <div className="month-week" key={wi}>
                    {week.map((d) => {
                      const dayKey = formatDateLocal(d);
                      const dayTurnos = turnos.filter(
                        (t) =>
                          t.fecha === dayKey &&
                          (!filtroPrestador ||
                            String(t.prestadorId) ===
                              String(filtroPrestador)) &&
                          (!filtroEspecialidad ||
                            (
                              prestadores.find(
                                (p) => String(p.id) === String(t.prestadorId)
                              )?.especialidades || []
                            )
                              .map((s: any) => s.nombre)
                              .includes(filtroEspecialidad))
                      );
                      const isToday = dayKey === formatDateLocal(new Date());
                      return (
                        <div
                          className={
                            "month-day" +
                            (d.getMonth() === currentDateRef.current.getMonth()
                              ? ""
                              : " other-month") +
                            (isToday ? " today" : "")
                          }
                          key={dayKey}
                          onClick={() => {
                            const dt = new Date(dayKey);
                            setCurrentDate(dt);
                            setView("day");
                          }}
                        >
                          <div className="day-header small">
                            {d.toLocaleDateString("es-ES", {
                              weekday: "short",
                            })}{" "}
                            <span className="day-num">{d.getDate()}</span>
                          </div>
                          <div className="day-body small">
                            {(() => {
                              const groups: { [k: string]: any[] } = {};
                              for (const dt of dayTurnos) {
                                const key = String(dt.prestadorId);
                                groups[key] = groups[key] || [];
                                groups[key].push(dt);
                              }
                              const entries = Object.entries(groups);
                              const visible = entries.slice(0, 2);
                              return (
                                <>
                                  {visible.map(([pid, arr]) => {
                                    const prest = prestadores.find(
                                      (p) => String(p.id) === String(pid)
                                    );
                                    let minStart = Infinity;
                                    let maxEnd = -Infinity;
                                    for (const t of arr) {
                                      const s = horaAMinutos(t.hora);
                                      const dur = Number(t.duracion || 30);
                                      minStart = Math.min(minStart, s);
                                      maxEnd = Math.max(maxEnd, s + dur);
                                    }
                                    const fmt = (m: number) =>
                                      `${String(Math.floor(m / 60)).padStart(
                                        2,
                                        "0"
                                      )}:${String(m % 60).padStart(2, "0")}`;
                                    const rangeText = `${fmt(minStart)} - ${fmt(
                                      maxEnd
                                    )}`;
                                    const colors = getPrestadorTagColors(prest);
                                    const bg = colors.background;
                                    const border = colors.border;
                                    return (
                                      <div
                                        className="chip"
                                        key={pid}
                                        style={{
                                          background: bg,
                                          borderColor: border,
                                        }}
                                        onClick={() => showDetalleTurno(prest, arr)}
                                      >
                                        {rangeText} -{" "}
                                        {prest
                                          ? prest.nombre || prest.nombreCompleto
                                          : "Prestador"}
                                      </div>
                                    );
                                  })}
                                  {entries.length > 2 && (
                                    <div
                                      className="more-badge"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentDate(new Date(dayKey));
                                        setView("week");
                                      }}
                                    >{`+${entries.length - 2} más`}</div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>
        ) : (
          <RBCalendar
            localizer={localizer}
            events={events}
            resources={resources}
            resourceIdAccessor="resourceId"
            resourceTitleAccessor="resourceTitle"
            defaultView={Views.WEEK}
            view={view}
            date={currentDate}
            onView={(v: any) => setView(v)}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            step={30}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={(evt: any) => {
              showDetalleTurno(undefined, evt.extendedProps);
            }}
            eventPropGetter={(event: any) => {
              const pid = event.extendedProps?.prestadorId ?? (event.resourceId && String(event.resourceId).startsWith('p-') ? String(event.resourceId).slice(2) : undefined);
              const prest = prestadores.find((p) => String(p.id) === String(pid));
              const colors = getPrestadorTagColors(prest);
              return {
                style: {
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  borderRadius: 12,
                  padding: '2px 8px'
                }
              };
            }}
            min={new Date(1970, 1, 1, minTime, 0, 0)}
            max={new Date(1970, 1, 1, maxTime, 0, 0)}
            components={{ toolbar: CustomToolbar }}
            onRangeChange={() => {
              /* keep default */
            }}
            toolbar={true}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="admin-page">
        <Header
          title="Agenda de Turnos"
          subtitle="Asignación de turnos a prestadores"
        />
        <div className="admin-content">
          <SubHeader
            title="Agenda"
            subtitle="Calendario y asignación de turnos"
            onVolver={() => navigate("/")}
            onAlta={async () => {
              const prest = filtroPrestador
                ? prestadores.find(
                    (p) => String(p.id) === String(filtroPrestador)
                  )
                : prestadores[0] || null;
              if (!prest) {
                modal.mostrarAdvertencia(
                  "Sin prestador",
                  "No hay prestador disponible para dar de alta un turno"
                );
                return;
              }
              const hoy = new Date();
              const fecha = formatDateLocal(hoy);
              const hora = "09:00";
              modal.mostrarModal({
                titulo: "Crear turno rápido",
                mensaje: `Crear turno para ${
                  prest.nombreCompleto || prest.nombre + " " + prest.apellido
                } el ${fecha} ${hora}`,
                tipo: "confirmation",
                textoBotonConfirmar: "Crear",
                textoBotonCancelar: "Cancelar",
                onConfirmar: async () => {
                  try {
                    await agendaService.createTurno({
                      prestadorId: prest.id,
                      fecha,
                      hora,
                      duracion: 30,
                      paciente: { nombre: "Paciente" },
                    });
                    modal.mostrarExito(
                      "Turno creado",
                      "Turno creado correctamente"
                    );
                    const t = await agendaService.getTurnos();
                    setBackendTurnos(Array.isArray(t) ? t : []);
                  } catch (e: any) {
                    modal.mostrarError("Error", e?.message || String(e));
                  }
                },
              });
            }}
            buttonText="Nuevo turno"
          />

          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <label>Especialidad:</label>
              <Select
                        value={filtroEspecialidad}
                        onChange={(value) => setFiltroEspecialidad(value)}
                        options={[
                          { value: "", label: "Todos" },
                          ...especialidades.map((especialidad) => ({
                            value: especialidad,
                            label: especialidad,
                          })),
                        ]}
              ></Select>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <label>Prestador:</label>
              <Select
                        value={filtroPrestador}
                        onChange={(value) => setFiltroPrestador(value)}
                        options={[
                          { value: "", label: "Todos" },
                          ...prestadores.map((prestador) => ({
                            value: prestador.id,
                            label:
                              prestador.nombreCompleto ||
                              prestador.nombre + " " + (prestador.apellido || ""),
                          })),
                        ]}
              ></Select>
            </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        className="rbc-btn small"
                        onClick={() => {
                          setFiltroEspecialidad("");
                          setFiltroPrestador("");
                        }}
                      >
                        Eliminar filtros
                      </button>
                    </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                id="showDisp"
                checked={showDisponibilidad}
                onChange={(e) => setShowDisponibilidad(e.target.checked)}
              />
              <label htmlFor="showDisp">
                Mostrar disponibilidad (horarios)
              </label>
            </div>
          </div>

          <div>
            {renderCalendar()}
          </div>
        </div>
      </div>

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
      {isCreating && (
        <div className="creating-overlay">
          <div className="creating-box">Creando turno...</div>
        </div>
      )}
    </>
  );
};

export default AgendaPage;
