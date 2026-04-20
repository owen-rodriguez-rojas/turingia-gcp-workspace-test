import functions_framework
import logging
import requests
import json
import os

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Variables de entorno (seguridad)
WEBHOOK_URL = os.environ.get("WEBHOOK_URL")
TOKEN_SECRETO = os.environ.get("TOKEN_SECRETO")


@functions_framework.cloud_event
def procesar_archivo(cloud_event):
    """
    Cloud Function que se activa cuando se sube un archivo al bucket.
    Extrae metadatos, los registra en logs y los envía a Apps Script.
    """
    try:
        # ------------------------------------------------------
        # PASO 1: EXTRACCIÓN DE DATOS
        # ------------------------------------------------------
        data = cloud_event.data

        nombre_archivo = data.get("name", "desconocido")
        bucket_nombre  = data.get("bucket", "desconocido")
        tamanio_bytes  = data.get("size", 0)
        tipo_archivo   = data.get("contentType", "desconocido")

        tamanio_kb = round(int(tamanio_bytes) / 1024, 2)

        # ------------------------------------------------------
        # LOGS 
        # ------------------------------------------------------
        logger.info("=== NUEVO EVENTO DE ARCHIVO ===")
        logger.info(f"Archivo detectado en bucket: {bucket_nombre}")
        logger.info(f"Nombre del archivo: {nombre_archivo}")
        logger.info(f"Tamaño: {tamanio_kb} KB")
        logger.info(f"Tipo de archivo: {tipo_archivo}")

        # ------------------------------------------------------
        # PASO 2: VALIDAR CONFIGURACIÓN
        # ------------------------------------------------------
        if not WEBHOOK_URL or not TOKEN_SECRETO:
            logger.error("Variables de entorno no configuradas correctamente")
            logger.error(f"WEBHOOK_URL: {WEBHOOK_URL}")
            logger.error(f"TOKEN_SECRETO: {TOKEN_SECRETO}")
            raise ValueError("Faltan variables de entorno")

        # ------------------------------------------------------
        # PASO 3: PREPARAR PAYLOAD
        # ------------------------------------------------------
        payload = {
            "token": TOKEN_SECRETO,
            "nombre_archivo": nombre_archivo,
            "tamanio_bytes": int(tamanio_bytes),
            "tipo_contenido": tipo_archivo,
            "bucket": bucket_nombre
        }

        logger.info("Payload preparado para envío a Apps Script")

        # ------------------------------------------------------
        # PASO 4: ENVÍO AL WEBHOOK
        # ------------------------------------------------------
        logger.info("Enviando datos al webhook de Apps Script...")

        response = requests.post(
            WEBHOOK_URL,
            json=payload,
            timeout=10
        )

        # ------------------------------------------------------
        # PASO 5: VALIDACIÓN DE RESPUESTA
        # ------------------------------------------------------
        logger.info(f"Código de respuesta del webhook: {response.status_code}")

        if response.status_code == 200:
            try:
                res_json = response.json()
                logger.info(f"Respuesta del webhook: {res_json}")
            except Exception:
                logger.warning("No se pudo parsear la respuesta como JSON")
                logger.info(f"Respuesta cruda: {response.text}")
        else:
            logger.error(f"Error en webhook: {response.status_code}")
            logger.error(f"Detalle: {response.text}")

        return f"Archivo {nombre_archivo} procesado e integrado correctamente."

    except KeyError as e:
        logger.error(f"Campo faltante en el evento: {str(e)}")
        raise

    except ValueError as e:
        logger.error(f"Error al procesar datos: {str(e)}")
        raise

    except requests.exceptions.RequestException as e:
        logger.error(f"Error de conexión con el webhook: {str(e)}")
        return "Error de comunicación con Apps Script."

    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        raise