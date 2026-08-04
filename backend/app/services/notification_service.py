"""Notification creation service — triggered by application events."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scheme import Notification


async def create_notification(
    db: AsyncSession,
    user_id: str,
    title: str,
    message: str,
    notif_type: str = "info",
) -> Notification:
    """Create and persist an in-app notification."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
        is_read=False,
    )
    db.add(notif)
    # Caller is responsible for commit
    return notif


async def notify_first_chat(db: AsyncSession, user_id: str, language: str = "English") -> None:
    msgs = {
        "Hindi": ("आपकी पहली AI बातचीत! 🎉", "बधाई हो! आपने BhashaSetu AI से अपनी पहली बातचीत शुरू की। AI मेंटर आपकी हर समस्या में मदद करेगा।"),
        "Tamil": ("உங்கள் முதல் AI உரையாடல்! 🎉", "வாழ்த்துக்கள்! BhashaSetu AI உடன் உங்கள் முதல் உரையாடலை தொடங்கினீர்கள்."),
    }
    title, message = msgs.get(language, (
        "First AI Chat! 🎉",
        "Congratulations! You've started your first conversation with BhashaSetu AI. Your AI mentor is here to help.",
    ))
    await create_notification(db, user_id, title, message, "success")


async def notify_lesson_complete(db: AsyncSession, user_id: str, lesson_title: str, language: str = "English") -> None:
    msgs_en = (
        f"Lesson completed: {lesson_title} ✅",
        f"Great job! You've completed '{lesson_title}'. Keep learning to grow your business knowledge.",
    )
    msgs_hi = (
        f"पाठ पूरा हुआ: {lesson_title} ✅",
        f"शाबाश! आपने '{lesson_title}' पाठ पूरा किया। सीखते रहें और अपना व्यापार बढ़ाएं।",
    )
    title, message = msgs_hi if language == "Hindi" else msgs_en
    await create_notification(db, user_id, title, message, "success")


async def notify_welcome(db: AsyncSession, user_id: str, name: str, language: str = "English") -> None:
    msgs = {
        "Hindi": (
            f"BhashaSetu में आपका स्वागत है, {name}! 🙏",
            "हम खुश हैं कि आप हमसे जुड़े। AI मेंटर से बात करें, सरकारी योजनाएं खोजें, और अपना व्यापार बढ़ाएं।",
        ),
        "Tamil": (
            f"BhashaSetu-க்கு வரவேற்கிறோம், {name}! 🙏",
            "நாங்கள் உங்களுடன் இணைந்ததில் மகிழ்ச்சியடைகிறோம்.",
        ),
        "Telugu": (
            f"BhashaSetu కి స్వాగతం, {name}! 🙏",
            "మీరు మాతో చేరినందుకు సంతోషంగా ఉన్నాము.",
        ),
    }
    title, message = msgs.get(language, (
        f"Welcome to BhashaSetu, {name}! 🙏",
        "We're glad you joined us. Chat with your AI mentor, discover government schemes, and grow your business.",
    ))
    await create_notification(db, user_id, title, message, "info")
