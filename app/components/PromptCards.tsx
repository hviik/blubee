import { COLORS } from '../constants/colors';

const SAMPLE_PROMPTS = [
  "Plan a 5-day trip to Bali with beaches, temples, and local food experiences",
  "Create a romantic weekend getaway itinerary in Italy for couples who love art, wine, and scenic views.",
  "Design a budget-friendly adventure trip to Thailand for 7 days with activities like snorkeling, hiking, and exploring islands."
];

interface PromptCardsProps {
  onPromptClick?: (prompt: string) => void;
}

export default function PromptCards({ onPromptClick }: PromptCardsProps) {
  const handlePromptClick = (prompt: string) => {
    if (onPromptClick) {
      onPromptClick(prompt);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 items-start">
      {/* Header */}
      <div className="w-full flex flex-wrap items-center gap-1 md:gap-2">
        <div 
          className="text-[0.625rem] sm:text-[0.688rem] md:text-[0.75rem] lg:text-[0.813rem] font-medium whitespace-nowrap"
          style={{ 
            fontFamily: 'var(--font-poppins)',
            color: COLORS.textPrimary
          }}
        >
          Not Sure Where to Start?
        </div>
        <div 
          className="text-[0.625rem] sm:text-[0.688rem] md:text-[0.75rem] lg:text-[0.813rem] font-medium"
          style={{ 
            fontFamily: 'var(--font-poppins)',
            color: COLORS.textPrimary
          }}
        >
          Try one of these sample prompts:
        </div>
      </div>

      {/* Prompt Cards */}
      <div className="w-full flex flex-col gap-3 items-start">
        {SAMPLE_PROMPTS.map((prompt, index) => (
          <div
            key={index}
            onClick={() => handlePromptClick(prompt)}
            className="w-full px-4 py-2 md:py-2 rounded-xl md:rounded-2xl outline outline-1 outline-offset-[-1px] hover:outline-[#2d4e92] transition-colors cursor-pointer"
            style={{ 
              backgroundColor: COLORS.white,
              outlineColor: COLORS.borderMedium
            }}
          >
            <div 
              className="text-[0.75rem] sm:text-[0.813rem] md:text-[0.875rem] lg:text-[0.938rem] font-normal leading-normal"
              style={{ 
                fontFamily: 'var(--font-poppins)',
                color: COLORS.textSecondary
              }}
            >
              {prompt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
