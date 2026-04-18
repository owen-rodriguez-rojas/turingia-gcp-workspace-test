import unittest
from unittest.mock import MagicMock

from main import procesar_archivo


def make_event(data):
    """Crea un evento simulado de Cloud Storage."""
    event = MagicMock()
    event.data = data
    return event


class TestProcesarArchivo(unittest.TestCase):

    def test_flujo_exitoso(self):
        """Verifica que la función procesa correctamente un evento válido."""
        evento = make_event({
            "name": "archivo-prueba.txt",
            "bucket": "bucket-turing-prueba",
            "size": "2048",
            "contentType": "text/plain"
        })

        resultado = procesar_archivo(evento)
        self.assertIn("archivo-prueba.txt", resultado)

    def test_campos_faltantes(self):
        """Verifica que la función usa valores por defecto si faltan campos."""
        evento = make_event({})

        resultado = procesar_archivo(evento)
        self.assertIn("desconocido", resultado)

    def test_tamanio_invalido(self):
        """Verifica que la función lanza ValueError si el tamaño no es número."""
        evento = make_event({
            "name": "archivo.txt",
            "bucket": "bucket-turing-prueba",
            "size": "no-es-numero",
            "contentType": "text/plain"
        })

        with self.assertRaises(ValueError):
            procesar_archivo(evento)


if __name__ == "__main__":
    unittest.main()