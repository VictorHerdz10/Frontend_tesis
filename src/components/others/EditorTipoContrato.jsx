import { useState, useEffect } from "react";
import {
  FaBriefcase,
  FaHandshake,
  FaHome,
  FaLaptop,
  FaUserTie,
  FaEdit,
  FaTrash,
  FaPlus,
  FaFileContract,
  FaBalanceScale,
  FaBuilding,
  FaChartLine,
  FaClipboardList,
  FaCogs,
  FaCoins,
  FaFileSignature,
  FaGlobe,
  FaIndustry,
  FaLandmark,
  FaMoneyBillAlt,
  FaRegHandshake,
  FaSuitcase,
  FaTools,
} from "react-icons/fa";
import { BsInfoCircle } from "react-icons/bs";
import { IoSaveOutline, IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clienteAxios from "../../axios/axios";
import useValidation from "../../hooks/useValidation";
import { Link, useNavigate } from "react-router-dom";

// Lista de íconos disponibles para seleccionar
const availableIcons = [
  { name: "FaBriefcase", icon: FaBriefcase },
  { name: "FaHandshake", icon: FaHandshake },
  { name: "FaHome", icon: FaHome },
  { name: "FaLaptop", icon: FaLaptop },
  { name: "FaUserTie", icon: FaUserTie },
  { name: "FaFileContract", icon: FaFileContract },
  { name: "FaBalanceScale", icon: FaBalanceScale },
  { name: "FaBuilding", icon: FaBuilding },
  { name: "FaChartLine", icon: FaChartLine },
  { name: "FaClipboardList", icon: FaClipboardList },
  { name: "FaCogs", icon: FaCogs },
  { name: "FaCoins", icon: FaCoins },
  { name: "FaFileSignature", icon: FaFileSignature },
  { name: "FaGlobe", icon: FaGlobe },
  { name: "FaIndustry", icon: FaIndustry },
  { name: "FaLandmark", icon: FaLandmark },
  { name: "FaMoneyBillAlt", icon: FaMoneyBillAlt },
  { name: "FaRegHandshake", icon: FaRegHandshake },
  { name: "FaSuitcase", icon: FaSuitcase },
  { name: "FaTools", icon: FaTools },
];

const ContractConfigPanel = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoveredField, setHoveredField] = useState(null);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [contractName, setContractName] = useState("");
  const [contractDescription, setContractDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [contractToEdit, setContractToEdit] = useState(null);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [contractAsociation, setContractAsociation] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { contractTypes, obtenerTiposContrato } = useValidation();
  const navigate = useNavigate();

  const requiredFields = [
    {
      id: "objetoContrato",
      label: "Objeto del Contrato",
      tooltip: "Descripción del objeto del contrato",
    },
    {
      id: "entidad",
      label: "Entidad",
      tooltip: "Entidad involucrada en el contrato",
    },
    {
      id: "direccionEjecutiva",
      label: "Dirección Ejecutiva",
      tooltip: "Dirección ejecutiva responsable",
    },
    {
      id: "aprobadorCC",
      label: "Aprobador por el CC",
      tooltip: "Fecha que fue aprobada por el Comité de Contrataciones",
    },
    {
      id: "fechaFirmada",
      label: "Fecha Firmada",
      tooltip: "Fecha en que se firmó el contrato",
    },
    {
      id: "entregadoJuridica",
      label: "Entregado Jurídica",
      tooltip: "Fecha que fue entregado al área jurídica",
    },
    {
      id: "fechaRecibido",
      label: "Fecha Recibido",
      tooltip: "Fecha de recepción del contrato",
    },
    { id: "monto", label: "Monto", tooltip: "Monto total del contrato" },
    { id: "vigencia", label: "Vigencia", tooltip: "Vigencia del contrato" },
    { id: "estado", label: "Estado", tooltip: "Estado actual del contrato" },
    {
      id: "numeroDictamen",
      label: "Número de Dictamen",
      tooltip: "Número de dictamen asociado",
    },
    {
      id: "subirPDF",
      label: "Subir PDF",
      tooltip: "Subir archivo PDF del contrato",
    },
  ];

  // Manejar la selección de un tipo de contrato
  const handleTypeSelect = (type) => {
    if (selectedType?._id === type._id) {
      // Si el tipo ya está seleccionado, deseleccionarlo
      setSelectedType(null);
      setSelectedFields([]); // Limpiar los campos seleccionados
    } else {
      // Si no está seleccionado, seleccionarlo
      setSelectedType(type);
      // Actualizar los campos seleccionados según los campos requeridos del tipo de contrato
      setSelectedFields(type.camposRequeridos.map((field) => field.id));
    }
  };

  // Manejar el cambio en los checkboxes de los campos requeridos
  const handleFieldToggle = (fieldId) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldId)) {
        return prev.filter((id) => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
    setHasChanges(true);
  };
  const handleAllContractAsociation = async (id) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const url = `/tipo-contrato/contratos-asociados/${id}`;
      const response = await clienteAxios.get(url, config);
      setContractAsociation(response.data);
    } catch (error) {}
  };
  // Guardar los cambios en los campos requeridos
  const handleSave = async () => {
    if (!selectedType) return;

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const url = `/tipo-contrato/actualizar-campos/${selectedType._id}`;
      const response = await clienteAxios.put(
        url,
        {
          camposRequeridos: requiredFields
            .filter((field) => selectedFields.includes(field.id))
            .map((field) => ({
              id: field.id,
              etiqueta: field.label,
              descripcion: field.tooltip,
            })),
        },
        config
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setHasChanges(false);
      toast.success(response.data.msg);
      await obtenerTiposContrato();
    } catch (error) {
      setSelectedFields(selectedType.camposRequeridos.map((field) => field.id));
      toast.error(error.response.data.msg);
    } finally {
      setHasChanges(false);
    }
  };

  // Crear un nuevo tipo de contrato
  const handleCreateContract = async () => {
    if (!contractName || !contractDescription || !selectedIcon) {
      setErrorText("Todos los campos son obligatorios.");
      return;
    }

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const url = "/tipo-contrato";
      const response = await clienteAxios.post(
        url,
        {
          nombre: contractName,
          icon: selectedIcon.name,
          descripcion: contractDescription,
          camposRequeridos: [],
        },
        config
      );
      toast.success(response.data.msg);
      await obtenerTiposContrato();
      setShowModalCreate(false);
      setContractName("");
      setContractDescription("");
      setSelectedIcon(null);
      setErrorText("");
    } catch (error) {
      toast.error(error.response.data.msg);
    }
  };

  // Actualizar un tipo de contrato
  const handleUpdateContract = async () => {
    if (!contractName || !contractDescription || !selectedIcon) {
      setErrorText("Todos los campos son obligatorios.");
      return;
    }

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const url = `/tipo-contrato/modificar-tipoContrato/${contractToEdit._id}`;
      const response = await clienteAxios.put(
        url,
        {
          nombre: contractName,
          icon: selectedIcon.name,
          descripcion: contractDescription,
        },
        config
      );
      toast.success(response.data.msg);
      await obtenerTiposContrato();
      setShowModalUpdate(false);
      setContractName("");
      setContractDescription("");
      setSelectedIcon(null);
      setErrorText("");
    } catch (error) {
      toast.error(error.response.data.msg);
    }
  };

  // Eliminar un tipo de contrato
  const handleDeleteContract = async () => {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const url = `/tipo-contrato/eliminar-tipoContrato/${contractToDelete._id}`;
      const response = await clienteAxios.delete(url, config);
      toast.success(response.data.msg);
      await obtenerTiposContrato();
      setShowModalDelete(false);
    } catch (error) {
      toast.error(error.response.data.msg);
    }
  };

  return (
    <div className="h-auto bg-blue-50  dark:bg-uci p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-end items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          {showSuccess && (
            <span className="bg-green-500 text-white px-4 py-2 rounded-md">
              ¡Cambios guardados exitosamente!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md text-white shadow-lg transition-all
              ${
                hasChanges
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            <IoSaveOutline className="text-xl" />
            <span>Guardar Cambios</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-t-4 border-blue-500 dark:border-blue-600">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Tipos de Contrato
            </h2>
            <div className="grid gap-4">
              {contractTypes.map((type) => (
                <div
                  key={type._id}
                  onClick={() => handleTypeSelect(type)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer transform hover:scale-[1.02]
                    ${
                      selectedType?._id === type._id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900 shadow-md"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`text-2xl ${
                          selectedType?._id === type._id
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {availableIcons
                          .find((icon) => icon.name === type.icon)
                          ?.icon()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">
                          {type.nombre}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {type.descripcion}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContractToEdit(type);
                          setContractName(type.nombre);
                          setContractDescription(type.descripcion);
                          setSelectedIcon(
                            availableIcons.find(
                              (icon) => icon.name === type.icon
                            )
                          );
                          setShowModalUpdate(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-600"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setContractToDelete(type);
                          await handleAllContractAsociation(type._id);
                          setShowModalDelete(true);
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowModalCreate(true)}
                className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all"
              >
                <FaPlus className="text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">
                  Agregar Tipo de Contrato
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-t-4 border-indigo-500 dark:border-indigo-600">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Campos Requeridos
            </h2>
            {!selectedType ? (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                Por favor, selecciona un tipo de contrato primero
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
                    Información del Contrato
                  </h3>
                  <div className="space-y-4">
                    {requiredFields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-2 rounded transition-colors mb-4"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={`${selectedType._id}-${field.id}`}
                            checked={selectedFields.includes(field.id)}
                            onChange={() => handleFieldToggle(field.id)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-green-300 dark:border-green-500"
                          />
                          <label
                            htmlFor={`${selectedType._id}-${field.id}`}
                            className="text-gray-700 dark:text-gray-300"
                          >
                            {field.label}
                          </label>
                        </div>
                        <div
                          className="relative"
                          onMouseEnter={() => setHoveredField(field.id)}
                          onMouseLeave={() => setHoveredField(null)}
                        >
                          <BsInfoCircle className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer" />
                          {hoveredField === field.id && (
                            <span className="absolute right-0 top-6 w-48 p-2 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md z-10">
                              {field.tooltip}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Crear */}
      {showModalCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl animate-slideIn">
            <button
              onClick={() => {
                setShowModalCreate(false);
                setErrorText("");
                setContractName("");
                setContractDescription("");
                setSelectedIcon(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <IoClose size={24} />
            </button>
            <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">
              Crear Tipo de Contrato
            </h3>
            <div className="mb-4">
              <label
                htmlFor="contractName"
                className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1"
              >
                Tipo de Contrato
              </label>
              <input
                type="text"
                id="contractName"
                name="contractName"
                placeholder="Nombre del Contrato"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="contractDescription"
                className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1"
              >
                Descripción
              </label>
              <input
                type="text"
                id="contractDescription"
                name="contractDescription"
                placeholder="Descripción"
                value={contractDescription}
                onChange={(e) => setContractDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1">
                Seleccionar Ícono
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableIcons.map((icon) => (
                  <div
                    key={icon.name}
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        selectedIcon?.name === icon.name
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
                      }`}
                  >
                    <icon.icon className="text-2xl text-gray-600 dark:text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
            {errorText && <span className="text-red-500">{errorText}</span>}
            <div className="flex justify-end space-x-4 mt-5">
              <button
                onClick={() => {
                  setShowModalCreate(false);
                  setErrorText("");
                  setContractName("");
                  setContractDescription("");
                  setSelectedIcon(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateContract}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar */}
      {showModalUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl animate-slideIn">
            <button
              onClick={() => {
                setShowModalUpdate(false);
                setErrorText("");
                setContractName("");
                setContractDescription("");
                setSelectedIcon(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <IoClose size={24} />
            </button>
            <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">
              Editar Tipo de Contrato
            </h3>
            <div className="mb-4">
              <label
                htmlFor="contractName"
                className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1"
              >
                Tipo de Contrato
              </label>
              <input
                type="text"
                id="contractName"
                name="contractName"
                placeholder="Nombre del Contrato"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="contractDescription"
                className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1"
              >
                Descripción
              </label>
              <input
                type="text"
                id="contractDescription"
                name="contractDescription"
                placeholder="Descripción"
                value={contractDescription}
                onChange={(e) => setContractDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1">
                Seleccionar Ícono
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableIcons.map((icon) => (
                  <div
                    key={icon.name}
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        selectedIcon?.name === icon.name
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
                      }`}
                  >
                    <icon.icon className="text-2xl text-gray-600 dark:text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
            {errorText && <span className="text-red-500">{errorText}</span>}
            <div className="flex justify-end space-x-4 mt-5">
              <button
                onClick={() => {
                  setShowModalUpdate(false);
                  setErrorText("");
                  setContractName("");
                  setContractDescription("");
                  setSelectedIcon(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateContract}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Eliminar */}
      {showModalDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl animate-slideIn">
            <button
              onClick={() => {
                setContractAsociation(0);
                setShowModalDelete(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <IoClose size={24} />
            </button>
            <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">
              Eliminar Tipo de Contrato
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              ¿Estás seguro de que deseas eliminar este tipo de contrato?
            </p>

            {/* Advertencia de contratos asociados */}
            {contractAsociation > 0 && (
              <div className="mb-4">
                <p className="text-red-600 font-medium">
                  Advertencia: Este tipo de contrato tiene {contractAsociation}{" "}
                  contrato(s) asociado(s).
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  Si deseas eliminar este tipo de contrato, primero exporta los
                  registros asociados.
                </p>
                <button
                  onClick={() => navigate("/admin/registro-contrato")}
                  className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 underline"
                >
                  Ir a registros de contratos
                </button>
              </div>
            )}

            {/* Checkbox para confirmar eliminación */}
            {contractAsociation > 0 && (
              <div className="flex items-center mb-4 justify-start">
                <input
                  type="checkbox"
                  id="confirmDelete"
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  className="mr-2 form-checkbox h-5 w-5 text-green-600 border-2 border-green-500 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="confirmDelete"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Confirmo que deseo eliminar este tipo de contrato y soy
                  consciente de los riesgos.
                </label>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 mt-5">
              <button
                onClick={() => {
                  setContractAsociation(0);
                  setShowModalDelete(false);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteContract}
                disabled={contractAsociation > 0 && !confirmDelete}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  contractAsociation > 0 && !confirmDelete
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractConfigPanel;
