# Infraestructura GCP — Periodo de Prueba Técnica Turing IA

## Descripción
Infraestructura GCP con Cloud Storage, Cloud Functions y automatización 
en Google Workspace — Periodo de prueba técnica Turing IA.

## Arquitectura
![Diagrama de flujo](docs/capturas/diagrama-flujo.png)

## Configuración del proyecto

### 1. Proyecto GCP
Se creó el proyecto `turing-gcp-test` en Google Cloud Platform.

![Proyecto creado](docs/capturas/01-proyecto-creado.png)

### 2. APIs habilitadas
Se habilitaron las APIs necesarias para el proyecto.

![APIs habilitadas](docs/capturas/02-apis-habilitadas.png)

### 3. IAM
Se configuró un usuario de prueba con el rol de Visualizador de objetos 
de Storage, aplicando el principio de privilegios mínimos.

![IAM configurado](docs/capturas/03-iam-configurado.png)

### 4. Bucket
Se creó el bucket `bucket-turing-prueba` en us-central1 con clase Standard,
control de acceso uniforme y prevención de acceso público activada.

![Bucket creado](docs/capturas/04-bucket-creado.png)

### 5. Ciclo de vida
Se configuró una regla para eliminar objetos con más de 30 días de antigüedad.

![Ciclo de vida](docs/capturas/05-ciclo-de-vida.png)

### 6. Permisos del bucket
Se asignaron permisos de lectura al usuario de prueba. 
La cuenta principal tiene acceso total al proyecto por su rol de propietario.

![Permisos bucket](docs/capturas/06-permisos-bucket.png)

### 7. Cloud Function
Se desplegó una Cloud Function en Python 3.11 que se activa automáticamente 
cuando se sube un archivo al bucket, extrae sus metadatos y los registra 
en Cloud Logging.

![Cloud Function activador](docs/capturas/07-cloud-function-activador.png)
![Cloud Function código](docs/capturas/08-cloud-function-codigo.png)

## Prueba end-to-end
Se subió un archivo de prueba al bucket y se verificó que la Cloud Function 
se activó correctamente y registró los metadatos en Cloud Logging.

![Archivo subido](docs/capturas/09-archivo-subido-bucket.png)
![Logs](docs/capturas/10-logs-cloud-logging.png)

## Pruebas unitarias
Se implementaron 3 pruebas unitarias verificando el flujo exitoso, 
campos faltantes y manejo de errores.

![Pruebas unitarias](docs/capturas/11-pruebas-unitarias.png)

## Estructura del repositorio
```
turing-gcp-workspace-prueba/
├── README.md
├── cloud-function/
│   ├── main.py
│   ├── requirements.txt
│   └── test_main.py
└── docs/
    └── capturas/
```