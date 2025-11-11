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
      <div className="w-full flex flex-wrap items-center gap-1">
        <div 
          className="text-[10px] md:text-[0.75rem] lg:text-[0.813rem] font-medium whitespace-nowrap"
          style={{ 
            fontFamily: 'var(--font-poppins)',
            color: '#181818'
          }}
        >
          Not Sure Where to Start?
        </div>
        <div 
          className="text-[10px] md:text-[0.75rem] lg:text-[0.813rem] font-medium"
          style={{ 
            fontFamily: 'var(--font-poppins)',
            color: '#181818'
          }}
        >
          Try one of these sample prompts:
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 items-start">
        {SAMPLE_PROMPTS.map((prompt, index) => (
          <div
            key={index}
            onClick={() => handlePromptClick(prompt)}
            className="w-full px-4 py-2 md:py-3 rounded-[12px] md:rounded-2xl border border-[#cbcbcb] hover:border-[#2d4e92] transition-colors cursor-pointer"
            style={{ 
              backgroundColor: COLORS.white
            }}
          >
            <div 
              className="text-[12px] md:text-[0.875rem] lg:text-[0.938rem] font-normal leading-normal"
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
