### Juan Pablo Oyanedel — Plataforma Web Personal, Portafolio & CMS

Repositorio del sitio web personal, blog técnico y portafolio de proyectos de Juan Pablo Oyanedel; Analista Programador enfocado en desarrollo de software, arquitectura de sistemas y diseño de soluciones digitales.

La plataforma fue concebida bajo principios de esencialidad visual, contraste analógico y rigor compositivo. La experiencia pública se articula a través de una coreografía de scroll basada en proporciones relativas de pantalla, navegación contextual mediante ventanas modales superpuestas sin pérdida de estado, un sistema de inversión cromática sincronizado en tiempo real y una jerarquía tipográfica milimétrica sustentada en una fuente sans-serif suiza de estructura geométrica y proporciones humanistas, optimizada localmente para garantizar máxima nitidez y cadencia visual.

Asimismo, la plataforma integra un entorno de administración privado (`/dashboard`) protegido mediante autenticación de servidor y middleware criptográfico en Supabase Auth. Este portal interno opera como un gestor de contenidos (CMS) desacoplado a medida que centraliza el control editorial completo: gestión del ciclo de vida de publicaciones (control de borradores y publicaciones activas), redacción estructurada mediante un editor enriquecido WYSIWYG (TipTap), administración y actualización en la nube del archivo PDF del CV en Supabase Storage, y monitoreo directo de solicitudes entrantes del formulario de contacto.

La arquitectura del sistema aprovecha el rendimiento nativo de Server Components y Server Actions en Next.js 16 con Turbopack, garantizando tipado estático estricto, seguridad en mutaciones de datos, tiempos de carga instantáneos y comunicación transaccional a través de Resend.

---

### Enlace de Producción:

<a href="https://personal-web-gamma-six.vercel.app/" target="_blank" rel="noopener noreferrer">https<span>://</span>personal-web-gamma-six<span>.</span>vercel<span>.</span>app/ ↗</a>

---

### Stack Tecnológico:

* **Framework Web:** Next.js 16 (App Router, Server Components, Server Actions & Turbopack)
* **Librería de Interfaz:** React 19
* **Lenguaje:** TypeScript (modo estricto)
* **Estilos y Maquetación:** Tailwind CSS v4 (CSS `@theme` y variables de interpolación nativas `@property`)
* **Animaciones y Dinámica:** Motion (Framer Motion)
* **Panel de Administración Privado (CMS):** Dashboard interno protegido con gestión de publicaciones, control de estados (Borrador/Publicado), visor de mensajes y carga dinámica de CV
* **Editor de Contenidos:** TipTap (WYSIWYG con HTML estructurado)
* **Base de Datos, Auth & Storage:** Supabase (PostgreSQL, autenticación SSR por cookies y almacenamiento en buckets)
* **Validación de Esquemas:** Zod
* **Servicio de Correo Transaccional:** Resend
* **Tipografía:** Fuente sans-serif de alta fidelidad auto-alojada localmente (WOFF)
* **Infraestructura y Despliegue:** Vercel

---

### Créditos y Autoría:

* **Diseño de Interfaz & Desarrollo:** Juan Pablo Oyanedel (<a href="https://github.com/juanpablo3705" target="_blank" rel="noopener noreferrer">github<span>.</span>com/juanpablo3705 ↗</a>)
