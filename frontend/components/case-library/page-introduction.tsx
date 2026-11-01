export function PageIntroduction() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="grid grid-cols-1 md:grid-cols-[118px_1fr] lg:grid-cols-[132px_1fr] border-b-[1.5px] border-black"
    >
      {/* Left Section Rail 01 */}
      <div className="md:border-r-[1.5px] border-b md:border-b-0 border-black px-4 sm:px-5 py-3 md:py-7 bg-white">
        <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#D91C1F] leading-[1.35]">
          <div>01 /</div>
          <div>LIBRARY</div>
        </div>
      </div>

      {/* Asymmetric Two-Column Hero Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.58fr_1fr] bg-white">
        {/* Left Hero Column */}
        <div className="px-5 sm:px-8 py-6 sm:py-8">
          <div className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#D91C1F] mb-2">
            01 / LIBRARY
          </div>
          <h1
            id="hero-heading"
            className="text-[52px] sm:text-[68px] lg:text-[78px] font-black tracking-[-0.045em] leading-[0.92] text-black"
          >
            Case Law
            <br />
            Library
          </h1>
          <div className="w-14 h-[4px] bg-[#D91C1F] mt-5 mb-4" aria-hidden="true" />
          <p className="text-[17px] sm:text-[19px] text-neutral-800 leading-[1.4] max-w-[430px] font-normal">
            Search judgments, citations, and legal codes in one research index.
          </p>
        </div>

        {/* Right Hero Column */}
        <div className="px-5 sm:px-8 py-6 sm:py-8 border-t lg:border-t-0 border-neutral-200 flex items-stretch">
          <div className="w-full lg:border-l-[1.5px] lg:border-black lg:pl-8 flex flex-col justify-between py-1">
            <div>
              <h2 className="text-[12px] font-extrabold tracking-[0.11em] uppercase text-black leading-[1.45] mb-4">
                A COMPREHENSIVE
                <br />
                RESEARCH RESOURCE
              </h2>
              <p className="text-[13.5px] text-neutral-700 leading-[1.6] max-w-[330px]">
                Access judgments from courts across India, with advanced search and filtering to find relevant precedent quickly and accurately.
              </p>
            </div>
            <div className="w-16 h-[3.5px] bg-[#D91C1F] mt-6" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
