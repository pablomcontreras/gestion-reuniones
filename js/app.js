import { archivePreviousMeeting, getModuleData, saveMembers, saveNextAgenda, savePreviousMeeting } from "./api.js";
import { moduleConfig } from "./config.js";

const elements = {
  page: document.body.dataset.page,
  sidebar: document.getElementById("sidebar"),
  menuToggle: document.getElementById("menuToggle"),
  sidebarOverlay: document.getElementById("sidebarOverlay"),
  navLinks: [...document.querySelectorAll(".sidebar-link")],
  statsGrid: document.getElementById("statsGrid"),
  taskList: document.getElementById("taskList"),
  nextMeetingTitle: document.getElementById("nextMeetingTitle"),
  nextMeetingCopy: document.getElementById("nextMeetingCopy"),
  agendaList: document.getElementById("agendaList"),
  previousMeetingMeta: document.getElementById("previousMeetingMeta"),
  attendeesList: document.getElementById("attendeesList"),
  resolutionList: document.getElementById("resolutionList"),
  historyList: document.getElementById("historyList"),
  meetingDetailTitle: document.getElementById("meetingDetailTitle"),
  meetingDetailDate: document.getElementById("meetingDetailDate"),
  meetingDetailList: document.getElementById("meetingDetailList"),
  printMeetingLink: document.getElementById("printMeetingLink"),
  membersList: document.getElementById("membersList"),
  printNowBtn: document.getElementById("printNowBtn"),
  printAgendaTitle: document.getElementById("printAgendaTitle"),
  printAgendaSubtitle: document.getElementById("printAgendaSubtitle"),
  printAgendaList: document.getElementById("printAgendaList"),
  printMeetingTitle: document.getElementById("printMeetingTitle"),
  printMeetingSubtitle: document.getElementById("printMeetingSubtitle"),
  printMeetingMeta: document.getElementById("printMeetingMeta"),
  printMeetingList: document.getElementById("printMeetingList"),
  addAgendaItemBtn: document.getElementById("addAgendaItemBtn"),
  saveAgendaBtn: document.getElementById("saveAgendaBtn"),
  addAttendeeBtn: document.getElementById("addAttendeeBtn"),
  saveMinutesBtn: document.getElementById("saveMinutesBtn"),
  archiveMeetingBtn: document.getElementById("archiveMeetingBtn"),
  addMemberBtn: document.getElementById("addMemberBtn"),
  saveMembersBtn: document.getElementById("saveMembersBtn"),
};

let agendaState = [];
let previousMeetingState = null;
let membersState = [];
let historyState = [];

const HISTORY_PAGE_SIZE = 5;
let historyCurrentPage = 1;

// ─── Helpers ───────────────────────────────────────────────────────────────

function getMemberName(memberId) {
  const member = membersState.find((item) => item.id === memberId);
  return member ? `${member.firstName} ${member.lastName}`.trim() : "A definir";
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
    parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]),
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

function getWeekdayInTimeZone(date, timeZone) {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

function getCurrentZonedDate(timeZone) {
  const now = new Date();
  const parts = getZonedDateParts(now, timeZone);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second));
}

function getNextMeetingInfo() {
  const nowInZone = getCurrentZonedDate(moduleConfig.meetingTimezone);
  const zonedWeekday = getWeekdayInTimeZone(new Date(), moduleConfig.meetingTimezone);
  const daysUntilMeeting = (moduleConfig.meetingWeekday - zonedWeekday + 7) % 7;

  const currentMeeting = new Date(nowInZone);
  currentMeeting.setUTCDate(currentMeeting.getUTCDate() + daysUntilMeeting);
  currentMeeting.setUTCHours(moduleConfig.meetingStartHour, 0, 0, 0);

  const currentCutoff = new Date(currentMeeting);
  currentCutoff.setUTCHours(moduleConfig.meetingStartHour - moduleConfig.agendaLockHoursBefore, 0, 0, 0);

  const unlockAt = new Date(currentMeeting);
  unlockAt.setUTCDate(unlockAt.getUTCDate() + 1);
  unlockAt.setUTCHours(moduleConfig.agendaUnlockHourAfterMeetingDay, 0, 0, 0);

  const isLocked = daysUntilMeeting === 0 && nowInZone >= currentCutoff && nowInZone < unlockAt;

  const displayedMeeting = new Date(currentMeeting);
  if (daysUntilMeeting === 0 && nowInZone >= currentMeeting) {
    displayedMeeting.setUTCDate(displayedMeeting.getUTCDate() + 7);
  } else if (daysUntilMeeting === 0 && nowInZone >= unlockAt) {
    displayedMeeting.setUTCDate(displayedMeeting.getUTCDate() + 7);
  }

  const displayedCutoff = new Date(displayedMeeting);
  displayedCutoff.setUTCHours(moduleConfig.meetingStartHour - moduleConfig.agendaLockHoursBefore, 0, 0, 0);

  return { nextMeeting: displayedMeeting, cutoff: displayedCutoff, isLocked };
}

function formatMeetingDate(date) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function computeStats() {
  if (!previousMeetingState) return [];
  const attendeeCount = (previousMeetingState.attendees || []).length;
  const allActionables = (previousMeetingState.items || []).flatMap((i) => i.actionables || []);
  const pendingCount = allActionables.filter((a) => !a.done).length;
  const unassignedCount = allActionables.filter((a) => !a.done && !a.memberId).length;
  const treatedCount = (previousMeetingState.items || []).filter((i) => i.statusLabel === "Tratado").length;

  return [
    {
      label: "asistentes",
      value: String(attendeeCount),
      sub: "en la ultima reunion",
      tone: attendeeCount > 0 ? "green" : "",
    },
    {
      label: "puntos tratados",
      value: String(treatedCount),
      sub: `de ${(previousMeetingState.items || []).length} en agenda`,
      tone: "blue",
    },
    {
      label: "accionables pendientes",
      value: String(pendingCount),
      sub: unassignedCount > 0 ? `${unassignedCount} sin responsable asignado` : "todos asignados",
      tone: pendingCount > 0 ? "amber" : "green",
    },
  ];
}

// ─── Render: Agenda (Próxima reunión) ──────────────────────────────────────

function renderAgenda() {
  if (!elements.agendaList) return;
  if (!agendaState.length) {
    elements.agendaList.innerHTML = `
      <article class="agenda-empty">
        Todavia no hay temas cargados para la proxima reunion.
      </article>
    `;
    return;
  }
  elements.agendaList.innerHTML = agendaState
    .map(
      (point, index) => `
        <article class="agenda-item">
          <div class="agenda-head">
            <label class="agenda-index" for="agenda-title-${index}">Punto ${index + 1}</label>
            <input
              class="agenda-input agenda-input-title"
              id="agenda-title-${index}"
              type="text"
              value="${point.title}"
              placeholder="Nuevo punto"
            >
            <button class="icon-btn" type="button" data-remove-agenda="${index}" aria-label="Eliminar punto">×</button>
          </div>
          <label class="sr-only" for="agenda-desc-${index}">Descripcion del punto ${index + 1}</label>
          <textarea class="agenda-input agenda-textarea" id="agenda-desc-${index}" rows="3">${point.description}</textarea>
        </article>
      `,
    )
    .join("");
}

function renderMeetingHeader() {
  if (!elements.nextMeetingTitle || !elements.nextMeetingCopy) return;
  const { nextMeeting, cutoff, isLocked } = getNextMeetingInfo();
  const nextMeetingLabel = formatMeetingDate(nextMeeting);
  const hourLabel = `${String(moduleConfig.meetingStartHour).padStart(2, "0")}:00 hs.`;
  const cutoffLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(cutoff);

  elements.nextMeetingTitle.textContent = `Proxima reunion \u2014 ${nextMeetingLabel} \u00b7 ${hourLabel}`;
  elements.nextMeetingCopy.textContent = isLocked
    ? "Orden del dia cerrado para esta reunion. La edicion del proximo orden del dia se habilitara a las 0:00 hs del dia de manana."
    : `Cierre de edicion del orden del dia: ${cutoffLabel} hs.`;

  Array.from(document.querySelectorAll(".agenda-input")).forEach((field) => {
    field.disabled = isLocked;
  });
  if (elements.addAgendaItemBtn) elements.addAgendaItemBtn.disabled = isLocked;
  if (elements.saveAgendaBtn) {
    elements.saveAgendaBtn.disabled = isLocked;
    elements.saveAgendaBtn.textContent = isLocked ? "Edicion cerrada" : "Guardar orden del dia";
  }
}

function syncAgendaStateFromInputs() {
  agendaState = agendaState.map((point, index) => ({
    ...point,
    title: document.getElementById(`agenda-title-${index}`)?.value || "",
    description: document.getElementById(`agenda-desc-${index}`)?.value || "",
  }));
}

function setupAgendaActions() {
  if (!elements.addAgendaItemBtn || !elements.saveAgendaBtn) return;

  elements.agendaList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const index = target.dataset.removeAgenda;
    if (index === undefined) return;
    syncAgendaStateFromInputs();
    agendaState.splice(Number(index), 1);
    renderAgenda();
    renderMeetingHeader();
  });

  elements.addAgendaItemBtn.addEventListener("click", () => {
    syncAgendaStateFromInputs();
    agendaState.push({ title: "", description: "" });
    renderAgenda();
    renderMeetingHeader();
    const newInput = document.getElementById(`agenda-title-${agendaState.length - 1}`);
    newInput?.focus();
  });

  elements.saveAgendaBtn.addEventListener("click", () => {
    syncAgendaStateFromInputs();
    saveNextAgenda(agendaState).then(() => {
      elements.saveAgendaBtn.textContent = "Orden del dia guardado";
      window.setTimeout(() => {
        renderMeetingHeader();
      }, 1200);
    });
  });
}

// ─── Render: Stats ─────────────────────────────────────────────────────────

function renderStats(stats) {
  if (!elements.statsGrid) return;
  elements.statsGrid.innerHTML = stats
    .map(
      (stat) => `
        <article class="stat-card ${stat.tone || ""}">
          <div class="stat-label">${stat.label}</div>
          <div class="stat-value">${stat.value}</div>
          <div class="stat-sub">${stat.sub}</div>
        </article>
      `,
    )
    .join("");
}

// ─── Render: Última reunión — meta estática ─────────────────────────────────

function renderPreviousMeetingMeta(previousMeeting) {
  if (!elements.previousMeetingMeta) return;

  const isNoCelebrada = previousMeeting.status === "No celebrada";

  elements.previousMeetingMeta.innerHTML = `
    <div class="meeting-meta-static">
      <div class="meta-row">
        <span class="meta-label">Reunion</span>
        <span class="meta-value">N\u00b0 ${previousMeeting.number}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Fecha</span>
        <span class="meta-value">${previousMeeting.dateLabel}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Hora de inicio</span>
        <span class="meta-value">${previousMeeting.startTime} hs.</span>
      </div>
    </div>
    <label class="detail-item" style="margin-top:14px;">
      <strong>Estado</strong>
      <select class="agenda-input" id="meeting-status">
        <option value="Pendiente de cierre definitivo" ${previousMeeting.status === "Pendiente de cierre definitivo" ? "selected" : ""}>Pendiente de cierre definitivo</option>
        <option value="No celebrada" ${isNoCelebrada ? "selected" : ""}>No celebrada</option>
        <option value="Cerrada" ${previousMeeting.status === "Cerrada" ? "selected" : ""}>Cerrada</option>
      </select>
    </label>
    <div id="motivoSection" ${!isNoCelebrada ? "hidden" : ""} style="margin-top:10px;">
      <label class="detail-item">
        <strong>Motivo</strong>
        <textarea class="agenda-input agenda-textarea compact-textarea" id="meeting-motivo" rows="3" placeholder="Describir el motivo de la reunion no celebrada...">${previousMeeting.motivo || ""}</textarea>
      </label>
      <div class="agenda-actions" style="margin-top:8px;">
        <button class="action-btn action-btn-primary" id="archiveNoCelebradaBtn" type="button">Archivar como No celebrada</button>
      </div>
    </div>
  `;
}

// ─── Render: Asistentes (dropdown) ─────────────────────────────────────────

function memberOptions(selectedId) {
  return membersState
    .map(
      (m) =>
        `<option value="${m.id}" ${m.id === selectedId ? "selected" : ""}>${m.firstName} ${m.lastName}</option>`,
    )
    .join("");
}

function renderAttendees(attendees) {
  if (!elements.attendeesList) return;

  if (!attendees || !attendees.length) {
    elements.attendeesList.innerHTML = `<div class="empty-note">Sin asistentes registrados.</div>`;
    return;
  }

  elements.attendeesList.innerHTML = attendees
    .map((attendee, index) => {
      if (attendee._pending) {
        return `
          <div class="attendee-row">
            <input class="agenda-input" id="new-first-${index}" type="text" placeholder="Nombre" style="min-width:0">
            <input class="agenda-input" id="new-last-${index}" type="text" placeholder="Apellido" style="min-width:0">
            <select class="agenda-input" id="new-mode-${index}">
              <option value="Presencial">Presencial</option>
              <option value="Remota">Remota</option>
            </select>
            <button class="action-btn" type="button" data-confirm-new="${index}" style="white-space:nowrap;padding:8px 10px;">\u2713</button>
            <button class="icon-btn" type="button" data-remove-attendee="${index}" aria-label="Cancelar">\u00d7</button>
          </div>
        `;
      }
      return `
        <div class="attendee-row">
          <select class="agenda-input" id="attendee-member-${index}">
            <option value="">Seleccionar miembro</option>
            ${memberOptions(attendee.memberId)}
            <option value="__new__">+ Nuevo asistente...</option>
          </select>
          <select class="agenda-input" id="attendee-mode-${index}">
            <option value="Presencial" ${attendee.mode === "Presencial" ? "selected" : ""}>Presencial</option>
            <option value="Remota" ${attendee.mode === "Remota" ? "selected" : ""}>Remota</option>
          </select>
          <button class="icon-btn" type="button" data-remove-attendee="${index}" aria-label="Eliminar asistente">\u00d7</button>
        </div>
      `;
    })
    .join("");
}

function syncAttendeesFromDom() {
  if (!previousMeetingState) return;
  previousMeetingState.attendees.forEach((attendee, index) => {
    if (attendee._pending) return;
    const memberEl = document.getElementById(`attendee-member-${index}`);
    const modeEl = document.getElementById(`attendee-mode-${index}`);
    if (memberEl && memberEl.value && memberEl.value !== "__new__") {
      attendee.memberId = memberEl.value;
    }
    if (modeEl) attendee.mode = modeEl.value;
  });
}

// ─── Render: Accionables pendientes (resumen derivado) ─────────────────────

function renderActionablesSummary() {
  if (!elements.taskList) return;

  const allActionables = [];
  (previousMeetingState?.items || []).forEach((item, itemIdx) => {
    if (item.hasActionables) {
      (item.actionables || []).forEach((actionable, actionableIdx) => {
        allActionables.push({ ...actionable, itemIdx, actionableIdx });
      });
    }
  });

  if (!allActionables.length) {
    elements.taskList.innerHTML = `<li class="empty-note" style="list-style:none;">No hay accionables registrados aun.</li>`;
    return;
  }

  elements.taskList.innerHTML = allActionables
    .map(
      (actionable) => `
        <li class="${actionable.done ? "task-done" : ""}">
          <input
            type="checkbox"
            class="action-checkbox"
            ${actionable.done ? "checked" : ""}
            data-summary-done="${actionable.itemIdx}-${actionable.actionableIdx}"
          >
          <span class="assignee-tag ${!actionable.memberId ? "unassigned" : ""}">
            ${getMemberName(actionable.memberId)}
          </span>
          <span class="task-desc">${actionable.description || "Sin descripcion."}</span>
        </li>
      `,
    )
    .join("");
}

// ─── Render: Tratamiento de puntos ─────────────────────────────────────────

function renderResolutions(items) {
  if (!elements.resolutionList) return;
  elements.resolutionList.innerHTML = items
    .map(
      (item, itemIdx) => `
        <article class="resolution-card">
          <div class="resolution-head">
            <input class="agenda-input agenda-input-title" id="resolution-title-${itemIdx}" type="text" value="${item.title}">
            <select class="agenda-input resolution-select" id="resolution-status-${itemIdx}">
              <option value="Tratado" ${item.statusLabel === "Tratado" ? "selected" : ""}>Tratado</option>
              <option value="No tratado" ${item.statusLabel === "No tratado" ? "selected" : ""}>No tratado</option>
              <option value="Postergado" ${item.statusLabel === "Postergado" ? "selected" : ""}>Postergado</option>
            </select>
          </div>

          <div class="resolution-block">
            <div class="resolution-label">Comentarios</div>
            <textarea class="agenda-input agenda-textarea compact-textarea" id="resolution-comments-${itemIdx}" rows="3">${item.comments || ""}</textarea>
          </div>

          <div class="resolution-block">
            <div class="resolution-label">Resolucion / Salida</div>
            <textarea class="agenda-input agenda-textarea compact-textarea" id="resolution-text-${itemIdx}" rows="3">${item.resolution}</textarea>
          </div>

          <div class="resolution-block">
            <div class="resolution-label-row">
              <span class="resolution-label">Accionables</span>
              <select class="agenda-input resolution-select-sm" data-has-actionables="${itemIdx}">
                <option value="no" ${!item.hasActionables ? "selected" : ""}>Sin accionables</option>
                <option value="si" ${item.hasActionables ? "selected" : ""}>Con accionables</option>
              </select>
            </div>
            ${
              item.hasActionables
                ? `
              <div class="actionables-list" id="actionables-list-${itemIdx}">
                ${(item.actionables || [])
                  .map(
                    (actionable, actionableIdx) => `
                  <div class="actionable-row">
                    <input
                      class="agenda-input"
                      id="actionable-desc-${itemIdx}-${actionableIdx}"
                      type="text"
                      value="${actionable.description}"
                      placeholder="Describir accionable..."
                    >
                    <select class="agenda-input actionable-member-select" id="actionable-member-${itemIdx}-${actionableIdx}">
                      <option value="">A definir</option>
                      ${membersState
                        .map(
                          (m) =>
                            `<option value="${m.id}" ${m.id === actionable.memberId ? "selected" : ""}>${m.firstName} ${m.lastName}</option>`,
                        )
                        .join("")}
                    </select>
                    <button class="icon-btn" type="button" data-remove-actionable="${itemIdx}-${actionableIdx}" aria-label="Eliminar accionable">\u00d7</button>
                  </div>
                `,
                  )
                  .join("")}
                <button class="action-btn" type="button" data-add-actionable="${itemIdx}" style="margin-top:8px;">+ Agregar accionable</button>
              </div>
            `
                : ""
            }
          </div>
        </article>
      `,
    )
    .join("");
}

// ─── Sync: Última reunión ───────────────────────────────────────────────────

function syncPreviousMeetingStateFromInputs() {
  if (!previousMeetingState) return;

  syncAttendeesFromDom();
  previousMeetingState.attendees = previousMeetingState.attendees.filter(
    (a) => !a._pending && a.memberId && a.memberId !== "__new__",
  );

  const statusEl = document.getElementById("meeting-status");
  const motivoEl = document.getElementById("meeting-motivo");

  previousMeetingState = {
    ...previousMeetingState,
    status: statusEl?.value || previousMeetingState.status,
    motivo: motivoEl?.value || "",
    items: previousMeetingState.items.map((item, itemIdx) => {
      const hasActionablesEl = document.querySelector(`[data-has-actionables="${itemIdx}"]`);
      const hasActionables = hasActionablesEl ? hasActionablesEl.value === "si" : item.hasActionables;

      const actionables = hasActionables
        ? (item.actionables || []).map((_a, actionableIdx) => {
            const descEl = document.getElementById(`actionable-desc-${itemIdx}-${actionableIdx}`);
            const memberEl = document.getElementById(`actionable-member-${itemIdx}-${actionableIdx}`);
            const doneEl = document.querySelector(`[data-summary-done="${itemIdx}-${actionableIdx}"]`);
            return {
              description: descEl?.value ?? _a.description,
              memberId: memberEl?.value ?? _a.memberId,
              done: doneEl ? doneEl.checked : _a.done,
            };
          })
        : [];

      const titleEl = document.getElementById(`resolution-title-${itemIdx}`);
      const statusSelectEl = document.getElementById(`resolution-status-${itemIdx}`);
      const resolutionEl = document.getElementById(`resolution-text-${itemIdx}`);
      const statusLabel = statusSelectEl?.value || item.statusLabel;

      return {
        ...item,
        title: titleEl?.value ?? item.title,
        treated: statusLabel === "Tratado",
        statusLabel,
        comments: document.getElementById(`resolution-comments-${itemIdx}`)?.value ?? item.comments ?? "",
        resolution: resolutionEl?.value ?? item.resolution,
        hasActionables,
        actionables,
      };
    }),
  };
}

// ─── Setup: Última reunión ──────────────────────────────────────────────────

function setupLastMeetingActions() {
  if (!elements.saveMinutesBtn || !elements.archiveMeetingBtn) return;

  // Status dropdown → show/hide motivo section
  elements.previousMeetingMeta?.addEventListener("change", (event) => {
    const target = event.target;
    if (target.id === "meeting-status") {
      const motivoSection = document.getElementById("motivoSection");
      if (motivoSection) motivoSection.hidden = target.value !== "No celebrada";
    }
  });

  // Archive as "No celebrada"
  elements.previousMeetingMeta?.addEventListener("click", (event) => {
    if (event.target.id !== "archiveNoCelebradaBtn") return;
    syncPreviousMeetingStateFromInputs();
    if (!previousMeetingState.motivo?.trim()) {
      window.alert("Por favor indica el motivo de la reunion no celebrada.");
      return;
    }
    savePreviousMeeting(previousMeetingState)
      .then(() => archivePreviousMeeting())
      .then((data) => {
        previousMeetingState = data.previousMeeting;
        renderPreviousMeetingMeta(previousMeetingState);
        renderAttendees(previousMeetingState.attendees);
        renderActionablesSummary();
        renderResolutions(previousMeetingState.items);
        renderStats(computeStats());
        elements.archiveMeetingBtn.textContent = "Archivada";
      });
  });

  // Agregar asistente
  elements.addAttendeeBtn?.addEventListener("click", () => {
    syncAttendeesFromDom();
    previousMeetingState.attendees.push({ memberId: "", mode: "Presencial" });
    renderAttendees(previousMeetingState.attendees);
  });

  // Seleccionar "+ Nuevo asistente..." en dropdown → modo inline
  elements.attendeesList?.addEventListener("change", (event) => {
    const target = event.target;
    if (!target.id?.startsWith("attendee-member-") || target.value !== "__new__") return;
    const index = Number(target.id.replace("attendee-member-", ""));
    syncAttendeesFromDom();
    previousMeetingState.attendees[index] = { memberId: "", mode: "Presencial", _pending: true };
    renderAttendees(previousMeetingState.attendees);
    document.getElementById(`new-first-${index}`)?.focus();
  });

  // Clicks en lista de asistentes: confirmar nuevo / eliminar
  elements.attendeesList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const confirmBtn = target.closest("[data-confirm-new]");
    if (confirmBtn) {
      const index = Number(confirmBtn.dataset.confirmNew);
      const firstName = (document.getElementById(`new-first-${index}`)?.value || "").trim();
      const lastName = (document.getElementById(`new-last-${index}`)?.value || "").trim();
      if (!firstName) { document.getElementById(`new-first-${index}`)?.focus(); return; }
      const newMember = { id: `m-${Date.now()}`, firstName, lastName, phone: "" };
      membersState.push(newMember);
      saveMembers(membersState);
      previousMeetingState.attendees[index] = {
        memberId: newMember.id,
        mode: document.getElementById(`new-mode-${index}`)?.value || "Presencial",
      };
      renderAttendees(previousMeetingState.attendees);
      return;
    }

    const removeBtn = target.closest("[data-remove-attendee]");
    if (removeBtn) {
      const index = Number(removeBtn.dataset.removeAttendee);
      syncAttendeesFromDom();
      previousMeetingState.attendees.splice(index, 1);
      renderAttendees(previousMeetingState.attendees);
    }
  });

  // Resolution list: actionable toggle, add, remove
  elements.resolutionList?.addEventListener("change", (event) => {
    const target = event.target;
    if (target.dataset.hasActionables === undefined) return;
    const itemIdx = Number(target.dataset.hasActionables);
    syncPreviousMeetingStateFromInputs();
    previousMeetingState.items[itemIdx].hasActionables = target.value === "si";
    if (!previousMeetingState.items[itemIdx].hasActionables) {
      previousMeetingState.items[itemIdx].actionables = [];
    } else if (!previousMeetingState.items[itemIdx].actionables.length) {
      previousMeetingState.items[itemIdx].actionables.push({ description: "", memberId: "", done: false });
    }
    renderResolutions(previousMeetingState.items);
    renderActionablesSummary();
  });

  elements.resolutionList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const addBtn = target.closest("[data-add-actionable]");
    if (addBtn) {
      const itemIdx = Number(addBtn.dataset.addActionable);
      syncPreviousMeetingStateFromInputs();
      previousMeetingState.items[itemIdx].actionables.push({ description: "", memberId: "", done: false });
      renderResolutions(previousMeetingState.items);
      renderActionablesSummary();
      const newInput = document.getElementById(`actionable-desc-${itemIdx}-${previousMeetingState.items[itemIdx].actionables.length - 1}`);
      newInput?.focus();
      return;
    }

    const removeBtn = target.closest("[data-remove-actionable]");
    if (removeBtn) {
      const [itemIdx, actionableIdx] = removeBtn.dataset.removeActionable.split("-").map(Number);
      syncPreviousMeetingStateFromInputs();
      previousMeetingState.items[itemIdx].actionables.splice(actionableIdx, 1);
      if (!previousMeetingState.items[itemIdx].actionables.length) {
        previousMeetingState.items[itemIdx].hasActionables = false;
      }
      renderResolutions(previousMeetingState.items);
      renderActionablesSummary();
    }
  });

  // Summary checkboxes: update done state
  elements.taskList?.addEventListener("change", (event) => {
    const target = event.target;
    const summaryDone = target.dataset.summaryDone;
    if (!summaryDone) return;
    const [itemIdx, actionableIdx] = summaryDone.split("-").map(Number);
    if (previousMeetingState?.items[itemIdx]?.actionables[actionableIdx] !== undefined) {
      previousMeetingState.items[itemIdx].actionables[actionableIdx].done = target.checked;
      const li = target.closest("li");
      if (li) li.classList.toggle("task-done", target.checked);
    }
  });

  // Save minuta
  elements.saveMinutesBtn.addEventListener("click", () => {
    syncPreviousMeetingStateFromInputs();
    savePreviousMeeting(previousMeetingState).then(() => {
      renderStats(computeStats());
      elements.saveMinutesBtn.textContent = "Minuta guardada";
      window.setTimeout(() => {
        elements.saveMinutesBtn.textContent = "Guardar minuta";
      }, 1200);
    });
  });

  // Archive normal
  elements.archiveMeetingBtn.addEventListener("click", () => {
    if (!window.confirm("\u00bfArchivar esta reunion en la memoria institucional? Esta accion no se puede deshacer.")) return;
    syncPreviousMeetingStateFromInputs();
    savePreviousMeeting(previousMeetingState)
      .then(() => archivePreviousMeeting())
      .then((data) => {
        previousMeetingState = data.previousMeeting;
        renderPreviousMeetingMeta(previousMeetingState);
        renderAttendees(previousMeetingState.attendees);
        renderActionablesSummary();
        renderResolutions(previousMeetingState.items);
        renderStats(computeStats());
        elements.archiveMeetingBtn.textContent = "Archivada";
      });
  });
}

// ─── Render: Historial ─────────────────────────────────────────────────────

function renderHistory(history) {
  if (!elements.historyList) return;
  historyState = history;

  const totalPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  if (historyCurrentPage > totalPages) historyCurrentPage = totalPages;

  const start = (historyCurrentPage - 1) * HISTORY_PAGE_SIZE;
  const pageItems = history.slice(start, start + HISTORY_PAGE_SIZE);

  const cardsHtml = pageItems
    .map((meeting) => {
      const allActionables = (meeting.items || []).flatMap((i) => i.actionables || []);
      const pendingCount = allActionables.filter((a) => !a.done).length;
      const unassignedCount = allActionables.filter((a) => !a.done && !a.memberId).length;
      const treatedCount = (meeting.items || []).filter((i) => i.status === "Tratado").length;
      const isNoCelebrada = meeting.status === "No celebrada";

      return `
        <a class="history-card history-card-link" href="./detalle-reunion.html?id=${encodeURIComponent(meeting.id)}">
          <div class="history-head">
            <div class="history-title">${meeting.title}</div>
            <div class="history-date">${meeting.date}</div>
          </div>
          ${isNoCelebrada
            ? `<p class="history-status-note">Reunion no celebrada${meeting.motivo ? `: ${meeting.motivo}` : "."}</p>`
            : `<p style="margin-bottom:6px"><strong>${treatedCount}</strong> de <strong>${meeting.items.length}</strong> puntos tratados</p>
               ${pendingCount > 0
                  ? `<p class="history-actionable-note ${unassignedCount > 0 ? "has-unassigned" : ""}">
                       ${pendingCount} accionable${pendingCount !== 1 ? "s" : ""} pendiente${pendingCount !== 1 ? "s" : ""}
                       ${unassignedCount > 0 ? `\u00b7 ${unassignedCount} sin asignar` : ""}
                     </p>`
                  : `<p class="history-clear-note">Sin accionables pendientes</p>`
               }`
          }
        </a>
      `;
    })
    .join("");

  const paginationHtml =
    totalPages > 1
      ? `<div class="pagination">
           <button class="action-btn" id="histPrevBtn" ${historyCurrentPage <= 1 ? "disabled" : ""}>\u2190 Anterior</button>
           <span class="page-indicator">P\u00e1gina ${historyCurrentPage} de ${totalPages}</span>
           <button class="action-btn" id="histNextBtn" ${historyCurrentPage >= totalPages ? "disabled" : ""}>Siguiente \u2192</button>
         </div>`
      : "";

  elements.historyList.innerHTML = cardsHtml + paginationHtml;

  document.getElementById("histPrevBtn")?.addEventListener("click", () => {
    historyCurrentPage--;
    renderHistory(historyState);
  });
  document.getElementById("histNextBtn")?.addEventListener("click", () => {
    historyCurrentPage++;
    renderHistory(historyState);
  });
}

// ─── Render: Detalle de reunión ─────────────────────────────────────────────

function renderMeetingDetail(history) {
  if (!elements.meetingDetailTitle || !elements.meetingDetailDate || !elements.meetingDetailList) return;

  const searchParams = new URLSearchParams(window.location.search);
  const meetingId = searchParams.get("id");
  const meeting = history.find((item) => item.id === meetingId) || history[0];

  if (!meeting) {
    elements.meetingDetailTitle.textContent = "Acta no encontrada";
    elements.meetingDetailDate.textContent = "";
    elements.meetingDetailList.innerHTML = "";
    return;
  }

  elements.meetingDetailTitle.textContent = meeting.title;

  let dateSubtitle = meeting.date || "";
  if (meeting.startTime) dateSubtitle += ` \u00b7 ${meeting.startTime} hs.`;
  elements.meetingDetailDate.textContent = dateSubtitle;

  let metaHtml = "";
  const hasAttendees = meeting.attendees && meeting.attendees.length > 0;
  if (hasAttendees || meeting.quorum || meeting.status) {
    const attendeeNames = (meeting.attendees || [])
      .map((a) => {
        const name = getMemberName(a.memberId);
        return name !== "A definir" ? `${name} (${a.mode})` : null;
      })
      .filter(Boolean)
      .join(", ");

    metaHtml = `
      <article class="panel-card" style="margin-bottom:14px;">
        <div class="detail-list">
          ${attendeeNames ? `<div class="detail-item"><strong>Asistentes</strong><span>${attendeeNames}</span></div>` : ""}
          ${meeting.quorum ? `<div class="detail-item"><strong>Quorum</strong><span>${meeting.quorum}</span></div>` : ""}
          ${meeting.status && meeting.status !== "Archivada" ? `<div class="detail-item"><strong>Estado</strong><span>${meeting.status}</span></div>` : ""}
          ${meeting.motivo ? `<div class="detail-item"><strong>Motivo</strong><span>${meeting.motivo}</span></div>` : ""}
        </div>
      </article>
    `;
  }

  const itemsHtml = meeting.items
    .map((item) => {
      const hasActionables = item.actionables && item.actionables.length > 0;
      return `
        <article class="resolution-card">
          <div class="resolution-head">
            <div class="resolution-title">${item.title}</div>
            <span class="badge ${
              item.status === "Tratado" ? "badge-active" : item.status === "Postergado" ? "badge-pilot" : "badge-draft"
            }">${item.status || ""}</span>
          </div>
          <div class="resolution-block">
            <div class="resolution-label">Comentarios</div>
            <p>${item.comments || "Sin comentarios registrados."}</p>
          </div>
          <div class="resolution-block">
            <div class="resolution-label">Resolucion</div>
            <p>${item.resolution || "Sin resolucion registrada."}</p>
          </div>
          ${hasActionables
            ? `<div class="resolution-block">
                 <div class="resolution-label">Accionables</div>
                 <ul class="actionable-display-list">
                   ${item.actionables
                     .map(
                       (a) => `
                     <li class="actionable-display-item ${a.done ? "done" : ""}">
                       <span class="assignee-tag ${!a.memberId ? "unassigned" : ""}">${getMemberName(a.memberId)}</span>
                       <span>${a.description}</span>
                     </li>
                   `,
                     )
                     .join("")}
                 </ul>
               </div>`
            : ""}
        </article>
      `;
    })
    .join("");

  elements.meetingDetailList.innerHTML = metaHtml + itemsHtml;
}

// ─── Render: Miembros ──────────────────────────────────────────────────────

function renderMembers() {
  if (!elements.membersList) return;
  elements.membersList.innerHTML = membersState
    .map(
      (member, index) => `
        <div class="member-row">
          <input class="agenda-input" id="member-first-name-${index}" type="text" value="${member.firstName}" placeholder="Nombre">
          <input class="agenda-input" id="member-last-name-${index}" type="text" value="${member.lastName}" placeholder="Apellido">
          <input class="agenda-input" id="member-phone-${index}" type="text" value="${member.phone}" placeholder="Telefono">
          <button class="icon-btn" type="button" data-remove-member="${index}" aria-label="Eliminar miembro">\u00d7</button>
        </div>
      `,
    )
    .join("");
}

function syncMembersStateFromInputs() {
  membersState = membersState
    .map((member, index) => ({
      ...member,
      firstName: document.getElementById(`member-first-name-${index}`)?.value || "",
      lastName: document.getElementById(`member-last-name-${index}`)?.value || "",
      phone: document.getElementById(`member-phone-${index}`)?.value || "",
    }))
    .filter((member) => member.firstName || member.lastName || member.phone);
}

function setupMembersActions() {
  if (!elements.addMemberBtn || !elements.saveMembersBtn) return;

  elements.membersList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const index = target.dataset.removeMember;
    if (index === undefined) return;
    syncMembersStateFromInputs();
    membersState.splice(Number(index), 1);
    renderMembers();
  });

  elements.addMemberBtn.addEventListener("click", () => {
    syncMembersStateFromInputs();
    membersState.push({ id: `m-${Date.now()}`, firstName: "", lastName: "", phone: "" });
    renderMembers();
    const newInput = document.getElementById(`member-first-name-${membersState.length - 1}`);
    newInput?.focus();
  });

  elements.saveMembersBtn.addEventListener("click", () => {
    syncMembersStateFromInputs();
    saveMembers(membersState).then(() => {
      elements.saveMembersBtn.textContent = "Miembros guardados";
      window.setTimeout(() => {
        elements.saveMembersBtn.textContent = "Guardar miembros";
      }, 1200);
    });
  });
}

// ─── Render: Impresión ─────────────────────────────────────────────────────

function renderPrintAgenda() {
  if (!elements.printAgendaTitle || !elements.printAgendaSubtitle || !elements.printAgendaList) return;
  const { nextMeeting } = getNextMeetingInfo();
  const nextMeetingLabel = formatMeetingDate(nextMeeting);
  const hourLabel = `${String(moduleConfig.meetingStartHour).padStart(2, "0")}:00 hs.`;

  elements.printAgendaTitle.textContent = "Orden del dia";
  elements.printAgendaSubtitle.textContent = `${nextMeetingLabel} \u00b7 Inicio: ${hourLabel}`;
  elements.printAgendaList.innerHTML = agendaState
    .map(
      (point, index) => `
        <article class="print-item">
          <h2>Punto ${index + 1}: ${point.title}</h2>
          ${point.description ? `<p>${point.description}</p>` : ""}
        </article>
      `,
    )
    .join("");
}

function renderPrintMeeting(data) {
  if (!elements.printMeetingTitle || !elements.printMeetingSubtitle || !elements.printMeetingMeta || !elements.printMeetingList) return;

  const searchParams = new URLSearchParams(window.location.search);
  const source = searchParams.get("source");
  const id = searchParams.get("id");
  const meeting =
    source === "last"
      ? data.previousMeeting
      : data.history.find((item) => item.id === id) || data.history[0];

  if (!meeting) return;

  const title = meeting.title || `Reunion N\u00b0 ${meeting.number}`;
  const date = meeting.date || meeting.dateLabel || "";
  const startTime = meeting.startTime || "";
  const timeLabel = startTime ? ` \u00b7 ${startTime} hs.` : "";

  const attendees = meeting.attendees
    ? meeting.attendees
        .map((a) => {
          const name = getMemberName(a.memberId);
          return name !== "A definir" ? `${name} (${a.mode})` : null;
        })
        .filter(Boolean)
        .join(", ")
    : "";

  elements.printMeetingTitle.textContent = title;
  elements.printMeetingSubtitle.textContent = `${date}${timeLabel}`;
  elements.printMeetingMeta.innerHTML = `
    ${attendees ? `<p><strong>Asistentes:</strong> ${attendees}</p>` : ""}
    ${meeting.quorum ? `<p><strong>Quorum:</strong> ${meeting.quorum}</p>` : ""}
    ${meeting.status && meeting.status !== "Archivada" ? `<p><strong>Estado:</strong> ${meeting.status}</p>` : ""}
    ${meeting.motivo ? `<p><strong>Motivo:</strong> ${meeting.motivo}</p>` : ""}
  `;

  const items = (meeting.items || []).map((item) => ({
    title: item.title,
    status: item.status || item.statusLabel || "",
    comments: item.comments || "",
    resolution: item.resolution || "",
    actionables: item.actionables || [],
  }));

  elements.printMeetingList.innerHTML = items
    .map(
      (item) => `
        <article class="print-item">
          <div class="print-item-head">
            <h2>${item.title}</h2>
            <div>${item.status}</div>
          </div>
          <p><strong>Comentarios:</strong> ${item.comments || "Sin comentarios registrados."}</p>
          <p><strong>Resolucion:</strong> ${item.resolution || "Sin resolucion registrada."}</p>
          ${
            item.actionables.length
              ? `<div><strong>Accionables:</strong>
                  <ul class="print-bullets">
                    ${item.actionables
                      .map(
                        (a) =>
                          `<li>${a.description}${a.memberId ? ` \u2014 <em>${getMemberName(a.memberId)}</em>` : " \u2014 <em>A definir</em>"}</li>`,
                      )
                      .join("")}
                  </ul>
                </div>`
              : "<p><strong>Accionables:</strong> Sin accionables registrados.</p>"
          }
        </article>
      `,
    )
    .join("");
}

function setupPrintAction() {
  elements.printNowBtn?.addEventListener("click", () => window.print());
}

// ─── Sidebar ───────────────────────────────────────────────────────────────

function setupSidebar() {
  if (!elements.menuToggle || !elements.sidebar || !elements.sidebarOverlay) return;

  const openSidebar = () => {
    elements.sidebar.classList.add("open");
    elements.sidebarOverlay.classList.add("visible");
  };
  const closeSidebar = () => {
    elements.sidebar.classList.remove("open");
    elements.sidebarOverlay.classList.remove("visible");
  };

  elements.menuToggle.addEventListener("click", () => {
    elements.sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  elements.sidebarOverlay.addEventListener("click", closeSidebar);
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });
}

// ─── Init ──────────────────────────────────────────────────────────────────

async function init() {
  document.title = `${moduleConfig.moduleName} | ${moduleConfig.schoolName}`;
  setupSidebar();

  try {
    const data = await getModuleData();
    membersState = JSON.parse(JSON.stringify(data.members || []));

    if (elements.page === "next-meeting") {
      agendaState = (data.nextAgenda.points || []).map((p) => ({
        title: p.title,
        description: p.description,
      }));
      renderAgenda();
      renderMeetingHeader();
      setupAgendaActions();
    }

    if (elements.page === "last-meeting") {
      previousMeetingState = JSON.parse(JSON.stringify(data.previousMeeting));
      renderStats(computeStats());
      renderPreviousMeetingMeta(previousMeetingState);
      renderAttendees(previousMeetingState.attendees);
      renderResolutions(previousMeetingState.items);
      renderActionablesSummary();
      setupLastMeetingActions();
    }

    if (elements.page === "history") {
      renderHistory(data.history);
    }

    if (elements.page === "meeting-detail") {
      renderMeetingDetail(data.history);
      if (elements.printMeetingLink) {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get("id");
        elements.printMeetingLink.href = `./print-acta.html?id=${encodeURIComponent(id || "")}`;
      }
    }

    if (elements.page === "members") {
      renderMembers();
      setupMembersActions();
    }

    if (elements.page === "print-agenda") {
      agendaState = (data.nextAgenda.points || []).map((p) => ({
        title: p.title,
        description: p.description,
      }));
      renderPrintAgenda();
      setupPrintAction();
    }

    if (elements.page === "print-meeting") {
      previousMeetingState = JSON.parse(JSON.stringify(data.previousMeeting));
      renderPrintMeeting(data);
      setupPrintAction();
    }
  } catch (error) {
    if (elements.statsGrid) {
      elements.statsGrid.innerHTML = `
        <article class="stat-card">
          <div class="stat-label">error</div>
          <div class="stat-value">!</div>
          <div class="stat-sub">${error.message}</div>
        </article>
      `;
    }
    console.error(error);
  }
}

init();
