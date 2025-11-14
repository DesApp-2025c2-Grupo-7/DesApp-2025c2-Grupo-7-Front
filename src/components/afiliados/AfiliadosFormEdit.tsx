import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import "./ListaAfiliados.css";
import Button from "../genericos/Button";
import MultipleInput from "../genericos/MultipleInput";
import DireccionInput from "../genericos/DireccionInput";
import SituacionesTerapeuticasInput from "./SituacionesTerapeuticasInput";
import Modal from "../genericos/Modal";
import { useModal } from "../../hooks/useModal";
import { personasService } from "../../services/personasService";
import { Trash2 } from "lucide-react";

type SituacionTerapeutica = {
  diagnostico: string;
  fechaInicio: string;
  fechaFin: string;
};

type FormDataType = {
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefonos: string[];
  emails: string[];
  direccion: {
    calle: string;
    numero: string;
    depto: string;
    localidad: string;
    codigoPostal: string;
  }[];
  parentesco: string;
  situacionesTerapeuticas: SituacionTerapeutica[];
  planMedico: string;
  fechaAlta: string;
  fechaBaja: string;
};

export default function AfiliadosFormEdit() {
  /* Hooks */
  const navigate = useNavigate();
  const modal = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    tipoDocumento: "DNI", // Valor predeterminado
    numeroDocumento: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    telefonos: [""],
    emails: [""],
    direccion: [
      { calle: "", numero: "", depto: "", localidad: "", codigoPostal: "" },
    ],
    parentesco: "Titular", // Valor predeterminado
    situacionesTerapeuticas: [
      { diagnostico: "", fechaInicio: "", fechaFin: "" },
    ],
    planMedico: "Bronce", // Valor predeterminado
    fechaAlta: new Date().toISOString().split("T")[0], // Fecha actual por defecto
    fechaBaja: "",
  });

  const [listaSituacionesTerapeuticas] = useState([
    "Diabetes",
    "Hipertension",
    "Alcoholismo",
    "Obesidad",
    "Asma",
  ]);

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDireccionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedDirecciones = [...formData.direccion];
    updatedDirecciones[index] = {
      ...updatedDirecciones[index],
      [field]: value,
    };
    setFormData({ ...formData, direccion: updatedDirecciones });
  };

  const addDireccionField = () => {
    setFormData({
      ...formData,
      direccion: [
        ...formData.direccion,
        { calle: "", numero: "", depto: "", localidad: "", codigoPostal: "" },
      ],
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // No hacer nada aquí, los botones manejan sus propias acciones
  };

  // Maneja el cambio de una situación terapéutica individual
  const handleSituacionTerapeuticaChange = (
    index: number,
    field: keyof SituacionTerapeutica,
    value: string
  ) => {
    const nuevasSituaciones = [...formData.situacionesTerapeuticas];
    nuevasSituaciones[index] = { ...nuevasSituaciones[index], [field]: value };
    setFormData({ ...formData, situacionesTerapeuticas: nuevasSituaciones });
  };

  // Validación del formulario
  const validarFormulario = (): { esValido: boolean; errores: string[] } => {
    const errores: string[] = [];

    // Validar campos obligatorios
    // La credencial y sufijo se asignan automáticamente en el backend; no validar aquí
    if (!formData.nombre.trim()) errores.push("El nombre es obligatorio");
    if (!formData.apellido.trim()) errores.push("El apellido es obligatorio");
    if (!formData.numeroDocumento.trim())
      errores.push("El número de documento es obligatorio");
    if (!formData.fechaNacimiento.trim())
      errores.push("La fecha de nacimiento es obligatoria");
    if (!formData.fechaAlta.trim())
      errores.push("La fecha de alta es obligatoria");

    // Validar direcciones
    if (
      formData.direccion.length === 0 ||
      !formData.direccion[0].calle.trim()
    ) {
      errores.push("Debe tener al menos una dirección válida");
    }

    // Validar teléfonos y emails
    const telefonosValidos = formData.telefonos.filter(
      (tel) => tel.trim() !== ""
    );
    const emailsValidos = formData.emails.filter(
      (email) => email.trim() !== ""
    );

    if (telefonosValidos.length === 0)
      errores.push("Debe tener al menos un teléfono");
    if (emailsValidos.length === 0)
      errores.push("Debe tener al menos un email");

    // Validar formato de emails
    emailsValidos.forEach((email, index) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errores.push(`El formato del email ${index + 1} no es válido`);
      }
    });

    // Validar fechas
    const fechaNac = new Date(formData.fechaNacimiento);
    const fechaAlta = new Date(formData.fechaAlta);
    const hoy = new Date();

    if (fechaNac > hoy)
      errores.push("La fecha de nacimiento no puede ser futura");
    if (fechaNac > fechaAlta)
      errores.push(
        "La fecha de alta no puede ser anterior a la fecha de nacimiento"
      );

    // Validar situaciones terapéuticas
    formData.situacionesTerapeuticas.forEach((situacion, index) => {
      if (situacion.diagnostico.trim() && !situacion.fechaInicio.trim()) {
        errores.push(`La situación ${index + 1} requiere fecha de inicio`);
      }
      if (
        situacion.fechaInicio &&
        situacion.fechaFin &&
        situacion.fechaFin < situacion.fechaInicio
      ) {
        errores.push(
          `En la situación ${
            index + 1
          }, la fecha de fin no puede ser anterior a la fecha de inicio`
        );
      }
    });

    return { esValido: errores.length === 0, errores };
  };

  // Función para cancelar y volver a la lista
  const handleCancelar = () => {
    navigate("/afiliados");
  };

  // Función para crear el titular
  const handleCrearTitular = async () => {
    const validacion = validarFormulario();

    if (!validacion.esValido) {
      modal.mostrarError(
        "Errores en el formulario",
        "Por favor corrige los siguientes errores:",
        validacion.errores
      );
      return;
    }

    setIsLoading(true);

    try {
      // Preparar datos para el backend
      const datosAfiliado = {
        // No enviar credencial/sufijo: el backend los genera automáticamente
        tipoPersona: "AFILIADO", // Titular
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        nombre: formData.nombre,
        apellido: formData.apellido,
        fechaNacimiento: formData.fechaNacimiento,
        telefono: formData.telefonos.filter((tel) => tel.trim() !== ""),
        email: formData.emails.filter((email) => email.trim() !== ""),
        parentesco: "Titular",
        fechaAlta: formData.fechaAlta,
        fechaBaja: formData.fechaBaja || null,
        // Omitir el campo 'depto' en el payload porque la entidad de la DB no lo contiene
        direccion: formData.direccion
          .filter((dir) => dir.calle.trim() !== "")
          .map((dir) => ({
            calle: dir.calle,
            numero: dir.numero,
            localidad: dir.localidad,
            codigoPostal: dir.codigoPostal,
          })),
        situacionesTerapeuticas: formData.situacionesTerapeuticas
          .filter(
            (st) => st.diagnostico.trim() !== "" && st.fechaInicio.trim() !== ""
          )
          .map((st) => ({
            ...st,
            fechaFin: st.fechaFin.trim() === "" ? null : st.fechaFin,
          })),
        // planMedico va en la raíz del DTO (el backend lo lee desde dto.planMedico)
        planMedico: formData.planMedico,
      };

      // Llamar al servicio para crear el titular (usando createIntegrante para titular)
      console.log(
        "Payload crear afiliado:",
        JSON.stringify(datosAfiliado, null, 2)
      );
      const nuevoAfiliado = await personasService.createAfiliado(datosAfiliado);

      // Mostrar modal de éxito y navegar cuando el usuario confirme
      modal.mostrarModal({
        titulo: "¡Afiliado creado exitosamente!",
        mensaje: `Se ha dado de alta al titular ${formData.nombre} ${formData.apellido}. Credencial asignada: ${nuevoAfiliado.credencial}-${nuevoAfiliado.sufijo}`,
        submensaje: "Presione Aceptar para ir al perfil del afiliado.",
        tipo: "success",
        textoBotonConfirmar: "Aceptar",
        soloInformacion: true,
        onConfirmar: () => navigate(`/afiliados/${nuevoAfiliado.id}`),
      });
    } catch (error: any) {
      console.error("Error al crear afiliado:", error);

      modal.mostrarError(
        "Error al crear afiliado",
        "No se pudo dar de alta al afiliado",
        [error.message || "Error desconocido del servidor"]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className="afiliado-form" onSubmit={handleSubmit}>
        {/* Credencial */}
        {/* La credencial se asigna automáticamente en el backend */}

        {/* Parentesco */}
        <div className="form-row">
          <label>Parentesco</label>
          <input
            disabled
            value={"Titular"}
            style={{
              background: "#fff",
              border: "1px solid #ccd6e0",
              borderRadius: "8px",
              padding: "0.7rem 1rem",
              fontSize: "0.95rem",
              color: "#2c3e50",
              fontWeight: 500,
              minHeight: "42px",
              display: "flex",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          ></input>
        </div>

        {/* Plan Médico */}
        <div className="form-row-double-item-left">
          <label>Plan médico *</label>
          <Select
            className="input-valor"
            name="planMedico"
            onChange={(value: string) => handleInputChange("planMedico", value)}
            options={[
              { value: "Bronce", label: "Bronce" },
              { value: "Plata", label: "Plata" },
              { value: "Oro", label: "Oro" },
              { value: "Platino", label: "Platino" },
            ]}
          />
        </div>

        {/* Nombre */}
        <div className="form-row">
          <label>Nombre *</label>
          <Input
            type="text"
            className="input-valor"
            name="nombre"
            value={formData.nombre}
            onChange={(value: string) => handleInputChange("nombre", value)}
            required
            validationType="nombre"
            showValidation={true}
          />
        </div>

        {/* Apellido */}
        <div className="form-row">
          <label>Apellido *</label>
          <Input
            type="text"
            className="input-valor"
            name="apellido"
            value={formData.apellido}
            onChange={(value: string) => handleInputChange("apellido", value)}
            required
            validationType="apellido"
            showValidation={true}
          />
        </div>

        {/* Tipo y número de documento */}
        <div className="form-row-double">
          <div className="form-row-double-item-left">
            <label>Tipo de documento *</label>
            <Select
              className="input-valor"
              name="tipoDocumento"
              onChange={(value: string) =>
                handleInputChange("tipoDocumento", value)
              }
              options={[
                { value: "DNI", label: "DNI" },
                { value: "LC", label: "LC" },
                { value: "LE", label: "LE" },
                { value: "PASAPORTE", label: "Pasaporte" },
              ]}
            />
          </div>
          <div className="form-row-double-item-right">
            <label>Documento *</label>
            <Input
              type="text"
              className="input-valor"
              name="documento"
              value={formData.numeroDocumento}
              onChange={(value: string) =>
                handleInputChange("numeroDocumento", value)
              }
              required
              validationType="dni"
              showValidation={true}
            />
          </div>
        </div>

        {/* Fecha de nacimiento */}
        <div className="form-row">
          <label>Fecha de nacimiento *</label>
          <Input
            type="date"
            className="input-valor"
            value={formData.fechaNacimiento}
            onChange={(value: string) =>
              handleInputChange("fechaNacimiento", value)
            }
            required
          />
        </div>

        {/* Fecha de alta del sistema */}
        <div className="form-row">
          <label>Fecha de Alta del Sistema *</label>
          <Input
            type="date"
            className="input-valor"
            value={formData.fechaAlta}
            onChange={(value: string) => handleInputChange("fechaAlta", value)}
            required
          />
          <small
            style={{ color: "#666", fontSize: "0.8rem", marginTop: "5px" }}
          >
            Fecha en que se registra en el sistema
          </small>
        </div>

        {/* Dirección */}
        <div className="form-row">
          <label>Direcciones *</label>
          {formData.direccion.map((direccion, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <DireccionInput
                direccion={direccion}
                onChange={(field, value) =>
                  handleDireccionChange(index, field, value)
                }
              />

              {/* Botón eliminar dirección */}
              {formData.direccion.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const updatedDirecciones = formData.direccion.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, direccion: updatedDirecciones });
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#d11a2a",
                  }}
                  title="Eliminar dirección"
                >
                  <Trash2 size={18} color="#d11a2a" />
                </button>
              )}
            </div>
          ))}
          <button
            style={{
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
              fontWeight: "bold",
              padding: 0,
              marginTop: "5px",
              width: "100%",
              textAlign: "left",
            }}
            type="button"
            onClick={addDireccionField}
          >
            + Agregar dirección
          </button>
        </div>

        {/* Teléfono */}
        <div className="form-row">
          <label>Teléfono *</label>
          <MultipleInput
            type="tel"
            name="telefono"
            onChange={(values) =>
              setFormData({ ...formData, telefonos: values })
            }
          />
        </div>

        {/* Emails */}
        <div className="form-row">
          <label>Email *</label>
          <MultipleInput
            name="email"
            type="email"
            onChange={(values) => setFormData({ ...formData, emails: values })}
          />
        </div>

        {/* Situaciones Terapéuticas */}
        <>
          <div
            className="form-row"
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label>Situaciones Terapéuticas (opcional)</label>

            {formData.situacionesTerapeuticas.map((situacion, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <SituacionesTerapeuticasInput
                  value={situacion}
                  onChange={(field, value) =>
                    handleSituacionTerapeuticaChange(
                      index,
                      field as keyof SituacionTerapeutica,
                      value
                    )
                  }
                  listaSituacionesTerapeuticas={listaSituacionesTerapeuticas}
                />

                {/* Botón eliminar situación */}
                {formData.situacionesTerapeuticas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const nuevasSituaciones =
                        formData.situacionesTerapeuticas.filter(
                          (_, i) => i !== index
                        );
                      setFormData({
                        ...formData,
                        situacionesTerapeuticas: nuevasSituaciones,
                      });
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "18px",
                      color: "#d11a2a",
                    }}
                    title="Eliminar situación"
                  >
                    <Trash2 size={18} color="#d11a2a" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "blue",
                cursor: "pointer",
                fontWeight: "bold",
                padding: 0,
                marginTop: "5px",
                width: "100%",
                textAlign: "left",
              }}
              onClick={() =>
                setFormData({
                  ...formData,
                  situacionesTerapeuticas: [
                    ...formData.situacionesTerapeuticas,
                    { diagnostico: "", fechaInicio: "", fechaFin: "" },
                  ],
                })
              }
            >
              + Agregar situación terapéutica
            </button>
          </div>
          <div className="form-row"></div>

          <Button
            type="button"
            variant="cancel"
            onClick={handleCancelar}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleCrearTitular}
            disabled={isLoading}
          >
            {isLoading ? "Creando..." : "Dar de alta"}
          </Button>
        </>
      </form>

      {/* Modal */}
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
}

/* EXTRA
1. Agregar en todos los "Agregar x cosa" un eliminar.

*/
