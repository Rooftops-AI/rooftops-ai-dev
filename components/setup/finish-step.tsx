import { FC } from "react"

interface FinishStepProps {
  displayName: string
}

export const FinishStep: FC<FinishStepProps> = ({ displayName }) => {
  return (
    <div className="space-y-4 text-zinc-300">
      <div className="text-lg">
        Welcome to Rooftops AI
        {displayName.length > 0 ? `, ${displayName.split(" ")[0]}` : null}!
      </div>

      <div className="text-base">Click next to start chatting.</div>
    </div>
  )
}
