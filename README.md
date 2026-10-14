# Encuesta de Identidad Visual · TIRANTE® | Bienes Raíces

Página de votación para elegir la marquesina de la oficina. Cada persona elige una 1.ª opción (2 puntos) y una 2.ª (1 punto).

## Publicarla (unos 10 minutos)

**1. Subir a GitHub**
1. Entrá a github.com/new, poné un nombre (por ejemplo `tirante-encuesta`) y elegí **Private**.
2. En la página del repositorio nuevo tocá **uploading an existing file**.
3. Descomprimí este .zip y arrastrá TODO el contenido (las carpetas `api`, `lib`, `img` y los archivos sueltos). Tocá **Commit changes**.

**2. Crear el proyecto en Vercel**
1. Entrá a vercel.com, **Add New… > Project** e importá el repositorio.
2. En *Framework Preset* dejá **Other**. No cambies nada más y tocá **Deploy**.

**3. Conectar la base de datos de votos**
1. En el proyecto, pestaña **Storage** > **Create Database** (o *Marketplace*) > **Upstash for Redis** > plan gratuito.
2. Conectala a este proyecto. Vercel agrega solo las variables de conexión.

**4. Poner la contraseña de Resultados**
1. **Settings > Environment Variables**: nombre `ADMIN_PASSWORD`, valor la contraseña que quieras.
2. **Deployments** > los tres puntos del último > **Redeploy**.

El enlace para compartir es el dominio que te da Vercel (termina en `.vercel.app`).

## Ver los resultados
Ctrl + clic (Cmd + clic en Mac) sobre el logo TIRANTE® de arriba. En el celular, mantené apretado el logo casi un segundo. También sirve agregar `#resultados` al final del enlace. Pide la contraseña.

## Notas
- Se cuenta un voto por dispositivo. Si la misma persona vota desde dos aparatos, el detalle marca "mismo WhatsApp que otro voto" cuando puso el mismo número, y podés quitar el repetido.
- Los votos se guardan en Upstash, no en este repositorio.
- La página no se indexa en buscadores.
