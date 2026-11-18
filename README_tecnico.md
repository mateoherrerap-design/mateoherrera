# Mateo Herrera Seguros · Web + Portal administrativo v3

Sitio público y portal administrativo en un solo archivo (`index.html`), publicado en Vercel con el dominio **mateoherrera.com.co**. El portal se abre en `/#admin`.

## Qué tiene el portal
- **Dos perfiles separados (Mateo y Andrea).** Cada asesor ve y edita solo sus clientes, pipeline, agenda, cotizaciones, documentos, campañas y bases. Lo impone Supabase con reglas de seguridad (RLS), no solo la pantalla.
- **Resumen con dos vistas:** «Mis métricas» (personales) y «Global del equipo» (solo totales por asesor, sin datos de clientes).
- **Clientes:** botón «Crear cliente», que lo deja en la etapa 1 del pipeline. La ficha guarda nombre, cédula o NIT, celular, correo, dirección, ciudad, fecha de nacimiento (para cumpleaños), hijos, empresa, cargo y observaciones. Tiene pestañas de seguimiento, pólizas, documentos (PDF, PNG o JPG) y citas.
- **Pipeline de 9 etapas:** cada vez que se avanza o se devuelve una etapa se pide una observación obligatoria, que queda en el historial del cliente. Al llegar a «Seguimiento» se crea la cotización, y al llegar a «Póliza recaudada» se ofrece registrar la póliza.
- **Agenda:** tabla semanal de lunes a viernes, de 7:00 a. m. a 8:00 p. m., cada asesor con la suya. Las citas se vinculan a un cliente o empresa, avisan si se cruzan con otra y tienen confirmación por WhatsApp.
- **Base de datos:** separada de clientes y del pipeline. Muestra todas las bases en una tabla y cada base en su propia pestaña. Tiene cuatro vistas (tabla, tarjetas, agrupada y resumen), filtros por sector, ubicación, tamaño, ramo sugerido y etiqueta, y un importador de Excel o CSV que limpia y etiqueta los registros.
- **Exportar** clientes y bases a PDF, Excel, PNG o CSV, con el logo y los datos del negocio. No usa librerías externas.
- **Ramos:** 34 en total, incluido **SOAT**.

## Estructura
| Ruta | Qué es |
|---|---|
| `index.html` | Archivo que publica Vercel. Se genera con `build.py`, así que no se edita a mano. |
| `src/*.js` | Código del portal, separado por módulos. |
| `admin/admin.html`, `admin/admin_v3.css` | Estructura y estilos del portal. |
| `admin/admin.css` | Estilos base del portal (versión 2). Se conservan dentro de `build/sitio_base.html`. |
| `build/sitio_base.html` | Sitio público. Contiene el logo y los estilos base. |
| `build.py` | Une todo en `index.html`: `python3 build.py` |
| `supabase/schema.sql` | Tablas, seguridad por asesor, métricas globales y almacenamiento de archivos. |
| `supabase/limpiar.sql` | Vacía los datos del portal y conserva los usuarios. |

## Puesta en marcha en Supabase
1. Abre **SQL Editor → New query**, pega `supabase/schema.sql` y dale **Run**. Esto borra las tablas de la versión anterior.
2. En **Authentication → Users → Add user → Create new user**:
   - Mateo: correo `93412108@mateoherrera.com.co`, la contraseña que él elija y **Auto Confirm User** activado.
   - Andrea: correo `<cédula de Andrea>@mateoherrera.com.co`, su contraseña y **Auto Confirm User** activado.
3. Vuelve a correr el SQL para que Mateo quede con su nombre. Andrea completa el suyo la primera vez que entra.
4. Para entrar al portal se usa **la cédula y la contraseña**.

## Publicar
```
python3 build.py
git add . && git commit -m "Portal v3" && git push
```
Vercel publica automáticamente cada vez que se hace `git push` a `main`.

> **Datos personales:** no subas archivos de bases de datos (.xlsx o .csv) al repositorio. Todo lo que está en el repositorio queda publicado en la web. Las bases se cargan desde el portal: Base de datos → Importar base. El archivo `.vercelignore` evita que se publiquen el código fuente y el SQL.
