export function getGreeting(): string {
  const hour = new Date().getHours()

  // Determine time period
  let greetings: string[]

  if (hour >= 5 && hour < 12) {
    // Morning (5am-11:59am)
    greetings = [
      "Good morning, let's rise and roof.",
      "Time to nail the day.",
      "Early bird gets the shingles.",
      "Morning. Let's peak.",
      "Rise up. Roof on.",
      "Good morning, sunshine and shingles.",
      "Let's get pitched up.",
      "Time to layer up.",
      "Morning crew. Let's climb.",
      "Another day, another ridge cap."
    ]
  } else if (hour >= 12 && hour < 18) {
    // Afternoon (12pm-5:59pm)
    greetings = [
      "Good afternoon, let's keep climbing.",
      "Halfway there. Stay elevated.",
      "Afternoon. Still rising.",
      "Let's finish strong today.",
      "Keep the momentum rolling.",
      "Good afternoon. Ridge time.",
      "Midday. High stakes.",
      "Afternoon crew. Let's seal it.",
      "Still daylight. Let's build.",
      "Good afternoon, let's cap it off."
    ]
  } else if (hour >= 18 && hour < 21) {
    // Evening (6pm-8:59pm)
    greetings = [
      "Good evening, let's wrap this up.",
      "Evening. Time to seal the deal.",
      "Sunset crew. Let's close strong.",
      "Good evening. Final layer.",
      "Late shift. Let's nail it.",
      "Evening. Make it count.",
      "Wrapping up? Let's finish.",
      "Good evening. Last ridge.",
      "Twilight crew. Let's go.",
      "Evening. One more job."
    ]
  } else {
    // Night (9pm-4:59am)
    greetings = [
      "Burning midnight shingles?",
      "Late night hustle. Respect.",
      "Night shift. Let's build.",
      "Working late? Let's roof.",
      "Moon's out. Quotes out.",
      "Late night grind. Let's go.",
      "Night owl? Let's work.",
      "Midnight crew. Rise up.",
      "Late night, high ambitions.",
      "Still working? Let's nail it."
    ]
  }

  // Return random greeting from appropriate array
  return greetings[Math.floor(Math.random() * greetings.length)]
}
