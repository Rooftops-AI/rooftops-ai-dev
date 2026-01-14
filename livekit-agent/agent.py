import logging
from dotenv import load_dotenv
import os

from livekit.agents import JobContext, WorkerOptions, cli
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import openai, silero

# Try to import elevenlabs, fall back to openai TTS if not available
try:
    from livekit.plugins import elevenlabs
    HAS_ELEVENLABS = bool(os.getenv("ELEVEN_API_KEY"))
except ImportError:
    HAS_ELEVENLABS = False

load_dotenv()

logger = logging.getLogger("voice-agent")
logger.setLevel(logging.INFO)


class RooftopsAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions="""You are a friendly, conversational AI assistant for Rooftops AI.
You help users with roofing-related questions in a natural, relaxed way.
Keep your responses concise and conversational - like you're chatting with a friend.
Don't be overly formal. Use natural speech patterns."""
        )


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the voice assistant"""

    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect()

    # Choose TTS based on available API keys
    if HAS_ELEVENLABS:
        logger.info("Using ElevenLabs TTS for natural voice")
        tts = elevenlabs.TTS(
            voice_id="UgBBYS2sOqTuMpoF3BR0",
            model="eleven_flash_v2_5",  # Fastest model, lower latency
            voice_settings=elevenlabs.VoiceSettings(
                stability=0.7,  # Higher = more consistent voice
                similarity_boost=0.9,  # Higher = closer to original voice
                speed=1.15,  # Slightly faster speech
            ),
        )
    else:
        logger.info("Using OpenAI TTS (set ELEVEN_API_KEY for better voices)")
        tts = openai.TTS(voice="shimmer")

    # Create the agent session
    session = AgentSession(
        stt=openai.STT(),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=tts,
        vad=silero.VAD.load(
            min_speech_duration=0.2,
            min_silence_duration=0.5,
            activation_threshold=0.5,
        ),
    )

    # Start the session with the assistant
    await session.start(room=ctx.room, agent=RooftopsAssistant())

    # Greet the user naturally
    await session.generate_reply(
        instructions="Greet the user casually and offer to help. Be warm and friendly, not robotic."
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
