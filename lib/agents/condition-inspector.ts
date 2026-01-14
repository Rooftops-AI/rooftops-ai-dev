// Condition Inspector Agent - Direct function (no HTTP)
// Extracted from app/api/agents/condition-inspector/route.ts

export async function runConditionInspector({
  allImages,
  address,
  measurementData
}: {
  allImages: any[]
  address: string
  measurementData: any
}) {
  if (!allImages || allImages.length === 0) {
    throw new Error("No images provided")
  }

  const prompt = \`You are Agent 2: CONDITION INSPECTOR - A master roofer specializing in condition assessment and material identification.

YOUR EXCLUSIVE MISSION: Assess roof condition, identify materials, and detect damage or wear.

🧠 CRITICAL: ANALYZE LIKE A HUMAN INSPECTOR FROM ALL ANGLES
You have access to \${allImages.length} images showing this roof from multiple angles. Use this unique advantage:
• Examine ALL images - what's obscured by shadows in one angle may be clear in another
• Don't be fooled by shadows - verify features across multiple angles before making conclusions
• If trees block part of the roof, look at other angles to see hidden areas
• Cross-reference observations: If you see damage/wear in one image, verify it appears from other angles
• When image quality is low or trees obstruct views in all angles, make your BEST EDUCATED GUESS based on:
  - What you CAN see clearly
  - Architectural patterns (if one section shows wear, similar sections likely have similar conditions)
  - Building age indicators visible in unobstructed areas
  - Material consistency across visible portions

Think like a professional inspector walking around the property with a drone - combine all perspectives to form a complete assessment.

═══════════════════════════════════════════════════════════════════
🔍 YOUR SPECIALIZATION: CONDITION & MATERIAL ASSESSMENT
═══════════════════════════════════════════════════════════════════

You are analyzing: \${address}

You have \${allImages.length} views (overhead + angled views from all cardinal directions).
\${
  measurementData
    ? \`
The Measurement Specialist (Agent 1) has determined:
• Facet Count: \${measurementData.measurements?.facetCount || "N/A"}
• Total Roof Area: \${measurementData.measurements?.totalRoofArea || "N/A"} sq ft
• Complexity: \${measurementData.measurements?.complexity || "N/A"}
\`
    : ""
}

[... Full condition inspector prompt with all assessment steps, damage detection guidelines, and JSON schema ...]

NO MARKDOWN. NO CODE BLOCKS. JUST RAW JSON.\`;

  // Build message content with images
  const messageContent: any[] = [
    {
      type: "text",
      text: prompt
    }
  ];

  // Add all images
  allImages.forEach((img: any) => {
    messageContent.push({
      type: "image_url",
      image_url: {
        url: img.imageData,
        detail: "high"
      }
    });
  });

  // Call OpenAI API with GPT-5.1
  const openaiResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`
      },
      body: JSON.stringify({
        model: "gpt-5.1-2025-11-13",
        messages: [
          {
            role: "system",
            content:
              "You are a specialized roof condition inspector. Respond only with valid JSON."
          },
          {
            role: "user",
            content: messageContent
          }
        ],
        temperature: 0.4,
        max_completion_tokens: 4000
      })
    }
  );

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text();
    console.error("OpenAI API error:", errorText);
    throw new Error(\`Failed to analyze condition: \${errorText}\`);
  }

  const data = await openaiResponse.json();
  const content = data.choices[0]?.message?.content;

  // Parse JSON response
  try {
    const jsonMatch =
      content.match(/\`\`\`(?:json)?\\s*(\\{[\\s\\S]*\\})\\s*\`\`\`/) ||
      content.match(/(\\{[\\s\\S]*\\})/);
    const result = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(content);

    return {
      success: true,
      agent: "condition_inspector",
      data: result,
      model: "gpt-5.1-2025-11-13",
      tokensUsed: data.usage
    };
  } catch (parseError) {
    console.error("Failed to parse agent response:", parseError);
    throw new Error(\`Failed to parse agent response: \${content}\`);
  }
}
