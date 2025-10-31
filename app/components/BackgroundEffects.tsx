import { COLORS } from '../constants/colors';

export default function BackgroundEffects() {
  return (
    <>
      {/* Grid Lines */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="relative w-full max-w-[1440px] h-full">
          {/* Horizontal Lines */}
          <div className="absolute left-[10%] md:left-[352px] top-[15%] md:top-[186px] flex gap-8 md:gap-16 opacity-30 md:opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="w-px h-[500px] md:h-[648.5px] bg-[#a0a0a0]"
              />
            ))}
          </div>
          
          {/* Vertical Lines */}
          <div className="absolute left-[10%] md:left-[321px] top-[20%] md:top-[248.5px] w-[80%] md:w-[799px] flex flex-col gap-8 md:gap-14 opacity-30 md:opacity-40">
            {Array.from({ length: 11 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="w-full h-px bg-[#a0a0a0]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Radial Gradient Overlay - expanded to cover entire viewport */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.85) 65%, #FFFFFF 90%)",
        }}
      />

      {/* Blue Blur Ellipses */}
      <div 
        className="absolute z-0 right-[-40%] top-[-10%] md:right-[-120px] md:top-[69px] w-[380px] h-[520px] md:w-96 md:h-[706.75px] origin-top-left rotate-[40deg] md:rotate-[54.89deg] rounded-full blur-[160px] md:blur-[200px]"
        style={{ backgroundColor: COLORS.blurEllipse1 }}
      />
      <div 
        className="absolute z-0 left-[-40%] bottom-[-10%] md:left-[8px] md:top-[370.79px] w-[420px] h-[600px] md:w-[509.87px] md:h-[884.44px] origin-top-left -rotate-[28deg] md:-rotate-[39.86deg] rounded-full blur-[160px] md:blur-[200px]"
        style={{ backgroundColor: COLORS.blurEllipse2 }}
      />

      {/* Cloud Images */}
      <img
        className="absolute z-0 w-[260px] h-[150px] right-[-40px] top-[220px] opacity-60 md:w-[662px] md:h-96 md:left-[843px] md:top-[234px] md:right-auto"
        src="/assets/cloud.png"
        alt=""
        width={662}
        height={372}
      />
      <img
        className="absolute z-0 w-[260px] h-[150px] left-[-60px] bottom-[120px] opacity-60 md:w-[662px] md:h-96 md:left-[-97px] md:top-[517px] md:bottom-auto"
        src="/assets/cloud.png"
        alt=""
        width={662}
        height={372}
      />
      <img
        className="absolute z-0 hidden md:block w-[662px] h-96 left-[760px] top-[812.57px] origin-top-left rotate-180 opacity-20"
        src="/assets/cloud.png"
        alt=""
        width={662}
        height={372}
      />
      <img
        className="absolute z-0 hidden md:block w-[662px] h-96 left-[1281px] top-[546.57px] origin-top-left rotate-180 opacity-40"
        src="/assets/cloud.png"
        alt=""
        width={662}
        height={372}
      />
    </>
  );
}