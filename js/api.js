import { moduleConfig } from "./config.js";

const STORAGE_KEY = "dandelion-meetings-state";
const STORAGE_VERSION = 5;

const mockData = {
  members: [
    { id: "m1", firstName: "Maximiliano", lastName: "Contreras", phone: "+54 9 3517 53-8199" },
    { id: "m2", firstName: "Lucas", lastName: "Di Stefano", phone: "+54 9 3513 00-3693" },
    { id: "m3", firstName: "Esteban", lastName: "Prospero", phone: "+54 9 3516 56-9914" },
    { id: "m4", firstName: "Ana", lastName: "Weissbein", phone: "" },
    { id: "m5", firstName: "Anabella", lastName: "Gargiullo", phone: "" },
    { id: "m6", firstName: "Hector", lastName: "Larrea", phone: "" },
    { id: "m7", firstName: "Javier", lastName: "Serra", phone: "" },
    { id: "m8", firstName: "Ines", lastName: "Robertson", phone: "+54 9 3512 11-2050" },
    { id: "m9", firstName: "Yuliana", lastName: "Longhi", phone: "+54 9 3513 64-5612" },
  ],
  nextAgenda: {
    points: [
      { title: "Apertura y lectura del acta anterior", description: "" },
      { title: "Encuadre legal e impositivo del Marketplace", description: "Punto postergado de la reunion anterior, incorporado con prioridad." },
      { title: "Organigrama de la Comision", description: "Presentacion del borrador elaborado por Maximiliano Contreras." },
    ],
  },
  previousMeeting: {
    number: 2,
    dateLabel: "Martes 14 de abril de 2026",
    startTime: "18:45",
    status: "Pendiente de cierre definitivo",
    motivo: "",
    attendees: [
      { memberId: "m1", mode: "Presencial" },
      { memberId: "m3", mode: "Presencial" },
      { memberId: "m9", mode: "Presencial" },
    ],
    items: [
      {
        title: "Punto 1 \u2014 Apertura y seguimiento de acuerdos",
        treated: true,
        statusLabel: "Tratado",
        resolution: "Solicitar informe o participacion de Comision Economica en la proxima reunion.",
        hasActionables: true,
        actionables: [
          { description: "Contactar Comision Economica y solicitar espacio en Reunion N\u00b0 3.", memberId: "m1", done: false },
        ],
      },
      {
        title: "Punto 2 \u2014 Tienda Diente de Leon: primera entrega con TiendaNube y validacion QR",
        treated: true,
        statusLabel: "Tratado",
        resolution: "Ines evaluara la viabilidad de una validacion asincronica. Queda pendiente definir responsable para carteleria.",
        hasActionables: true,
        actionables: [
          { description: "Evaluar viabilidad tecnica del sistema QR sin conexion.", memberId: "m8", done: false },
          { description: "Coordinar carteleria de difusion con Camila.", memberId: "", done: false },
        ],
      },
      {
        title: "Punto 3 \u2014 Organigrama de la Comision",
        treated: true,
        statusLabel: "Tratado",
        resolution: "Maxi elaborara un primer borrador de organigrama para la Reunion N\u00b0 3.",
        hasActionables: true,
        actionables: [
          { description: "Preparar borrador de organigrama para la siguiente reunion.", memberId: "m1", done: false },
        ],
      },
      {
        title: "Punto 4 \u2014 Encuadre legal e impositivo del Marketplace",
        treated: false,
        statusLabel: "Postergado",
        resolution: "Se incorpora con prioridad al orden del dia de la Reunion N\u00b0 3.",
        hasActionables: false,
        actionables: [],
      },
      {
        title: "Punto 5 \u2014 Participacion de miembros no presenciales",
        treated: true,
        statusLabel: "Tratado",
        resolution: "Se habilita videollamada a demanda para quienes la necesiten en reuniones especificas.",
        hasActionables: false,
        actionables: [],
      },
      {
        title: "Punto 6 \u2014 SEF: activacion comunitaria",
        treated: true,
        statusLabel: "Tratado",
        resolution: "Avanzar con una comunicacion formal a la comunidad y planificar un evento de activacion.",
        hasActionables: true,
        actionables: [
          { description: "Definir responsable para comunicacion formal a la comunidad.", memberId: "", done: false },
          { description: "Definir responsable y fecha tentativa para evento de activacion.", memberId: "", done: false },
        ],
      },
    ],
  },
  history: [
    {
      id: "reunion-2",
      title: "Reunion N\u00b0 2",
      date: "14 de abril de 2026",
      startTime: "18:45",
      attendees: [
        { memberId: "m1", mode: "Presencial" },
        { memberId: "m3", mode: "Presencial" },
        { memberId: "m9", mode: "Presencial" },
      ],
      quorum: "3 asistentes",
      status: "Pendiente de cierre definitivo",
      motivo: "",
      items: [
        {
          title: "Punto 1 \u2014 Apertura y seguimiento de acuerdos",
          status: "Tratado",
          resolution: "Solicitar informe o participacion de Comision Economica en la proxima reunion.",
          actionables: [
            { description: "Contactar Comision Economica y solicitar espacio en Reunion N\u00b0 3.", memberId: "m1", done: false },
          ],
        },
        {
          title: "Punto 2 \u2014 Tienda Diente de Leon: primera entrega con TiendaNube y validacion QR",
          status: "Tratado",
          resolution: "Revisar alternativa asincronica y asignar responsable de carteleria.",
          actionables: [
            { description: "Evaluar validacion asincronica sin conexion.", memberId: "m8", done: false },
            { description: "Coordinar carteleria con Camila.", memberId: "", done: false },
          ],
        },
        {
          title: "Punto 3 \u2014 Organigrama de la Comision",
          status: "Tratado",
          resolution: "Presentar borrador en la Reunion N\u00b0 3.",
          actionables: [
            { description: "Preparar borrador de organigrama.", memberId: "m1", done: false },
          ],
        },
        {
          title: "Punto 4 \u2014 Encuadre legal e impositivo del Marketplace",
          status: "Postergado",
          resolution: "Retomar con prioridad en la proxima reunion.",
          actionables: [],
        },
        {
          title: "Punto 5 \u2014 Participacion de miembros no presenciales",
          status: "Tratado",
          resolution: "Se mantiene modalidad remota a demanda.",
          actionables: [],
        },
        {
          title: "Punto 6 \u2014 SEF: activacion comunitaria",
          status: "Tratado",
          resolution: "Definir responsables y canal de comunicacion.",
          actionables: [
            { description: "Asignar responsable para comunicacion formal.", memberId: "", done: false },
            { description: "Proponer fecha de evento de activacion.", memberId: "", done: false },
          ],
        },
      ],
    },
    {
      id: "reunion-1",
      title: "Reunion N\u00b0 1",
      date: "7 de abril de 2026",
      startTime: "18:00",
      attendees: [],
      quorum: "",
      status: "",
      motivo: "",
      items: [
        {
          title: "Punto 1 \u2014 Apertura y definicion de agenda",
          status: "Tratado",
          resolution: "Se fijaron los temas prioritarios iniciales.",
          actionables: [],
        },
        {
          title: "Punto 2 \u2014 Encuadre legal del marketplace",
          status: "Postergado",
          resolution: "Retomar con mas informacion disponible.",
          actionables: [],
        },
        {
          title: "Punto 3 \u2014 Reunion virtual intermedia",
          status: "Tratado",
          resolution: "Reabrir debate en la Reunion N\u00b0 2.",
          actionables: [],
        },
      ],
    },
  ],
};

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function getInitialData() {
  return cloneData(mockData);
}

function readStoredData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION || !parsed.data) {
      return null;
    }
    return parsed.data;
  } catch (_error) {
    return null;
  }
}

function writeStoredData(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, data }),
    );
  } catch (_error) {
    console.warn("No se pudo guardar en localStorage:", _error);
  }
}

export async function getModuleData() {
  if (moduleConfig.useMocks || !moduleConfig.apiBaseUrl) {
    const stored = readStoredData();
    if (stored) return Promise.resolve(stored);

    const initialData = getInitialData();
    writeStoredData(initialData);
    return Promise.resolve(initialData);
  }

  const response = await fetch(moduleConfig.apiBaseUrl);
  if (!response.ok) {
    throw new Error("No se pudo cargar la informacion del modulo.");
  }
  return response.json();
}

export async function saveNextAgenda(points) {
  const data = readStoredData() || getInitialData();
  data.nextAgenda.points = cloneData(points);
  writeStoredData(data);
  return Promise.resolve(data);
}

export async function savePreviousMeeting(previousMeeting) {
  const data = readStoredData() || getInitialData();
  data.previousMeeting = cloneData(previousMeeting);
  writeStoredData(data);
  return Promise.resolve(data);
}

export async function saveMembers(members) {
  const data = readStoredData() || getInitialData();
  data.members = cloneData(members);
  writeStoredData(data);
  return Promise.resolve(data);
}

export async function archivePreviousMeeting() {
  const data = readStoredData() || getInitialData();
  const previousMeeting = data.previousMeeting;

  const attendeeCount = (previousMeeting.attendees || []).length;

  const archiveEntry = {
    id: `reunion-${previousMeeting.number}`,
    title: `Reunion N\u00b0 ${previousMeeting.number}`,
    date: previousMeeting.dateLabel,
    startTime: previousMeeting.startTime || "",
    attendees: cloneData(previousMeeting.attendees || []),
    quorum: `${attendeeCount} ${attendeeCount === 1 ? "asistente" : "asistentes"}`,
    status: previousMeeting.status || "",
    motivo: previousMeeting.motivo || "",
    items: previousMeeting.items.map((item) => ({
      title: item.title,
      status: item.statusLabel,
      resolution: item.resolution || "",
      actionables: cloneData(item.actionables || []),
    })),
  };

  data.history.unshift(archiveEntry);
  data.previousMeeting.status = "Archivada";
  writeStoredData(data);
  return Promise.resolve(data);
}
