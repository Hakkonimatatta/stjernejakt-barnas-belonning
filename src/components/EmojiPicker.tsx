import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
  quickEmojis?: string[];
}

const emojiCategories = {
  godteri: ["🍦", "🍭", "🍬", "🍫", "🍩", "🍪", "🧁", "🎂", "🍰", "🍨", "🍧", "🥧", "🍮", "🍡", "🍯"],
  mat: ["🍕", "🍔", "🍟", "🌭", "🍿", "🧀", "🥐", "🍳", "🥞", "🧇", "🥯", "🥨", "🍞", "🌮", "🌯"],
  drikke: ["🧃", "🥤", "🧋", "☕", "🍵", "🥛", "🍼", "🧊", "🍶", "🍺", "🍹", "🧉", "🥂", "🍾", "🫖"],
  lek: ["🎮", "🎯", "🎪", "🎠", "🎡", "🎢", "🛝", "🎨", "🎭", "🎬", "🎤", "🎧", "🎸", "🎹", "🪀"],
  sport: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🏒", "🥅", "⛳", "🎿"],
  dyr: ["🐕", "🐈", "🐇", "🐹", "🦊", "🐻", "🐼", "🦁", "🐯", "🦄", "🐴", "🐮", "🐷", "🐸", "🦋"],
  natur: ["🌳", "🌸", "🌺", "🌻", "🌼", "🍀", "🌈", "⭐", "🌙", "☀️", "🌊", "🏖️", "🏔️", "🌴", "🍁"],
  aktiviteter: ["🧹", "🪥", "📚", "🎒", "🛏️", "🚿", "🍽️", "👕", "🧦", "🎵", "💪", "🧘", "🚴", "🏃", "✏️"],
  transport: ["🚗", "🚕", "🚌", "🚎", "🚐", "🚚", "🏎️", "🚀", "✈️", "🚁", "⛵", "🛶", "🚂", "🚲", "🛴"],
  gaver: ["🎁", "🎀", "🎈", "🎉", "🎊", "🏆", "🥇", "🥈", "🥉", "🎖️", "🏅", "💎", "💝", "💖", "💐"],
};

const allEmojis = Object.values(emojiCategories).flat();

// Keyword to emoji mapping for smart suggestions
const keywordEmojis: Record<string, string[]> = {
  // Godteri og mat
  is: ["🍦", "🍨", "🍧", "🧁", "🍰"],
  iskrem: ["🍦", "🍨", "🍧", "🧁", "🍰"],
  godteri: ["🍭", "🍬", "🍫", "🍪", "🧁"],
  sjokolade: ["🍫", "🍪", "🧁", "🍩", "🍰"],
  kake: ["🎂", "🍰", "🧁", "🍪", "🍩"],
  pizza: ["🍕", "🍔", "🍟", "🌭", "🍿"],
  popcorn: ["🍿", "🎬", "🎥", "📺", "🛋️"],
  brus: ["🥤", "🧃", "🧋", "🍹", "🧊"],
  juice: ["🧃", "🥤", "🍊", "🍎", "🍇"],
  
  // Aktiviteter og husarbeid
  rydd: ["🧹", "🧺", "🗑️", "📦", "🏠"],
  rom: ["🛏️", "🧹", "📦", "🏠", "🚪"],
  seng: ["🛏️", "😴", "🌙", "⭐", "🛋️"],
  tann: ["🪥", "🦷", "✨", "💪", "😁"],
  tenner: ["🪥", "🦷", "✨", "💪", "😁"],
  dusj: ["🚿", "🛁", "🧴", "🧼", "💧"],
  bad: ["🛁", "🚿", "🧴", "🧼", "💧"],
  klær: ["👕", "👖", "🧦", "👗", "🧥"],
  sko: ["👟", "👞", "🥾", "👢", "🧦"],
  mat: ["🍽️", "🍳", "🥗", "🍲", "🥘"],
  spis: ["🍽️", "🍴", "🥄", "🍲", "🥗"],
  lekser: ["📚", "✏️", "📖", "🎒", "💡"],
  les: ["📚", "📖", "📕", "📗", "🔖"],
  
  // Sport og lek
  fotball: ["⚽", "🏃", "🥅", "🏆", "🎽"],
  ball: ["⚽", "🏀", "🏈", "🎾", "🏐"],
  sykkel: ["🚴", "🚲", "🛴", "🏃", "🌳"],
  løp: ["🏃", "👟", "🏅", "💪", "🎽"],
  svøm: ["🏊", "🌊", "🏖️", "💧", "🥽"],
  spill: ["🎮", "🕹️", "🎯", "🎲", "🃏"],
  tv: ["📺", "🎬", "🍿", "🛋️", "🎥"],
  film: ["🎬", "📺", "🍿", "🎥", "🎞️"],
  tegn: ["🎨", "✏️", "🖍️", "🖌️", "📝"],
  mal: ["🎨", "🖌️", "🖍️", "✏️", "📝"],
  musikk: ["🎵", "🎶", "🎸", "🎹", "🎤"],
  sang: ["🎤", "🎵", "🎶", "🎧", "🎼"],
  dans: ["💃", "🕺", "🎵", "🎶", "🩰"],
  
  // Dyr
  hund: ["🐕", "🦮", "🐶", "🐾", "🦴"],
  katt: ["🐈", "🐱", "🐾", "🧶", "🐟"],
  kanin: ["🐇", "🐰", "🥕", "🌿", "🐾"],
  fisk: ["🐟", "🐠", "🐡", "🌊", "🐚"],
  hamster: ["🐹", "🐾", "🧀", "🌻", "🏠"],
  
  // Gaver og belønninger
  gave: ["🎁", "🎀", "🎉", "🎊", "💝"],
  overraskel: ["🎁", "🎉", "🎊", "🎈", "✨"],
  fest: ["🎉", "🎊", "🎈", "🎂", "🥳"],
  bursdags: ["🎂", "🎈", "🎁", "🎉", "🥳"],
  tur: ["🚗", "🏖️", "🏔️", "🌳", "🚌"],
  lekeplass: ["🛝", "🎠", "🎡", "🎢", "🏃"],
  park: ["🌳", "🌸", "🦋", "🐿️", "🌺"],
  kino: ["🎬", "🍿", "🎥", "📺", "🎞️"],
  zoo: ["🦁", "🐘", "🦒", "🐵", "🦓"],
  dyrepark: ["🦁", "🐘", "🦒", "🐵", "🦓"],
};

const defaultQuickEmojis = ["🍦", "🎮", "🎁", "⚽", "🐕"];

export const getSuggestedEmojis = (text: string): string[] => {
  if (!text || text.trim().length === 0) {
    return defaultQuickEmojis;
  }
  
  const lowerText = text.toLowerCase();
  
  for (const [keyword, emojis] of Object.entries(keywordEmojis)) {
    if (lowerText.includes(keyword)) {
      return emojis;
    }
  }
  
  return defaultQuickEmojis;
};

const EmojiPicker = ({ value, onChange, placeholder = "Velg emoji", quickEmojis = defaultQuickEmojis }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredEmojis = search
    ? (() => {
        const lowerSearch = search.toLowerCase();
        const matchedEmojis = new Set<string>();
        
        // Search by keywords
        for (const [keyword, emojis] of Object.entries(keywordEmojis)) {
          if (keyword.includes(lowerSearch) || lowerSearch.includes(keyword)) {
            emojis.forEach(emoji => matchedEmojis.add(emoji));
          }
        }
        
        if (value) {
          matchedEmojis.delete(value);
        }
        return Array.from(matchedEmojis);
      })()
    : [];

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {quickEmojis.map((emoji) => (
          <Button
            key={emoji}
            type="button"
            variant={value === emoji ? "default" : "outline"}
            onClick={() => onChange(emoji)}
            className="h-12 w-12 text-2xl p-0"
          >
            {emoji}
          </Button>
        ))}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-full text-lg justify-center gap-2"
          >
            {value ? (
              <>
                <span className="text-2xl">{value}</span>
                <span className="text-sm text-muted-foreground">Endre</span>
              </>
            ) : (
              <span>🔍 Søk emoji</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3 bg-popover" align="start">
          <div className="space-y-3">
            <Input
              placeholder="Søk emoji..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10"
            />
            
            {search ? (
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {filteredEmojis.length > 0 ? (
                  filteredEmojis.map((emoji, i) => (
                    <Button
                      key={`${emoji}-${i}`}
                      variant="ghost"
                      className="h-10 w-10 text-xl p-0"
                      onClick={() => handleSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))
                ) : (
                  <p className="col-span-6 text-center text-muted-foreground py-4">
                    Ingen treff
                  </p>
                )}
              </div>
            ) : (
              <Tabs defaultValue="godteri" className="w-full">
                <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent">
                  {Object.keys(emojiCategories).map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="text-xs px-2 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <TabsContent key={category} value={category} className="mt-2">
                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                      {emojis.map((emoji, i) => (
                        <Button
                          key={`${emoji}-${i}`}
                          variant={value === emoji ? "default" : "ghost"}
                          className="h-10 w-10 text-xl p-0"
                          onClick={() => handleSelect(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
