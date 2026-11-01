# Especificación Técnica y Arquitectura del Proyecto (Fuente de Verdad)

> **INSTRUCCIÓN PARA TODOS LOS AGENTES EN ANTIGRAVITY:**
> Este documento contiene las reglas de negocio, arquitectura y diseño estructural del sitio web personal. Ningún agente debe salirse de estos lineamientos ni agregar librerías pesadas o funciones no solicitadas.

---

## 1. Filosofía del Proyecto y Diseño Inicial (Wireframe Funcional)
* **Idioma:** 100% Español en toda la interfaz, rutas, botones y mensajes.
* **Fase Actual (Esqueleto Funcional):** Todo el desarrollo de los Agentes 0 al 5 debe entregarse con un estilo visual **Wireframe Limpio (Blanco y Negro / Escala de grises con Tailwind CSS)**, tipografía limpia y bordes simples (`border-neutral-300`). **No tomar decisiones artísticas complejas aún**, ya que el **Agente 6 (Dirección de Arte)** intervendrá el diseño gráfico junto al cliente al final.
* **Minimalismo y Ligereza:** Prohibido instalar librerías pesadas de componentes UI (no usar shadcn/ui, Material UI ni Radix UI). Usar HTML5 semántico nativo estilizado con Tailwind CSS para que sea sumamente fácil de personalizar artísticamente después.

---

## 2. Stack Tecnológico Obligatorio
* **Framework:** Next.js (App Router) con React y **TypeScript** estricto.
* **Estilos y Animaciones Futuras:** Tailwind CSS + `motion` (Framer Motion, dejar instalado para la fase de diseño).
* **Base de Datos, Auth y Almacenamiento:** Supabase (`@supabase/supabase-js` y `@supabase/ssr`).
* **Editor de Texto del CMS Privado:** Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`, `@tiptap/extension-link`, `@tiptap/extension-image`) configurado de forma ultra-minimalista.
* **Envío de Correos y Validación:** Resend (`resend`) + Zod (`zod`).
* **Hosting Objetivo:** Vercel.

---

## 3. Estructura de Rutas y Carpetas
```text
src/
├── app/
│   ├── (public)/                        # Layout público con Menú Estático siempre visible
│   │   ├── page.tsx                     # Inicio (Estática)
│   │   ├── perfil/page.tsx              # Perfil Profesional + Botón Descargar CV (Estática)
│   │   ├── otros-proyectos/page.tsx     # Otros Proyectos (Estática)
│   │   ├── contacto/page.tsx            # Formulario de Contacto (Nombre, Correo, Asunto, Mensaje)
│   │   ├── proyectos/
│   │   │   ├── page.tsx                 # Grilla de CUADRADOS (20 por página)
│   │   │   ├── [slug]/page.tsx          # Vista directa del proyecto
│   │   │   └── @modal/(.)[slug]/page.tsx # Popup superpuesto con "X" y "Anterior / Siguiente"
│   │   └── blog/
│   │       ├── page.tsx                 # Lista de FILAS DE ANCHO COMPLETO (20 por página)
│   │       ├── [slug]/page.tsx          # Vista directa del artículo
│   │       └── @modal/(.)[slug]/page.tsx # Popup superpuesto con "X" y "Anterior / Siguiente"
│   │
│   └── (admin)/                         # Rutas protegidas por middleware.ts
│       ├── login/page.tsx               # Login exclusivo del propietario
│       └── dashboard/
│           ├── page.tsx                 # Pantalla 1: Botones crear, Subir CV PDF y Lista de Posts
│           └── editor/page.tsx          # Pantalla 2: Crear/Editar entrada (Blog o Proyecto)
├── components/
│   ├── layout/                          # Navbar estático y contenedores base
│   ├── ui/                              # Modal superpuesto, paginación y elementos básicos
│   └── admin/                           # Editor Tiptap minimalista y subidor de archivos
├── lib/
│   ├── supabase/                        # Clientes server.ts, client.ts y middleware
│   ├── actions/                         # Server Actions (posts, cv, contacto, auth)
│   └── types/                           # Tipos TypeScript de la BD
└── middleware.ts                        # Protección de /dashboard
```

---

## 4. Modelo de Datos y Almacenamiento en Supabase

### 4.1. Tabla única: `posts`
Tanto **Blog** como **Proyectos** comparten exactamente la misma estructura en una sola tabla:
* `id`: `uuid` (Primary Key, default `gen_random_uuid()`)
* `type`: `text` (Check: `'blog'` o `'project'`)
* `status`: `text` (Check: `'draft'` o `'published'`, default `'draft'`)
* `title`: `text` (Obligatorio)
* `slug`: `text` (Único, generado automáticamente a partir del título)
* `summary`: `text` (Resumen breve para mostrar junto al thumbnail en el catálogo)
* `thumbnail_url`: `text` (URL pública de la imagen de vista previa)
* `content`: `text` (HTML limpio generado por el editor con texto e imágenes intercaladas)
* `created_at`: `timestamptz` (Default `now()`)
* `updated_at`: `timestamptz` (Default `now()`)

**Políticas RLS (Row Level Security):**
* `SELECT`: Público para registros donde `status = 'published'`. El usuario autenticado (`authenticated`) puede leer todos (`draft` y `published`).
* `INSERT`, `UPDATE`, `DELETE`: Permitido únicamente a usuarios con rol `authenticated`.

### 4.2. Buckets de Supabase Storage
1. **Bucket `media` (Público):** Para almacenar los thumbnails y las imágenes intercaladas dentro del contenido de Blog y Proyectos.
2. **Bucket `documents` (Público):** Para almacenar el CV del propietario bajo el nombre fijo `cv_actual.pdf` usando `upsert: true` al subirlo para que siempre reemplace al anterior manteniendo la misma URL pública.

---

## 5. Reglas de Experiencia de Usuario (UX) por Módulo

### Módulo A: Portal Privado (`/dashboard`)
* Diseño funcional y sobrio, sin adornos innecesarios.
* **Pantalla 1 (`/dashboard`):**
  1. Tres acciones superiores claras: `[ + Nueva Entrada de Blog ]`, `[ + Nuevo Proyecto ]`, y un bloque directo `[ Subir / Actualizar CV (PDF) ]` que sube el PDF a `documents/cv_actual.pdf` (`upsert: true`) y muestra un mensaje de confirmación: *"CV actualizado correctamente"*.
  2. Lista/tabla simple de todas las entradas creadas (mostrando título, tipo Blog/Proyecto, estado Borrador/Publicado y fecha) con botones para **Editar**, **Cambiar estado (Publicar/Pasar a borrador)** y **Eliminar**.
* **Pantalla 2 (`/dashboard/editor`):**
  * Sirve tanto para crear como para editar (recibiendo `?type=blog|project` o `?id=uuid`).
  * Campos: Selector de Tipo (`Blog` / `Proyecto`), Selector de Estado (`Borrador` / `Publicado`), **Título**, **Subida de Thumbnail** (1 imagen), **Resumen Breve** (`textarea` corto para la vista previa del catálogo) y **Contenido** (Editor Tiptap embebido).
  * **Barra del Editor Tiptap:** Solo debe tener botones para **Negrita**, **Cursiva**, **Subrayado**, **Insertar/Editar Link (`href` con `target="_blank"`)** e **Insertar Imagen** (que sube la imagen al bucket `media` e inserta el `<img>` entre medio del texto). Prohibido agregar bloques de código, tablas o menús flotantes complejos.

### Módulo B: Catálogos Públicos y "Popup Falso" (`/proyectos` y `/blog`)
* **Sin buscadores ni etiquetas:** Orden estrictamente cronológico (`created_at DESC`) de las entradas con `status = 'published'`.
* **Paginación limpia:** Mostrar máximo **20 publicaciones por página**. Si existen más de 20, mostrar abajo controles limpios de `"← Anterior"` y `"Siguiente →"` (`?page=2`).
* **Diferencia de Layout:**
  * `/proyectos`: Grilla de **cuadrados** (Thumbnail + Título + Resumen breve).
  * `/blog`: Lista vertical de **rectángulos de ancho completo** sin bordes recargados (Thumbnail a la izquierda + Título y Resumen breve a la derecha).
* **El Popup Superpuesto (Intercepting Routes):**
  * Al hacer clic en un proyecto o post del blog, se abre un marco superpuesto sobre el catálogo (manteniendo el catálogo visible de fondo).
  * **Arriba:** Botón `"X"` claro que cierra el marco y devuelve al catálogo (`router.back()` o cierre del modal).
  * **Centro:** Título y contenido completo (texto con imágenes intercaladas).
  * **Abajo:** Barra sobria con botones `"← Anterior"` y `"Siguiente →"` que permiten navegar a la entrada anterior o siguiente del mismo tipo (`blog` o `project`) **dentro del mismo popup sin cerrarlo**.

### Módulo C: Páginas Estáticas y Formulario de Contacto
* **Menú de Navegación:** Fijo, estático y siempre visible en todas las páginas públicas con enlaces a: *Inicio, Proyectos, Blog, Otros Proyectos, Perfil Profesional, Contacto*.
* **Perfil Profesional (`/perfil`):** Estructura limpia para mostrar el perfil/CV en texto e incluye el botón `"Descargar CV en PDF"` apuntando a la URL pública de `documents/cv_actual.pdf`.
* **Contacto (`/contacto`):** Formulario simple con 4 campos: *Nombre, Correo electrónico, Asunto y Mensaje*. Sin captchas ni protecciones complejas por ahora (dejar el código limpio por si se agrega un honeypot en el futuro). Envía el correo vía **Resend** al Gmail del propietario configurando `replyTo` con el correo del remitente.