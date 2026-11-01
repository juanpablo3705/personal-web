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
  const [fadingFromPath, setFadingFromPath] = useState<string | null>(null);
  const [forcingWhiteFromPath, setForcingWhiteFromPath] = useState<
    string | null
  >(null);

  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeInTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHomePage = pathname === "/";

  // En el Home: fondo negro en el landing superior y transición suave a blanco al hacer scroll hacia abajo
  useEffect(() => {
    if (!isHomePage) {
      return;
    }

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

  // Limpiar temporizadores al cambiar de ruta
  useEffect(() => {
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
      navTimeoutRef.current = null;
    }
    if (fadeInTimeoutRef.current) {
      clearTimeout(fadeInTimeoutRef.current);
      fadeInTimeoutRef.current = null;
    }
  }, [pathname]);

  // Interceptación de hipervínculos internos: 0,5s de difuminado de salida antes de cargar la nueva vista
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

      const currentUrl =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : pathname;

      if (href === currentUrl) {
        if (href === "/" && typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      event.preventDefault();

      const noScroll = anchor.getAttribute("data-no-scroll") === "true";
      const useReplace = anchor.getAttribute("data-replace") === "true";

      const isOpeningModal =
        (pathname === "/proyectos" && href.startsWith("/proyectos/")) ||
        (pathname === "/blog" && href.startsWith("/blog/"));

      setFadingFromPath(pathname);
      if (!isOpeningModal && href !== "/") {
        setForcingWhiteFromPath(pathname);
      }

      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
      }
      if (fadeInTimeoutRef.current) {
        clearTimeout(fadeInTimeoutRef.current);
      }

      navTimeoutRef.current = setTimeout(() => {
        if (useReplace) {
          router.replace(href, { scroll: !noScroll });
        } else {
          router.push(href, { scroll: !noScroll });
        }

        // Si solo cambiaron query params (?page=2) o la misma ruta, reactivar fade-in
        fadeInTimeoutRef.current = setTimeout(() => {
          setFadingFromPath(null);
          setForcingWhiteFromPath(null);
        }, 60);
      }, 500);
    },
    [pathname, router]
  );

  const isFadingOut = fadingFromPath === pathname;
  const forcingWhiteBg = forcingWhiteFromPath === pathname;

  const isInverted =
    !forcingWhiteBg && (isModalOpen || (isHomePage && isHomeAtTop));

  return (
    <PublicShellContext.Provider value={{ isModalOpen, setModalOpen }}>
      <div
        onClickCapture={handleDocumentClick}
        className={`public-scope min-h-screen flex flex-col transition-colors duration-700 ease-in-out ${
          isInverted
            ? "bg-[var(--negro)] text-[var(--blanco)] theme-inverted"
            : "bg-[var(--blanco)] text-[var(--negro)] theme-normal"
        }`}
      >
        <Navbar isInverted={isInverted} />

        <motion.main
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={
            isFadingOut
              ? { opacity: 0, filter: "blur(8px)" }
              : { opacity: 1, filter: "blur(0px)" }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full flex-1 px-5 pb-20 sm:px-8 md:px-12 lg:px-16"
        >
          {children}
        </motion.main>
      </div>
    </PublicShellContext.Provider>
  );
}
