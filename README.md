# Mateo Herrera Seguros — Web + Portal administrativo

Sitio público y portal administrativo en un solo archivo (`index.html`).

- **Dominio:** mateoherrera.com.co (GoDaddy → Vercel)
- **Portal admin:** `/#admin` (usuario y contraseña: la cédula)
- **Base de datos:** Supabase, proyecto `ppzegmemytxcfallivez` (São Paulo)

## Estructura
| Archivo | Para qué sirve |
|---|---|
| `index.html` | Web pública + admin. Es el único archivo que Vercel sirve. |
| `admin/admin.html, admin.css, admin.js` | Copia del portal admin separada, solo para leer o editar por partes. Si editas aquí, hay que volver a pegarlo dentro de `index.html`. |
| `supabase/schema.sql` | Crea las tablas, políticas y buckets en Supabase. |
| `supabase/limpiar.sql` | Vacía todas las tablas y deja solo los 2 asesores. |
| `vercel.json` | Configuración de Vercel. |

## Desplegar
1. Sube el repo a GitHub (rama `main`).
2. En Vercel: proyecto `cotizadorpolizas` → Settings → Git → Connect Git Repository.
3. Cada `git push` publica automáticamente.

## Pendiente
- Cargar los datos desde Supabase al abrir el admin (hoy el admin solo escribe).
- Login real con Supabase Auth (las políticas RLS exigen usuario autenticado).
- Subida de PDFs e imágenes al Storage.
- Recordatorios automáticos por correo y WhatsApp.
