from dotenv import load_dotenv
import os, json

from livekit import agents, api
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    openai,
    noise_cancellation,
)

load_dotenv(".env.local")

# Your SIP trunk id (from env var or default)
TRUNK_ID = os.getenv("LIVEKIT_SIP_TRUNK_ID", "")  # Add your trunk ID to .env.local


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="""You are a helpful AI assistant for a fish market and health monitoring service.
        You can help users with:
        - Finding nearby fish markets and their information
        - Providing health information about Carpal Tunnel Syndrome (CTS) risk assessment
        - Answering questions about fish and seafood
        - General assistance related to fishing and maritime work

        Be professional, friendly, and helpful. Keep responses concise for phone conversations.""")


async def entrypoint(ctx: agents.JobContext):
    # Create the agent session (LLM + voice)
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            voice="coral"  # You can change to "alloy", "shimmer", "echo", "fable", or "nova"
        )
    )

    # See if dispatch included a phone number in metadata
    phone = None
    if ctx.job.metadata:
        try:
            metadata = json.loads(ctx.job.metadata)
            phone = metadata.get("phone_number")
        except Exception as e:
            print(f"Error parsing metadata: {e}")

    # If phone provided, dial it via SIP trunk
    if phone and TRUNK_ID:
        print(f"Dialing phone number: {phone}")
        await ctx.api.sip.create_sip_participant(api.CreateSIPParticipantRequest(
            room_name=ctx.room.name,
            sip_trunk_id=TRUNK_ID,
            sip_call_to=phone,
            participant_identity=phone,
            wait_until_answered=True,
        ))

    # Start the session inside the room
    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # For telephony, BVCTelephony is optimized for phone audio
            noise_cancellation=noise_cancellation.BVCTelephony() if phone else noise_cancellation.BVC(),
        ),
    )

    # If it's a phone call, wait for them to answer before greeting
    # Otherwise, greet immediately for web connections
    if not phone:
        await session.generate_reply(
            instructions="Greet the user warmly and offer your assistance with finding fish markets or health information."
        )


if __name__ == "__main__":
    # Give the worker a descriptive name
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="fish-market-assistant"
        )
    )