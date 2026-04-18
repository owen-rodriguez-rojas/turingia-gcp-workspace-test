import functions_framework
import logging
from google.cloud import storage

# Configuramos el sistema de logging de Python para registrar mensajes
# desde el nivel INFO en adelante (INFO, WARNING, ERROR, CRITICAL)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# El decorador @cloud_event indica que esta función se activa mediante
# un evento de CloudEvents (estandar abierto para describir eventos)
# En este caso, el evento es generado por Cloud Storage cuando se sube un archivo.
@functions_framework.cloud_event
def procesar_archivo(cloud_event):
    """
    Cloud Function que se activa automáticamente cuando se sube
    un archivo al bucket de Cloud Storage.
    Extrae metadatos del archivo y los registra en Cloud Logging.
    """
    try:
        # cloud_event.data contiene el payload del evento de Cloud Storage
        # con los metadatos del archivo que fue subido
        data = cloud_event.data

        # Usamos .get() en lugar de acceso directo por corchetes para evitar
        # KeyError si algún campo no viene en el evento. El segundo argumento
        # es el valor por defecto si el campo no existe.
        nombre_archivo = data.get("name", "desconocido")
        bucket_nombre  = data.get("bucket", "desconocido")
        tamanio_bytes  = data.get("size", 0)
        tipo_archivo   = data.get("contentType", "desconocido")

        # Se convierte de bytes a kilobytes para que sea mas legible en los logs
        tamanio_kb = round(int(tamanio_bytes) / 1024, 2)

        # Registramos los metadatos en Cloud Logging.
        logger.info(f"Archivo detectado en bucket: {bucket_nombre}")
        logger.info(f"Nombre del archivo: {nombre_archivo}")
        logger.info(f"Tamaño: {tamanio_kb} KB")
        logger.info(f"Tipo de archivo: {tipo_archivo}")

        return f"Archivo {nombre_archivo} procesado correctamente."

    except KeyError as e:
        # Se activa si algún campo obligatorio no existe en el evento
        logger.error(f"Campo faltante en el evento: {str(e)}")
        raise

    except ValueError as e:
        # Se activa si el tamaño del archivo no se puede convertir a entero
        logger.error(f"Error al procesar el tamaño del archivo: {str(e)}")
        raise

    except Exception as e:
        # Captura cualquier otro error inesperado
        # Se usa raise para que GCP registre el error y reintente la ejecución
        logger.error(f"Error inesperado al procesar el archivo: {str(e)}")
        raise