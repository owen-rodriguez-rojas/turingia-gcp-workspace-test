// ============================================================
// webhook.gs — Endpoint Web App para recibir metadatos de GCP
// Autor: Owen Misael Rodriguez Rojas
// Proyecto: Integración GCP + Google Workspace — Turing IA
//
// DESCRIPCIÓN GENERAL:
// Este script convierte Google Apps Script en un endpoint HTTP
// capaz de recibir solicitudes POST desde servicios externos,
// específicamente desde una Cloud Function en GCP.
//
// FLUJO DE TRABAJO:
// 1. Se sube un archivo a Cloud Storage
// 2. La Cloud Function se activa automáticamente
// 3. La función envía un POST a este endpoint con metadatos
// 4. Este script valida el token de seguridad
// 5. Registra los datos en Google Sheets
// 6. Envía una notificación por correo
// ============================================================


// ------------------------------------------------------------
// CONFIGURACIÓN GENERAL
// ------------------------------------------------------------

const NOMBRE_HOJA = "Archivos GCP";
const SPREADSHEET_ID = "1LZw2yt14H4coEsN1rtfbQTCqYyY8t1TM_EmOa77eihQ";

const TOKEN_SECRETO = PropertiesService
  .getScriptProperties()
  .getProperty("TOKEN_SECRETO");


// ------------------------------------------------------------
// FUNCIÓN PRINCIPAL — doPost(e)
// ------------------------------------------------------------

function doPost(e) {

  try {

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "error",
          mensaje: "Solicitud inválida: sin cuerpo"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const datos = JSON.parse(e.postData.contents);

    if (!datos.token) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "error",
          mensaje: "Token no proporcionado"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (datos.token !== TOKEN_SECRETO) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "error",
          mensaje: "Token inválido — acceso denegado"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!datos.nombre_archivo || !datos.bucket) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "error",
          mensaje: "Datos incompletos"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const hoja = spreadsheet.getSheetByName(NOMBRE_HOJA);

    if (!hoja) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "error",
          mensaje: `No se encontró la hoja "${NOMBRE_HOJA}"`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const fechaRecepcion = new Date();

    hoja.appendRow([
      datos.nombre_archivo,
      datos.tamanio_bytes,
      datos.tipo_contenido,
      datos.bucket,
      fechaRecepcion
    ]);

    // --------------------------------------------------------
    // ENVÍO DE NOTIFICACIÓN POR GMAIL
    // --------------------------------------------------------

    const destinatario = "owen.rodriguez.rojas@gmail.com";

    const asunto = `Nuevo archivo en GCP: ${datos.nombre_archivo}`;

    const cuerpo = `
Se ha registrado un nuevo archivo desde Cloud Storage.

Nombre: ${datos.nombre_archivo}
Tamaño: ${datos.tamanio_bytes} bytes
Tipo: ${datos.tipo_contenido}
Bucket: ${datos.bucket}
Fecha: ${fechaRecepcion}
`;

    GmailApp.sendEmail(destinatario, asunto, cuerpo);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "ok",
        mensaje: "Metadatos registrados y correo enviado correctamente"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        mensaje: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}