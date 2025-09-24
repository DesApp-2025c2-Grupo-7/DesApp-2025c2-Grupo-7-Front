import React from "react";
import Button from "../genericos/Button";
import "./ListaAfiliados.css"
import type { Afiliado } from "../../types/afiliados";

interface AfiliadoFormProps {
  afiliado: Afiliado | null;
  onDarDeBaja: () => void;  
}

const AfiliadosForm: React.FC<AfiliadoFormProps> = ( {afiliado, onDarDeBaja}  ) => {
    //const navigate = useNavigate();
    return (
        <div className="afiliado-form">
          <div className="form-row"><label>Credencial</label><span>{afiliado?.credencial}</span></div> 
          <div className="form-row"><label>Plan médico</label><span>{afiliado?.planMedico}</span></div>
          <div className="form-row"><label>Tipo de documento</label><span>{afiliado?.tipoDocumento}</span></div>
          <div className="form-row"><label>Número de documento</label><span>{afiliado?.numeroDocumento}</span></div>
          <div className="form-row"><label>Nombre</label><span>{afiliado?.nombre}</span></div>
          <div className="form-row"><label>Apellido</label><span>{afiliado?.apellido}</span></div>
          <div className="form-row"><label>Fecha de nacimiento</label><span>{afiliado?.fechaNacimiento}</span></div>
          <div className="form-row"><label>Teléfono</label><span>{afiliado?.telefono.join(", ")}</span></div>
          <div className="form-row"><label>Dirección</label><span>{afiliado?.direccion.map((d) => `${d.calle} ${d.numero}${d.depto ? `, ${d.depto}`: ""}, ${d.codigoPostal}, ${d.localidad}`).join(" | ")}</span></div>
          <div className="form-row"><label>Mail</label><span>{afiliado?.email.map((e) => `${e}`).join(" | ")}</span></div> 
          <div className="form-row"><label>Fecha de Alta</label><span>{afiliado?.fechaAlta}</span></div>
          <div className="form-row"><label>Fecha Baja</label><span>{afiliado?.fechaBaja}</span></div>
          <div className="form-row">
            <label>Situaciones Terapeuticas</label>
            <span>
              {afiliado && afiliado.situacionesTerapeuticas && afiliado.situacionesTerapeuticas.length > 0
                ? afiliado.situacionesTerapeuticas.map((st) => st.diagnostico).join(", ")
                : "No posee situaciones terapeuticas"}
            </span>
          </div>


          <div className="form-row">
            <label>Estado del Afiliado</label>
            <span>{afiliado?.fechaBaja === null ? "Activo" : "Activo hasta " + afiliado?.fechaBaja}</span>
            
          </div>
            <Button size="large" variant="danger" type="button" onClick={onDarDeBaja}>
                Dar de baja
            </Button>
          
        </div>
    );
};

export default AfiliadosForm;


        