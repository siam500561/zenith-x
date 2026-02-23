import Lenis from "lenis";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const imagePaths = Array.from(
  { length: 144 },
  (_, i) => `/headphone-seqs/${String(i + 1).padStart(5, "0")}.png`,
);

function App() {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Preload images in batches to prevent network congestion
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    const BATCH_SIZE = 5; // Load 5 images at a time

    const loadBatch = async (startIndex: number): Promise<void> => {
      const endIndex = Math.min(startIndex + BATCH_SIZE, imagePaths.length);
      const batchPromises: Promise<void>[] = [];

      for (let i = startIndex; i < endIndex; i++) {
        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.src = imagePaths[i];
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if an image fails
          loadedImages[i] = img;
        });
        batchPromises.push(promise);
      }

      await Promise.all(batchPromises);
    };

    const loadAllImages = async () => {
      for (let i = 0; i < imagePaths.length; i += BATCH_SIZE) {
        await loadBatch(i);
        // Update state progressively so first frames can render sooner
        setImages([...loadedImages]);

        // Hide loading screen after the first batch is loaded
        if (i === 0) {
          // Small delay to ensure smooth transition and prevent flashing if cached
          setTimeout(() => setIsLoading(false), 800);
        }
      }
    };

    loadAllImages();
  }, []);

  // Scroll animation for the sequence
  const { scrollYProgress } = useScroll({
    target: sequenceRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const frameIndex = useTransform(smoothProgress, [0, 1], [0, 143]);

  // Text animations based on sequence scroll
  const text1Opacity = useTransform(
    smoothProgress,
    [0, 0.15, 0.25, 0.35],
    [0, 1, 1, 0],
  );
  const text1Y = useTransform(smoothProgress, [0, 0.15, 0.35], [50, 0, -50]);

  const text2Opacity = useTransform(
    smoothProgress,
    [0.35, 0.5, 0.6, 0.7],
    [0, 1, 1, 0],
  );
  const text2Y = useTransform(smoothProgress, [0.35, 0.5, 0.7], [50, 0, -50]);

  const text3Opacity = useTransform(
    smoothProgress,
    [0.7, 0.85, 0.95, 1],
    [0, 1, 1, 0],
  );
  const text3Y = useTransform(smoothProgress, [0.7, 0.85, 1], [50, 0, -50]);

  // Canvas rendering
  useEffect(() => {
    if (images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = (index: number) => {
      const img = images[Math.round(index)];
      if (!img) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate aspect ratio to fit the image nicely
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio); // Cover the screen

      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      // Draw with better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShift_x,
        centerShift_y,
        img.width * ratio,
        img.height * ratio,
      );
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(frameIndex.get());
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const unsubscribe = frameIndex.on("change", (latest) => {
      render(latest);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribe();
    };
  }, [images, frameIndex]);

  return (
    <div className="bg-[#050505] text-white font-sans selection:bg-[#d4c5b9] selection:text-black">
      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-widest mb-6">
                ZENITH X
              </h1>
              <div className="w-48 h-[1px] bg-neutral-800 overflow-hidden relative">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-white"
                  initial={{ width: "0%", x: "-100%" }}
                  animate={{ width: "50%", x: "200%" }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
              </div>
              <p className="mt-6 text-xs tracking-widest uppercase text-neutral-500">
                Preparing Experience
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="fixed top-0 left-0 w-full z-50 flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-4 md:py-6 mix-blend-difference gap-4 md:gap-0"
      >
        <div className="font-serif text-xl md:text-2xl tracking-widest font-bold">
          ZENITH X
        </div>
        <div className="flex gap-4 md:gap-8 text-xs md:text-sm tracking-widest uppercase">
          <a href="#design" className="hover:text-[#d4c5b9] transition-colors">
            Design
          </a>
          <a href="#sound" className="hover:text-[#d4c5b9] transition-colors">
            Sound
          </a>
          <a href="#specs" className="hover:text-[#d4c5b9] transition-colors">
            Specs
          </a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 50 : 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="text-center z-10"
        >
          <h1 className="font-serif text-7xl md:text-9xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
            ZENITH X
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-[0.3em] text-[#d4c5b9]">
            THE ULTIMATE SOUND
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest uppercase text-neutral-400">
            Scroll to explore
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-neutral-400 to-transparent"></div>
        </motion.div>
      </section>

      {/* Sequence Section */}
      <section ref={sequenceRef} className="h-[400vh] relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#050505]">
          <canvas ref={canvasRef} className="w-full h-full object-cover" />

          {/* Overlay Texts */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              style={{ opacity: text1Opacity, y: text1Y }}
              className="absolute text-center px-4"
            >
              <h2 className="font-serif text-4xl md:text-6xl mb-4">
                Thin-Beige Elegance
              </h2>
              <p className="text-lg md:text-xl text-neutral-400 font-light max-w-xl mx-auto">
                Crafted from aerospace-grade aluminum and wrapped in supple,
                thin-beige vegan leather. A statement of pure luxury.
              </p>
            </motion.div>

            <motion.div
              style={{ opacity: text2Opacity, y: text2Y }}
              className="absolute text-center px-4"
            >
              <h2 className="font-serif text-4xl md:text-6xl mb-4">
                Acoustic Perfection
              </h2>
              <p className="text-lg md:text-xl text-neutral-400 font-light max-w-xl mx-auto">
                Custom 50mm beryllium drivers deliver a soundstage so wide,
                you'll feel every breath, every note, every heartbeat.
              </p>
            </motion.div>

            <motion.div
              style={{ opacity: text3Opacity, y: text3Y }}
              className="absolute text-center px-4"
            >
              <h2 className="font-serif text-4xl md:text-6xl mb-4">
                Absolute Silence
              </h2>
              <p className="text-lg md:text-xl text-neutral-400 font-light max-w-xl mx-auto">
                Next-generation Active Noise Cancellation adapts to your
                environment 50,000 times per second.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="design"
        className="py-24 md:py-32 px-4 md:px-8 lg:px-24 bg-white text-black"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="mb-16 md:mb-24"
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl mb-6 md:mb-8">
              Design without
              <br />
              compromise.
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-neutral-600 font-light max-w-2xl">
              Every curve, every material, every stitch has been meticulously
              considered to create a headphone that looks as breathtaking as it
              sounds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-6 group cursor-pointer"
            >
              <div className="h-[400px] bg-neutral-100 rounded-3xl overflow-hidden relative">
                <img
                  src="/headphone-ear-pads.png"
                  alt="Memory Foam Comfort"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 transition-colors duration-1000 group-hover:bg-transparent"></div>
              </div>
              <h3 className="font-serif text-3xl transition-colors duration-500 group-hover:text-[#a89b90]">
                Memory Foam Comfort
              </h3>
              <p className="text-neutral-600 font-light leading-relaxed">
                Ear cushions crafted from high-density memory foam, wrapped in
                breathable acoustic fabric. Designed for endless listening
                sessions without a hint of fatigue.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.4 }}
              className="space-y-6 md:mt-24 group cursor-pointer"
            >
              <div className="h-[400px] bg-neutral-100 rounded-3xl overflow-hidden relative">
                <img
                  src="/headphone-seamless.png"
                  alt="Seamless Articulation"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 transition-colors duration-1000 group-hover:bg-transparent"></div>
              </div>
              <h3 className="font-serif text-3xl transition-colors duration-500 group-hover:text-[#a89b90]">
                Seamless Articulation
              </h3>
              <p className="text-neutral-600 font-light leading-relaxed">
                The custom-designed hinge mechanism provides fluid, silent
                rotation. It adapts perfectly to your head shape, ensuring an
                optimal acoustic seal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sound Section */}
      <section
        id="sound"
        className="py-24 md:py-32 px-4 md:px-8 lg:px-24 bg-[#050505] relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4c5b9] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          >
            <h2 className="font-serif text-4xl md:text-6xl lg:text-8xl mb-6 md:mb-8">
              Pure. Unadulterated.
              <br />
              Sound.
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-neutral-400 font-light max-w-3xl mx-auto mb-12 md:mb-16">
              Experience audio exactly as the artist intended. No artificial
              boosting, no muddy frequencies. Just crystal-clear highs, rich
              mids, and deep, authoritative bass.
            </p>

            <div className="flex flex-col gap-16 md:gap-24 text-left mt-20 md:mt-32">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-16 items-start md:items-center border-b border-neutral-800 pb-16 md:pb-24 group"
              >
                <div className="text-[#d4c5b9] text-5xl md:text-6xl lg:text-8xl font-serif font-light opacity-50 transition-opacity duration-500 group-hover:opacity-100">
                  01
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl lg:text-4xl font-serif mb-2 md:mb-4 transition-colors duration-500 group-hover:text-[#d4c5b9]">
                    Lossless Audio
                  </h4>
                  <p className="text-lg md:text-xl text-neutral-400 font-light max-w-2xl">
                    Support for 24-bit/96kHz high-resolution audio via USB-C or
                    premium Bluetooth codecs.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-16 items-start md:items-center border-b border-neutral-800 pb-16 md:pb-24 group"
              >
                <div className="text-[#d4c5b9] text-5xl md:text-6xl lg:text-8xl font-serif font-light opacity-50 transition-opacity duration-500 group-hover:opacity-100">
                  02
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl lg:text-4xl font-serif mb-2 md:mb-4 transition-colors duration-500 group-hover:text-[#d4c5b9]">
                    Spatial Audio
                  </h4>
                  <p className="text-lg md:text-xl text-neutral-400 font-light max-w-2xl">
                    Dynamic head tracking places you in the center of a
                    three-dimensional soundscape.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-16 items-start md:items-center group"
              >
                <div className="text-[#d4c5b9] text-5xl md:text-6xl lg:text-8xl font-serif font-light opacity-50 transition-opacity duration-500 group-hover:opacity-100">
                  03
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl lg:text-4xl font-serif mb-2 md:mb-4 transition-colors duration-500 group-hover:text-[#d4c5b9]">
                    50h Battery
                  </h4>
                  <p className="text-lg md:text-xl text-neutral-400 font-light max-w-2xl">
                    Listen for days. A quick 5-minute charge provides up to 5
                    hours of playback.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-24 md:py-32 px-4 md:px-8 lg:px-24 bg-white text-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="w-full lg:w-1/2 space-y-8"
            >
              <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl">
                The Art of
                <br />
                Craftsmanship.
              </h2>
              <p className="text-lg md:text-xl text-neutral-600 font-light leading-relaxed">
                Every Zenith X is hand-assembled by master technicians. The
                anodized aluminum chassis undergoes a 12-hour polishing process,
                resulting in a finish that catches light with liquid grace.
              </p>
              <div className="pt-8 border-t border-neutral-200">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-3xl md:text-4xl font-serif mb-2">
                      12h
                    </div>
                    <div className="text-sm text-neutral-500 uppercase tracking-widest">
                      Polishing
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-serif mb-2">
                      100%
                    </div>
                    <div className="text-sm text-neutral-500 uppercase tracking-widest">
                      Hand-Assembled
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5 }}
              className="w-full lg:w-1/2 h-[500px] md:h-[700px] bg-neutral-100 rounded-3xl overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#d4c5b9]/30 to-transparent z-10 transition-opacity duration-1000 group-hover:opacity-50"></div>
              <img
                src="/headphone-seamless.png"
                alt="Craftsmanship Detail"
                className="w-full h-full object-cover object-center scale-110 transition-transform duration-1000 group-hover:scale-100"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Specifications Section */}
      <section
        id="specs"
        className="py-24 md:py-32 px-4 md:px-8 lg:px-24 bg-[#0a0a0a] text-white border-t border-neutral-900"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mb-16 md:mb-24 text-center"
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl mb-6">
              Technical
              <br />
              <span className="text-[#d4c5b9] italic">Specifications.</span>
            </h2>
            <p className="text-neutral-400 font-light tracking-widest uppercase text-sm">
              Engineered for Absolute Fidelity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
            {/* Audio Specs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 }}
              className="space-y-8"
            >
              <h3 className="text-xl font-serif text-[#d4c5b9] border-b border-neutral-800 pb-4">
                Audio
              </h3>
              <ul className="space-y-6 text-neutral-400 font-light">
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Drivers</span>
                  <span>50mm Custom Beryllium</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">
                    Frequency Response
                  </span>
                  <span>5Hz - 50,000Hz</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Impedance</span>
                  <span>32 Ohms</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">THD</span>
                  <span>&lt;0.05% @ 1kHz</span>
                </li>
              </ul>
            </motion.div>

            {/* Connectivity Specs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-8"
            >
              <h3 className="text-xl font-serif text-[#d4c5b9] border-b border-neutral-800 pb-4">
                Connectivity
              </h3>
              <ul className="space-y-6 text-neutral-400 font-light">
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Bluetooth</span>
                  <span>Version 5.4 with Multipoint</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Codecs</span>
                  <span>LDAC, aptX Adaptive, AAC, SBC</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Wired</span>
                  <span>USB-C Lossless Audio (24-bit/96kHz)</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Microphones</span>
                  <span>8-Mic Array for ANC & Voice</span>
                </li>
              </ul>
            </motion.div>

            {/* Design & Battery Specs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="space-y-8"
            >
              <h3 className="text-xl font-serif text-[#d4c5b9] border-b border-neutral-800 pb-4">
                Design & Power
              </h3>
              <ul className="space-y-6 text-neutral-400 font-light">
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Materials</span>
                  <span>Aerospace Aluminum, Vegan Leather</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Weight</span>
                  <span>315 grams</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Battery Life</span>
                  <span>50 Hours (ANC On)</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white font-medium">Fast Charge</span>
                  <span>5 Mins = 5 Hours Playback</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pre-order / CTA Section */}
      <section
        id="preorder"
        className="py-32 md:py-48 px-4 md:px-8 lg:px-24 bg-white text-black relative overflow-hidden flex items-center justify-center text-center"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,197,185,0.15)_0%,transparent_70%)]"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-3xl mx-auto space-y-12"
        >
          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl">
            Step into the
            <br />
            <span className="italic bg-gradient-to-r text-[#d4c5b9] drop-shadow-sm">
              Silence.
            </span>
          </h2>
          <p className="text-lg md:text-xl text-neutral-600 font-light">
            Reserve your Zenith X today. Limited to 500 units worldwide for the
            inaugural Founders Edition.
          </p>

          <button className="group relative inline-flex items-center justify-center px-12 py-5 text-sm tracking-[0.2em] uppercase overflow-hidden bg-black text-white transition-all duration-500 hover:bg-gradient-to-r hover:from-[#d4af37] hover:to-[#f9e596] hover:text-black hover:shadow-[0_0_30px_rgba(249,229,150,0.4)]">
            <span className="relative z-10 font-medium">Pre-Order Now</span>
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] text-white py-12 md:py-16 px-4 md:px-8 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-serif text-2xl md:text-3xl font-bold tracking-widest">
            ZENITH X
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs md:text-sm tracking-widest uppercase font-medium">
            <a href="#" className="hover:text-[#d4c5b9] transition-colors">
              Instagram
            </a>
            <a href="#" className="hover:text-[#d4c5b9] transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-[#d4c5b9] transition-colors">
              Support
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 md:mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-neutral-500 uppercase tracking-widest text-center md:text-left">
          <p>&copy; 2026 Zenith Audio. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
