import Image from 'next/image';

export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 bg-white overflow-hidden pointer-events-none">
      {/* Grid Lines Container - offset for sidebar on desktop */}
      <div className="absolute md:left-[240px] left-0 top-0 w-full h-full max-w-[1440px]">
        {/* Horizontal Grid Lines */}
        <div className="absolute left-[31px] top-0 w-[1340px] h-[1024px]">
          {[0, 67, 134, 201, 268, 335, 402, 469, 536, 603, 670, 737, 804, 871, 938, 1005, 1072, 1139, 1206, 1273, 1340].map((left) => (
            <div
              key={`h-${left}`}
              className="absolute top-0 h-full w-px bg-gray-200 opacity-40"
              style={{ left: `${left}px` }}
            />
          ))}
        </div>
        
        {/* Vertical Grid Lines */}
        <div className="absolute left-0 top-[62px] w-[1440px] h-[944px]">
          {[0, 59, 118, 177, 236, 295, 354, 413, 472, 531, 590, 649, 708, 767, 826, 885, 944].map((top) => (
            <div
              key={`v-${top}`}
              className="absolute left-0 w-full h-px bg-gray-200 opacity-40"
              style={{ top: `${top}px` }}
            />
          ))}
        </div>
      </div>

      {/* White Radial Gradient Overlay */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full md:w-[1440px] md:h-[1024px] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(ellipse 45.844% 32.6% at center, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
        }}
      />

      {/* Blur Ellipse 1 - Top Right Blue */}
      <div
        className="absolute right-[10%] top-[5%] w-[300px] h-[400px] 
                   md:left-[1091px] md:right-auto md:top-[69px] md:w-[812px] md:h-[740px]"
      >
        <div
          className="absolute inset-0 rounded-full blur-[150px] md:blur-[200px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(135, 185, 235, 0.8) 0%, rgba(135, 185, 235, 0.5) 50%, rgba(135, 185, 235, 0) 100%)',
          }}
        />
      </div>

      {/* Blur Ellipse 2 - Bottom Left Blue */}
      <div
        className="absolute left-[2%] bottom-[10%] w-[350px] h-[450px]
                   md:left-[8px] md:top-[371px] md:bottom-auto md:w-[958px] md:h-[1006px]"
      >
        <div
          className="absolute inset-0 rounded-full blur-[150px] md:blur-[200px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(135, 185, 235, 0.8) 0%, rgba(135, 185, 235, 0.5) 50%, rgba(135, 185, 235, 0) 100%)',
          }}
        />
      </div>

      {/* Cloud Images */}
      <div className="absolute left-[-97px] top-[175px] w-[1602px] h-[713.567px]">
        {/* Cloud 1 - Top Right (visible on all screens) */}
        <Image
          className="absolute right-[10%] top-[100px] w-[400px] h-[225px] 
                     md:left-[843px] md:right-auto md:top-[234px] md:w-[662px] md:h-[371.567px]"
          src="/assets/cloud.png"
          alt=""
          width={662}
          height={372}
          priority
        />
        
        {/* Cloud 2 - Bottom Left (visible on all screens) */}
        <Image
          className="absolute left-[-50px] bottom-[50px] w-[400px] h-[225px]
                     md:left-[-97px] md:top-[517px] md:bottom-auto md:w-[662px] md:h-[371.567px]"
          src="/assets/cloud.png"
          alt=""
          width={662}
          height={372}
        />
        
        {/* Cloud 3 - Bottom Middle (flipped, 20% opacity, hidden on mobile) */}
        <div className="hidden md:block absolute left-[760px] top-[441px] w-[662px] h-[371.567px]" style={{ transform: 'rotateY(180deg) scale(-1, 1)' }}>
          <Image
            className="opacity-20"
            src="/assets/cloud.png"
            alt=""
            width={662}
            height={372}
          />
        </div>
        
        {/* Cloud 4 - Top Middle (flipped, 40% opacity, hidden on mobile) */}
        <div className="hidden md:block absolute left-[1281px] top-[547px] w-[662px] h-[371.567px]" style={{ transform: 'rotate(180deg)' }}>
          <Image
            className="opacity-40"
            src="/assets/cloud.png"
            alt=""
            width={662}
            height={372}
          />
        </div>
      </div>
    </div>
  );
}
