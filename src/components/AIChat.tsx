import { useState } from 'react';
import { Send, Sparkles, MessageSquare, Calendar, HelpCircle, RefreshCw, X, ArrowUpRight } from 'lucide-react';
import { ChatMessage, TimetableEvent } from '../types';
import { synth } from '../utils/synth';

interface AIChatProps {
  userName: string;
  currentSchedule: TimetableEvent[];
  onAddEventSuggestion: (title: string, desc: string, startTime: string, endTime: string) => void;
}

export default function AIChat({
  userName,
  currentSchedule,
  onAddEventSuggestion
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `✨ Greetings, **${userName}**! \n\nI am your **TimeMate AI Coach**, here to keep your daily companion components organized. \n\nHow can I help you optimize your timetable or habit tracking?`,
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestionEvent, setSuggestionEvent] = useState<{title: string; desc: string; startTime: string; endTime: string} | null>(null);

  // Instant acceleration presets
  const presets = [
    { text: "Suggest study slots", prompt: "Suggest an eye-safe study timetable deep work focus block for exam preparation today." },
    { text: "Explain Focus rule", prompt: "What is the science behind Pomodoro intervals and taking breaks for maximum stamina?" },
    { text: "Hydration interval", prompt: "Suggest a healthy Water reminder interval schedule for active office workers." }
  ];

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() || loading) return;

    synth.playBubble();
    
    // Add User message
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);
    setSuggestionEvent(null);

    try {
      // Connect to the Express server-side `/api/chat` route!
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ sender: m.sender, text: m.text })),
          userProfile: { name: userName },
          currentSchedule
        })
      });

      if (!res.ok) throw new Error("API call interrupted.");
      const reply = await res.json();

      // Add AI reply
      setMessages(p => [...p, {
        id: Math.random().toString(36).substring(7),
        sender: 'ai',
        text: reply.text || "I remain ready to structure your timetable.",
        timestamp: new Date().toISOString()
      }]);

      // Simple keyword parse to simulate helpful suggested events (e.g. "Draft study slot" or user request)
      if (promptToSend.toLowerCase().includes('study') || promptToSend.toLowerCase().includes('suggest study')) {
        setSuggestionEvent({
          title: "💻 AI Deep Work Session",
          desc: "Deep focus study block recommended by TimeMate AI Coach",
          startTime: "14:00",
          endTime: "16:00"
        });
      } else if (promptToSend.toLowerCase().includes('water') || promptToSend.toLowerCase().includes('hydration')) {
        setSuggestionEvent({
          title: "💧 AI Hydration break",
          desc: "Mandatory system relaxation and glass drink interval",
          startTime: "11:00",
          endTime: "11:15"
        });
      }
      synth.playSuccess();
    } catch (e) {
      console.error(e);
      setMessages(p => [...p, {
        id: Math.random().toString(36).substring(7),
        sender: 'ai',
        text: "⚡ Transaction error communicating with Server Companion. Please verify Secrets panel configuring `GEMINI_API_KEY`.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const executeAddSuggest = () => {
    if (!suggestionEvent) return;
    synth.playSuccess();
    onAddEventSuggestion(
      suggestionEvent.title,
      suggestionEvent.desc,
      suggestionEvent.startTime,
      suggestionEvent.endTime
    );
    // Notify
    setMessages(p => [...p, {
      id: Math.random().toString(36).substring(7),
      sender: 'ai',
      text: `✅ Fantastic! I've successfully written **${suggestionEvent.title}** (${suggestionEvent.startTime} - ${suggestionEvent.endTime}) directly into your **Smart Timetable**. Check your agenda tab!`,
      timestamp: new Date().toISOString()
    }]);
    setSuggestionEvent(null);
  };

  return (
    <div className="flex flex-col h-[520px] bg-white dark:bg-gray-800 rounded-3xl border border-gray-105 dark:border-gray-750 shadow-md overflow-hidden font-sans">
      
      {/* Header section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 shrink-0 flex items-center gap-3 text-white">
        <div className="p-2 bg-white/10 rounded-2xl">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse fill-yellow-300" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm leading-tight">TimeMate AI Coach</h3>
          <p className="text-[10px] text-indigo-200">Aesthetic scheduling intelligence active</p>
        </div>
      </div>

      {/* Messages dialogue board */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40 dark:bg-gray-850/20">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start animate-fade-in'}`}>
            <div className={`rounded-2xl p-3.5 max-w-[85%] text-xs leading-normal shadow-xs ${
              m.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-gray-750 text-gray-800 dark:text-gray-250 rounded-tl-none border border-gray-100 dark:border-gray-700'
            }`}>
              {/* Replace literal breaks with proper tags */}
              <div className="whitespace-pre-wrap font-medium">
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {/* AI typing state loader */}
        {loading && (
          <div className="flex justify-start items-center gap-2 text-gray-400 text-xs py-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-555" />
            <span className="font-semibold italic">Consulting companion scheduling databases...</span>
          </div>
        )}

        {/* Suggested Scheduler card block */}
        {suggestionEvent && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-955/30 border border-indigo-150 dark:border-indigo-900/50 rounded-2xl space-y-2.5 animate-fade-in max-w-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-550 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded">Smart Suggestion</span>
                <h4 className="text-xs font-black text-gray-800 dark:text-gray-150 mt-1.5 leading-none">{suggestionEvent.title}</h4>
              </div>
              <button onClick={() => setSuggestionEvent(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            
            <p className="text-[11px] text-gray-500 leading-tight">{suggestionEvent.desc}</p>
            
            <div className="text-[10px] font-black text-indigo-600 font-mono">
              Proposed Schedule: {suggestionEvent.startTime} - {suggestionEvent.endTime}
            </div>

            <button
              onClick={executeAddSuggest}
              className="w-full py-2 bg-indigo-650 text-white rounded-xl text-[10px] font-bold shadow-xs hover:bg-indigo-700 flex items-center justify-center gap-1"
            >
              Add To My Timetable <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Preset fast prompt accelerators */}
      {messages.length === 1 && (
        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-750 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide select-none">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.prompt)}
              className="py-1.5 px-3 bg-gray-55 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-750 text-gray-450 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 text-[10px] font-black rounded-lg whitespace-nowrap transition-colors border border-gray-100 dark:border-gray-700 shrink-0"
            >
              {p.text}
            </button>
          ))}
        </div>
      )}

      {/* Message input trigger bottom segment */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-750 flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI Coach for study slots or tips..."
          className="flex-1 bg-gray-55 dark:bg-gray-750 text-gray-900 dark:text-white px-4 py-2.5 rounded-2xl text-xs focus:outline-none border-transparent font-medium"
        />
        <button
          onClick={() => handleSend()}
          className="p-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4 fill-current" />
        </button>
      </div>

    </div>
  );
}
