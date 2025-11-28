import React from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Splash from "@/components/Splash-Screen/Splash";
import landingPageImg from "../public/landingPage.svg";
import stetoscopeImg from "../public/stetoscope.svg";
import { FaArrowDown, FaArrowRight } from "react-icons/fa";
import RenderThemeToggler from "@/components/UI/RenderThemeToggler";

export default function Home() {
  return (
    <>
      <Head>
        <title>AuraBUENA</title>
        <meta
          name="description"
          content="Holistic care and spiritual support"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Splash />
        <section className="flex flex-col w-full min-h-screen gap-12 xl:gap-10">
          <div className="relative flex flex-col xl:gap-6 items-center justify-center h-[100dvh] xl:flex-row-reverse px-4 xl:px-8">
            <RenderThemeToggler />

            <div className="relative w-4/5 aspect-square xl:basis-1/2">
              <Image src={landingPageImg} fill priority alt="Landing Img" />
            </div>

            <div className="flex flex-col space-y-6 text-black xl:basis-1/2 dark:text-white">
              <h1 className="w-full text-4xl text-center xl:text-6xl xl:text-left">
                AuraBUENA Holistics
              </h1>

              <p className="w-full max-w-lg text-xl text-center xl:text-left dark:text-gray-400">
                Welcome to{" "}
                <span className="text-[#2A9988]">My AuraBUENA</span> where
                you can receive spiritual care and holistic support with competence and love.
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href="/sign-up"
                  className="px-2 py-3 w-1/2 bg-[#2a9988] hover:bg-[#1C665B] duration-500 rounded-full text-white text-xl max-w-[250px] text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="flex gap-2 items-center justify-center px-2 py-3 w-1/2 border border-[#2a9988] bg-[#2a9988] hover:bg-[#1C665B] dark:bg-transparent dark:hover:bg-[#1C665B] duration-500 rounded-full text-white text-xl max-w-[250px]"
                >
                  Login <FaArrowRight />
                </Link>
              </div>
            </div>

            <a
              href="#faq"
              className="mx-auto mt-10 xl:absolute bottom-20 animate-bounce"
            >
              <FaArrowDown className="text-4xl dark:text-white" />
            </a>
          </div>

          <div className="flex flex-col items-end w-full text-black dark:text-white">
            <div
              id="faq"
              className="flex flex-col items-center w-full px-6 sm:px-20 scroll-mt-6"
            >
              <h1 className="w-full text-3xl text-center">
                Expert Care from Certified Spiritual Professionals
              </h1>
              <br />
              <p className="w-full max-w-lg text-base text-center xl:text-lg sm:font-normal">
                Our spiritual professionals undergo a rigorous screening and
                selection process before they join our team. When you receive an
                holistic consultation through our service, you can trust
                that you&apos;re receiving competent support and guidance from a
                an ordained and certified spiritual professional.
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col items-end bg-[#2A9988] text-white py-10 overflow-hidden relative">
            <Image
              src={stetoscopeImg}
              width={600}
              height={600}
              alt="Stetoscope Img"
              className="absolute overflow-hidden blur-sm"
            />

            <h1 className="w-full px-5 text-2xl font-bold text-left sm:px-20">
              FAQs:
            </h1>

            <br />

            <ul className="z-10 grid grid-cols-1 gap-10 px-5 md:grid-cols-2 xl:grid-cols-3 sm:px-20 ">
              <div className="space-y-1">
                <li className="text-xl">
                  How do I sign up for holistic care?
                </li>
                <li className="text-sm font-light">
                  Signing up is easy! Simply create an account on our website
                  and provide some basic information about yourself. Once
                  you&apos;ve created an account, you can schedule a
                  consultation with one of our spiritual professionals at a time
                  that&apos;s convenient for you.
                </li>
              </div>

              <div className="space-y-1">
                <li className="text-xl">
                  How do I pay for my spiritual care and holistic support?
                </li>
                <li className="text-sm font-light">
                  We accept a variety of payment methods, including debit cards,
                  and Bank Transfers. You&apos;ll be asked to provide payment
                  information when you schedule your consultation.
                </li>
              </div>

              <div className="space-y-1">
                <li className="text-xl">
                  Is my personal and spiritual information secure?
                </li>
                <li className="text-sm font-light">
                  Yes! We take the security and privacy of your personal and
                  spiritual information very seriously.
                </li>
              </div>

              <div className="space-y-1">
                <li className="text-xl">
                  What if I need to cancel or reschedule my consultation?
                </li>
                <li className="text-sm font-light">
                  If you need to cancel or reschedule your consultation, simply
                  log in to your account and make the changes. Please note that
                  we have a 24-hour cancellation policy, so be sure to cancel or
                  reschedule at least 24 hours before your scheduled
                  consultation.
                </li>
              </div>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
