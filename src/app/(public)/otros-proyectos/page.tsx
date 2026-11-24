export default function OtrosProyectosPage() {
  return (
    <article
      aria-labelledby="ideas-intro"
      className="mx-auto w-full max-w-5xl pb-24 pt-16 font-roman text-sm leading-relaxed sm:pb-32 sm:pt-24 sm:text-base"
    >
      {/* 1. Frase de apertura centrada */}
      <h1 id="ideas-intro" className="text-center font-roman text-sm sm:text-base">
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
        </div>
      </section>

      {/* 3. SoundCloud #1 (izquierda) + texto desplazado a su derecha */}
      <section
        aria-label="Pista 7 en SoundCloud"
        className="mt-36 grid grid-cols-1 items-center gap-y-12 sm:mt-48 md:grid-cols-12 md:gap-x-12 lg:gap-x-16"
      >
        <div className="min-w-0 md:col-span-6">
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

        <p className="space-y-8 sm:space-y-10 md:col-span-6">
          <span className="block text-right">música de fondo</span>
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
          <span className="block">y una canción pegada</span>
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
        </div>
      </section>
    </article>
  );
}
