import { moduleConfig } from "./config.js";
import { getAuthToken } from "./auth.js";

const STORAGE_KEY = "dandelion-meetings-state";
const STORAGE_VERSION = 9;

const mockData = {
  meta: {
    lastRolloverMeetingKey: null,
  },
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
    points: [],
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
        comments: "Se revisaron los acuerdos vigentes y el pedido a la Comision Economica.",
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
        comments: "Se identifico la falta de señal como principal cuello de botella operativo.",
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
        comments: "Se considero necesario mapear roles antes de sumar nuevas personas.",
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
        comments: "No se trato por falta de tiempo y por requerir mayor participacion.",
        resolution: "Se incorpora con prioridad al orden del dia de la Reunion N\u00b0 3.",
        hasActionables: false,
        actionables: [],
      },
      {
        title: "Punto 5 \u2014 Participacion de miembros no presenciales",
        treated: true,
        statusLabel: "Tratado",
        comments: "Se aclaro que la agenda efectiva inicia a las 18:45 luego del espacio intercomisiones.",
        resolution: "Se habilita videollamada a demanda para quienes la necesiten en reuniones especificas.",
        hasActionables: false,
        actionables: [],
      },
      {
        title: "Punto 6 \u2014 SEF: activacion comunitaria",
        treated: true,
        statusLabel: "Tratado",
        comments: "Se planteo la necesidad de una comunicacion formal y un evento de activacion.",
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
          comments: "Se revisaron los acuerdos vigentes y el pedido a la Comision Economica.",
          resolution: "Solicitar informe o participacion de Comision Economica en la proxima reunion.",
          actionables: [
            { description: "Contactar Comision Economica y solicitar espacio en Reunion N\u00b0 3.", memberId: "m1", done: false },
          ],
        },
        {
          title: "Punto 2 \u2014 Tienda Diente de Leon: primera entrega con TiendaNube y validacion QR",
          status: "Tratado",
          comments: "Se detecto la falta de señal como principal dificultad operativa.",
          resolution: "Revisar alternativa asincronica y asignar responsable de carteleria.",
          actionables: [
            { description: "Evaluar validacion asincronica sin conexion.", memberId: "m8", done: false },
            { description: "Coordinar carteleria con Camila.", memberId: "", done: false },
          ],
        },
        {
          title: "Punto 3 \u2014 Organigrama de la Comision",
          status: "Tratado",
          comments: "Se definio preparar un borrador de organigrama para la reunion siguiente.",
          resolution: "Presentar borrador en la Reunion N\u00b0 3.",
          actionables: [
            { description: "Preparar borrador de organigrama.", memberId: "m1", done: false },
          ],
        },
        {
          title: "Punto 4 \u2014 Encuadre legal e impositivo del Marketplace",
          status: "Postergado",
          comments: "No se trato por falta de tiempo y por requerir mayor participacion.",
          resolution: "Retomar con prioridad en la proxima reunion.",
          actionables: [],
        },
        {
          title: "Punto 5 \u2014 Participacion de miembros no presenciales",
          status: "Tratado",
          comments: "Se habilito la participacion remota por videollamada a demanda.",
          resolution: "Se mantiene modalidad remota a demanda.",
          actionables: [],
        },
        {
          title: "Punto 6 \u2014 SEF: activacion comunitaria",
          status: "Tratado",
          comments: "Se propuso avanzar con una comunicacion formal y un evento de activacion.",
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
          comments: "Se establecieron prioridades iniciales de trabajo.",
          resolution: "Se fijaron los temas prioritarios iniciales.",
          actionables: [],
        },
        {
          title: "Punto 2 \u2014 Encuadre legal del marketplace",
          status: "Postergado",
          comments: "El tema quedo pendiente para una reunion posterior con mas informacion.",
          resolution: "Retomar con mas informacion disponible.",
          actionables: [],
        },
        {
          title: "Punto 3 \u2014 Reunion virtual intermedia",
          status: "Tratado",
          comments: "Se dejo abierta la votacion para la reunion siguiente.",
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

function getZonedDateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getCurrentZonedDate(timeZone) {
  const now = new Date();
  const parts = getZonedDateParts(now, timeZone);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
}

function getWeekdayInTimeZone(date, timeZone) {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);

  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

function formatMeetingDateLabel(date) {
  const text = new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatMeetingKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function computeCurrentMeetingWindow() {
  const nowInZone = getCurrentZonedDate(moduleConfig.meetingTimezone);
  const zonedWeekday = getWeekdayInTimeZone(new Date(), moduleConfig.meetingTimezone);
  const daysUntilMeeting = (moduleConfig.meetingWeekday - zonedWeekday + 7) % 7;

  const thisWeekMeeting = new Date(nowInZone);
  thisWeekMeeting.setUTCDate(thisWeekMeeting.getUTCDate() + daysUntilMeeting);
  thisWeekMeeting.setUTCHours(moduleConfig.meetingStartHour, 0, 0, 0);

  if (daysUntilMeeting > 0) {
    thisWeekMeeting.setUTCDate(thisWeekMeeting.getUTCDate() - 7);
  }

  const nextMeeting = new Date(thisWeekMeeting);
  nextMeeting.setUTCDate(nextMeeting.getUTCDate() + 7);

  return {
    nowInZone,
    currentMeeting: thisWeekMeeting,
    currentMeetingKey: formatMeetingKey(thisWeekMeeting),
    nextMeeting,
  };
}

function normalizeAgendaPoint(point) {
  return {
    title: point.title || "",
    description: point.description || "",
  };
}

function normalizeMeetingItemFromAgenda(point) {
  return {
    title: point.title || "",
    treated: false,
    statusLabel: "No tratado",
    comments: point.description || "",
    resolution: "",
    hasActionables: false,
    actionables: [],
  };
}

function normalizePreviousMeetingItem(item) {
  return {
    title: item?.title || "",
    treated: item?.treated ?? item?.statusLabel === "Tratado",
    statusLabel: item?.statusLabel || item?.status || "No tratado",
    comments: item?.comments || "",
    resolution: item?.resolution || "",
    hasActionables: item?.hasActionables ?? Boolean((item?.actionables || []).length),
    actionables: cloneData(item?.actionables || []),
  };
}

function normalizeHistoryItemFromMeeting(item) {
  return {
    title: item.title || "",
    status: item.statusLabel || item.status || "No tratado",
    comments: item.comments || "",
    resolution: item.resolution || "",
    actionables: cloneData(item.actionables || []),
  };
}

function normalizePreviousMeeting(meeting, fallbackNumber = 1) {
  const normalizedItems = (meeting?.items || []).map(normalizePreviousMeetingItem);
  return {
    number: Number(meeting?.number || fallbackNumber),
    dateLabel: meeting?.dateLabel || "",
    startTime: meeting?.startTime || `${String(moduleConfig.meetingStartHour).padStart(2, "0")}:00`,
    status: meeting?.status || "Pendiente de cierre definitivo",
    motivo: meeting?.motivo || "",
    attendees: cloneData(meeting?.attendees || []),
    items: normalizedItems,
  };
}

function normalizeHistoryMeeting(meeting) {
  const attendees = cloneData(meeting?.attendees || []);
  return {
    id: meeting?.id || `reunion-${meeting?.number || Date.now()}`,
    title: meeting?.title || `Reunion N° ${meeting?.number || ""}`.trim(),
    date: meeting?.date || meeting?.dateLabel || "",
    startTime: meeting?.startTime || "",
    attendees,
    quorum: meeting?.quorum || `${attendees.length} ${attendees.length === 1 ? "asistente" : "asistentes"}`,
    status: meeting?.status || "",
    motivo: meeting?.motivo || "",
    items: (meeting?.items || []).map(normalizeHistoryItemFromMeeting),
    changeLog: cloneData(meeting?.changeLog || []),
  };
}

function normalizeModuleData(data) {
  const members = cloneData(data?.members || []);
  const nextAgendaPoints = cloneData(data?.nextAgenda?.points || []).map(normalizeAgendaPoint);
  const previousMeeting = normalizePreviousMeeting(data?.previousMeeting, 1);
  const history = (data?.history || [])
    .filter((meeting) => meeting && typeof meeting === "object" && (meeting.id || meeting.title || meeting.date || meeting.dateLabel))
    .map(normalizeHistoryMeeting);

  return {
    meta: {
      lastRolloverMeetingKey: data?.meta?.lastRolloverMeetingKey || null,
    },
    members,
    nextAgenda: {
      points: nextAgendaPoints,
    },
    previousMeeting,
    history,
  };
}

function archiveMeetingSnapshot(meeting) {
  if (!meeting || !meeting.number) return null;

  const attendeeCount = (meeting.attendees || []).length;
  return {
    id: `reunion-${meeting.number}`,
    title: `Reunion N° ${meeting.number}`,
    date: meeting.dateLabel,
    startTime: meeting.startTime || "",
    attendees: cloneData(meeting.attendees || []),
    quorum: `${attendeeCount} ${attendeeCount === 1 ? "asistente" : "asistentes"}`,
    status: meeting.status || "",
    motivo: meeting.motivo || "",
    items: (meeting.items || []).map(normalizeHistoryItemFromMeeting),
  };
}

function rolloverMeetingsIfNeeded(data) {
  const working = normalizeModuleData(data);
  working.meta = working.meta || { lastRolloverMeetingKey: null };

  const { nowInZone, currentMeeting, currentMeetingKey } = computeCurrentMeetingWindow();
  if (nowInZone < currentMeeting) return working;
  if (working.meta.lastRolloverMeetingKey === currentMeetingKey) return working;

  const archived = archiveMeetingSnapshot(working.previousMeeting);
  if (archived) {
    const existingHistory = working.history || [];
    working.history = [
      archived,
      ...existingHistory.filter((item) => item.id !== archived.id),
    ];
  }

  const nextMeetingNumber = Number(working.previousMeeting?.number || 0) + 1;
  const agendaPoints = (working.nextAgenda?.points || []).map(normalizeAgendaPoint);

  working.previousMeeting = {
    number: nextMeetingNumber,
    dateLabel: formatMeetingDateLabel(currentMeeting),
    startTime: `${String(moduleConfig.meetingStartHour).padStart(2, "0")}:00`,
    status: "Pendiente de cierre definitivo",
    motivo: "",
    attendees: [],
    items: agendaPoints.map(normalizeMeetingItemFromAgenda),
  };

  working.nextAgenda = { points: [] };
  working.meta.lastRolloverMeetingKey = currentMeetingKey;

  return working;
}

function readStoredData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data) {
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

// --- Firebase REST helpers ---

async function firebaseUrl() {
  const token = await getAuthToken();
  return `${moduleConfig.apiBaseUrl}.json?auth=${token}`;
}

async function firebaseGet() {
  const response = await fetch(await firebaseUrl());
  if (!response.ok) throw new Error(`Firebase GET fallo: ${response.status}`);
  return response.json();
}

async function firebasePatch(partial) {
  const response = await fetch(await firebaseUrl(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!response.ok) throw new Error(`Firebase PATCH fallo: ${response.status}`);
  return response.json();
}

async function firebasePut(data) {
  const response = await fetch(await firebaseUrl(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Firebase PUT fallo: ${response.status}`);
  return response.json();
}

// --- Public API ---

export async function getModuleData() {
  if (moduleConfig.useMocks || !moduleConfig.apiBaseUrl) {
    const stored = readStoredData();
    if (stored) {
      const rolled = rolloverMeetingsIfNeeded(normalizeModuleData(stored));
      writeStoredData(rolled);
      return Promise.resolve(rolled);
    }

    const initialData = normalizeModuleData(getInitialData());
    const rolled = rolloverMeetingsIfNeeded(initialData);
    writeStoredData(rolled);
    return Promise.resolve(rolled);
  }

  const remote = await firebaseGet();

  if (!remote) {
    // Primera vez: inicializar Firebase con los datos de ejemplo
    const initialData = rolloverMeetingsIfNeeded(normalizeModuleData(getInitialData()));
    await firebasePut(initialData);
    writeStoredData(initialData);
    return initialData;
  }

  const rolled = rolloverMeetingsIfNeeded(normalizeModuleData(remote));
  if (JSON.stringify(rolled) !== JSON.stringify(remote)) {
    await firebasePut(rolled);
  }
  writeStoredData(rolled);
  return rolled;
}

export async function saveNextAgenda(points) {
  if (moduleConfig.useMocks || !moduleConfig.apiBaseUrl) {
    const data = readStoredData() || getInitialData();
    data.nextAgenda.points = cloneData(points);
    writeStoredData(data);
    return Promise.resolve(data);
  }

  await firebasePatch({ nextAgenda: { points: cloneData(points) } });

  const data = readStoredData() || getInitialData();
  data.nextAgenda.points = cloneData(points);
  writeStoredData(data);
  return data;
}

export async function savePreviousMeeting(previousMeeting) {
  if (moduleConfig.useMocks || !moduleConfig.apiBaseUrl) {
    const data = readStoredData() || getInitialData();
    data.previousMeeting = cloneData(previousMeeting);
    writeStoredData(data);
    return Promise.resolve(data);
  }

  await firebasePatch({ previousMeeting: cloneData(previousMeeting) });

  const data = readStoredData() || getInitialData();
  data.previousMeeting = cloneData(previousMeeting);
  writeStoredData(data);
  return data;
}

export async function saveMembers(members) {
  if (moduleConfig.useMocks || !moduleConfig.apiBaseUrl) {
    const data = readStoredData() || getInitialData();
    data.members = cloneData(members);
    writeStoredData(data);
    return Promise.resolve(data);
  }

  await firebasePatch({ members: cloneData(members) });

  const data = readStoredData() || getInitialData();
  data.members = cloneData(members);
  writeStoredData(data);
  return data;
}

export async function saveHistoryMeeting(meetingId, updatedMeeting) {
  let data;
  if (moduleConfig.useMocks || !moduleConfig.apiBaseUrl) {
    data = normalizeModuleData(readStoredData() || getInitialData());
  } else {
    data = normalizeModuleData(await firebaseGet() || readStoredData() || getInitialData());
  }

  const normalizedMeeting = normalizeHistoryMeeting(updatedMeeting);
  const history = (data.history || []).map((meeting) =>
    meeting.id === meetingId ? normalizedMeeting : meeting,
  );

  if (moduleConfig.useMocks || !moduleConfig.apiBaseUrl) {
    data.history = history;
    writeStoredData(data);
    return Promise.resolve(data);
  }

  await firebasePatch({ history });

  data.history = history;
  writeStoredData(data);
  return data;
}

export async function archivePreviousMeeting() {
  // For archive we need current history, so always read from source of truth
  let data;
  if (moduleConfig.useMocks || !moduleConfig.apiBaseUrl) {
    data = readStoredData() || getInitialData();
  } else {
    data = await firebaseGet() || readStoredData() || getInitialData();
  }

  const previousMeeting = normalizePreviousMeeting(data.previousMeeting, 1);
  const archiveId = `reunion-${previousMeeting.number}`;
  if (previousMeeting.status === "Archivada") {
    data.previousMeeting = previousMeeting;
    writeStoredData(data);
    return Promise.resolve(data);
  }
  const attendeeCount = (previousMeeting.attendees || []).length;

  const archiveEntry = {
    id: archiveId,
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
      comments: item.comments || "",
      resolution: item.resolution || "",
      actionables: cloneData(item.actionables || []),
    })),
    changeLog: [],
  };

  const newHistory = [
    archiveEntry,
    ...((data.history || []).filter((meeting) => meeting && meeting.id !== archiveId)),
  ];
  const updatedPreviousMeeting = { ...cloneData(previousMeeting), status: "Archivada" };

  if (moduleConfig.useMocks || !moduleConfig.apiBaseUrl) {
    data.history = newHistory;
    data.previousMeeting = updatedPreviousMeeting;
    writeStoredData(data);
    return Promise.resolve(data);
  }

  await firebasePatch({ history: newHistory, previousMeeting: updatedPreviousMeeting });

  data.history = newHistory;
  data.previousMeeting = updatedPreviousMeeting;
  writeStoredData(data);
  return data;
}
