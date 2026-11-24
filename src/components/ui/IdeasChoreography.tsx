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

  const bandcampSentinelRef = useRef<HTMLSpanElement | null>(null);
  const soundcloud1SentinelRef = useRef<HTMLSpanElement | null>(null);
  const soundcloud2SentinelRef = useRef<HTMLSpanElement | null>(null);
  const instagramSentinelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const palette = getSessionIdeasPalette();
    const sentinels = [
      bandcampSentinelRef.current,
      soundcloud1SentinelRef.current,
      soundcloud2SentinelRef.current,
      instagramSentinelRef.current,
    ];

    if (
      sentinels.some((el) => !el) ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const validSentinels = sentinels as HTMLSpanElement[];
    const passed = [false, false, false, false];
    let isAtTop = window.scrollY <= 4;
    let currentStage = 0;

    // Primera carga siempre en blanco oficial
    setCustomBg(null);

    const applyStage = () => {
      let nextStage = 0;
      if (!isAtTop) {
        for (let i = 0; i < passed.length; i++) {
          if (passed[i]) {
            nextStage = i + 1;
          }
        }
      }

      if (nextStage === currentStage) {
        return;
      }

      currentStage = nextStage;
      setCustomBg(nextStage === 0 ? null : palette[nextStage - 1]);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = validSentinels.indexOf(entry.target as HTMLSpanElement);
          if (idx === -1) continue;

          if (entry.isIntersecting) {
            passed[idx] = true;
          } else {
            const rootMid = entry.rootBounds
              ? entry.rootBounds.top + entry.rootBounds.height / 2
              : window.innerHeight / 2;
            // Salió por arriba del viewport -> sigue superado; salió por abajo -> revertido
            passed[idx] = entry.boundingClientRect.top < rootMid;
          }
        }

        isAtTop = window.scrollY <= 4;
        applyStage();
      },
      { threshold: 0 }
    );

    for (const sentinel of validSentinels) {
      observer.observe(sentinel);
    }

    // Guardia liviana sin lecturas de layout: asegura fondo blanco al estar en top (scrollY <= 4)
    // incluso en pantallas muy altas donde Bandcamp quepa desde el inicio.
    const handleScroll = () => {
      const nextAtTop = window.scrollY <= 4;
      if (nextAtTop !== isAtTop) {
        isAtTop = nextAtTop;
        applyStage();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
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

        <div className="mx-auto w-full max-w-[350px] md:mx-0 md:justify-self-end">
          <iframe
            title="malas decisiones de juan pablo díaz en Bandcamp"
            src="https://bandcamp.com/EmbeddedPlayer/album=75179538/size=large/bgcol=ffffff/linkcol=333333/transparent=true/"
            width={350}
            height={687}
            className="block w-full border-0 bg-transparent"
            style={{ height: "687px" }}
          />
          <span
            ref={bandcampSentinelRef}
            aria-hidden="true"
            className="pointer-events-none block h-px w-full opacity-0"
          />
        </div>
      </section>

      {/* 3. SoundCloud #1: en móvil el texto antecede al reproductor; en desktop SoundCloud queda a la izquierda y texto a la derecha */}
      <section
        aria-label="Pista 7 en SoundCloud"
        className="mt-36 grid grid-cols-1 items-center gap-y-12 sm:mt-48 md:grid-cols-12 md:gap-x-12 lg:gap-x-16"
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
          <span
            ref={soundcloud1SentinelRef}
            aria-hidden="true"
            className="pointer-events-none block h-px w-full opacity-0"
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
          <iframe
            title="11 de juan pablo díaz en SoundCloud"
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A2324702429&color=%232c3433&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            height={166}
            loading="lazy"
            allow="autoplay; encrypted-media"
            className="block w-full overflow-hidden border-0"
            style={{ height: "166px" }}
          />
          <span
            ref={soundcloud2SentinelRef}
            aria-hidden="true"
            className="pointer-events-none block h-px w-full opacity-0"
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

      {/* 5. Cierre centrado + Instagram embed centrado */}
      <section
        aria-label="Colección en Instagram perrosatrapados"
        className="mt-36 flex flex-col items-center space-y-14 sm:mt-48 sm:space-y-20"
      >
        <p className="text-center">
          tambien colecciono fotos de perros atrapados en la segunda
          dimensión...
        </p>

        <div className="w-full max-w-[400px]">
          <iframe
            title="Perfil de Instagram @perrosatrapados"
            src="https://www.instagram.com/perrosatrapados/embed/"
            width={400}
            height={480}
            loading="lazy"
            className="block w-full overflow-hidden border-0 bg-transparent"
            style={{ height: "480px" }}
          />
          <span
            ref={instagramSentinelRef}
            aria-hidden="true"
            className="pointer-events-none block h-px w-full opacity-0"
          />
        </div>
      </section>
    </article>
  );
}
