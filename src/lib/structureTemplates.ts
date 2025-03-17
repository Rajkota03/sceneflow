
import { Structure, Act, Beat, ActType } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to create a Beat
const createBeat = (
  title: string, 
  description: string, 
  timePosition: number, 
  pageRange: string = "X-Y", 
  notes: string = ""
): Beat => ({
  id: uuidv4(),
  title,
  description,
  timePosition,
  pageRange,
  complete: false,
  notes
});

// Three Act Structure
export const createThreeActStructure = (id: string): Structure => {
  const act1: Act = {
    id: uuidv4(),
    title: "Act 1: Setup",
    colorHex: "#3b82f6", // blue
    startPosition: 0,
    endPosition: 25,
    act_type: ActType.ACT_1,
    beats: [
      createBeat(
        "🔹 Hook (Page X-Y)",
        "🎯 The opening moment that sets the tone and grabs attention.",
        2,
        "X-Y",
        "Introduces protagonist, world, and theme."
      ),
      createBeat(
        "🔹 Set-Up (Page X-Y)",
        "📝 Introduce characters, their goals, and the stakes.",
        8,
        "X-Y",
        "Establish protagonist's ordinary world.\nIntroduce key relationships and foreshadow conflicts."
      ),
      createBeat(
        "🔹 Inciting Incident (Page X-Y)",
        "🚀 The \"Call to Adventure\"—an event that disrupts the protagonist's world.",
        12,
        "X-Y",
        "Shakes up the normal world.\nIntroduces the main conflict."
      ),
      createBeat(
        "🔹 Build-Up (Page X-Y)",
        "🔥 Preparing for the transition into the main conflict.",
        18,
        "X-Y",
        "Rising action leads to First Plot Point.\nAntagonist or external force strengthens."
      ),
      createBeat(
        "🔹 1st Plot Point (Page X-Y)",
        "🚪 Marks the transition from Act 1 to Act 2.",
        24,
        "X-Y",
        "The point of no return."
      ),
    ]
  };
  
  const act2: Act = {
    id: uuidv4(),
    title: "Act 2: Confrontation",
    colorHex: "#f59e0b", // amber
    startPosition: 25,
    endPosition: 75,
    act_type: ActType.ACT_2A,
    beats: [
      createBeat(
        "🔹 1st Pinch Point (Page X-Y)",
        "🎭 A reminder of the antagonist's strength or new information that raises stakes.",
        35,
        "X-Y",
        "The protagonist struggles to react."
      ),
      createBeat(
        "🔹 Midpoint (Page X-Y)",
        "⚡ A game-changing revelation shifts the protagonist's perspective.",
        50,
        "X-Y",
        "Biggest shift in the protagonist's goal/motivation.\nFalse victory or devastating loss."
      ),
      createBeat(
        "🔹 2nd Pinch Point (Page X-Y)",
        "⚠️ A foreshadowing event that reinforces what's at stake.",
        65,
        "X-Y",
        "Antagonist strengthens or executes a major move."
      ),
    ]
  };
  
  const act3: Act = {
    id: uuidv4(),
    title: "Act 3: Resolution",
    colorHex: "#ef4444", // red
    startPosition: 75,
    endPosition: 100,
    act_type: ActType.ACT_3,
    beats: [
      createBeat(
        "🔹 Renewed Push (Page X-Y)",
        "💥 The protagonist starts taking charge and moving toward the final battle.",
        78,
        "X-Y",
        "Shifts from reaction to action."
      ),
      createBeat(
        "🔹 3rd Plot Point (Page X-Y)",
        "🌑 A dark moment—the protagonist faces a major loss or setback.",
        85,
        "X-Y",
        "The antagonist gains the upper hand."
      ),
      createBeat(
        "🔹 Climax (Page X-Y)",
        "🏆 The final confrontation—the protagonist vs. antagonist.",
        90,
        "X-Y",
        "Protagonist fully transforms and takes decisive action."
      ),
      createBeat(
        "🔹 Resolution (Page X-Y)",
        "🌅 The final moments—tying up loose ends and leaving an emotional impact.",
        95,
        "X-Y",
        "Shows the protagonist's changed world."
      )
    ]
  };

  return {
    id,
    name: "Three Act Structure",
    description: "The classic structure dividing a story into Setup, Confrontation, and Resolution.",
    acts: [act1, act2, act3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    structure_type: "three_act"
  };
};

// Save the Cat Structure
export const createSaveTheCatStructure = (id: string): Structure => {
  const act: Act = {
    id: uuidv4(),
    title: "Save the Cat Beats",
    colorHex: "#8b5cf6", // purple
    startPosition: 0,
    endPosition: 100,
    act_type: ActType.ACT_1, // Using ACT_1 as a generic type since Save the Cat doesn't fit neatly into the ActType enum
    beats: [
      createBeat(
        "🔹 Opening Image (Page 1)",
        "A snapshot of the protagonist's life before the transformation begins.",
        1,
        "1",
        "Sets up the tone, mood, and the initial state of the hero."
      ),
      createBeat(
        "🔹 Theme Stated (Page 5)",
        "Someone (usually not the protagonist) states the theme of the film.",
        5,
        "5",
        "Often a throwaway line that encapsulates the message of the story."
      ),
      createBeat(
        "🔹 Set-Up (Pages 1-10)",
        "We meet the protagonist and learn about their life, flaws, and what needs fixing.",
        7,
        "1-10",
        "Introduce all the character's flaws that will need to be addressed."
      ),
      createBeat(
        "🔹 Catalyst (Page 12)",
        "A life-changing event that sets the story in motion.",
        12,
        "12",
        "Also called the 'inciting incident' - something that disrupts the status quo."
      ),
      createBeat(
        "🔹 Debate (Pages 12-25)",
        "The protagonist wrestles with the question raised by the catalyst.",
        18,
        "12-25",
        "Character asks: Should I go? Should I do this? What will happen if I do?"
      ),
      createBeat(
        "🔹 Break into Two (Page 25)",
        "The protagonist makes a choice and enters a new world or situation.",
        25,
        "25",
        "Character answers the Debate question with action. The story truly begins."
      ),
      createBeat(
        "🔹 B Story (Page 30)",
        "A secondary story or relationship begins, often providing the solution to the main story.",
        30,
        "30",
        "Usually introduces a love interest or mentor who helps with the transformation."
      ),
      createBeat(
        "🔹 Fun and Games (Pages 30-55)",
        "The 'promise of the premise' - the entertaining section where we explore the concept.",
        42,
        "30-55",
        "The heart of the movie - the trailer moments that deliver on the premise."
      ),
      createBeat(
        "🔹 Midpoint (Page 55)",
        "Raises the stakes and pushes the hero toward the second half of the journey.",
        55,
        "55",
        "Either a false victory (things seem great) or false defeat (all is lost)."
      ),
      createBeat(
        "🔹 Bad Guys Close In (Pages 55-75)",
        "External and internal pressures mount as obstacles become greater.",
        65,
        "55-75",
        "External: villains advance. Internal: hero's flaws sabotage success."
      ),
      createBeat(
        "🔹 All Is Lost (Page 75)",
        "The opposite of the Midpoint - a devastating moment where all hope seems gone.",
        75,
        "75",
        "Often involves a death (literal or metaphorical)."
      ),
      createBeat(
        "🔹 Dark Night of the Soul (Pages 75-85)",
        "The protagonist's lowest point - wallowing in hopelessness.",
        80,
        "75-85",
        "Hero must decide whether to give up or find a new source of hope."
      ),
      createBeat(
        "🔹 Break into Three (Page 85)",
        "Thanks to a new idea, realization, or inspiration, the hero finds the solution.",
        85,
        "85",
        "The clue to success often comes from the B Story."
      ),
      createBeat(
        "��� Finale (Pages 85-110)",
        "The hero proves they've changed and defeats the antagonist.",
        95,
        "85-110",
        "Hero executes the new plan, demonstrating their transformation."
      ),
      createBeat(
        "🔹 Final Image (Page 110)",
        "A mirror to the Opening Image that shows how much the protagonist has changed.",
        110,
        "110",
        "Bookends the story and demonstrates the complete transformation."
      )
    ]
  };

  return {
    id,
    name: "Save the Cat Beat Sheet",
    description: "Blake Snyder's popular screenwriting formula with 15 essential plot points.",
    acts: [act],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    structure_type: "save_the_cat"
  };
};

// Hero's Journey Structure
export const createHeroJourneyStructure = (id: string): Structure => {
  const act1: Act = {
    id: uuidv4(),
    title: "Act 1: Departure",
    colorHex: "#10b981", // emerald
    startPosition: 0,
    endPosition: 33,
    act_type: ActType.ACT_1,
    beats: [
      createBeat(
        "🔹 Ordinary World",
        "The hero's normal life before the adventure begins.",
        5,
        "1-10",
        "Establish the hero's everyday life, limitations, flaws, and desires."
      ),
      createBeat(
        "🔹 Call to Adventure",
        "A problem presents itself to the hero - an opportunity or challenge.",
        10,
        "10-15",
        "The inciting incident that disrupts the status quo and invites change."
      ),
      createBeat(
        "🔹 Refusal of the Call",
        "The hero initially resists the adventure due to fear or insecurity.",
        15,
        "15-20",
        "Hesitation, doubt, or reluctance to change. Exhibits the hero's flaws."
      ),
      createBeat(
        "🔹 Meeting with the Mentor",
        "The hero gains guidance, wisdom, or equipment for the journey ahead.",
        20,
        "20-25",
        "Encouragement and preparation for the challenges that lie ahead."
      ),
      createBeat(
        "🔹 Crossing the First Threshold",
        "The hero commits to the adventure and enters the Special World.",
        30,
        "25-35",
        "The point of no return - leaving the Ordinary World behind."
      )
    ]
  };
  
  const act2: Act = {
    id: uuidv4(),
    title: "Act 2: Initiation",
    colorHex: "#f59e0b", // amber
    startPosition: 33,
    endPosition: 66,
    act_type: ActType.ACT_2A,
    beats: [
      createBeat(
        "🔹 Tests, Allies, and Enemies",
        "The hero faces challenges, meets friends, and confronts enemies.",
        40,
        "35-45",
        "A series of obstacles that test the hero's resolve and skills."
      ),
      createBeat(
        "🔹 Approach to the Inmost Cave",
        "Preparations for the major challenge ahead.",
        45,
        "45-55",
        "Final preparations before facing the central ordeal."
      ),
      createBeat(
        "🔹 The Ordeal",
        "The hero faces their greatest fear or most difficult challenge.",
        55,
        "55-65",
        "A symbolic death and rebirth. The hero must change to overcome this challenge."
      ),
      createBeat(
        "🔹 Reward (Seizing the Sword)",
        "The hero achieves the goal or gains the treasure they sought.",
        60,
        "65-70",
        "Celebration, but the journey isn't over yet."
      )
    ]
  };
  
  const act3: Act = {
    id: uuidv4(),
    title: "Act 3: Return",
    colorHex: "#ef4444", // red
    startPosition: 66,
    endPosition: 100,
    act_type: ActType.ACT_3,
    beats: [
      createBeat(
        "🔹 The Road Back",
        "The hero commits to returning to the Ordinary World.",
        75,
        "70-80",
        "Dealing with the consequences of confronting the Ordeal."
      ),
      createBeat(
        "🔹 Resurrection",
        "The final test where the hero must use everything they've learned.",
        85,
        "80-90",
        "The climactic moment that demonstrates the hero's complete transformation."
      ),
      createBeat(
        "🔹 Return with the Elixir",
        "The hero returns home with something to improve the Ordinary World.",
        95,
        "90-100",
        "Bringing back wisdom, treasure, or healing to share with others."
      )
    ]
  };

  return {
    id,
    name: "Hero's Journey",
    description: "Joseph Campbell's monomyth structure used in countless stories across cultures.",
    acts: [act1, act2, act3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    structure_type: "hero_journey"
  };
};

// Dan Harmon's Story Circle
export const createStoryCircleStructure = (id: string): Structure => {
  const act: Act = {
    id: uuidv4(),
    title: "Story Circle",
    colorHex: "#ec4899", // pink
    startPosition: 0,
    endPosition: 100,
    act_type: ActType.ACT_1, // Using ACT_1 as a generic type since Story Circle doesn't fit neatly into the ActType enum
    beats: [
      createBeat(
        "🔹 1. You",
        "Establish a character in their zone of comfort.",
        5,
        "1-10",
        "Show the protagonist in their normal world with a clear status quo."
      ),
      createBeat(
        "🔹 2. Need",
        "The character wants something.",
        15,
        "10-20",
        "Express a desire or identify a problem that disrupts the protagonist's comfort."
      ),
      createBeat(
        "🔹 3. Go",
        "The character enters an unfamiliar situation.",
        25,
        "20-30",
        "Protagonist takes action, crossing the threshold into a new world or state of being."
      ),
      createBeat(
        "🔹 4. Search",
        "The character adapts to the new situation.",
        37,
        "30-45",
        "Protagonist experiences trials, gains allies, and encounters enemies as they search for what they need."
      ),
      createBeat(
        "🔹 5. Find",
        "The character finds what they wanted.",
        50,
        "45-55",
        "Protagonist gets what they initially thought they needed, but it may not be what they truly need."
      ),
      createBeat(
        "🔹 6. Take",
        "The character pays a price for getting what they wanted.",
        65,
        "55-70",
        "Actions have consequences - protagonist must face the results of their choices."
      ),
      createBeat(
        "🔹 7. Return",
        "The character returns to their familiar situation.",
        80,
        "70-90",
        "Protagonist returns to their original world but is fundamentally changed by the journey."
      ),
      createBeat(
        "🔹 8. Change",
        "The character has changed as a result of the journey.",
        95,
        "90-100",
        "Protagonist demonstrates how they've evolved and how their world is now different."
      )
    ]
  };

  return {
    id,
    name: "Story Circle",
    description: "Dan Harmon's circular story structure used in shows like Rick and Morty and Community.",
    acts: [act],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    structure_type: "story_circle"
  };
};
