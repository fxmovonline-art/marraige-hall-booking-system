import { InfiniteSlider } from "@/components/InfiniteSlider";
import { MarriageFaqSection } from "@/components/MarriageFaqSection";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/prisma";

import { WavyBackground } from "@/components/ui/wavy-background";
import SpecialHallBlob from "@/components/SpecialHallBlob";
import { SearchBar } from "@/components/search-bar";

export default async function Home() {
  const authorities = [
    { logo: "/vercel.svg", name: "Marriage Halls Association" },
    { logo: "/globe.svg", name: "City Development Authority" },
    { logo: "/file.svg", name: "Federal Board of Revenue" },
    { logo: "/window.svg", name: "Tourism Management Office" },
    { logo: "/next.svg", name: "Civic Health & Safety" },
  ];

  const halls = await prisma.hall.findMany({
    where: {
      status: "APPROVED",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <>
      <WavyBackground
        containerClassName="h-[72vh] min-h-[460px]"
        className="mx-auto w-full max-w-5xl px-6 text-center"
        backgroundFill="#014421"
        blur={1}
        waveWidth={44}
        waveOpacity={0.4}
      >
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Book verified halls with confidence.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-200 md:text-lg">
          Explore approved wedding venues, compare capacities and pricing, and pick a location that fits your event perfectly.
        </p>
        <div className="mt-8 flex justify-center">
          <SearchBar />
        </div>
      </WavyBackground>

      <div id="blur-area" className="transition-[filter] duration-300">

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#014421_0%,#026440_45%,#013220_100%)] py-10">
        <div className="pointer-events-none absolute -left-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-yellow-400/20 blur-3xl"></div>
        <div className="pointer-events-none absolute -right-20 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-yellow-500/20 blur-3xl"></div>

        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-yellow-300/85">
            Trusted by Regulatory Authorities
          </p>

          <div className="relative mt-6 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 relative z-10">
              {authorities.map((authority, idx) => (
                <div
                  key={authority.name}
                  className="group relative overflow-hidden rounded-2xl border border-yellow-300/25 bg-zinc-950/70 p-4 shadow-[0_0_0_1px_rgba(255,215,120,0.08),0_18px_45px_-22px_rgba(255,200,80,0.45)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-yellow-200/45"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_15%,rgba(255,224,130,0.18)_45%,transparent_75%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-yellow-200/35 bg-[radial-gradient(circle_at_30%_20%,#ffe6a8_0%,#c8972f_45%,#8e6918_100%)]">
                      <img
                        src={authority.logo}
                        alt={authority.name + " logo"}
                        className="h-8 w-8 object-contain drop-shadow-[0_2px_8px_rgba(255,215,80,0.18)]"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs font-medium uppercase leading-5 tracking-[0.12em] text-zinc-200/90">
                      {authority.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Blob SVG below the authority strip */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
            {/* Blob on the left, larger size */}
            <div className="flex-shrink-0 flex justify-center w-full md:w-auto">
              <img
                src="/blob.svg"
                alt="Decorative blob"
                className="w-92 h-92 md:w-96 md:h-96 opacity-80 pointer-events-none select-none"
                aria-hidden="true"
              />
            </div>
            {/* Text content on the right */}
            <div className="flex flex-col items-center md:items-start max-w-xl text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-yellow-200 mb-3">Why Book With Us?</h2>
              <p className="text-base md:text-lg text-zinc-200/90">
                Enjoy peace of mind with verified venues, transparent pricing, and trusted regulatory oversight. Our platform ensures your event is in safe hands from start to finish.
              </p>
            </div>
          </div>
        </div>
        </section>
        

      {/* Infinite Slider Section: Two rows, opposite directions */}
      <div className="py-12 bg-gradient-to-b from-[#013220] to-[#014421] flex flex-col gap-8">
        {/* Top row: left to right */}
        <InfiniteSlider gap={32} duration={30} className="mb-2">
          <img src="/Slider1/bogdanazvyagolska-park-7407081_1920.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 1-1" />
          <img src="/Slider1/groom-putting-ring-bride-s-finger.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 1-2" />
          <img src="/Slider1/jeanborges-rings-1196145_1920.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 1-3" />
          <img src="/Slider1/sonamabcd-wedding-4445670_1920.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 1-4" />
          <img src="/Slider1/toanmda-couple-443600_1920.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 1-5" />
        </InfiniteSlider>
        {/* Bottom row: right to left */}
        <InfiniteSlider gap={32} duration={30} reverse className="mt-2">
          <img src="/Slider2/anncapictures-roses-1420719_1920.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 2-1" />
          <img src="/Slider2/innokurnia-wedding-4297343_1920.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 2-2" />
          <img src="/Slider2/jessbaileydesign-roses-3072698_1920.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 2-3" />
          <img src="/Slider2/olcayertem-bride-6230410_1920.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 2-4" />
          <img src="/Slider2/stocksnap-sunset-698501_1920.jpg" className="w-40 h-52 object-cover rounded-xl" alt="Slider 2-5" />
        </InfiniteSlider>
      </div>

        {/* Marriage Features Section */}
        <section className="py-16 bg-[linear-gradient(135deg,#014421_0%,#026440_45%,#013220_100%)]">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
              Why Choose Us For Your Marriage Event?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex items-center justify-center w-14 h-14 rounded-lg bg-[#014421]">
                  <span className="text-3xl">💍</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Verified Venues</h3>
                <p className="text-zinc-300">All marriage halls are thoroughly vetted for quality, safety, and authenticity, ensuring your big day is in trusted hands.</p>
              </div>
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex items-center justify-center w-14 h-14 rounded-lg bg-[#014421]">
                  <span className="text-3xl">💐</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Custom Decor & Themes</h3>
                <p className="text-zinc-300">Personalize your event with a wide range of decor options and themes to match your dream wedding style.</p>
              </div>
              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex items-center justify-center w-14 h-14 rounded-lg bg-[#014421]">
                  <span className="text-3xl">🎂</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Catering Excellence</h3>
                <p className="text-zinc-300">Enjoy a curated selection of top-tier caterers offering diverse menus to delight every guest at your celebration.</p>
              </div>
              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex items-center justify-center w-14 h-14 rounded-lg bg-[#014421]">
                  <span className="text-3xl">🚗</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">End-to-End Support</h3>
                <p className="text-zinc-300">From booking to the last dance, our team is with you every step, ensuring a seamless and memorable wedding experience.</p>
              </div>
            </div>
          </div>
        </section>
        {/* FAQ Section */}
        <MarriageFaqSection />
        <Footer />

      </div>
    </>
    
  );
}
