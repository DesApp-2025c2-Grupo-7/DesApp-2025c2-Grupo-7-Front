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
import Button from "../components/genericos/Button";

type Turno = {
  id?: number;
  prestadorId: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  duracion?: number; // minutes
  paciente?: any;
  especialidad?: any;
  centro?: string;
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
const generateTurnos = (prestadoresList: any[], date: Date): Turno[] => {
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
            especialidad: h.especialidad || null,
            centro: d.nombre || p.nombre || "",
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
  const [onlyCentros, setOnlyCentros] = useState<boolean>(false);
  const [onlyIndependientes, setOnlyIndependientes] = useState<boolean>(false);
  const [view, setView] = useState<"month" | "week" | "day">("week");

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const modal = useModal();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const currentDateRef = useRef<Date>(currentDate);
  useEffect(() => {
    currentDateRef.current = currentDate;
  }, [currentDate]);

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
      } catch (e) {
        console.error("Error cargando datos de agenda", e);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const turnosAux = generateTurnos(prestadores, currentDate);
    setTurnos(turnosAux);
  }, [prestadores, currentDate]);
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
    const isCentro = (p: any) => {
      if (!p) return false;
      if (Object.prototype.hasOwnProperty.call(p, "isProfesionalIndependiente"))
        return !Boolean(p.isProfesionalIndependiente);
      if (Object.prototype.hasOwnProperty.call(p, "esProfesionalIndependiente"))
        return !Boolean(p.esProfesionalIndependiente);
      const tipo = p.tipoPrestacion || p.tipo || "";
      return /centro/i.test(String(tipo));
    };

    return prestadores.filter((p) => {
      if (
        filtroEspecialidad &&
        !(p.especialidades || [])
          .map((s: any) => (s && s.nombre ? s.nombre : s))
          .includes(filtroEspecialidad)
      )
        return false;
      if (filtroPrestador && String(p.id) !== String(filtroPrestador))
        return false;

      // apply centro/independiente filters
      if (onlyCentros && !onlyIndependientes) {
        if (!isCentro(p)) return false;
      } else if (onlyIndependientes && !onlyCentros) {
        if (isCentro(p)) return false;
      }

      return true;
    });
  }, [
    prestadores,
    filtroEspecialidad,
    filtroPrestador,
    onlyCentros,
    onlyIndependientes,
  ]);

  const allowedPrestadorIds = useMemo(
    () => new Set((prestadoresFiltrados || []).map((p: any) => String(p.id))),
    [prestadoresFiltrados]
  );

  useEffect(() => {
    if (!filtroPrestador) return;
    const sel = prestadores.find(
      (p) => String(p.id) === String(filtroPrestador)
    );
    if (!sel) return;
    const hasDireccion =
      Array.isArray(sel.direccion) && sel.direccion.length > 0;
    const hasHorarios =
      hasDireccion &&
      sel.direccion.some(
        (d: any) =>
          Array.isArray(d.horariosAtencion) && d.horariosAtencion.length > 0
      );

    // check whether there are any turnos for this prestador in the current period/day
    const anyTurnos = (turnos || []).some(
      (t) =>
        String(t.prestadorId) === String(sel.id) &&
        t.fecha === formatDateLocal(currentDate)
    );

    if (!hasDireccion) {
      modal.mostrarAdvertencia(
        "Prestador sin dirección",
        `El prestador ${
          sel.nombreCompleto || sel.nombre
        } no tiene una dirección configurada. Por ese motivo no tiene horarios de atención ni turnos asociados.`
      );
    } else if (!hasHorarios) {
      modal.mostrarAdvertencia(
        "Sin horarios de atención",
        `El prestador ${
          sel.nombreCompleto || sel.nombre
        } tiene direcciones registradas pero no dispone de horarios de atención. Por ese motivo no tiene turnos asociados.`
      );
    }
  }, [filtroPrestador, prestadores, turnos, currentDate]);

  const renderCalendar = () => {
    const resources = (prestadoresFiltrados || prestadores).map((p) => ({
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
          setCurrentDate(
            (prev) =>
              new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1)
          );
        } else {
          // week
          setCurrentDate((prev) => {
            const s = startOfWeek(new Date(prev), { weekStartsOn: 1 });
            return new Date(s.getFullYear(), s.getMonth(), s.getDate() - 7);
          });
        }
      };
      const goNext = () => {
        if (toolbarView === "day") {
          setCurrentDate(
            (prev) =>
              new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1)
          );
        } else {
          // week
          setCurrentDate((prev) => {
            const s = startOfWeek(new Date(prev), { weekStartsOn: 1 });
            return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7);
          });
        }
      };

      const goToday = () => {
        if (toolbarView === "week")
          setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
        else setCurrentDate(new Date());
      };

      const centerLabel = (() => {
        if (toolbarView === "week")
          return formatRange(startOfWeekDate, endOfWeekDate);
        if (toolbarView === "day")
          return new Date(currentDate).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "short",
          });
        return label || "";
      })();

      return (
        <div className="rbc-custom-toolbar">
          <div className="rbc-toolbar-left" style={{ display: "flex" }}>
            <button
              className="rbc-btn small"
              onClick={() => onView && onView("week")}
            >
              Semana
            </button>
            <button
              className="rbc-btn small"
              onClick={() => onView && onView("day")}
            >
              Día
            </button>
          </div>
          <div
            className="rbc-toolbar-center"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
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
              style={{
                minWidth: 180,
                textAlign: "center",
                fontWeight: 600,
                color: "#0b66d1",
                cursor: "pointer",
              }}
            >
              {centerLabel}
            </div>
            <button className="rbc-btn" onClick={goNext} aria-label="Siguiente">
              ›
            </button>
          </div>
          <div className="rbc-toolbar-right">
            {/* Legend */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginLeft: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    background: "#e9fbe9",
                    border: "1px solid #9be79b",
                    borderRadius: 3,
                    display: "inline-block",
                  }}
                />
                <small>Profesionales independientes</small>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    background: "#e6f7ff",
                    border: "1px solid #9ad6ff",
                    borderRadius: 3,
                    display: "inline-block",
                  }}
                />
                <small>Centros</small>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const showDetalleTurno = (prest?: any, turnoOrArr?: any) => {
      const arr = Array.isArray(turnoOrArr)
        ? turnoOrArr
        : turnoOrArr
        ? [turnoOrArr]
        : [];
      const turno =
        !Array.isArray(turnoOrArr) && turnoOrArr ? turnoOrArr : undefined;
      const p =
        prest ||
        (turno
          ? prestadores.find((x) => String(x.id) === String(turno.prestadorId))
          : undefined);

      const addresses =
        p && Array.isArray(p.direccion) && p.direccion.length > 0
          ? p.direccion
              .map((d: any) =>
                `${d.calle || ""} ${d.numero || ""} ${d.localidad || ""}`.trim()
              )
              .filter(Boolean)
              .join(" — ")
          : "No registrada";

      // ✅ Solo mostrar la especialidad del turno actual
      const specs =
        arr.length > 0
          ? arr[0]?.especialidad?.nombre || arr[0]?.especialidad || "-"
          : turno
          ? turno.especialidad?.nombre || turno.especialidad || "-"
          : "-";

      let rangeText = "-";
      if (arr.length > 0) {
        let minStart = Infinity;
        let maxEnd = -Infinity;
        for (const t of arr) {
          const s = horaAMinutos(t.hora);
          const dur = Number(t.duracion || 30);
          minStart = Math.min(minStart, s);
          maxEnd = Math.max(maxEnd, s + dur);
        }
        const fmt = (m: number) =>
          `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
            m % 60
          ).padStart(2, "0")}`;
        rangeText = `${fmt(minStart)} - ${fmt(maxEnd)}`;
      } else if (turno) {
        const s = horaAMinutos(turno.hora);
        const dur = Number(turno.duracion || 30);
        const fmt = (m: number) =>
          `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
            m % 60
          ).padStart(2, "0")}`;
        rangeText = `${fmt(s)} - ${fmt(s + dur)}`;
      }

      modal.mostrarModal({
        titulo: "Detalle de turno",
        mensaje: p
          ? p.nombreCompleto || `${p.nombre} ${p.apellido || ""}`
          : "Turno",
        tipo: "info",
        contenidoExtra: (
          <div>
            {turno && (
              <>
                <p>
                  <strong>Inicio:</strong>{" "}
                  {new Date(`${turno.fecha}T${turno.hora}:00`).toLocaleString()}
                </p>
                <p>
                  <strong>Duración:</strong>{" "}
                  {Math.round(Number(turno.duracion || 30))} min
                </p>
              </>
            )}
            <p>
              <strong>Rango:</strong> {rangeText}
            </p>
            <p>
              <strong>Turnos:</strong>{" "}
              {arr.length > 0 ? arr.length : turno ? 1 : 0}
            </p>
            <p>
              <strong>Dirección(es):</strong> {addresses}
            </p>
            <p>
              <strong>Especialidad:</strong> {specs}
            </p>
            <Button
              onClick={() => {
                navigate("/prestadores/" + p.id);
              }}
            >
              Ver más
            </Button>
          </div>
        ),
        soloInformacion: true,
      });
    };

    const isCentroPrestador = (p: any) => {
      if (!p) return false;

      if (
        Object.prototype.hasOwnProperty.call(p, "isProfesionalIndependiente")
      ) {
        return !Boolean(p.isProfesionalIndependiente);
      }
      if (
        Object.prototype.hasOwnProperty.call(p, "esProfesionalIndependiente")
      ) {
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

                return presToShow.flatMap((p: any) => {
                  // Obtener los turnos del prestador en el día actual
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

                  // Agrupar por especialidad
                  const groups: { [k: string]: any[] } = {};
                  for (const t of myTurnos) {
                    const key =
                      t.especialidad?.nombre ||
                      t.especialidad ||
                      "sin-especialidad";
                    groups[key] = groups[key] || [];
                    groups[key].push(t);
                  }

                  // Renderizar una tarjeta por especialidad
                  return Object.entries(groups).map(([esp, arr]) => {
                    let minStart = Infinity;
                    let maxEnd = -Infinity;
                    for (const t of arr) {
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

                    const durSet = Array.from(
                      new Set(
                        arr.map((h: any) => parseDuracion(h.duracion || 30))
                      )
                    );
                    const durText =
                      durSet.length === 1
                        ? `${durSet[0]} min`
                        : durSet.length === 0
                        ? "N/A"
                        : `${durSet.join(", ")} min`;

                    const todayNameNorm = stripDiacritics(
                      diasSemanaEsp[new Date(currentDate).getDay()]
                    );
                    const horariosForDay = (p.direccion || [])
                      .flatMap((d: any) => d.horariosAtencion || [])
                      .filter(
                        (h: any) => stripDiacritics(h.dia) === todayNameNorm
                      );

                    const hasHorarios = horariosForDay.length > 0;
                    const noHorarioReason =
                      !p.direccion || p.direccion.length === 0
                        ? "Sin direcciones configuradas"
                        : horariosForDay.length === 0
                        ? "No tiene horarios para el día seleccionado"
                        : "";

                    return (
                      <div className="prestador-card" key={`${p.id}-${esp}`}>
                        <h4
                          style={{
                            color: "#0b8f4a",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span>
                            {`${esp} - ${
                              p.nombreCompleto || p.nombre || "Prestador"
                            }`}
                          </span>
                          {!hasHorarios && (
                            <span
                              title={noHorarioReason}
                              aria-label={noHorarioReason}
                              style={{
                                background: "#fff0f0",
                                color: "#a00",
                                padding: "2px 8px",
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: noHorarioReason ? "help" : "default",
                              }}
                            >
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
                              {durText} • {arr.length} turno
                              {arr.length !== 1 ? "s" : ""}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              className="rbc-btn"
                              onClick={() => showDetalleTurno(p, arr)}
                            >
                              Detalle
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                });
              })()}
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
                          .includes(filtroEspecialidad)) &&
                      // respect centro/independiente filters
                      (allowedPrestadorIds.size === 0 ||
                        allowedPrestadorIds.has(String(t.prestadorId)))
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
                              const key = `${dt.prestadorId}-${
                                dt.especialidad?.nombre || "sin-especialidad"
                              }`;
                              groups[key] = groups[key] || [];
                              groups[key].push(dt);
                            }

                            return Object.entries(groups).map(([pid, arr]) => {
                              const prest = prestadores.find(
                                (p) =>
                                  String(p.id) === String(arr[0]?.prestadorId)
                              );
                              console.log(prestadores);
                              console.log(pid);
                              console.log(groups);
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
                                    {`${
                                      arr[0]?.especialidad?.nombre ||
                                      arr[0]?.especialidad ||
                                      "Sin especialidad"
                                    } - ${
                                      prest?.nombre ||
                                      prest?.nombreCompleto ||
                                      arr[0]?.centroNombre ||
                                      "Prestador"
                                    }`}
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
                              .includes(filtroEspecialidad)) &&
                          (allowedPrestadorIds.size === 0 ||
                            allowedPrestadorIds.has(String(t.prestadorId)))
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
                                        onClick={() =>
                                          showDetalleTurno(prest, arr)
                                        }
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
            onSelectEvent={(evt: any) => {
              showDetalleTurno(undefined, evt.extendedProps);
            }}
            eventPropGetter={(event: any) => {
              const pid =
                event.extendedProps?.prestadorId ??
                (event.resourceId && String(event.resourceId).startsWith("p-")
                  ? String(event.resourceId).slice(2)
                  : undefined);
              const prest = prestadores.find(
                (p) => String(p.id) === String(pid)
              );
              const colors = getPrestadorTagColors(prest);
              return {
                style: {
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  borderRadius: 12,
                  padding: "2px 8px",
                },
              };
            }}
            min={new Date(1970, 1, 1, minTime, 0, 0)}
            max={new Date(1970, 1, 1, maxTime, 0, 0)}
            components={{ toolbar: CustomToolbar }}
            onRangeChange={() => {}}
            toolbar={true}
          />
        )}
      </div>
    );
  };

  console.log(prestadores);
  console.log(prestadoresFiltrados);
  return (
    <>
      <div className="admin-page">
        <Header
          title="MedIntegral - Panel de Administración"
          subtitle="Administración de agenda de turnos"
        />
        <div className="admin-content">
          <SubHeader
            title="Agenda"
            subtitle="Calendario y asignación de turnos"
            onVolver={() => navigate("/")}
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

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyCentros}
                  onChange={(e) => setOnlyCentros(e.target.checked)}
                />
                Solo centros médicos
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyIndependientes}
                  onChange={(e) => setOnlyIndependientes(e.target.checked)}
                />
                Solo profesionales independientes
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="rbc-btn small"
                onClick={() => {
                  setFiltroEspecialidad("");
                  setFiltroPrestador("");
                  setOnlyCentros(false);
                  setOnlyIndependientes(false);
                }}
              >
                Eliminar filtros
              </button>
            </div>
          </div>

          <div>{renderCalendar()}</div>
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
    </>
  );
};

export default AgendaPage;
