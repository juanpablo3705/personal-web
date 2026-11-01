# Plan Maestro de Agentes para Antigravity

Para dividir las labores al máximo sin que los agentes se pisen los archivos entre sí, utilizaremos **7 agentes especializados** (del Agente 0 al Agente 6).

---

## Resumen del Equipo y Orden de Ejecución

1. **Agente 0: `00-Jefe-Arquitecto`** *(Secuencial - Va primero)*
   * **Rol:** Inicializa el proyecto Next.js, instala dependencias, crea la estructura de carpetas vacía, el menú estático base y te entrega la guía en lenguaje humano para crear tus cuentas gratuitas.
2. **Agente 1: `01-Especialista-Datos-Auth`** *(Secuencial - Va segundo)*
   * **Rol:** Crea el script SQL automático para Supabase, configura los clientes de conexión, protege las rutas con el `middleware.ts` y construye la pantalla de Login.
3. **Agente 2: `02-Constructor-Portal-CMS`** *(Paralelo - Puede correr junto al 3 y 4)*
   * **Rol:** Construye tu portal privado (`/dashboard` y `/dashboard/editor`), el subidor de CV en PDF y el editor de texto simple con subida de imágenes.
4. **Agente 3: `03-Constructor-Catalogos-Popups`** *(Paralelo - Puede correr junto al 2 y 4)*
   * **Rol:** Construye las páginas públicas dinámicas (`/proyectos` en cuadrados y `/blog` en filas), la paginación de 20 en 20 y el sistema de ventanas superpuestas con la `"X"` y `"Anterior / Siguiente"`.
5. **Agente 4: `04-Constructor-Estaticas-Contacto`** *(Paralelo - Puede correr junto al 2 y 3)*
   * **Rol:** Construye las vistas base de *Inicio, Perfil Profesional* (con descarga del CV), *Otros Proyectos* y el formulario de *Contacto* conectado a Resend.
6. **Agente 5: `05-Inspector-QA-Despliegue`** *(Secuencial - Va cuando terminen 2, 3 y 4)*
   * **Rol:** Revisa que todo compile sin errores de TypeScript y te guía paso a paso como "Jefe de Informática" para subir el sitio a Vercel y dejarlo publicado.
7. **Agente 6: `06-Director-Arte-UI`** *(Fase Creativa Final - Trabaja contigo mano a mano)*
   * **Rol:** Transforma el esqueleto blanco y negro en tu visión artística personalizada, agregando efectos, animaciones e imágenes de diseño sin romper la funcionalidad.

---

## Paso Previo antes de empezar en Antigravity

1. Crea una carpeta vacía para tu proyecto en tu computador y ábrela en Antigravity.
2. Guarda el primer archivo que te generé (`CONTEXTO_ARQUITECTURA.md`) en la raíz de esa carpeta.

---

## Los Prompts para cada Agente (Copiar y Pegar)

### PASO 1: Ejecutar al Agente 0
* **Nombre en Antigravity:** `00-Jefe-Arquitecto`
* **Cuándo ejecutarlo:** Ahora mismo para iniciar el proyecto.

**Prompt para copiar y pegar:**
> Actúa como el Jefe de Informática y Arquitecto Principal de mi proyecto. Yo soy el cliente (dueño del proyecto, sin conocimientos profundos de configuración de servidores) y tú debes guiarme de forma clara y amable cuando necesites que yo haga clic en algún servicio externo.
>
> Primero, lee atentamente el archivo `CONTEXTO_ARQUITECTURA.md` ubicado en la raíz del proyecto, el cual es nuestra fuente de verdad absoluta.
>
> Tu misión en esta etapa es **únicamente** realizar el scaffolding (esqueleto inicial) del proyecto:
> 1. Inicializa el proyecto Next.js (App Router) con TypeScript y Tailwind CSS en este directorio e instala los paquetes base indicados en `CONTEXTO_ARQUITECTURA.md` (`@supabase/supabase-js`, `@supabase/ssr`, `motion`, `resend`, `zod`, y las extensiones básicas de `@tiptap`).
> 2. Crea toda la estructura de carpetas y archivos `page.tsx` base (con textos placeholder en blanco y negro muy limpios) respetando exactamente el árbol de rutas de `CONTEXTO_ARQUITECTURA.md`.
> 3. Crea el componente del **Menú de Navegación estático siempre visible** en el layout público (`src/app/(public)/layout.tsx`) con los enlaces en español a: Inicio (`/`), Proyectos (`/proyectos`), Blog (`/blog`), Otros Proyectos (`/otros-proyectos`), Perfil Profesional (`/perfil`) y Contacto (`/contacto`).
> 4. Crea un archivo `.env.example` con los nombres exactos de las variables de entorno que necesitaremos para Supabase y Resend.
> 5. Al finalizar, entrégame en el chat una guía paso a paso (a prueba de principiantes) explicándome cómo crear mi cuenta gratuita en **Supabase** y en **Resend**, y de dónde sacar las claves para mi archivo `.env.local` antes de pasar al Agente 1. No programes la lógica interna de los demás módulos todavía.

---

### PASO 2: Ejecutar al Agente 1
* **Nombre en Antigravity:** `01-Especialista-Datos-Auth`
* **Cuándo ejecutarlo:** Una vez que el Agente 0 termine y tengas creado tu proyecto vacío en Supabase.

**Prompt para copiar y pegar:**
> Lee primero el archivo `CONTEXTO_ARQUITECTURA.md` para conocer todas las reglas del proyecto.
>
> Tu misión es construir toda la capa de Base de Datos, Almacenamiento y Autenticación en Supabase. Recuerda que yo soy el cliente y no quiero diseñar tablas manualmente, así que tú debes darme todo resuelto:
> 1. Crea un archivo llamado `supabase_setup.sql` en la raíz del proyecto que contenga todo el código SQL listo para llegar, copiar y pegar en el "SQL Editor" de mi panel de Supabase. Ese script debe crear automáticamente:
>    - La tabla `posts` con todos los campos e índices necesarios según `CONTEXTO_ARQUITECTURA.md`.
>    - Las políticas de seguridad RLS para que cualquiera pueda leer los posts publicados (`status = 'published'`), pero solo un usuario autenticado pueda ver borradores, crear, editar o borrar.
>    - Los dos buckets públicos de Storage (`media` y `documents`) con sus políticas RLS para que cualquiera pueda ver/descargar archivos, pero solo el usuario autenticado pueda subir, sobrescribir (`upsert`) o eliminar archivos.
> 2. Implementa los clientes de conexión a Supabase en `src/lib/supabase/` (para Server Components, Server Actions y Client Components) y define los tipos TypeScript de la tabla `posts` en `src/lib/types/`.
> 3. Configura `src/middleware.ts` para proteger todas las rutas dentro de `/dashboard`, redirigiendo a `/login` si no hay sesión activa.
> 4. Construye la página funcional `src/app/(admin)/login/page.tsx` con un diseño wireframe sobrio en español (Correo y Contraseña) y su respectiva acción de inicio y cierre de sesión.
> 5. Al terminar, dime exactamente dónde debo pegar el contenido de `supabase_setup.sql` en la web de Supabase y cómo crear mi usuario administrador desde el panel de Supabase Auth.

---

### PASO 3: Ejecutar a los Agentes 2, 3 y 4 (Pueden trabajar en paralelo)

Como estos tres agentes trabajan en carpetas completamente distintas (`(admin)`, `(public)/blog y proyectos`, y `(public)/estáticas`), puedes ejecutarlos uno tras otro o en paralelo en Antigravity.

#### Agente 2: El Portal Privado (CMS)
* **Nombre en Antigravity:** `02-Constructor-Portal-CMS`

**Prompt para copiar y pegar:**
> Lee atentamente el archivo `CONTEXTO_ARQUITECTURA.md` (específicamente el **Módulo A: Portal Privado**).
>
> Tu misión exclusiva es construir el Portal Privado de administración en `src/app/(admin)/dashboard/` y sus componentes en `src/components/admin/` y `src/lib/actions/`:
> 1. **Pantalla Principal (`/dashboard/page.tsx`):**
>    - Diseño wireframe muy limpio y funcional en español, sin adornos innecesarios.
>    - Arriba debe mostrar 3 acciones claras: Botón `[ + Nueva Entrada de Blog ]` (lleva a `/dashboard/editor?type=blog`), Botón `[ + Nuevo Proyecto ]` (lleva a `/dashboard/editor?type=project`), y un formulario directo `[ Subir / Actualizar CV (PDF) ]`.
>    - Al subir un archivo PDF en ese bloque, súbelo al bucket `documents` de Supabase Storage bajo el nombre fijo `cv_actual.pdf` con `upsert: true`, y muestra en pantalla el mensaje de confirmación: *"CV actualizado correctamente"*.
>    - Debajo, muestra la lista de todas las entradas (`posts`) ordenadas por fecha, indicando Título, Tipo (Blog o Proyecto) y Estado (Borrador o Publicado), con botones funcionales para **Editar**, **Cambiar estado (Publicar/Borrador)** y **Eliminar**.
> 2. **Pantalla del Editor (`/dashboard/editor/page.tsx`):**
>    - Sirve tanto para crear una entrada nueva como para editar una existente (`?id=...`).
>    - Incluye únicamente: Selector de Tipo (`Blog` / `Proyecto`), Selector de Estado (`Borrador` / `Publicado`), Campo **Título** (que autogenere un `slug` limpio), Subida de **Thumbnail** (sube la imagen al bucket `media` y guarda la URL), Campo **Resumen Breve** (`textarea` para el texto que acompaña al thumbnail en el catálogo) y el **Editor de Contenido**.
>    - Configura el editor Tiptap embebido de forma ultra-minimalista: su barra de herramientas superior SOLO debe tener botones para **Negrita**, **Cursiva**, **Subrayado**, **Enlace (`href` con `target="_blank"`)** e **Insertar Imagen** (botón que permita seleccionar una foto de mi computador, la suba al bucket `media` de Supabase y la inserte como `<img>` entre medio del texto).
>    - Al guardar o actualizar, ejecuta `revalidatePath` en `/blog` y `/proyectos` para que los cambios se reflejen al instante.

#### Agente 3: Catálogos Públicos y "Popups Falsos"
* **Nombre en Antigravity:** `03-Constructor-Catalogos-Popups`

**Prompt para copiar y pegar:**
> Lee atentamente el archivo `CONTEXTO_ARQUITECTURA.md` (específicamente el **Módulo B: Catálogos Públicos y Popup Falso**).
>
> Tu misión exclusiva es construir las páginas públicas dinámicas de `/proyectos` y `/blog`, incluyendo sus rutas interceptadas (`@modal/(.)[slug]`) y sus páginas de detalle directo (`[slug]`):
> 1. Mantén un estilo visual wireframe minimalista en blanco y negro (fácil de estilizar más adelante), sin buscadores, sin etiquetas y sin carruseles.
> 2. **Vista de Proyectos (`/proyectos/page.tsx`):** Consulta los registros de la tabla `posts` con `type = 'project'` y `status = 'published'` en orden cronológico descendente. Muéstralos en una **grilla de cuadrados**, donde cada cuadrado muestre su Thumbnail, Título y Resumen breve.
> 3. **Vista de Blog (`/blog/page.tsx`):** Consulta los registros con `type = 'blog'` y `status = 'published'` en orden cronológico descendente. Muéstralos hacia abajo como **rectángulos limpios que ocupen todo el ancho disponible**, con el Thumbnail a la izquierda y el Título + Resumen breve a la derecha.
> 4. **Paginación de 20 en 20:** Tanto en `/proyectos` como en `/blog`, muestra un máximo de 20 publicaciones por página (`?page=1`). Cuando existan más de 20 registros, muestra abajo botones limpios de `"← Anterior"` y `"Siguiente →"`.
> 5. **El Marco Superpuesto / Popup Falso (`@modal/(.)[slug]/page.tsx`):**
>    - Cuando el usuario haga clic en una entrada desde `/proyectos` o `/blog`, abre un marco modal superpuesto en la misma ventana manteniendo el catálogo visible de fondo.
>    - En la parte superior del marco debe haber un botón `"X"` claro que cierre el marco y devuelva al catálogo.
>    - En el centro debe renderizar el Título y el HTML del contenido (texto e imágenes intercaladas).
>    - En la parte inferior del marco debe haber una barra sobria con botones `"← Anterior"` y `"Siguiente →"` que permitan pasar a la publicación anterior o siguiente del mismo tipo (`blog` o `project`) **sin cerrar el popup**.
>    - Asegúrate también de que si alguien entra directamente a la URL `/blog/[slug]` o `/proyectos/[slug]` recargando el navegador, la entrada se vea correctamente.

#### Agente 4: Páginas Estáticas y Formulario de Contacto
* **Nombre en Antigravity:** `04-Constructor-Estaticas-Contacto`

**Prompt para copiar y pegar:**
> Lee atentamente el archivo `CONTEXTO_ARQUITECTURA.md` (específicamente el **Módulo C: Páginas Estáticas y Formulario de Contacto**).
>
> Tu misión exclusiva es construir las 4 páginas estáticas públicas manteniendo un diseño wireframe limpio en blanco y negro (preparado para que luego intervengamos el diseño artístico):
> 1. **Inicio (`src/app/(public)/page.tsx`):** Estructura base limpia de bienvenida conectada al menú principal.
> 2. **Otros Proyectos (`src/app/(public)/otros-proyectos/page.tsx`):** Estructura estática modular preparada para que en el futuro agreguemos bloques de contenido estático.
> 3. **Perfil Profesional (`src/app/(public)/perfil/page.tsx`):** Estructura limpia para mostrar mi biografía/experiencia en pantalla, más un botón destacado `"Descargar CV (PDF)"` que apunte directamente a la URL pública del archivo `cv_actual.pdf` alojado en el bucket `documents` de Supabase Storage (con atributo `target="_blank"` o descarga directa).
> 4. **Contacto (`src/app/(public)/contacto/page.tsx`):**
>    - Construye un formulario limpio en español con únicamente 4 campos: **Nombre**, **Correo electrónico**, **Asunto** y **Mensaje**, más el botón de enviar. Sin captchas ni elementos complejos (pero deja un comentario en el código indicando dónde insertar un campo honeypot en el futuro si llegara a necesitarse).
>    - Crea la Server Action correspondiente validando los 4 campos con **Zod** y enviando el correo mediante **Resend** a mi correo personal (definido en una variable de entorno `CONTACT_RECEIVER_EMAIL`), configurando `replyTo` con el correo ingresado por el visitante. Muestra un mensaje claro en pantalla cuando el correo se haya enviado con éxito.

---

### PASO 4: Ejecutar al Agente 5 (Revisión y Publicación en Internet)
* **Nombre en Antigravity:** `05-Inspector-QA-Despliegue`
* **Cuándo ejecutarlo:** Cuando los Agentes 2, 3 y 4 hayan terminado sus tareas.

**Prompt para copiar y pegar:**
> Actúa nuevamente como mi Jefe de Informática. Lee `CONTEXTO_ARQUITECTURA.md` y revisa todo el código generado por los agentes anteriores.
>
> Tu misión es:
> 1. Ejecutar una revisión completa de tipos (`tsc --noEmit`) y de compilación (`npm run build`) para verificar que todos los eslabones (Supabase, Portal Privado, Popups de Blog y Proyectos, Descarga de CV y Formulario de Contacto) convivan sin ningún error ni conflicto. Si encuentras algún error de integración entre lo que hicieron los agentes, corrígelo.
> 2. Una vez que el proyecto compile al 100% sin errores, dame una guía paso a paso en lenguaje simple para subir este repositorio a mi cuenta de GitHub y conectarlo con **Vercel** (incluyendo qué variables de entorno debo copiar y pegar en el panel de Vercel) para dejar mi sitio web publicado en internet.

---

### PASO 5 (Fase Posterior): El Agente 6 de Diseño Artístico
* **Nombre en Antigravity:** `06-Director-Arte-UI`
* **Cuándo ejecutarlo:** Solo cuando el sitio base ya esté funcionando al 100% y quieras empezar a darle tu identidad visual, efectos y animaciones.

**Prompt inicial sugerido (que podrás personalizar con tus ideas artísticas):**
> Lee `CONTEXTO_ARQUITECTURA.md` para entender cómo funciona el sitio por dentro. Toda la funcionalidad del sitio ya está terminada y operando al 100%; tienes **prohibido romper la lógica de base de datos, las rutas o las Server Actions**.
>
> Tu único rol a partir de ahora es ser mi Director de Arte y Desarrollador Frontend Creativo. Trabajaremos juntos iterando sobre Tailwind CSS y `motion` (Framer Motion) para transformar este wireframe en blanco y negro en un sitio web con un diseño gráfico totalmente personalizado y artístico. Confírmame que entiendes la estructura actual de los componentes públicos y dime que estás listo para recibir mis primeras directrices visuales.