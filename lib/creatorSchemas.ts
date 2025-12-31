// lib/creatorSchemas.ts

export type FieldType =
  | {
      name: string
      label: string
      type: "text" | "textarea" | "select"
      options?: string[]
    }
  | { name: string; label: string; type: "number" }
  | { name: string; label: string; type: "date" }
  | { name: string; label: string; type: "logo" }

export interface ToolSchema {
  title: string
  description: string
  fields: FieldType[]
  buildPrompt: (values: Record<string, any>) => string
}

export const toolSchemas: Record<string, ToolSchema> = {
  proposal: {
    title: "Roofing Proposal Generator",
    description: "Create professional roofing proposals for customers",
    fields: [
      { name: "companyLogo", label: "Your Company Logo", type: "logo" },
      { name: "customerName", label: "Customer Name", type: "text" },
      { name: "propertyAddress", label: "Property Address", type: "text" },
      {
        name: "roofType",
        label: "Roof Type",
        type: "select",
        options: [
          "Asphalt Shingles",
          "Metal Roofing",
          "Tile",
          "Slate",
          "Flat/TPO",
          "Wood Shake"
        ]
      },
      { name: "squareFeet", label: "Roof Square Footage", type: "number" },
      {
        name: "scope",
        label: "Scope of Work",
        type: "textarea"
      },
      { name: "materialDetails", label: "Material Details", type: "textarea" },
      { name: "estimatedCost", label: "Estimated Cost ($)", type: "number" },
      { name: "timeline", label: "Project Timeline", type: "text" },
      {
        name: "warrantyYears",
        label: "Warranty Period (years)",
        type: "number"
      }
    ],
    buildPrompt: ({
      companyLogo,
      customerName,
      propertyAddress,
      roofType,
      squareFeet,
      scope,
      materialDetails,
      estimatedCost,
      timeline,
      warrantyYears
    }) =>
      `Create a professional roofing proposal in this EXACT format:

# ROOFING PROPOSAL

**Proposal Date:** ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
**Valid Until:** ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

---

## CUSTOMER INFORMATION

**${customerName}**
${propertyAddress}

---

## PROJECT DETAILS

| Item | Description |
|------|-------------|
| Roof Type | ${roofType} |
| Total Area | ${squareFeet} sq ft |
| Project Timeline | ${timeline} |
| Warranty Period | ${warrantyYears} years |

---

## SCOPE OF WORK

${scope}

---

## MATERIALS & SPECIFICATIONS

${materialDetails}

---

## INVESTMENT BREAKDOWN

| Description | Amount |
|-------------|--------|
| Materials | $${(estimatedCost * 0.4).toFixed(2)} |
| Labor | $${(estimatedCost * 0.45).toFixed(2)} |
| Permits & Disposal | $${(estimatedCost * 0.15).toFixed(2)} |
| **TOTAL INVESTMENT** | **$${estimatedCost}** |

---

## TERMS & CONDITIONS

- 50% deposit required to schedule work
- Balance due upon completion
- ${warrantyYears}-year warranty on workmanship
- All work performed by licensed professionals
- Job site cleaned daily

---

## PAYMENT METHODS

We accept: Check, Credit Card, Bank Transfer

---

**Authorized Signature:** _____________________________ **Date:** _____________

*This proposal is valid for 30 days from the date above. By signing, you agree to the terms and investment amount outlined in this proposal.*`
  },

  insurance: {
    title: "Insurance Claim Assistant",
    description: "Generate insurance claim documentation",
    fields: [
      { name: "companyLogo", label: "Your Company Logo", type: "logo" },
      { name: "propertyOwner", label: "Property Owner Name", type: "text" },
      { name: "propertyAddress", label: "Property Address", type: "text" },
      { name: "claimNumber", label: "Claim Number (if known)", type: "text" },
      {
        name: "damageType",
        label: "Type of Damage",
        type: "select",
        options: [
          "Hail Damage",
          "Wind Damage",
          "Storm Damage",
          "Tree Damage",
          "Water Damage/Leak",
          "Fire Damage",
          "Age/Wear & Tear"
        ]
      },
      { name: "dateOfLoss", label: "Date of Loss/Damage", type: "date" },
      {
        name: "damageDescription",
        label: "Detailed Damage Description",
        type: "textarea"
      },
      {
        name: "affectedAreas",
        label: "Affected Roof Areas",
        type: "textarea"
      },
      {
        name: "estimatedCost",
        label: "Estimated Repair Cost ($)",
        type: "number"
      },
      {
        name: "urgency",
        label: "Urgency Level",
        type: "select",
        options: ["Emergency", "High", "Medium", "Low"]
      }
    ],
    buildPrompt: ({
      companyLogo,
      propertyOwner,
      propertyAddress,
      claimNumber,
      damageType,
      dateOfLoss,
      damageDescription,
      affectedAreas,
      estimatedCost,
      urgency
    }) =>
      `You are a roofing contractor assisting with an insurance claim. Generate professional insurance claim documentation for ${propertyOwner} at ${propertyAddress}.

IMPORTANT: Output ONLY clean markdown text. Do NOT include any HTML tags, divs, or image tags. The logo will be handled separately.

CLAIM INFORMATION:
- Claim Number: ${claimNumber || "To be assigned"}
- Date of Loss: ${dateOfLoss}
- Damage Type: ${damageType}
- Urgency: ${urgency}
- Estimated Repair Cost: $${estimatedCost}

DAMAGE DETAILS:
${damageDescription}

AFFECTED AREAS:
${affectedAreas}

Create a comprehensive claim documentation package that includes:
1. Executive Summary of Damage
2. Detailed Damage Assessment
3. Photo Documentation Notes (reference points for adjuster)
4. Scope of Repairs Needed
5. Material & Labor Cost Breakdown
6. Recommended Timeline for Repairs
7. Safety Concerns (if any)
8. Code Compliance Requirements
9. Contractor Recommendations

Write in professional, factual language suitable for insurance adjusters. Include specific details, measurements, and industry terminology. Focus on documenting the damage thoroughly and justifying the repair scope.`
  },

  followup: {
    title: "Lead Follow-Up Writer",
    description: "Generate personalized lead follow-up messages",
    fields: [
      { name: "leadName", label: "Lead Name", type: "text" },
      { name: "propertyAddress", label: "Property Address", type: "text" },
      {
        name: "contactMethod",
        label: "Contact Method",
        type: "select",
        options: ["Email", "Text Message", "Phone Script"]
      },
      {
        name: "leadSource",
        label: "How They Found You",
        type: "select",
        options: [
          "Website",
          "Referral",
          "Door Knock",
          "Online Ad",
          "Social Media",
          "Trade Show",
          "Other"
        ]
      },
      {
        name: "interestedIn",
        label: "What They're Interested In",
        type: "text"
      },
      {
        name: "previousConversation",
        label: "Notes from Previous Conversation",
        type: "textarea"
      },
      {
        name: "followUpReason",
        label: "Reason for Follow-Up",
        type: "select",
        options: [
          "Initial Contact Response",
          "Quote Follow-Up",
          "Schedule Inspection",
          "Answer Questions",
          "Check Decision Status",
          "Seasonal Reminder",
          "Special Offer"
        ]
      },
      {
        name: "tone",
        label: "Tone",
        type: "select",
        options: ["Professional", "Friendly", "Helpful", "Urgent"]
      }
    ],
    buildPrompt: ({
      leadName,
      propertyAddress,
      contactMethod,
      leadSource,
      interestedIn,
      previousConversation,
      followUpReason,
      tone
    }) =>
      `You are a roofing sales professional. Write a ${tone.toLowerCase()} follow-up ${contactMethod.toLowerCase()} for ${leadName} at ${propertyAddress}.

CONTEXT:
- Lead Source: ${leadSource}
- Interested In: ${interestedIn}
- Follow-Up Reason: ${followUpReason}
- Previous Conversation Notes: ${previousConversation}

Generate a compelling follow-up message that:
1. References your previous conversation naturally
2. Provides value (helpful information, answer questions, etc.)
3. Includes a clear call-to-action
4. Shows you remember their specific situation
5. Makes it easy for them to respond
6. Builds trust and credibility

Keep it conversational, not pushy. Focus on being helpful and solving their roofing needs.${contactMethod === "Text Message" ? " Keep it concise for text - under 160 characters if possible, or break into 2-3 short messages." : ""}${contactMethod === "Phone Script" ? " Structure it as a phone conversation outline with key talking points and response options." : ""}`
  },

  jobreport: {
    title: "Job Completion Report",
    description: "Create detailed job completion documentation",
    fields: [
      { name: "companyLogo", label: "Your Company Logo", type: "logo" },
      { name: "customerName", label: "Customer Name", type: "text" },
      { name: "jobAddress", label: "Job Address", type: "text" },
      { name: "jobStartDate", label: "Job Start Date", type: "date" },
      { name: "jobEndDate", label: "Job Completion Date", type: "date" },
      {
        name: "workCompleted",
        label: "Work Completed (detailed)",
        type: "textarea"
      },
      {
        name: "materialsUsed",
        label: "Materials Used (list with quantities)",
        type: "textarea"
      },
      {
        name: "crewMembers",
        label: "Crew Members (names/roles)",
        type: "text"
      },
      { name: "weatherConditions", label: "Weather Conditions", type: "text" },
      {
        name: "challengesOrIssues",
        label: "Challenges or Issues Encountered",
        type: "textarea"
      },
      {
        name: "additionalNotes",
        label: "Additional Notes",
        type: "textarea"
      },
      {
        name: "customerPresent",
        label: "Customer Present During Completion?",
        type: "select",
        options: ["Yes", "No"]
      }
    ],
    buildPrompt: ({
      companyLogo,
      customerName,
      jobAddress,
      jobStartDate,
      jobEndDate,
      workCompleted,
      materialsUsed,
      crewMembers,
      weatherConditions,
      challengesOrIssues,
      additionalNotes,
      customerPresent
    }) =>
      `You are a roofing project manager. Create a comprehensive job completion report for the roofing project at ${jobAddress} for ${customerName}.

IMPORTANT: Output ONLY clean markdown text. Do NOT include any HTML tags, divs, or image tags. The logo will be handled separately.

PROJECT TIMELINE:
- Start Date: ${jobStartDate}
- Completion Date: ${jobEndDate}
- Duration: Calculate the working days

CREW INFORMATION:
${crewMembers}

WORK COMPLETED:
${workCompleted}

MATERIALS USED:
${materialsUsed}

WEATHER CONDITIONS:
${weatherConditions}

CHALLENGES/ISSUES:
${challengesOrIssues || "No significant issues encountered"}

ADDITIONAL NOTES:
${additionalNotes || "None"}

Customer Present at Completion: ${customerPresent}

Generate a professional job completion report that includes:
1. Project Summary
2. Scope of Work Completed (detailed)
3. Materials Used (with quantities and specifications)
4. Crew Information & Hours
5. Timeline & Weather Impact
6. Quality Control Checklist
7. Challenges Overcome (if any)
8. Site Cleanup & Final Inspection
9. Warranty Information Provided
10. Customer Sign-Off Status
11. Before/After Notes
12. Recommendations for Future Maintenance

Make it thorough, professional, and suitable for customer records and company documentation.`
  }
}
