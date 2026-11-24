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
 * Paleta de 4 colores fija durante toda la carga actual de la página ("sesión").
 * Se renueva aleatoriamente al recargar la página o al entrar otro visitante.
 */
let sessionIdeasPalette: readonly [string, string, string, string] | null = null;

function getSessionIdeasPalette(): readonly [string, string, string, string] {
  if (sessionIdeasPalette) {
    return sessionIdeasPalette;
  }

  const chosenFamilies = shuffleArray(HUE_FAMILIES).slice(0, 4);
  const pickedColors = chosenFamilies.map((family) => {
    const candidates = HYPERPOP_COLOR_POOL.filter((c) => c.family === family);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    return blendHexOverPaper(chosen.hex, IDEAS_COLOR_OPACITY);
  });

  sessionIdeasPalette = [
    pickedColors[0],
    pickedColors[1],
    pickedColors[2],
    pickedColors[3],
  ];

  return sessionIdeasPalette;
}

export function IdeasChoreography() {
  const { setCustomBg } = usePublicShell();

  const introRef = useRef<HTMLHeadingElement | null>(null);
  const bandcampRef = useRef<HTMLDivElement | null>(null);
  const soundcloud1Ref = useRef<HTMLDivElement | null>(null);
  const soundcloud2Ref = useRef<HTMLDivElement | null>(null);
  const instagramRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const palette = getSessionIdeasPalette();
    const embedNodes = [
      bandcampRef.current,
      soundcloud1Ref.current,
      soundcloud2Ref.current,
      instagramRef.current,
    ];

    if (embedNodes.some((node) => !node)) {
      return;
    }

    const embeds = embedNodes as HTMLDivElement[];

    // Primera carga siempre en blanco oficial
    let currentStage = 0;
    setCustomBg(null);

    const getCenters = () =>
      embeds.map((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });

    let prevScrollY = window.scrollY;
    let prevAbove = getCenters().map((cy) => cy <= window.innerHeight / 2);
    let rafId: number | null = null;

    const evaluate = () => {
      rafId = null;

      const vh = window.innerHeight;
      const midY = vh / 2;
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - vh
      );
      const isAtTop = scrollY <= 4;
      const isAtBottom = maxScroll > 20 && scrollY >= maxScroll - 8;
      const scrollingDown = scrollY > prevScrollY;
      const scrollingUp = scrollY < prevScrollY;

      const centers = getCenters();
      const above = centers.map((cy) => cy <= midY);

      const crossedUp: number[] = [];
      const crossedDown: number[] = [];
      for (let i = 0; i < above.length; i++) {
        if (!prevAbove[i] && above[i]) {
          crossedUp.push(i);
        } else if (prevAbove[i] && !above[i]) {
          crossedDown.push(i);
        }
      }

      let nextStage = currentStage;

      if (isAtTop) {
        nextStage = 0;
      } else if (crossedUp.length + crossedDown.length >= 2) {
        // Salto rápido (ej. arrastrar la barra de scroll o teclas Inicio/Fin):
        // sincroniza con el hito cuyo centro quedó más cerca del centro de pantalla.
        const introTop = introRef.current?.getBoundingClientRect().top ?? -999;
        if (introTop >= 88 && centers[0] > midY + 40) {
          nextStage = 0;
        } else {
          let closestIdx = 0;
          let minDist = Math.abs(centers[0] - midY);
          for (let i = 1; i < centers.length; i++) {
            const dist = Math.abs(centers[i] - midY);
            if (dist < minDist) {
              minDist = dist;
              closestIdx = i;
            }
          }
          nextStage = closestIdx + 1;
        }
      } else if (crossedUp.length === 1) {
        // Scroll hacia abajo: el elemento que viene desde abajo quedó centrado en pantalla
        nextStage = crossedUp[0] + 1;
      } else if (crossedDown.length === 1) {
        // Scroll hacia arriba: cambia solo cuando el ítem que viene apareciendo desde arriba
        // queda centrado en pantalla (idx + 1 < currentStage), nunca al apenas salir del actual.
        const idx = crossedDown[0];
        if (idx + 1 < currentStage) {
          nextStage = idx + 1;
        }
      } else if (currentStage === 0 && scrollingDown && above[0]) {
        // Caso borde en monitores muy altos donde Bandcamp ya parte centrado en scrollY=0:
        // mantiene blanco al cargar y pasa al primer color apenas el usuario scrollea hacia abajo.
        let highest = 1;
        for (let i = 1; i < above.length; i++) {
          if (above[i]) highest = i + 1;
        }
        nextStage = highest;
      } else if (currentStage === 1 && scrollingUp && !above[0]) {
        // De vuelta desde Bandcamp hacia la frase de apertura superior -> vuelve a blanco
        const introTop = introRef.current?.getBoundingClientRect().top ?? -999;
        if (introTop >= 88 && centers[0] > midY + 40) {
          nextStage = 0;
        }
      }

      // Resguardo en monitores muy altos si al llegar al fondo absoluto Instagram no alcanza a cruzar el 50%
      if (isAtBottom && scrollingDown && nextStage < 4) {
        nextStage = 4;
      }

      prevAbove = above;
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
      className="mx-auto w-full max-w-5xl pb-32 pt-16 font-roman text-sm leading-relaxed sm:pb-44 sm:pt-24 sm:text-base"
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

      {/* 3. SoundCloud #1 (izquierda) + texto desplazado a su derecha */}
      <section
        aria-label="Pista 7 en SoundCloud"
        className="mt-36 grid grid-cols-1 items-center gap-y-12 sm:mt-48 md:grid-cols-12 md:gap-x-12 lg:gap-x-16"
      >
        <div className="min-w-0 md:col-span-6">
          <div ref={soundcloud1Ref}>
            <iframe
              title="7 de juan pablo díaz en SoundCloud"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2324696579&color=%232c3433&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
              height={166}
              loading="lazy"
              allow="autoplay; encrypted-media"
              className="block w-full overflow-hidden border-0"
              style={{ height: "166px" }}
            />
          </div>
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

        <p className="space-y-8 sm:space-y-10 md:col-span-6">
          <span className="block pr-[4ch] text-right md:pr-[6ch]">
            música de fondo
          </span>
          <span className="block pl-2 sm:pl-6">
            para momentos muy específicos
          </span>
        </p>
      </section>

      {/* 4. Texto a la izquierda + SoundCloud #2 (derecha) */}
      <section
        aria-label="Pista 11 en SoundCloud"
        className="mt-28 grid grid-cols-1 items-center gap-y-12 sm:mt-40 md:grid-cols-12 md:gap-x-12 lg:gap-x-16"
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
          <div ref={soundcloud2Ref}>
            <iframe
              title="11 de juan pablo díaz en SoundCloud"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2324702429&color=%232c3433&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
              height={166}
              loading="lazy"
              allow="autoplay; encrypted-media"
              className="block w-full overflow-hidden border-0"
              style={{ height: "166px" }}
            />
          </div>
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
