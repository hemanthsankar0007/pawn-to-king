// import { motion, useAnimation, useInView } from "framer-motion";
// import { useEffect, useRef } from "react";
// import { Link } from "react-router-dom";
// import MagneticWrapper from "./MagneticWrapper";
// import homeImage from "../../assets/home.png";

// function HomeHero() {
//   // return (
//   //   <section className="py-14 lg:py-20">
//   //     <div className="hero-grid">
//   //       <div className="hero-text">
//   //         <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Premium Online Chess Academy</p>
//   //         <h1 className="font-display text-[clamp(2rem,4.2vw,4.8rem)] leading-tight text-text">
//   //           From Pawn to King.
//   //         </h1>
//   //         <p className="mt-5 max-w-2xl text-base leading-[1.7] text-text/80 md:text-lg">
//   //           A Structured 120-Day Chess Mastery Program
//   //         </p>
//   //         <div className="mt-8 flex flex-wrap gap-4">
//   //           <MagneticWrapper className="inline-block" strength={4}>
//   //             <Link to="/login" className="primary-btn inline-flex rounded-lg px-6 py-3 text-sm font-semibold">
//   //               Login
//   //             </Link>
//   //           </MagneticWrapper>
//   //           <MagneticWrapper className="inline-block" strength={4}>
//   //             <a
//   //               href="#program-structure"
//   //               className="secondary-btn inline-flex rounded-lg px-6 py-3 text-sm font-semibold"
//   //             >
//   //               View Program
//   //             </a>
//   //           </MagneticWrapper>
//   //         </div>
//   //       </div>

//   //       <motion.div
//   //         className="hero-image-wrapper hero-main-image"
//   //         initial={{ opacity: 0, y: 16 }}
//   //         animate={{ opacity: 1, y: 0 }}
//   //         transition={{ duration: 0.55, ease: "easeOut" }}
//   //       >
//   //         <div className="hero-image rounded-[1.6rem] border border-gold/40 shadow-[0_16px_30px_rgba(0,0,0,0.34)]">
//   //           <img
//   //             src={homeImage}
//   //             alt="Pawn to King academy home hero"
//   //             loading="lazy"
//   //             width="2400"
//   //             height="2400"
//   //           />
//   //         </div>
//   //       </motion.div>
//   //     </div>
//   //   </section>
//   // );
//   const ref = useRef(null);
//   const isInView = useInView(ref, { threshold: 0.2 });
//   const controls = useAnimation();
//   const dotControls = useAnimation();

//   useEffect(() => {
//     if (isInView) {
//       controls.start("visible");
//       dotControls.start("blink");
//     } else {
//       controls.start("hidden");
//       dotControls.start("off");
//     }
//   }, [isInView, controls, dotControls]);

//   const containerVariants = {
//     hidden: {},
//     visible: { transition: { staggerChildren: 0.045 } },
//   };

//   const letterVariants = {
//     hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
//     visible: {
//       opacity: 1,
//       y: 0,
//       filter: "blur(0px)",
//       transition: { duration: 0.4, ease: "easeOut" },
//     },
//   };

//   const dotVariants = {
//     blink: {
//       opacity: [1, 0, 1],
//       transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
//     },
//     off: { opacity: 0 },
//   };

//   return (
//     <section
//       ref={ref}
//       className="relative isolate min-h-[85vh] w-screen overflow-hidden"
//       style={{ marginLeft: "calc(-50vw + 50%)", width: "100vw" }}
//     >
//       {/* Full-bleed background image */}
//       <motion.img
//         src={homeImage}
//         alt="Pawn to King academy home hero"
//         className="absolute inset-0 h-full w-full object-cover object-center"
//         style={{ objectPosition: "center top" }}
//         loading="eager"
//         fetchPriority="high"
//         initial={{ scale: 1.08, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 1.4, ease: "easeOut" }}
//       />

//       {/* Left-heavy dark gradient overlay */}
//       <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(2,8,24,0.95)_0%,rgba(2,8,24,0.75)_40%,rgba(2,8,24,0.2)_100%)]" />

//       {/* Content */}
//       <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">

//         {/* Subtitle */}
//         <motion.p
//           className="mb-5 text-xs uppercase tracking-[0.25em] text-gold"
//           initial={{ opacity: 0, x: -30 }}
//           animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
//           transition={{ duration: 0.6, ease: "easeOut" }}
//         >
//           Premium Online Chess Academy
//         </motion.p>

//         {/* Letter-by-letter heading */}
//         <h1 className="font-display text-[clamp(2.4rem,5.5vw,5.8rem)] leading-tight text-text">
//           <motion.span
//             className="inline-flex flex-wrap"
//             variants={containerVariants}
//             initial="hidden"
//             animate={controls}
//           >
//             {sentence.map((char, i) => (
//               <motion.span
//                 key={i}
//                 variants={letterVariants}
//                 style={{ whiteSpace: char === " " ? "pre" : "normal" }}
//               >
//                 {char === " " ? "\u00A0" : char}
//               </motion.span>
//             ))}

//             {/* Blinking dot */}
//             <motion.span
//               className="text-gold"
//               variants={dotVariants}
//               animate={dotControls}
//               initial={{ opacity: 1 }}
//             >
//               .
//             </motion.span>
//           </motion.span>
//         </h1>

//         {/* Description */}
//         <motion.p
//           className="mt-6 max-w-xl text-base leading-[1.8] text-text/80 md:text-lg"
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
//           transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
//         >
//           A Structured 120-Day Chess Mastery Program
//         </motion.p>

//         {/* Buttons */}
//         <motion.div
//           className="mt-10 flex flex-wrap gap-4"
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
//           transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }}
//         >
//           <MagneticWrapper className="inline-block" strength={4}>
//             <Link
//               to="/login"
//               className="primary-btn inline-flex rounded-lg px-6 py-3 text-sm font-semibold"
//             >
//               Login
//             </Link>
//           </MagneticWrapper>

//           <MagneticWrapper className="inline-block" strength={4}>
//             <a
//               href="#program-structure"
//               className="secondary-btn inline-flex rounded-lg px-6 py-3 text-sm font-semibold"
//             >
//               View Program
//             </a>
//           </MagneticWrapper>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// export default HomeHero;



import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MagneticWrapper from "./MagneticWrapper";
import homeImage from "../../assets/home.png";

const sentence = "From Pawn to King".split("");

function HomeHero() {
  const ref = useRef(null);
  const isInView = useInView(ref, { threshold: 0.1, once: false });
  const controls = useAnimation();
  const dotControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
      dotControls.start("blink");
    } else {
      controls.start("hidden");
      dotControls.start("off");
    }
  }, [isInView, controls, dotControls]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.045 } },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const dotVariants = {
    blink: {
      opacity: [1, 0, 1],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    off: { opacity: 0 },
  };

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      {/* Full-bleed background image */}
      <motion.img
        src={homeImage}
        alt="Pawn to King academy home hero"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 20%" }}
        loading="eager"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Bottom fade — blends into page bg */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(to_top,#0b0f19_0%,#0b0f19_10%,transparent_100%)]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16">

        {/* Eyebrow */}
        <motion.p
          className="text-xs sm:text-sm tracking-widest uppercase text-gold mb-4"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Think Like a Pro
        </motion.p>

        {/* Letter-by-letter heading */}
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-white max-w-xl">
          <motion.span
            className="inline-flex flex-wrap"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {sentence.map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                style={{ whiteSpace: char === " " ? "pre" : "normal" }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}

            {/* Blinking gold dot */}
            <motion.span
              className="text-gold"
              variants={dotVariants}
              animate={dotControls}
              initial={{ opacity: 1 }}
            >
              .
            </motion.span>
          </motion.span>
        </h1>

        {/* Description */}
        <motion.p
          className="mt-6 text-base sm:text-lg text-gray-300 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
        >
          A Structured 160-Day Chess Mastery Program
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }}
        >
          <MagneticWrapper className="w-full sm:w-auto" strength={4}>
            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-md border border-gold px-6 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 sm:w-auto"
            >
              Login
            </Link>
          </MagneticWrapper>

          <MagneticWrapper className="w-full sm:w-auto" strength={4}>
            <a
              href="#program-structure"
              className="flex w-full items-center justify-center rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gold-hover sm:w-auto"
            >
              View Program
            </a>
          </MagneticWrapper>
        </motion.div>
      </div>
    </section>
  );
}

export default HomeHero;