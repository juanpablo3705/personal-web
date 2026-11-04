"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Navbar } from "./Navbar";

type PublicShellContextValue = {
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
};

const PublicShellContext = createContext<PublicShellContextValue>({
  isModalOpen: false,
  setModalOpen: () => {},
});

export function usePublicShell() {
  return useContext(PublicShellContext);
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isHomeAtTop, setIsHomeAtTop] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [forcingWhiteBg, setForcingWhiteBg] = useState(false);

  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldScrollTopRef = useRef(false);

  const isHomePage = pathname === "/";

  // En el Home: fondo negro en el landing superior y transición suave a blanco al hacer scroll hacia abajo
  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    /* =========================================================================
     * REGLA DE TRIGGER DE TEMA CRÍTICA (NO CAMBIAR A PÍXELES FIJOS)
     *
     * `threshold = window.innerHeight * 0.55` calcula el umbral relativo al 55%
     * de la altura de la pantalla del usuario en ese momento.
     *
     * Esta fórmula proporcional garantiza que la transición fluida de negro a blanco
     * ocurra exactamente en el mismo punto relativo del recorrido en cualquier monitor
     * (laptops 768p/900p, monitores 1080p, 2K, 4K o pantallas retina con trackpad).
     *
     * NO reemplazar por una distancia fija en píxeles (ej: 400px o 500px).
     * ========================================================================= */
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.55;
      setIsHomeAtTop(window.scrollY < threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isHomePage]);

  // Cuando la nueva ruta ya se montó, iniciar en el siguiente frame el difuminado de entrada (sin flicker de la vista anterior)
  useEffect(() => {
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = null;
    }

    const resetScrollToTop = shouldScrollTopRef.current;
    shouldScrollTopRef.current = false;

    if (resetScrollToTop) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    const frameId = window.requestAnimationFrame(() => {
      if (resetScrollToTop) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
      setIsFadingOut(false);
      setForcingWhiteBg(false);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

  // Interceptación de hipervínculos de cambio de sección
  const handleDocumentClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      if (
        anchor.hasAttribute("download") ||
        anchor.getAttribute("target") === "_blank" ||
        anchor.hasAttribute("data-modal-internal")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) {
        return;
      }

      // Cuando se abre un popup en /proyectos o /blog, NO difuminar ni ocultar la página de fondo:
      // solo invertir los colores de inmediato mientras se abre el popup.
      const isModalTrigger =
        anchor.getAttribute("data-modal-trigger") === "true" ||
        (pathname === "/proyectos" && href.startsWith("/proyectos/")) ||
        (pathname === "/blog" && href.startsWith("/blog/"));

      if (isModalTrigger) {
        setModalOpen(true);
        return;
      }

      const targetPathOnly = href.split("?")[0] ?? href;

      if (targetPathOnly === pathname) {
        if (href === "/" && typeof window !== "undefined") {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      event.preventDefault();

      const noScroll = anchor.getAttribute("data-no-scroll") === "true";
      const useReplace = anchor.getAttribute("data-replace") === "true";
      // Navegación completa (sin rutas interceptadas): evita que, desde la vista directa
      // de una entrada, "Anterior / Siguiente" abra un popup encima de la página.
      const useHardNav = anchor.getAttribute("data-hard-nav") === "true";

      shouldScrollTopRef.current = !noScroll;

      router.prefetch(href);

      setIsFadingOut(true);
      if (href !== "/") {
        setForcingWhiteBg(true);
      }

      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
      }

      navTimeoutRef.current = setTimeout(() => {
        if (useHardNav) {
          window.location.assign(href);
          return;
        }
        if (!noScroll) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
        if (useReplace) {
          router.replace(href, { scroll: false });
        } else {
          router.push(href, { scroll: false });
        }
      }, 500);
    },
    [pathname, router]
  );

  const isInverted =
    !forcingWhiteBg && (isModalOpen || (isHomePage && isHomeAtTop));

  // Sincroniza el lienzo raíz (franja reservada de la barra de scroll) con el tema invertido
  useEffect(() => {
    if (!isInverted) return;
    const root = document.documentElement;
    root.classList.add("canvas-inverted");
    return () => {
      root.classList.remove("canvas-inverted");
    };
  }, [isInverted]);

  return (
    <PublicShellContext.Provider value={{ isModalOpen, setModalOpen }}>
      <div
        onClickCapture={handleDocumentClick}
        className={`public-scope min-h-screen flex flex-col ${
          isInverted ? "theme-inverted" : "theme-normal"
        }`}
      >
        <Navbar />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: isFadingOut ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full flex-1 px-5 pb-20 sm:px-8 md:px-12 lg:px-16"
        >
          {children}
        </motion.main>
      </div>
    </PublicShellContext.Provider>
  );
}
