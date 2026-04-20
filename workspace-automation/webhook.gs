// ============================================================
// webhook.gs — Endpoint Web App para recibir metadatos de GCP
// Autor: Owen Misael Rodriguez Rojas
// Proyecto: Integración GCP + Google Workspace — Turing IA
//
// ¿Qué hace este archivo?
// Este script convierte el proyecto de Apps Script en un
// servidor web ligero que puede recibir solicitudes HTTP
// desde servicios externos, en este caso desde una Cloud
// Function de Google Cloud Platform.
//
// Flujo general:
// 1. Cloud Function sube archivo al bucket → extrae metadatos
// 2. Cloud Function hace POST a este endpoint con los datos
// 3. Este script valida que la solicitud sea legítima (token)
// 4. Registra los metadatos en Google Sheets
// 5. Envía notificación por Gmail al administrador
// ============================================================


// ------------------------------------------------------------
// CONSTANTES DE CONFIGURACIÓN
// ------------------------------------------------------------

// Nombre exacto de la hoja donde se registrarán los archivos
// que lleguen desde GCP. Debe coincidir con la pestaña creada
// en el Google Sheet.
const NOMBRE_HOJA_WEBHOOK = "Archivos GCP";

// Token de seguridad compartido entre la Cloud Function y este
// script. Funciona como una contraseña: si la solicitud no
// trae este token exacto, se rechaza automáticamente.
// IMPORTANTE: En el Bloque 3 moveremos este valor a
// Properties Service para no tenerlo visible en el código.
const TOKEN_SECRETO = "turing-ia-token-2024";


// ------------------------------------------------------------
// FUNCIÓN PRINCIPAL — doPost(e)
// ------------------------------------------------------------
// ¿Por qué se llama doPost?
// Google Apps Script tiene funciones reservadas que se activan
// automáticamente según el tipo de solicitud HTTP:
//   - doGet(e)  → se ejecuta cuando alguien hace GET (visitar URL)
//   - doPost(e) → se ejecuta cuando alguien hace POST (enviar datos)
//
// La Cloud Function enviará sus datos mediante POST, por eso
// usamos doPost. El parámetro "e" contiene toda la información
// de la solicitud entrante (headers, body, etc.)
// ------------------------------------------------------------

function doPost(e) {

  try {
    // ----------------------------------------------------------
    // PASO 1: PARSEAR EL CUERPO DE LA SOLICITUD
    // ----------------------------------------------------------
    // La Cloud Function envía los metadatos en formato JSON
    // dentro del cuerpo (body) de la solicitud HTTP.
    // e.postData.contents contiene ese texto JSON como string.
    // JSON.parse() lo convierte en un objeto JavaScript para
    // poder acceder a sus propiedades con punto (datos.nombre, etc.)
    //
    // Ejemplo de lo que llega:
    // {
    //   "token": "turing-ia-token-2024",
    //   "nombre_archivo": "reporte.pdf",
    //   "tamanio_bytes": 204800,
    //   "tipo_contenido": "application/pdf",
    //   "bucket": "bucket-turing-prueba"
    // }
    const datos = JSON.parse(e.postData.contents);


    // ----------------------------------------------------------
    // PASO 2: VALIDAR EL TOKEN DE SEGURIDAD
    // ----------------------------------------------------------
    // Antes de hacer cualquier cosa con los datos, verificamos
    // que la solicitud venga de una fuente confiable (nuestra
    // Cloud Function) y no de alguien desconocido.
    //
    // Si el token que llegó en los datos NO coincide con el
    // TOKEN_SECRETO que tenemos configurado, rechazamos la
    // solicitud inmediatamente y devolvemos un error.
    //
    // El "return" corta la ejecución aquí si el token es inválido,
    // así el resto del código nunca se ejecuta.
    if (datos.token !== TOKEN_SECRETO) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "error",
          mensaje: "Token inválido — solicitud rechazada"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }


    // ----------------------------------------------------------
    // PASO 3: OBTENER LA HOJA DE CÁLCULO
    // ----------------------------------------------------------
    // Buscamos la hoja llamada "Archivos GCP" dentro del
    // Spreadsheet activo (el que está vinculado a este script).
    // getSheetByName() devuelve null si la hoja no existe,
    // por eso verificamos antes de usarla.
    const hoja = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(NOMBRE_HOJA_WEBHOOK);

    // Si la hoja no existe, avisamos con un error descriptivo
    // en lugar de dejar que el script falle sin explicación.
    if (!hoja) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "error",
          mensaje: `No se encontró la hoja "${NOMBRE_HOJA_WEBHOOK}" en el Spreadsheet`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }


    // ----------------------------------------------------------
    // PASO 4: REGISTRAR LOS METADATOS EN EL SHEET
    // ----------------------------------------------------------
    // Capturamos la fecha y hora exacta en que se recibió
    // la solicitud. Esto sirve como registro de auditoría.
    const ahora = new Date();

    // appendRow() agrega una nueva fila al final de la hoja
    // con los valores que le pasamos en el array.
    // El orden debe coincidir con los encabezados que creaste:
    // Nombre_Archivo | Tamaño_Bytes | Tipo_Contenido | Bucket | Fecha_Recepción
    hoja.appendRow([
      datos.nombre_archivo,   // Columna A
      datos.tamanio_bytes,    // Columna B
      datos.tipo_contenido,   // Columna C
      datos.bucket,           // Columna D
      ahora                   // Columna E
    ]);


    // ----------------------------------------------------------
    // PASO 5: ENVIAR NOTIFICACIÓN POR GMAIL
    // ----------------------------------------------------------
    // Obtenemos el email del usuario que desplegó el Web App
    // (tu cuenta de Google) para enviarle la notificación.
    // Session.getActiveUser().getEmail() devuelve ese email
    // automáticamente sin necesidad de hardcodearlo.
    const destinatario = Session.getActiveUser().getEmail();

    const asunto = `Nuevo archivo en GCP: ${datos.nombre_archivo}`;

    // Cuerpo del correo con todos los metadatos recibidos
    // para que el administrador tenga contexto completo.
    const cuerpo = `
Hola,

Se ha detectado la subida de un nuevo archivo al bucket de Cloud Storage.

--- DETALLES DEL ARCHIVO ---
Nombre:           ${datos.nombre_archivo}
Tamaño:           ${datos.tamanio_bytes} bytes
Tipo de archivo:  ${datos.tipo_contenido}
Bucket de origen: ${datos.bucket}
Fecha recibido:   ${ahora}

Este mensaje fue generado automáticamente por el
Sistema Integrado GCP + Workspace — Turing IA.
    `;

    GmailApp.sendEmail(destinatario, asunto, cuerpo);


    // ----------------------------------------------------------
    // PASO 6: RESPONDER CON ÉXITO
    // ----------------------------------------------------------
    // Le decimos a la Cloud Function que todo salió bien.
    // Ella puede registrar esta respuesta en Cloud Logging
    // para tener trazabilidad completa del flujo.
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "ok",
        mensaje: "Metadatos registrados y notificación enviada correctamente"
      }))
      .setMimeType(ContentService.MimeType.JSON);


  } catch (error) {
    // ----------------------------------------------------------
    // MANEJO DE ERRORES INESPERADOS
    // ----------------------------------------------------------
    // Si algo falla en cualquier parte del proceso (red, permisos,
    // formato inesperado de datos, etc.), capturamos el error
    // y lo devolvemos como respuesta en lugar de dejar que el
    // script colapse silenciosamente.
    // error.toString() convierte el objeto Error en texto legible.
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        mensaje: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}