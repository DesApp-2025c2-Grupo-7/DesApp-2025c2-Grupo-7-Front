import React, { useState, useEffect } from "react";
import Button from "../genericos/Button";
import type { Direccion, HorarioAtencion } from "../../types/prestadores";
import "./ModalDireccion.css";
import { getApiUrl } from "../../config/env";
import Input from "../genericos/Input";
import Select from "../genericos/Select";

interface ModalDireccionProps {
  prestadorId: number;
  direccion: Direccion | null;
  onClose: () => void;
  onSave: (direccion: Direccion) => void;
  todasDirecciones?: Direccion[];
}

const ModalDireccion: React.FC<ModalDireccionProps> = ({
  prestadorId,
  direccion,
  onClose,
  onSave,
  todasDirecciones = [],
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

  useEffect(() => {
    setForm(
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
    setErrores({});
  }, [direccion]);

  const horaAMinutos = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  };

  const validarHorario = (horario: HorarioAtencion, index: number): string[] => {
    const nuevosErrores: string[] = [];
    if (!horario.desde || !horario.hasta || !horario.duracionTurno)
      return nuevosErrores;

    const inicio = horaAMinutos(horario.desde);
    const fin = horaAMinutos(horario.hasta);
    if (inicio >= fin)
      nuevosErrores.push("Hora inicio es mayor o igual a hora fin");

    let duracion = horario.duracionTurno.includes(":")
      ? horaAMinutos(horario.duracionTurno)
      : Number(horario.duracionTurno);
    if (duracion <= 0) nuevosErrores.push("Duración inválida");

    // Solapamiento con otras direcciones
    for (const dir of todasDirecciones || []) {
      if (dir.id === form.id) continue;
      for (const hO of dir.horariosAtencion) {
        if (hO.dia === horario.dia) {
          const inicioO = horaAMinutos(hO.desde);
          const finO = horaAMinutos(hO.hasta);
          if (!(fin <= inicioO || inicio >= finO)) {
            nuevosErrores.push(
              `Se superpone con otra dirección: ${dir.calle} ${dir.numero}`
            );
          }
        }
      }
    }

    // Solapamiento dentro de la misma dirección
    form.horariosAtencion.forEach((hI, i) => {
      if (i === index) return;
      if (hI.dia === horario.dia) {
        const inicioI = horaAMinutos(hI.desde);
        const finI = horaAMinutos(hI.hasta);
        if (!(fin <= inicioI || inicio >= finI))
          nuevosErrores.push("Se superpone con otro horario en esta dirección");
      }
    });

    return nuevosErrores;
  };

  const handleChange = (e: { target: { name?: string; value: string } }) => {
    const { name, value } = e.target;
    if (!name) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHorarioChange = (
    index: number,
    field: keyof HorarioAtencion,
    value: string
  ) => {
    const nuevosHorarios = form.horariosAtencion.map((h, i) =>
      i === index ? { ...h, [field]: value } : h
    );
    setForm((prev) => ({ ...prev, horariosAtencion: nuevosHorarios }));

    const erroresTotales: { [key: number]: string[] } = {};
    nuevosHorarios.forEach((h, i) => {
      const err = validarHorario(h, i);
      if (err.length > 0) erroresTotales[i] = err;
    });
    setErrores(erroresTotales);
  };

  const handleAddHorario = () => {
    const nuevo: HorarioAtencion = {
      id: 0,
      dia: "",
      desde: "",
      hasta: "",
      duracionTurno: "",
    };
    setForm((prev) => ({
      ...prev,
      horariosAtencion: [...prev.horariosAtencion, nuevo],
    }));
  };

  const handleDeleteHorario = (index: number) => {
    if (!window.confirm("¿Deseas eliminar este horario?")) return;
    const nuevos = form.horariosAtencion.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, horariosAtencion: nuevos }));

    // Revalidar
    const erroresTotales: { [key: number]: string[] } = {};
    nuevos.forEach((h, i) => {
      const err = validarHorario(h, i);
      if (err.length > 0) erroresTotales[i] = err;
    });
    setErrores(erroresTotales);
  };

  const handleSave = async () => {
    if (Object.keys(errores).length > 0) {
      alert("Corrige los errores antes de guardar");
      return;
    }

    if (!window.confirm("¿Deseas guardar los cambios realizados?")) return;

    // ⚙️ Si el prestador aún no existe, guardamos localmente
    if (!prestadorId || prestadorId === 0) {
      onSave({ ...form, esTemporal: true });
      onClose();
      return;
    }

    try {
      const method = form.id === 0 ? "POST" : "PUT";
      const url =
        form.id === 0
          ? `${getApiUrl(`/prestadores/${prestadorId}/direcciones`)}`
          : `${getApiUrl(
              `/prestadores/${prestadorId}/direcciones/${form.id}`
            )}`;

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

      if (!resDir.ok) throw new Error("Error al guardar dirección");
      const dirGuardada: Direccion = await resDir.json();

      // Guardar horarios
      const horariosActualizados: HorarioAtencion[] = [];
      for (const hor of form.horariosAtencion) {
        const horData = {
          ...hor,
          duracionTurno: hor.duracionTurno.includes("min")
            ? hor.duracionTurno
            : hor.duracionTurno + " minutos",
        };

        let resHor;
        if (hor.id && hor.id !== 0) {
          resHor = await fetch(
            `${getApiUrl(
              `/prestadores/${prestadorId}/direcciones/${dirGuardada.id}/horarios/${hor.id}`
            )}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(horData),
            }
          );
        } else {
          resHor = await fetch(
            `${getApiUrl(
              `/prestadores/${prestadorId}/direcciones/${dirGuardada.id}/horarios`
            )}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(horData),
            }
          );
        }

        const dataHor = await resHor.json();
        horariosActualizados.push({ ...hor, id: dataHor.id });
      }

      onSave({ ...dirGuardada, horariosAtencion: horariosActualizados });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la dirección o sus horarios");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="modal-overlay" onKeyDown={handleKeyDown}>
      <div className="modal-card">
        <h3 className="section-title">
          {form.id === 0 ? "Nueva Dirección" : "Editar Dirección"}
        </h3>

        {Object.keys(errores).length > 0 && (
          <div
            style={{
              color: "red",
              backgroundColor: "#ffe6e6",
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "4px",
              border: "1px solid red",
            }}
          >
            {Object.entries(errores).map(([idx, errs]) => (
              <div key={idx}>
                Horario {Number(idx) + 1}: {errs.join(", ")}
              </div>
            ))}
          </div>
        )}

        <div
          className="modal-content"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          <label>
            Calle:{" "}
            <Input
              type="text"
              name="calle"
              value={form.calle}
              onChange={(value) =>
                handleChange({ target: { name: "calle", value } })
              }
            />
          </label>
          <label>
            Número:{" "}
            <Input
              type="text"
              name="numero"
              value={form.numero}
              onChange={(value) =>
                handleChange({ target: { name: "numero", value } })
              }
            />
          </label>
          <label>
            Localidad:{" "}
            <Input
              type="text"
              name="localidad"
              value={form.localidad}
              onChange={(value) =>
                handleChange({ target: { name: "localidad", value } })
              }
            />
          </label>
          <label>
            Código Postal:{" "}
            <Input
              type="text"
              name="codigoPostal"
              value={form.codigoPostal}
              onChange={(value) =>
                handleChange({ target: { name: "codigoPostal", value } })
              }
            />
          </label>

          <h4>Horarios de Atención</h4>
          {form.horariosAtencion.map((hor, i) => (
            <div
              key={i}
              className="horario-item"
              style={{ marginBottom: "0.5rem" }}
            >
              <label>
                Día:{" "}
                <Select
                  value={hor.dia}
                  onChange={(value) => handleHorarioChange(i, "dia", value)}
                  options={[
                    { value: "Lunes", label: "Lunes" },
                    { value: "Martes", label: "Martes" },
                    { value: "Miercoles", label: "Miércoles" },
                    { value: "Jueves", label: "Jueves" },
                    { value: "Viernes", label: "Viernes" },
                    { value: "Sabado", label: "Sábado" },
                  ]}
                />
              </label>
              <label>
                Desde:{" "}
                <Input
                  type="time"
                  value={hor.desde}
                  onChange={(value) =>
                    handleHorarioChange(i, "desde", value)
                  }
                />
              </label>
              <label>
                Hasta:{" "}
                <Input
                  type="time"
                  value={hor.hasta}
                  onChange={(value) =>
                    handleHorarioChange(i, "hasta", value)
                  }
                />
              </label>
              <label>
                Duración:{" "}
                <Input
                  type="time"
                  value={hor.duracionTurno}
                  onChange={(value) =>
                    handleHorarioChange(i, "duracionTurno", value)
                  }
                />
              </label>
              <div style={{ marginTop: "15px" }}>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDeleteHorario(i)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
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
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            borderTop: "1px solid #ccc",
          }}
        >
          <Button variant="cancel" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalDireccion;
