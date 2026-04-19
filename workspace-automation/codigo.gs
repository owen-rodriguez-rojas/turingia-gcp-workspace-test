// ============================================================
// Automatización Google Workspace — Turing IA
// Autor: Owen Misael Rodriguez Rojas
// Descripción: Script que integra Google Sheets, Gmail y
// Google Calendar para automatizar la gestión de tareas.
// ============================================================


// ── CONFIGURACIÓN GLOBAL ──────────────────────────────────
// Nombre de la hoja de cálculo que contiene las tareas
const NOMBRE_HOJA = "Hoja 1";

// Número de días restantes mínimo para considerar una tarea urgente
const DIAS_ALERTA = 3;


// ── FUNCIÓN PRINCIPAL ─────────────────────────────────────
/**
 * procesarTareas()
 * Recorre todas las filas del Sheet, calcula los días restantes
 * de cada tarea, envía alertas por Gmail si la tarea está
 * próxima a vencer (solo una vez por tarea), y crea eventos
 * en Google Calendar si aún no han sido creados.
 */
function procesarTareas() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NOMBRE_HOJA);
  const totalFilas = hoja.getLastRow();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  for (let fila = 2; fila <= totalFilas; fila++) {

    const id            = hoja.getRange(fila, 1).getValue();
    const tarea         = hoja.getRange(fila, 2).getValue();
    const responsable   = hoja.getRange(fila, 3).getValue();
    const email         = hoja.getRange(fila, 4).getValue();
    const fechaLimite   = new Date(hoja.getRange(fila, 5).getValue());
    const estado        = hoja.getRange(fila, 6).getValue();
    const eventoCreado  = hoja.getRange(fila, 8).getValue();

    // Columna I — controla si ya se envio la alerta para esta tarea
    const alertaEnviada = hoja.getRange(fila, 9).getValue();

    if (!tarea || !email || !fechaLimite || estado === "Completada") continue;

    // ── CÁLCULO DE DÍAS RESTANTES ─────────────────────────
    const diferenciaMilis = fechaLimite.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaMilis / (1000 * 60 * 60 * 24));
    hoja.getRange(fila, 7).setValue(diasRestantes);

    // ── NOTIFICACIÓN POR GMAIL ────────────────────────────
    // Solo envia la alerta si la tarea es urgente Y no se ha enviado antes
    if (diasRestantes <= DIAS_ALERTA && !alertaEnviada) {
      enviarAlerta(email, tarea, responsable, diasRestantes);

      // Marcar columna I para no volver a enviar la alerta
      hoja.getRange(fila, 9).setValue("Enviada");
    }

    // ── CREACIÓN DE EVENTO EN CALENDAR ────────────────────
    if (!eventoCreado) {
      crearEvento(tarea, responsable, fechaLimite);
      hoja.getRange(fila, 8).setValue("Creado");
    }
  }
}


// ── FUNCIÓN DE ALERTA POR GMAIL ───────────────────────────
/**
 * enviarAlerta(email, tarea, responsable, diasRestantes)
 * Envia un correo de notificación cuando una tarea está
 * próxima a vencer. Se ejecuta solo una vez por tarea.
 */
function enviarAlerta(email, tarea, responsable, diasRestantes) {
  const asunto = `ALERTA: Tarea proxima a vencer — ${tarea}`;

  const cuerpo = `
Hola ${responsable},

Te informamos que la siguiente tarea esta proxima a vencer:

Tarea: ${tarea}
Responsable: ${responsable}
Dias restantes: ${diasRestantes} dia(s)

Por favor toma las acciones necesarias para completarla a tiempo.

Saludos,
Sistema de Gestion de Tareas — Turing IA
  `;

  GmailApp.sendEmail(email, asunto, cuerpo);
}


// ── FUNCIÓN DE CREACIÓN DE EVENTO ────────────────────────
/**
 * crearEvento(tarea, responsable, fechaLimite)
 * Crea un evento de todo el dia en Google Calendar
 * en la fecha limite de la tarea.
 */
function crearEvento(tarea, responsable, fechaLimite) {
  const calendario = CalendarApp.getDefaultCalendar();

  const titulo = `Vencimiento: ${tarea}`;

  const descripcion = `
Tarea: ${tarea}
Responsable: ${responsable}
Generado automaticamente por el Sistema de Gestion de Tareas — Turing IA
  `;

  calendario.createAllDayEvent(titulo, fechaLimite, { description: descripcion });
}