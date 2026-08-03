"""Database initialisation — create all tables and seed essential data."""

from loguru import logger
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

from app.db.database import Base, engine


async def create_tables() -> None:
    """Create all SQLAlchemy tables (idempotent)."""
    # Import models so they register with Base.metadata
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables verified / created")


async def seed_categories() -> None:
    """Insert default lesson categories if none exist."""
    from sqlalchemy import select
    from app.db.database import AsyncSessionLocal
    from app.models.lesson import Category

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Category).limit(1))
        if result.scalar_one_or_none():
            return  # already seeded

        categories = [
            Category(slug="business", name="Business Basics", name_hindi="व्यापार की मूल बातें", icon="Briefcase", color="blue", sort_order=1),
            Category(slug="finance", name="Finance & Banking", name_hindi="वित्त और बैंकिंग", icon="Banknote", color="green", sort_order=2),
            Category(slug="farming", name="Farming & Agriculture", name_hindi="खेती और कृषि", icon="Wheat", color="yellow", sort_order=3),
            Category(slug="digital", name="Digital Literacy", name_hindi="डिजिटल साक्षरता", icon="Smartphone", color="purple", sort_order=4),
            Category(slug="marketing", name="Marketing & Sales", name_hindi="विपणन और बिक्री", icon="TrendingUp", color="orange", sort_order=5),
            Category(slug="legal", name="Legal & Compliance", name_hindi="कानूनी और अनुपालन", icon="Scale", color="red", sort_order=6),
        ]
        session.add_all(categories)
        await session.commit()
        logger.info("✅ Seeded default categories")


async def seed_schemes() -> None:
    """Insert sample government schemes if none exist."""
    from sqlalchemy import select
    from app.db.database import AsyncSessionLocal
    from app.models.scheme import Scheme

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Scheme).limit(1))
        if result.scalar_one_or_none():
            return

        schemes = [
            Scheme(
                name="PM Mudra Yojana",
                name_hindi="प्रधानमंत्री मुद्रा योजना",
                category="finance",
                ministry="Ministry of Finance",
                description="Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.",
                eligibility="Any Indian citizen running a non-farm income generating activity. No minimum income limit.",
                benefits="Loans up to ₹10 lakh under Shishu (₹50K), Kishor (₹5L), Tarun (₹10L) categories.",
                documents_required='["Aadhaar Card", "PAN Card", "Business Plan", "Bank Statement"]',
                application_process="Apply at any bank, MFI, or online at mudra.org.in",
                website_url="https://www.mudra.org.in",
                target_audience="msme,entrepreneur,women",
            ),
            Scheme(
                name="PM Kisan Samman Nidhi",
                name_hindi="प्रधानमंत्री किसान सम्मान निधि",
                category="farming",
                ministry="Ministry of Agriculture",
                description="Direct income support of ₹6,000/year to small and marginal farmers.",
                eligibility="Farmers owning cultivable land up to 2 hectares.",
                benefits="₹6,000 per year paid in three equal installments of ₹2,000.",
                documents_required='["Aadhaar Card", "Land Records", "Bank Account"]',
                application_process="Register at pmkisan.gov.in or nearest CSC",
                website_url="https://pmkisan.gov.in",
                target_audience="farmer,agriculture",
            ),
            Scheme(
                name="Stand Up India",
                name_hindi="स्टैंड अप इंडिया",
                category="business",
                ministry="Ministry of Finance",
                description="Bank loans between ₹10 lakh and ₹1 crore for SC/ST and women entrepreneurs.",
                eligibility="SC/ST or Women entrepreneurs above 18 years setting up a greenfield enterprise.",
                benefits="Composite loan (term + working capital) of ₹10L to ₹1Cr.",
                documents_required='["Aadhaar Card", "PAN Card", "Business Plan", "Caste Certificate if applicable"]',
                application_process="Apply at standupmitra.in or any scheduled commercial bank",
                website_url="https://www.standupmitra.in",
                target_audience="women,sc,st,entrepreneur",
            ),
            Scheme(
                name="Pradhan Mantri Kaushal Vikas Yojana",
                name_hindi="प्रधानमंत्री कौशल विकास योजना",
                category="education",
                ministry="Ministry of Skill Development",
                description="Free skill development training for Indian youth.",
                eligibility="Indian nationals aged 15-45 years who are school/college dropouts or unemployed.",
                benefits="Free certified training, ₹8,000 reward on certification, placement assistance.",
                documents_required='["Aadhaar Card", "Educational Certificates"]',
                application_process="Register at pmkvyofficial.org or nearest PMKVY training center",
                website_url="https://pmkvyofficial.org",
                target_audience="student,youth,unemployed",
            ),
        ]
        session.add_all(schemes)
        await session.commit()
        logger.info("✅ Seeded default government schemes")
