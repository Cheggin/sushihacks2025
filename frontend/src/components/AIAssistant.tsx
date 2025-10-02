import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIAssistantProps {
  onClose: () => void;
  ctsData?: {
    severity: string;
    gripStrength: number;
    pinchStrength: number;
  } | null;
}

export default function AIAssistant({ onClose, ctsData }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI fishing assistant. I can help you with questions about fish handling, optimal fishing conditions, how your health impacts your fishing choices, and more. What would you like to know?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulated AI response (in production, this would call an LLM API)
  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerMessage = userMessage.toLowerCase();

    // Context-aware responses based on CTS data
    if (ctsData && (lowerMessage.includes('health') || lowerMessage.includes('carpal tunnel') || lowerMessage.includes('cts'))) {
      const healthContext = `Based on your current health data (${ctsData.severity} carpal tunnel, grip strength: ${ctsData.gripStrength.toFixed(1)}kg, pinch strength: ${ctsData.pinchStrength.toFixed(1)}kg), `;

      if (ctsData.severity === 'severe') {
        return healthContext + "I recommend focusing on lighter fish species that require less grip strength, such as mackerel or sardines. Consider using ergonomic fishing tools and taking frequent breaks. For larger catches like tuna, you may want to fish with a partner.";
      } else if (ctsData.severity === 'moderate') {
        return healthContext + "you should be mindful of prolonged gripping. I recommend alternating between lighter and heavier catches, using padded grips on your equipment, and doing hand stretches between catches.";
      } else {
        return healthContext + "your hand strength is good! You're well-suited for a variety of fish types, but remember to maintain proper form to prevent future issues.";
      }
    }

    // Fish handling questions
    if (lowerMessage.includes('mackerel') && lowerMessage.includes('handle')) {
      return "Mackerel are best handled with wet hands to protect their slime coating. Grip them firmly but gently behind the head, avoiding the sharp gill covers. They're oily fish, so rinse your hands afterward. For optimal freshness, immediately place them on ice.";
    }

    if (lowerMessage.includes('tuna') && (lowerMessage.includes('handle') || lowerMessage.includes('catch'))) {
      return "Tuna are powerful fish requiring strong grip and proper technique. Use a gaff for larger specimens. Always handle from the tail or gill plate. Due to their size and strength, they require significant grip strength - if you have carpal tunnel issues, consider using mechanical assistance or fishing with a partner.";
    }

    // Weather and fishing conditions
    if (lowerMessage.includes('weather') || lowerMessage.includes('condition') || lowerMessage.includes('when')) {
      return "Best fishing conditions typically occur during stable weather with temperatures between 20-25°C. Overcast days can be excellent as fish are more active. Avoid fishing during storms or extreme temperature changes. Early morning and late afternoon are usually the most productive times.";
    }

    // Fish recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('what fish') || lowerMessage.includes('should i catch')) {
      if (ctsData) {
        if (ctsData.severity === 'severe') {
          return "Given your current hand condition, I recommend targeting smaller species like sardines, anchovies, or mackerel. These require less grip strength and are still valuable catches. Consider using lighter tackle and ergonomic equipment.";
        } else if (ctsData.severity === 'moderate') {
          return "You can handle medium-sized fish like mackerel, small tuna, and sea bass comfortably. I'd suggest avoiding very large specimens and taking breaks between catches to prevent strain.";
        }
      }
      return "Based on current conditions, tuna, mackerel, and sea urchins are all excellent choices. Consider water temperature, time of day, and your equipment when making your selection.";
    }

    // Technique questions
    if (lowerMessage.includes('technique') || lowerMessage.includes('how to fish') || lowerMessage.includes('tips')) {
      return "Key fishing techniques: 1) Match your bait to local fish species, 2) Pay attention to tides and currents, 3) Use proper knots for your line, 4) Keep your equipment well-maintained, 5) Practice catch and release for sustainability, 6) Always use ergonomic grips to protect your hands and wrists.";
    }

    // Price and market questions
    if (lowerMessage.includes('price') || lowerMessage.includes('market') || lowerMessage.includes('sell')) {
      return "Fish prices vary by season, quality, and market demand. Tuna typically commands premium prices, especially bluefin. Mackerel and sardines are more affordable but consistent sellers. Check the Markets page for current price trends and predictions. Fresh, well-handled fish always fetch better prices.";
    }

    // Sustainability
    if (lowerMessage.includes('sustain') || lowerMessage.includes('environment') || lowerMessage.includes('conservation')) {
      return "Sustainable fishing is crucial for ocean health. Practice catch limits, avoid overfished species, use circle hooks to reduce bycatch, respect marine protected areas, and handle fish gently if releasing. Your fishing today ensures fish for tomorrow.";
    }

    // Default response
    return "I'm here to help with fishing advice! You can ask me about:\n\n• Fish handling techniques (e.g., 'how do I handle mackerel?')\n• How your health impacts fishing choices\n• Best fishing conditions and weather\n• Fish recommendations based on your abilities\n• Fishing techniques and tips\n• Market prices and trends\n• Sustainability practices\n\nWhat would you like to know more about?";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmitAsync();
  };

  const handleSubmitAsync = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateResponse(userMessage.content);
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try asking your question again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[600px] bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col ai-assistant-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Fishing Assistant</h2>
              <p className="text-xs text-white/60">Ask me anything about fishing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about fishing, fish handling, or your health..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/60 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-white/10 disabled:text-white/40 text-white rounded-lg transition-all flex items-center gap-2 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
