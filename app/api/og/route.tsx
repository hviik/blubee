import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'AI Travel Assistant';
  const description = searchParams.get('description') || 'Plan your perfect trip with Blubeez';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e8f5 50%, #a7c4d7 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: `
              radial-gradient(circle at 20% 80%, #2d4e92 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #2d4e92 0%, transparent 50%)
            `,
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <svg
              width="80"
              height="60"
              viewBox="0 0 112 80"
              style={{ marginRight: '16px' }}
            >
              <circle cx="56" cy="40" r="35" fill="#2d4e92" />
              <text
                x="56"
                y="48"
                textAnchor="middle"
                fill="white"
                fontSize="24"
                fontWeight="bold"
              >
                B
              </text>
            </svg>
            <span
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#2d4e92',
              }}
            >
              blubeez
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#132341',
              margin: '0 0 20px 0',
              lineHeight: 1.2,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '28px',
              color: '#475f73',
              margin: 0,
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>

          {/* Tagline */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '40px',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                color: '#6c7f8f',
              }}
            >
              www.blubeez.ai
            </span>
          </div>
        </div>

        {/* Bottom Border */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #2d4e92, #4a7bc7, #2d4e92)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
