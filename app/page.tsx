"use client";

import { Button } from "@/components/ui/button";
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    name: "Store your PDF Documents",
    description:
      "Keep all your important PDF files securely stored and easily accessible anytime, anywhere",
    icon: GlobeIcon,
  },
  {
    name: "Blazing Fast",
    description:
      "Experience lightning-fast answers to your document queries, ensuring you get the information you need instantly.",
    icon: ZapIcon,
  },
  {
    name: "Chat Memory",
    description:
      "The chatbot remembers previous interactions, providing a seamless and personalized experience",
    icon: BrainCogIcon,
  },
  {
    name: "Interactive PDF Viewer",
    description:
      "Engage with your PDFs like never before using our intuitive and interactive viewer.",
    icon: EyeIcon,
  },
  {
    name: "Cloud Backup",
    description:
      "Your documents are safely backed up on the cloud, protected from loss or corruption",
    icon: ServerCogIcon,
  },
  {
    name: "Responsiveness Across Devices",
    description:
      "Access and chat with PDFs seamlessly on any device, from desktop to mobile.",
    icon: MonitorSmartphoneIcon,
  },
];

export default function Home() {
  const [inView, setInView] = useState(false);
  const divRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Check if the div is in view
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true); // Start animation when in view
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the div is in view
      }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    // Clean up the observer
    return () => {
      if (divRef.current) {
        observer.unobserve(divRef.current);
      }
    };
  }, []);

  // Animation variants for the child divs (individual divs)
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5, // Duration for each item
      },
    },
  };

  // Animation variant for the parent grid
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2, // Stagger the children with 0.2s delay
      },
    },
  };
  return (
    <main className="flex-1 bg-gradient-to-bl from-white to-indigo-400 overflow-scroll p-2 lg:p-4">
      <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl mx-auto max-w-6xl px-6 lg:px-8 ">
        {/* top section of landing page */}
        <section className="flex flex-col justify-center items-center text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Your Interactive Document Companion
          </h2>
          <p className="mt-2 font-bold tracking-tight text-gray-900 text-3xl sm:text-6xl">
            Transform your PDF into Interactive Conversations
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Introducing{" "}
            <span className="text-primary font-bold">Documentz.chat!</span>
            <br></br>
            <br></br>
            Upload your doucment, our chatbot will answer quesetions, summarize
            content, and answer all your questions. Ideal for students,
            professionals, and everyone with a really long PDF to read.
            <span className="text-primary font-bold">Documentsz.chat</span>{" "}
            turns static documents into{" "}
            <span className="font-bold">dynamic conversations</span> enhancing
            productivity up to 10x.
          </p>
          <Button asChild className="shadow-md my-6">
            <Link href={"/dashboard"}>Get Started</Link>
          </Button>

          <div className="overflow-hidden pt-16">
            <div className="px-6 lg:px-8">
              <Image
                alt="app screenshot"
                src={"https://i.imgur.com/VciRSTI.jpeg"}
                width={2400}
                height={1400}
                className="rounded-xl shadow-2xl ring-1 ring-gray-900"
              />
              <div className="relative">
                <div className="absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]" />
              </div>
            </div>
          </div>
        </section>

        {/* features section */}
        <section className="mt-16 px-6 md:mt-24 md:px-8">
          <motion.dl
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10 leading-7 text-gray-600"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            ref={divRef}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.name}
                className="flex flex-row items-center gap-4"
                variants={fadeInVariants}
              >
                <dt className="font-semibold text-gray-900">
                  <feature.icon className="h-8 w-8" />
                </dt>
                <dd>{feature.description}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </section>
      </div>
    </main>
  );
}
