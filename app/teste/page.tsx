'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownIcon, CheckIcon, StarIcon, TrendingUpIcon } from 'lucide-react'

export default function EnhancedParallaxLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(aboutRef, { once: true })

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const smoothY = useSpring(y, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5
    }
  }, [])

  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      <motion.section 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{ scale, opacity }}
      >
        <motion.video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover"
          style={{ y: smoothY }}
        >
          <source src="/video.mp4" type="video/mp4" />
          Seu navegador não suporta o elemento de vídeo.
        </motion.video>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white z-10">
          <motion.h1 
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl font-bold mb-4 text-center"
          >
            Inovação em Movimento
          </motion.h1>
          <motion.p 
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-center max-w-2xl"
          >
            Descubra o poder da tecnologia que transforma o futuro
          </motion.p>
          <motion.div
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Explore o Futuro
            </Button>
          </motion.div>
        </div>
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDownIcon className="w-8 h-8 text-white" />
        </motion.div>
      </motion.section>

      <section ref={aboutRef} className="relative py-16 bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/placeholder.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2 
            variants={titleVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-3xl md:text-5xl font-bold mb-12 text-center"
          >
            Nossa Visão do Futuro
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: StarIcon, title: "Inovação Pioneira", description: "Liderando o caminho com tecnologias revolucionárias que definem o amanhã." },
              { icon: CheckIcon, title: "Excelência Garantida", description: "Comprometidos com a qualidade superior em cada aspecto de nossos produtos e serviços." },
              { icon: TrendingUpIcon, title: "Crescimento Exponencial", description: "Impulsionando o sucesso de nossos clientes com soluções que ampliam possibilidades." }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="bg-gray-800 border-gray-700 overflow-hidden">
                  <CardContent className="p-6 relative">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"
                      animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative z-10">
                      <item.icon className="w-12 h-12 mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-300">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}