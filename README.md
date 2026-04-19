# Infraestructura GCP & Google Workspace — Periodo de Prueba Técnica Turing IA

## Descripción
Infraestructura GCP con Cloud Storage, Cloud Functions y automatización 
en Google Workspace — Periodo de prueba técnica Turing IA.

## Arquitectura
![Diagrama de flujo](docs/capturas/Dia1/diagrama-flujo.png)

---

## DÍA 1 — Configuración de infraestructura GCP

### 1. Proyecto GCP
Se creó el proyecto `turing-gcp-test` en Google Cloud Platform.

![Proyecto creado](docs/capturas/Dia1/01-proyecto-creado.png)

### 2. APIs habilitadas
Se habilitaron las APIs necesarias para el proyecto.

![APIs habilitadas](docs/capturas/Dia1/02-apis-habilitadas.png)

### 3. IAM
Se configuró un usuario de prueba con el rol de Visualizador de objetos 
de Storage, aplicando el principio de privilegios mínimos.

![IAM configurado](docs/capturas/Dia1/03-iam-configurado.png)

### 4. Bucket
Se creó el bucket `bucket-turing-prueba` en us-central1 con clase Standard,
control de acceso uniforme y prevención de acceso público activada.

![Bucket creado](docs/capturas/Dia1/04-bucket-creado.png)

### 5. Ciclo de vida
Se configuró una regla para eliminar objetos con más de 30 días de antigüedad.

![Ciclo de vida](docs/capturas/Dia1/05-ciclo-de-vida.png)

### 6. Permisos del bucket
Se asignaron permisos de lectura al usuario de prueba. 
La cuenta principal tiene acceso total al proyecto por su rol de propietario.

![Permisos bucket](docs/capturas/Dia1/06-permisos-bucket.png)

### 7. Cloud Function
Se desplegó una Cloud Function en Python 3.11 que se activa automáticamente 
cuando se sube un archivo al bucket, extrae sus metadatos y los registra 
en Cloud Logging.

![Cloud Function activador](docs/capturas/Dia1/07-cloud-function-activador.png)
![Cloud Function código](docs/capturas/Dia1/08-cloud-function-codigo.png)

### Prueba end-to-end
Se subió un archivo de prueba al bucket y se verificó que la Cloud Function 
se activó correctamente y registró los metadatos en Cloud Logging.

![Archivo subido](docs/capturas/Dia1/09-archivo-subido-bucket.png)
![Logs](docs/capturas/Dia1/10-logs-cloud-logging.png)

### Pruebas unitarias
Se implementaron 3 pruebas unitarias verificando el flujo exitoso, 
campos faltantes y manejo de errores.

![Pruebas unitarias](docs/capturas/Dia1/11-pruebas-unitarias.png)

---

## DÍA 2 — Automatización en Google Workspace

### 1. Simulación del entorno de Google Workspace

Se simuló un entorno de Google Workspace mediante Google Groups,
configurando grupos de usuarios, asignación de roles y políticas
básicas de seguridad y permisos.

#### Google Groups
![Google Groups inicio](docs/capturas/Dia2/01-google-groups-inicio.png)
![Grupo creado](docs/capturas/Dia2/02-google-group-creado.png)
![Miembros y roles](docs/capturas/Dia2/03-google-group-miembros.png)

### 2. Google Sheet — Sistema de Gestión de Tareas

Se creó un Google Sheet con estructura de datos para gestionar tareas
del equipo, incluyendo responsable, email, fecha límite, estado,
días restantes y control de eventos y alertas.

![Estructura del Sheet](docs/capturas/Dia2/05-sheet-estructura.png)

### 3. Google Apps Script

Se desarrolló un script avanzado en Google Apps Script que integra
tres servicios de Google Workspace de forma automática:

- **Google Sheets** — Lee datos, calcula días restantes y actualiza registros
- **Gmail** — Envía alertas cuando una tarea está próxima a vencer
- **Google Calendar** — Crea eventos automáticamente en la fecha límite de cada tarea

El script incluye control de alertas duplicadas mediante la columna
`Alerta_Enviada`, garantizando que cada tarea reciba solo una notificación.

![Editor de Apps Script](docs/capturas/Dia2/06-apps-script-editor.png)
![Código del script](docs/capturas/Dia2/07-apps-script-codigo.png)
![Ejecución exitosa](docs/capturas/Dia2/08-apps-script-ejecucion.png)

### 4. Triggers configurados

Se configuraron dos activadores automáticos:

- **Trigger diario** — Ejecuta el script todos los días entre 9:00 y 10:00 am
- **Trigger por edición** — Ejecuta el script automáticamente al editar el Sheet

![Triggers configurados](docs/capturas/Dia2/12-triggers-configurados.png)

### 5. Pruebas de funcionamiento

Se realizaron pruebas simulando la adición de nuevas filas al Sheet,
verificando que el sistema respondió automáticamente en los tres servicios.

#### Sheet actualizado automáticamente
![Sheet actualizado](docs/capturas/Dia2/09-sheet-actualizado.png)

#### Notificación recibida en Gmail
![Notificación Gmail](docs/capturas/Dia2/10-gmail-notificacion.png)

#### Evento creado en Google Calendar
![Evento en Calendar](docs/capturas/Dia2/11-calendar-eventos.png)

#### Prueba con fila nueva — trigger automático
![Prueba fila nueva](docs/capturas/Dia2/13-prueba-fila-nueva.png)
![Prueba Gmail](docs/capturas/Dia2/14-prueba-gmail.png)
![Prueba Calendar](docs/capturas/Dia2/15-prueba-calendar.png)

#### Corrección de bug — alertas duplicadas
Se identificó y corrigió un bug donde el script enviaba alertas repetidas
a todas las tareas próximas a vencer en cada ejecución. Se implementó
una columna de control `Alerta_Enviada` que garantiza una sola notificación
por tarea.

![Bug corregido](docs/capturas/Dia2/16-prueba-bug-corregido.png)
![Gmail único correo](docs/capturas/Dia2/17-prueba-gmail-unico.png)

---

## Estructura del repositorio
```
turing-gcp-workspace-prueba/
├── README.md
├── cloud-function/
│   ├── main.py
│   ├── requirements.txt
│   └── test_main.py
├── workspace-automation/
│   └── codigo.gs
└── docs/
    └── capturas/
        ├── Dia1/
        └── Dia2/
```