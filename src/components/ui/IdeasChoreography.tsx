"use client";

import { useEffect, useRef } from "react";
import { usePublicShell } from "@/components/layout/PublicShell";

/**
 * Opacidad de los tintes hyperpop sobre el blanco oficial del sitio (#fbfbf9).
 * Ajustable en un solo punto (0.5 = 50%).
 */
const IDEAS_COLOR_OPACITY = 0.5;

const PAPER_RGB: readonly [number, number, number] = [0xfb, 0xfb, 0xf9];

type HueFamily = "pink" | "cyan" | "violet" | "green" | "warm";

type HyperpopColor = {
  family: HueFamily;
  hex: string;
};

/**
 * Pozo de colores hyperpop / iridiscentes extraídos de las referencias visuales,
 * agrupados por familia cromática para garantizar cambios bien diferenciados
 * entre hitos consecutivos del scroll.
 */
const HYPERPOP_COLOR_POOL: readonly HyperpopColor[] = [
  { family: "pink", hex: "#FF7AE5" }, // Orchid Magenta
  { family: "pink", hex: "#FF8BC6" }, // Bubblegum Rose
  { family: "pink", hex: "#FF92A8" }, // Electric Coral Pink
  { family: "cyan", hex: "#7CE8F8" }, // Glacier Cyan
  { family: "cyan", hex: "#8FC7FF" }, // Periwinkle Sky
  { family: "cyan", hex: "#85ECD9" }, // Pearlescent Aqua
  { family: "violet", hex: "#C299FF" }, // Digital Lilac
  { family: "violet", hex: "#DC9EFF" }, // Prism Lavender
  { family: "green", hex: "#B9F97C" }, // Acid Lime
  { family: "green", hex: "#84F4C0" }, // Mint Soda
  { family: "warm", hex: "#FFE268" }, // Sunlit Lemon
  { family: "warm", hex: "#FFAE78" }, // Chrome Apricot
];

const HUE_FAMILIES: readonly HueFamily[] = [
  "pink",
  "cyan",
  "violet",
  "green",
  "warm",
];

function blendHexOverPaper(hex: string, opacity: number): string {
  const numeric = Number.parseInt(hex.slice(1), 16);
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;

  const mix = (channel: number, base: number) =>
    Math.round(channel * opacity + base * (1 - opacity))
      .toString(16)
      .padStart(2, "0");

  return `#${mix(r, PAPER_RGB[0])}${mix(g, PAPER_RGB[1])}${mix(b, PAPER_RGB[2])}`;
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Paleta de 3 colores (Bandcamp, bloque SoundCloud unificado e Instagram)
 * fija durante toda la carga actual de la página ("sesión").
 * Se renueva aleatoriamente al recargar la página o al entrar otro visitante.
 */
let sessionIdeasPalette: readonly [string, string, string] | null = null;

function getSessionIdeasPalette(): readonly [string, string, string] {
  if (sessionIdeasPalette) {
    return sessionIdeasPalette;
  }

  const chosenFamilies = shuffleArray(HUE_FAMILIES).slice(0, 3);
  const pickedColors = chosenFamilies.map((family) => {
    const candidates = HYPERPOP_COLOR_POOL.filter((c) => c.family === family);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    return blendHexOverPaper(chosen.hex, IDEAS_COLOR_OPACITY);
  });

  sessionIdeasPalette = [pickedColors[0], pickedColors[1], pickedColors[2]];

  return sessionIdeasPalette;
}

export function IdeasChoreography() {
  const { setCustomBg } = usePublicShell();

  const introRef = useRef<HTMLHeadingElement | null>(null);
  const bandcampRef = useRef<HTMLDivElement | null>(null);
  const soundcloudBlockRef = useRef<HTMLDivElement | null>(null);
  const instagramRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const palette = getSessionIdeasPalette();
    const rawTargets = [
      introRef.current, // Stage 0 (blanco)
      bandcampRef.current, // Stage 1 (color 1 - Bandcamp)
      soundcloudBlockRef.current, // Stage 2 (color 2 - bloque SoundCloud completo)
      instagramRef.current, // Stage 3 (color 3 - Instagram)
    ];

    if (rawTargets.some((node) => !node)) {
      return;
    }

    const targets = rawTargets as HTMLElement[];

    // Primera carga siempre en blanco oficial
    let currentStage = 0;
    setCustomBg(null);

    const getNavBottom = () => {
      const header = document.querySelector("header");
      return header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    };

    const measure = () => {
      const vh = window.innerHeight;
      const navBottom = getNavBottom();
      const rects = targets.map((el) => el.getBoundingClientRect());
      // Al bajar: un bloque termina de asomarse cuando su borde inferior entra en pantalla (bottom <= vh)
      const bottomVisible = rects.map((r) => r.bottom <= vh);
      // Al subir: un bloque termina de asomarse desde arriba cuando su borde superior despeja el menú sticky (top >= navBottom)
      const topVisible = rects.map((r) => r.top >= navBottom);
      return { vh, navBottom, rects, bottomVisible, topVisible };
    };

    let prevScrollY = window.scrollY;
    const initial = measure();
    let prevBottomVisible = initial.bottomVisible;
    let prevTopVisible = initial.topVisible;
    let rafId: number | null = null;

    const evaluate = () => {
      rafId = null;

      const scrollY = window.scrollY;
      const isAtTop = scrollY <= 4;
      const scrollingDown = scrollY > prevScrollY;
      const scrollingUp = scrollY < prevScrollY;

      const { vh, rects, bottomVisible, topVisible } = measure();
      let nextStage = currentStage;

      if (isAtTop) {
        nextStage = 0;
      } else if (scrollingDown) {
        // Comportamiento simétrico hacia abajo: cambia cuando el nuevo bloque que entra desde abajo
        // termina de asomarse por completo (su borde inferior cruza el borde inferior del viewport).
        for (let i = 1; i < targets.length; i++) {
          if (!prevBottomVisible[i] && bottomVisible[i] && i > nextStage) {
            nextStage = i;
          }
        }

        // Caso borde en monitores muy altos donde Bandcamp ya estaba visible en scrollY=0:
        // parte en blanco al cargar y entra al primer color apenas el usuario comienza a bajar.
        if (currentStage === 0 && nextStage === 0 && bottomVisible[1]) {
          let highest = 1;
          for (let i = 2; i < targets.length; i++) {
            if (bottomVisible[i]) highest = i;
          }
          nextStage = highest;
        }
      } else if (scrollingUp) {
        // Comportamiento simétrico hacia arriba: cambia cuando el bloque anterior que viene
        // apareciendo desde arriba termina de asomarse por completo bajo el menú superior (top >= navBottom).
        for (let i = targets.length - 2; i >= 0; i--) {
          if (!prevTopVisible[i] && topVisible[i] && i < nextStage) {
            nextStage = i;
          }
        }

        // Coherencia en pantallas muy altas si el usuario revierte antes de que el bloque superior
        // haya salido por arriba: solo sincroniza cuando el bloque superior ya está completamente
        // despejado debajo del menú (top >= navBottom) y el bloque actual ya salió por abajo.
        if (nextStage === currentStage && currentStage > 0) {
          if (rects[currentStage].top >= vh) {
            for (let k = currentStage - 1; k >= 0; k--) {
              if (topVisible[k] && rects[k].top < vh) {
                nextStage = k;
                break;
              }
            }
          }
        }
      }

      prevBottomVisible = bottomVisible;
      prevTopVisible = topVisible;
      prevScrollY = scrollY;

      if (nextStage !== currentStage) {
        currentStage = nextStage;
        setCustomBg(nextStage === 0 ? null : palette[nextStage - 1]);
      }
    };

    const scheduleEvaluate = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(evaluate);
      }
    };

    window.addEventListener("scroll", scheduleEvaluate, { passive: true });
    window.addEventListener("resize", scheduleEvaluate, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleEvaluate);
      window.removeEventListener("resize", scheduleEvaluate);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      setCustomBg(null);
    };
  }, [setCustomBg]);

  return (
    <article
      aria-labelledby="ideas-intro"
      className="mx-auto w-full max-w-5xl pb-24 pt-16 font-roman text-sm leading-relaxed sm:pb-32 sm:pt-24 sm:text-base"
    >
      {/* 1. Frase de apertura centrada */}
      <h1
        ref={introRef}
        id="ideas-intro"
        className="text-center font-roman text-sm sm:text-base"
      >
        otras ideas lejanas al desarrollo de software, como por ejemplo,
      </h1>

      {/* 2. Bandcamp (derecha) + texto escalonado centrado verticalmente a la izquierda */}
      <section
        aria-label="Álbum malas decisiones en Bandcamp"
        className="mt-24 grid grid-cols-1 items-center gap-y-14 sm:mt-32 md:grid-cols-[minmax(0,1fr)_350px] md:gap-x-12 lg:gap-x-20"
      >
        <p className="md:pr-4">
          <span className="block">un montón de</span>
          <span className="mt-10 block pl-[32%] sm:mt-12 sm:pl-[44%] md:pl-[42%]">
            canciones tristes
          </span>
          <span className="mt-16 block pl-[14%] sm:mt-[4.5rem] sm:pl-[22%] md:pl-[20%]">
            que me hacen sentir mejor.
          </span>
        </p>

        <div
          ref={bandcampRef}
          className="mx-auto w-full max-w-[350px] md:mx-0 md:justify-self-end"
        >
          <iframe
            title="malas decisiones de juan pablo díaz en Bandcamp"
            src="https://bandcamp.com/EmbeddedPlayer/album=75179538/size=large/bgcol=ffffff/linkcol=333333/transparent=true/"
            width={350}
            height={687}
            className="block w-full border-0 bg-transparent"
            style={{ height: "687px" }}
          />
        </div>
      </section>

      {/* 3 y 4. Bloque unificado de SoundCloud (tratado como un solo hito de color) */}
      <div
        ref={soundcloudBlockRef}
        className="mt-36 space-y-28 sm:mt-48 sm:space-y-40"
      >
        {/* SoundCloud #1: en móvil el texto antecede al reproductor; en desktop SoundCloud queda a la izquierda y texto a la derecha */}
        <section
          aria-label="Pista 7 en SoundCloud"
          className="grid grid-cols-1 items-center gap-y-12 md:grid-cols-12 md:gap-x-12 lg:gap-x-16"
        >
          <p className="space-y-8 sm:space-y-10 md:order-2 md:col-span-6">
            <span className="block pr-[4ch] text-right md:pr-[6ch]">
              música de fondo
            </span>
            <span className="block pl-2 sm:pl-6">
              para momentos muy específicos
            </span>
          </p>

          <div className="min-w-0 md:order-1 md:col-span-6">
            <iframe
              title="7 de juan pablo díaz en SoundCloud"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2324696579&color=%232c3433&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
              height={166}
              loading="lazy"
              allow="autoplay; encrypted-media"
              className="block w-full overflow-hidden border-0"
              style={{ height: "166px" }}
            />
            <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs opacity-65">
              <a
                href="https://soundcloud.com/juanpabloxdiaz"
                target="_blank"
                rel="noopener noreferrer"
                className="hyper-link font-roman"
              >
                juan pablo díaz
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://soundcloud.com/juanpabloxdiaz/7a1"
                target="_blank"
                rel="noopener noreferrer"
                className="hyper-link font-roman"
              >
                7
              </a>
            </p>
          </div>
        </section>

        {/* SoundCloud #2: texto a la izquierda + SoundCloud a la derecha */}
        <section
          aria-label="Pista 11 en SoundCloud"
          className="grid grid-cols-1 items-center gap-y-12 md:grid-cols-12 md:gap-x-12 lg:gap-x-16"
        >
          <p className="space-y-8 sm:space-y-10 md:col-span-6">
            <span className="block pl-[4ch] md:pl-[6ch]">
              y una canción pegada
            </span>
            <span className="block text-right">
              que se cae de cara al final.
            </span>
          </p>

          <div className="min-w-0 md:col-span-6">
            <iframe
              title="11 de juan pablo díaz en SoundCloud"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2324702429&color=%232c3433&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
              height={166}
              loading="lazy"
              allow="autoplay; encrypted-media"
              className="block w-full overflow-hidden border-0"
              style={{ height: "166px" }}
            />
            <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs opacity-65">
              <a
                href="https://soundcloud.com/juanpabloxdiaz"
                target="_blank"
                rel="noopener noreferrer"
                className="hyper-link font-roman"
              >
                juan pablo díaz
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="https://soundcloud.com/juanpabloxdiaz/11a1"
                target="_blank"
                rel="noopener noreferrer"
                className="hyper-link font-roman"
              >
                11
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* 5. Cierre centrado + Instagram embed centrado */}
      <section
        aria-label="Colección en Instagram perrosatrapados"
        className="mt-36 flex flex-col items-center space-y-14 sm:mt-48 sm:space-y-20"
      >
        <p className="text-center">
          tambien colecciono fotos de perros atrapados en la segunda
          dimensión...
        </p>

        <div ref={instagramRef} className="w-full max-w-[400px]">
          <iframe
            title="Perfil de Instagram @perrosatrapados"
            src="https://www.instagram.com/perrosatrapados/embed/"
            width={400}
            height={480}
            loading="lazy"
            className="block w-full overflow-hidden border-0 bg-transparent"
            style={{ height: "480px" }}
          />
        </div>
      </section>
    </article>
  );
}
