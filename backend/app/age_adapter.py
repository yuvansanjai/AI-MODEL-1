<<<<<<< HEAD
AGE_GROUPS = {"Children", "Teenagers", "Adults"}


def generate_age_response(question, age, confidence, language, kural_records):
    if age not in AGE_GROUPS:
        age = "Adults"

    if not kural_records:
        if language == "Tamil":
            return "அந்த விஷயத்துக்குத் தொடர்பான குறளை நம்பகமான உள்ளூர் தரவுத்தளத்தில் கண்டுபிடிக்க முடியவில்லை. மேலும் குறிப்பிட்ட தலைப்பு அல்லது குறள் எண்ணை கூறுங்கள்."
        return "I could not find a matching verse in the verified local database. Please provide a more specific topic or Kural number."

    record = kural_records[0]
    original = f"{record['tamil_line1']} {record['tamil_line2']}"
    meaning = record["tamil_meaning_mv"] if language == "Tamil" else record["english_explanation"]

    if age == "Children":
        if language == "Tamil":
            explanation = f"இது ஒரு சிறு நல்ல பாடம்: \"{meaning}\" இதை வீட்டிலும் பள்ளியிலும் தினசரி செயலில் முயற்சி செய்யலாம்."
        else:
            explanation = f"This gives us a simple lesson: {meaning} Try it in school or at home with a kind and respectful choice."
    elif age == "Teenagers":
        if language == "Tamil":
            explanation = f"இந்தக் குறள் சவால்கள், நட்பு, படிப்பு அல்லது தனிப்பட்ட வளர்ச்சியில் உனக்கு நம்பிக்கைமான வழிகாட்டும்: {meaning}"
        else:
            explanation = f"For everyday challenges, friendships, study, and personal growth, this Kural reminds us: {meaning}"
    else:
        if language == "Tamil":
            explanation = f"இந்தக் குறளின் தத்துவச் சுருக்கம்: {meaning}"
        else:
            explanation = f"Philosophical and practical meaning: {meaning}"

    if confidence is not None and confidence < 0.60:
        disclaimer = (" | Voice age is uncertain; the manual age selection may be changed at any time."
                      if language == "English" else
                      " | குரலின் வயதுமதிப்பு உறுதியாக இல்லை; கையால் வயது வகையை மாற்றலாம்.")
    else:
        disclaimer = ""

    if language == "Tamil":
        return f"### குறள் {record['kural_number']}\n\n**{original}**\n\n**விளக்கம்:** {explanation}{disclaimer}"
    return f"### Kural {record['kural_number']}\n\n**{original}**\n\n**Explanation:** {explanation}{disclaimer}"
=======
"""Age-adaptive explanation generator for Thirukkural.

Generates age-differentiated explanations tailored to:
1. CHILD (6-12): Simple vocabulary, school/family/playground scenarios, moral stories, warm encouraging tone.
2. TEENAGER (13-17): Conversational, relatable to school/social media/career, modern practical examples.
3. ADULT (18+): Philosophical depth, historical context, leadership applications, nuanced ethical analysis.

The ORIGINAL KURAL TEXT is preserved 100% IDENTICALLY across all age groups.
Only the pedagogical framing, examples, and vocabulary adapt.
"""

from typing import Dict, Any, Optional
from app.models import AgeGroup, AgeAdaptedExplanation, KuralDetail, Kural

# Curated handcrafted age-adapted templates for key landmark Kurals
CURATED_EXPLANATIONS: Dict[int, Dict[AgeGroup, Dict[str, Any]]] = {
    1: {  # அகர முதல எழுத்தெல்லாம்
        AgeGroup.CHILD: {
            "en": {
                "explanation": "Just like how the letter 'A' is the very first letter you learn in school to make every word, God is the loving start of the entire world and everything in it!",
                "example": "When you draw a picture or write your name, you start with the first pencil stroke. In the same way, all beautiful things in nature started with God.",
                "moral": "Always remember and be grateful to the source of all good things in your life.",
                "vocab": {"அகர (Agara)": "The letter 'A'", "ஆதிபகவன் (Aadhi Bhagavan)": "The First Divine Creator"},
                "tone": "Warm, encouraging, and story-like",
            },
            "ta": {
                "explanation": "நாம் பள்ளியில் முதலில் 'அ' என்ற எழுத்தைப் படித்துதான் மற்ற எல்லா எழுத்துக்களையும் சொற்களையும் எழுதுகிறோம் அல்லவா? அதேபோல இந்த அழகான உலகத்திற்கு முதல் தொடக்கம் கடவுள் தான்!",
                "example": "நீ படம் வரையும் போது முதல் கோடு போடுவது போல, இந்த உலகத்தின் எல்லாவற்றிற்கும் கடவுளே முதல் தொடக்கம்.",
                "moral": "எப்போதும் நம்மை வழிநடத்தும் பெரியவர்களுக்கும் இறைவனுக்கும் நன்றி சொல்ல வேண்டும்.",
                "vocab": {"அகர": "அ என்ற முதல் எழுத்து", "ஆதி": "தொடக்கமானவர்"},
                "tone": "அன்பான, எளிய, ஊக்கமளிக்கும் சிறுவர் குரல்",
            }
        },
        AgeGroup.TEENAGER: {
            "en": {
                "explanation": "Every alphabet system starts with a foundational character like 'A'. Without it, no code, literature, or communication exists. Similarly, a primary force / supreme consciousness grounds all existence.",
                "example": "Think of the binary '0 and 1' in computer programming. Everything complex builds from that root. Respecting the fundamental origin keeps your foundation strong.",
                "moral": "Master the fundamentals first; never lose sight of your roots as you grow.",
                "vocab": {"Foundation": "The base on which everything stands"},
                "tone": "Relatable, rational, and modern",
            },
            "ta": {
                "explanation": "மொழிக்கு 'அ' எப்படி முதன்மையான அடிப்படையோ, அதேபோல இந்த பிரபஞ்சத்தின் அத்தனை இயக்கத்திற்கும் ஆதிபகவனே மூல முதலாக விளங்குகிறான்.",
                "example": "கம்ப்யூட்டர் கோடிங்கில் '0, 1' போல, வாழ்க்கையின் அடிப்படை உண்மைகளை நாம் மறந்துவிடக் கூடாது.",
                "moral": "வாழ்க்கையில் எவ்வளவு உயர்ந்தாலும் தொடக்கத்தையும் நல்வழியையும் மறக்கக் கூடாது.",
                "vocab": {"முதற்றே": "முதன்மையானது"},
                "tone": "நவீன, நேரடியான இளைஞர் குரல்",
            }
        },
        AgeGroup.ADULT: {
            "en": {
                "explanation": "Valluvar establishes an ontological premise: just as phonetics and language originate from the vowel 'A' (alpha), the manifest universe originates from the Primeval Divine Consciousness. It underscores the unity of cosmology and linguistics.",
                "example": "In governance and leadership, every noble institution must be anchored in an unshakeable ethical first principle, without which all superstructure crumbles.",
                "moral": "All intellect and worldly enterprise must remain aligned with transcendent moral order.",
                "vocab": {"Ontology": "The philosophical study of being and existence"},
                "tone": "Philosophically rigorous, classical, and introspective",
            },
            "ta": {
                "explanation": "ஒலி வடிவிலும் வரி வடிவிலும் 'அ' என்ற உயிர் எழுத்தே மொழியின் இயக்கத்திற்கு மூல காரணமாகிறது; அதுபோலவே, பிரபஞ்ச இயக்கத்திற்கு மெய்யறிவு நிறைந்த மூலப் பரம்பொருளே ஆதி மூலமாக அமைகிறது.",
                "example": "அரசியல், நிர்வாகம், தனிமனித ஒழுக்கம் ஆகிய அனைத்து அமைப்புகளுக்கும் அறமும் மெய்யுணர்வுமே மூல ஆதாரமாக அமைய வேண்டும்.",
                "moral": "அறிவும் ஆற்றலும் பிரபஞ்ச அறநெறிக்கு கட்டுப்பட்டு இயங்க வேண்டும்.",
                "vocab": {"வாலறிவன்": "தூய மெய்யறிவு உடையவன்"},
                "tone": "ஆழ்ந்த தத்துவார்த்த மற்றும் அறிவார்ந்த குரல்",
            }
        }
    },

    71: {  # அன்பிற்கும் உண்டோ அடைக்குந்தாழ்
        AgeGroup.CHILD: {
            "en": {
                "explanation": "Can you lock love inside a box? No way! When someone you love gets a scrape on the playground, the tears in your eyes show how much you care.",
                "example": "When your pet puppy is sick or your best friend loses their toy, your sad face shows your big, kind heart.",
                "moral": "Love is too big to hide; always show kindness to friends and family.",
                "vocab": {"அடைக்குந்தாழ் (Lock)": "A latch or bolt on a door"},
                "tone": "Gentle, caring, and relatable",
            },
            "ta": {
                "explanation": "அன்பை ஒரு பெட்டியிலோ கதவிலோ போட்டு பூட்ட முடியுமா? முடியாது! உன்னுடைய அன்பு நண்பன் கீழே விழுந்து அழும்போது, உன் கண்களில் வரும் கண்ணீரே உன் அன்பைக் காட்டிவிடும்.",
                "example": "வீட்டில் தம்பியோ தங்கையோ அழுதுவிட்டால் நீ உடனே ஓடிப்போய் ஆறுதல் சொல்வது உன் அன்பின் வெளிப்பாடு.",
                "moral": "அனைவரிடமும் அன்போடு பழகுவதே சிறந்த குணம்.",
                "vocab": {"பூசல்": "வெளிப்பட்டு முழங்குதல்"},
                "tone": "அன்பான, இனிமையான குரல்",
            }
        },
        AgeGroup.TEENAGER: {
            "en": {
                "explanation": "You can pretend to be indifferent or cool, but genuine love and loyalty can't be locked away. When someone you truly care about faces trouble, your instinct to stand up for them gives it away.",
                "example": "You might not text each other every day, but when your close friend is being unfairly bullied or going through a tough exam, you drop everything to back them up.",
                "moral": "Empathy isn't weakness; it's the strongest signal of authentic character.",
                "vocab": {"Vulnerability": "Being genuine enough to show care"},
                "tone": "Conversational, real-talk, empathetic",
            },
            "ta": {
                "explanation": "நாம் எவ்வளவுதான் வெளிப்படையாகக் காட்டாமல் மறைக்க நினைத்தாலும், உண்மையான அன்பை மூடி வைக்க முடியாது; நண்பனுக்கு ஒரு கஷ்டம் என்றால் நம் மனமும் செயலும் தானாகவே வெளிப்பட்டுவிடும்.",
                "example": "நண்பன் சோர்ந்து இருக்கும்போது அவனுக்கு உறுதுணையாக நிற்பதுதான் உண்மையான நட்பு.",
                "moral": "உண்மையான தோழமையும் அன்பும் எந்த முகமூடியையும் விட வலிமையானது.",
                "vocab": {"ஆர்வலர்": "அன்புடையவர்"},
                "tone": "நட்பான, சமகால சிந்தனை",
            }
        },
        AgeGroup.ADULT: {
            "en": {
                "explanation": "Valluvar posits love as an irrepressible ontological force. No psychological defense or social barrier can seal it. Authentic compassion spontaneously manifests in somatic empathy—tears for the suffering of others.",
                "example": "True philanthropic and civic leadership is born not from calculated PR, but from genuine grief at societal injustice, compelling decisive action.",
                "moral": "Universal empathy is the bedrock of moral responsibility and visionary leadership.",
                "vocab": {"Somatic empathy": "Physical bodily resonance with another's pain"},
                "tone": "Reflective, profound, and statesmanlike",
            },
            "ta": {
                "explanation": "அன்பை எத்தகைய தந்திரங்களாலும் கட்டுப்படுத்தி மூடி மறைக்க முடியாது; மற்றவர் துன்பத்தைக் கண்டு உருகும் மனிதநேயக் கண்ணீரே அன்பின் உண்மையான ஆதாரமாகும்.",
                "example": "மக்களின் இன்னல்களைத் தன் துன்பமாகக் கருதி துயர் துடைக்கும் தலைவனே வரலாற்றில் நிலைத்து நிற்கிறான்.",
                "moral": "சுயநலமற்ற பேரன்பே மனித சமூகத்தின் ஆன்மீக மற்றும் சமூக ஒழுங்கிற்கு அடிப்படை.",
                "vocab": {"புண்கண்நீர்": "துன்பத்தால் வரும் கண்ணீர்"},
                "tone": "ஆழ்ந்த மனிதநேய நோக்கு",
            }
        }
    },

    101: {  # செய்யாமல் செய்த உதவிக்கு
        AgeGroup.CHILD: {
            "en": {
                "explanation": "If someone helps you when you never did anything for them first, that kindness is bigger than the entire Earth and all the stars in the sky!",
                "example": "Imagine you forgot your lunchbox at home, and a classmate shares half their sandwich with you. That kind friend is giving a gift you can never truly measure!",
                "moral": "Never forget someone who helped you when you were in trouble.",
                "vocab": {"வையகம் (Vaiyagam)": "The Earth / Universe"},
                "tone": "Grateful, cheerful, and imaginative",
            },
            "ta": {
                "explanation": "நீ முன்பு எந்த உதவியும் செய்யாதபோது, ஒருவர் உனக்கு தாமாக வந்து உதவி செய்தால், அவருக்கு இந்த உலகத்தையே பரிசாகக் கொடுத்தாலும் ஈடாகாது!",
                "example": "பள்ளியில் பென்சில் மறந்துவிட்டபோது உடன் படிக்கும் தோழன் அவனுடைய பென்சிலைக் கொடுத்து உதவினால், அந்த நல்ல உள்ளத்தை எப்போதும் மறக்கக் கூடாது.",
                "moral": "சமயத்தில் உதவிய நல்ல உள்ளங்களை வாழ்நாள் முழுவதும் மறக்கக் கூடாது.",
                "vocab": {"வையகம்": "பூமி", "வானகம்": "விண்ணுலகம்"},
                "tone": "கனிவான சிறுவர் நடை",
            }
        },
        AgeGroup.TEENAGER: {
            "en": {
                "explanation": "Unconditional help given without any expectation of return is priceless. Even if you offered the whole world in exchange, you could never match the moral weight of selfless support.",
                "example": "When a senior mentors you for coding or college admissions late at night asking for nothing in return, respect and pay that mentorship forward.",
                "moral": "Honor unexpected kindness by becoming someone who helps others without scorekeeping.",
                "vocab": {"Altruism": "Helping others without expecting personal gain"},
                "tone": "Direct, insightful, motivating",
            },
            "ta": {
                "explanation": "எந்த எதிர்பார்ப்பும் இல்லாமல் தக்க தருணத்தில் ஒருவர் செய்யும் பேருதவிக்கு, விண்ணையும் மண்ணையும் கைம்மாறாகக் கொடுத்தாலும் ஈடாகாது.",
                "example": "தேர்வு சமயத்தில் எந்த எதிர்பார்ப்பும் இல்லாமல் உனக்கு கடினமான பாடங்களை ஒரு நண்பன் சொல்லிக்கொடுப்பதை வாழ்நாள் முழுவதும் மதிக்க வேண்டும்.",
                "moral": "நன்றியுணர்வு உள்ள மனிதனே உயர்ந்த நிலையை அடைவான்.",
                "vocab": {"ஆற்றல் அரிது": "ஈடு செய்ய முடியாது"},
                "tone": "நேர்த்தியான இளைஞர் பார்வை",
            }
        },
        AgeGroup.ADULT: {
            "en": {
                "explanation": "Valluvar measures gratuitous beneficence against cosmic scales. A service rendered without precedent reciprocity exceeds the cumulative value of terrestrial and celestial realms, establishing an infinite moral debt.",
                "example": "In institutional ethics, mentoring young talent or providing relief during civil crises without transactional motives establishes the highest social capital.",
                "moral": "Noble actions are evaluated by intent and timing, not transactional exchange.",
                "vocab": {"Beneficence": "The practice of doing good to others"},
                "tone": "Philosophical, stately, and elevating",
            },
            "ta": {
                "explanation": "முன்செய்த உபகாரம் ஏதுமின்றி ஒருவன் தானாக முன்வந்து செய்யும் பேருதவியின் பெருமைக்கு, பூவுலகையும் மேலுலகையும் சமமாகக் கொடுத்தாலும் ஈடாகாது.",
                "example": "சமூக நெருக்கடிகளில் எதிர்பார்ப்பின்றி கைகொடுக்கும் தன்னலமற்ற சேவையே சமூகத்தின் உன்னத மாண்பாக திகழ்கிறது.",
                "moral": "செய்த நன்றியை ஒருபோதும் மறவாமை தலைசிறந்த அறமாகும்.",
                "vocab": {"கைம்மாறு": "பதிலுதவி"},
                "tone": "செழுமையான மரபுசார் விளக்கம்",
            }
        }
    },

    391: {  # கற்க கசடறக் கற்பவை
        AgeGroup.CHILD: {
            "en": {
                "explanation": "Learn your lessons really well so you understand them clearly, not just to pass a test. And then, be a good and kind person just like your lessons teach you!",
                "example": "If you learn in school that honesty is good, don't just write it in an exam—actually tell the truth at home and with friends!",
                "moral": "Good learning means doing what is right, every single day.",
                "vocab": {"கசடற (Kasadara)": "Without mistakes or doubts"},
                "tone": "Inspiring, clear, and encouraging",
            },
            "ta": {
                "explanation": "நீ படிக்கும் பாடங்களை எந்த சந்தேகமும் இல்லாமல் தெளிவாகப் படிக்க வேண்டும். படித்து முடித்த பிறகு, அந்த நல்ல பாடங்கள் சொல்லிக்கொடுத்தபடி நல்வழியில் வாழ வேண்டும்!",
                "example": "பள்ளியில் 'பொய் சொல்லக் கூடாது' என்று படித்தால், வீட்டில் அம்மாவிடமும் நண்பர்களிடமும் எப்போதும் உண்மையே பேச வேண்டும்.",
                "moral": "படிப்பது மட்டும் போதாது; படித்தபடி நல்ல பிள்ளையாக வாழ வேண்டும்.",
                "vocab": {"கசடு": "குற்றம் அல்லது சந்தேகம்"},
                "tone": "நேர்மறையான, ஊக்கமளிக்கும் சிறுவர் பாணி",
            }
        },
        AgeGroup.TEENAGER: {
            "en": {
                "explanation": "Don't just memorize information for high scores. Master the concepts deeply with zero gaps, and then ensure your daily actions, ethics, and career mirror what you've learned.",
                "example": "If you study digital privacy or science, don't just score an A+; practice ethical coding, verify facts before sharing online, and stand by your principles.",
                "moral": "Knowledge without integrity is empty; walk the talk.",
                "vocab": {"Integrity": "Living in alignment with your principles"},
                "tone": "Actionable, sharp, empowering",
            },
            "ta": {
                "explanation": "வெறும் மதிப்பெண்களுக்காக மனப்பாடம் செய்யாமல், ஆழமாகப் புரிந்து கற்றுக்கொள்ள வேண்டும்; கற்ற கல்வியின் வழிநின்று ஒழுக்கத்துடன் செயல்பட வேண்டும்.",
                "example": "அறிவியலையோ தொழில்நுட்ப்பத்தையோ கற்றால், அதை ஆக்கப்பூர்வமாகவும் நேர்மையாகவும் சமூக நன்மைக்குப் பயன்படுத்த வேண்டும்.",
                "moral": "சொல்லுக்கும் செயலுக்கும் இடையே உள்ள இடைவெளியைக் குறைப்பதே மெய்யான கல்வி.",
                "vocab": {"நிற்க அதற்குத் தக": "கற்ற கல்வியின்படி வாழ்க"},
                "tone": "சுறுசுறுப்பான, சிந்தனையைத் தூண்டும் குரல்",
            }
        },
        AgeGroup.ADULT: {
            "en": {
                "explanation": "Valluvar provides a two-phase epistemological imperative: First, 'Karka Kasadara'—master worthy subjects free of fallacy or dogma. Second, 'Nirka Adharkkuth Thaga'—embody that knowledge into existential praxis and moral governance.",
                "example": "In corporate and public governance, theoretical credentials mean nothing if executive behavior departs from ethical jurisprudence and accountability.",
                "moral": "True intellectual maturity is the seamless fusion of rigorous inquiry and virtuous conduct.",
                "vocab": {"Epistemology": "The philosophical theory of knowledge and justified belief"},
                "tone": "Rigorous, analytical, and definitive",
            },
            "ta": {
                "explanation": "கற்கத் தகுந்த உயரிய நூல்களைக் குற்றமும் ஐயமும் நீங்கக் கற்க வேண்டும்; அவ்வாறு கற்றதன் பயனாக, அறநெறியிலும் நடைமுறை வாழ்விலும் அதற்கேற்ப வழுவாது நிலைத்து நிற்க வேண்டும்.",
                "example": "உயர்ந்த பதவிகளில் இருப்பவர்கள் தங்களின் கல்வியறிவை தர்மத்திற்கும் சமூக நீதிக்கும் ஏற்ப வெளிப்படுத்தும்போதுதான் சமுதாயம் மேன்மையடையும்.",
                "moral": "அறிவும் நடத்தையுமே ஒரு மனிதனின் மாண்பை நிர்ணயிக்கின்றன.",
                "vocab": {"கசடற": "ஐயம் திரிபற"},
                "tone": "செம்மையான சான்றோர் பார்வை",
            }
        }
    },

    788: {  # உடுக்கை இழந்தவன் கைபோல
        AgeGroup.CHILD: {
            "en": {
                "explanation": "If your dress begins to slip, your hand catches it instantly without even waiting to be told! That's how a best friend helps you the very second you are in trouble.",
                "example": "When you trip during a running race, your friend stops, reaches down, and pulls you right back up with a big smile.",
                "moral": "Be a friend who jumps in to help right when your friend needs you most.",
                "vocab": {"இடுக்கண் (Idukkan)": "Trouble or sorrow"},
                "tone": "Fun, vivid, and heartwarming",
            },
            "ta": {
                "explanation": "உடுத்திய ஆடை நழுவும் போது கை எப்படி உடனே சென்று பிடித்துக் காப்பாற்றுகிறதோ, அதேபோல நண்பனுக்கு ஒரு கஷ்டம் வந்தால் உடனே சென்று உதவுவதே உண்மையான நட்பு!",
                "example": "விளையாடும் போது நண்பன் கீழே விழுந்துவிட்டால், உடனே ஓடிச்சென்று அவனைத் தூக்கி விடுவதுதான் உண்மையான தோழமை.",
                "moral": "நண்பனுக்குத் துன்பம் வரும்போது தாமதிக்காமல் உதவ வேண்டும்.",
                "vocab": {"உடுக்கை": "ஆடை", "இடுக்கண்": "துன்பம்"},
                "tone": "எளிமையான, இனிமையான தோழமை குரல்",
            }
        },
        AgeGroup.TEENAGER: {
            "en": {
                "explanation": "A true friend doesn't wait for an SOS message. Like your hand instinctively catching slipping clothes before conscious thought, real friends step in immediately when adversity strikes.",
                "example": "When a friend is going through family grief or failing a class, you don't judge or gossip—you step in, share your notes, and protect their dignity.",
                "moral": "Loyalty isn't just hanging out during good times; it's instant support during crises.",
                "vocab": {"Instinctive": "Happening naturally without thinking"},
                "tone": "Dynamic, loyal, relatable",
            },
            "ta": {
                "explanation": "ஆடை நழுவும்போது கை எந்த யோசனையுமின்றி உடனே காப்பது போல, நண்பனுக்கு நெருக்கடி ஏற்படும்போது யோசிக்காமல் உடனே கை கொடுப்பதே உண்மையான நட்பு.",
                "example": "நண்பனை யாராவது தவறாகப் பேசினாலோ அல்லது அவன் கஷ்டத்தில் இருந்தாலோ, வேடிக்கை பார்க்காமல் அவனுக்குத் துணையாக நிற்க வேண்டும்.",
                "moral": "துன்பக் காலத்தில் உடனே துணை நிற்பவனே உற்ற தோழன்.",
                "vocab": {"களைவது": "நீக்குவது"},
                "tone": "இளமைத் துடிப்புள்ள தோழமை நெறி",
            }
        },
        AgeGroup.ADULT: {
            "en": {
                "explanation": "Valluvar's simile is hailed as world literature's finest depiction of friendship: instantaneous, unhesitating, preserving the friend's dignity without fanfare, akin to an autonomous somatic reflex.",
                "example": "In times of professional or political crisis, an ally who quietly and decisively covers your vulnerabilities without demanding acknowledgment is invaluable.",
                "moral": "True camaraderie is proactive, protective of dignity, and devoid of ego.",
                "vocab": {"Somatic reflex": "An involuntary, immediate physical protective reaction"},
                "tone": "Poetic, profound, and statesmanlike",
            },
            "ta": {
                "explanation": "ஆடை நழுவும்போது கை நொடிப்பொழுதும் தாமதிக்காமல் மானத்தைக் காப்பது போல, நண்பனுக்கு வரும் பழியையும் துன்பத்தையும் விரைந்து சென்று நீக்குவதே சிறந்த நட்பாகும்.",
                "example": "நெருக்கடி காலகட்டங்களில் தன்னுயிரைப் போல நண்பனின் மதிப்பையும் நல்வாழ்வையும் காப்பதே மேலான பண்பாடு.",
                "moral": "நட்பு என்பது வெறும் பொழுதுபோக்கு அல்ல; அது உயிரைக் காக்கும் உன்னத உறவு.",
                "vocab": {"ஆங்கே": "அவ்விடத்திலேயே நொடிப்பொழுதில்"},
                "tone": "மரபுச் செழுமை மற்றும் இலக்கிய நயம்",
            }
        }
    }
}


def _generate_dynamic_child_explanation(kural: Dict[str, Any], lang: str) -> AgeAdaptedExplanation:
    """Generate dynamic child-oriented explanation for any Kural."""
    trans = kural.get("translation", "")
    exp_tam = kural.get("explanation_tam", "") or kural.get("mv_explanation", "")
    chap_tam = kural.get("chapter_tamil", "")
    chap_eng = kural.get("chapter_english", "")

    if lang == "ta":
        explanation = (
            f"இந்த குறளில் திருவள்ளுவர் '{chap_tam}' பற்றி மிக அழகாகச் சொல்கிறார்: {exp_tam} "
            "இதன் மூலம் நாம் நல்ல பழக்கங்களை நம் அன்றாட வாழ்க்கையில் வளர்த்துக் கொள்ள வேண்டும் என்கிறார்."
        )
        example = (
            "பள்ளியில் உன் நண்பர்களுடனும், வீட்டில் உன் பெற்றோருடனும் பழகும் போது "
            "எப்போதும் நல்வழியில் நடக்கவும், மற்றவர்களுக்கு அன்போடு உதவி செய்யவும் முயற்சி செய்."
        )
        moral = "நல்ல எண்ணங்களோடு அன்பாக வாழ்வதே வாழ்க்கையின் உண்மையான சந்தோஷம்."
        vocab = {"அறம்": "நல்ல ஒழுக்கம் மற்றும் நேர்மை", "அறிவு": "சரியானதைச் செய்யும் திறன்"}
        tone = "அன்பான, எளிய, ஊக்கமளிக்கும் சிறுவர் குரல்"
    else:
        explanation = (
            f"In this verse about '{chap_eng}', sage Thiruvalluvar teaches: {trans}. "
            "He tells us that practicing kindness and doing the right thing makes life wonderful."
        )
        example = (
            "Think about your day at school or at home: whenever you have a choice to be selfish or kind, "
            "choosing kindness makes everyone around you smile!"
        )
        moral = "Doing the right thing makes you a hero to your family and friends."
        vocab = {"Virtue": "Doing good deeds", "Wisdom": "Knowing right from wrong"}
        tone = "Warm, encouraging, and story-like"

    return AgeAdaptedExplanation(
        age_group=AgeGroup.CHILD,
        explanation=explanation,
        real_world_example=example,
        moral_takeaway=moral,
        vocabulary_notes=vocab,
        tone=tone,
    )


def _generate_dynamic_teen_explanation(kural: Dict[str, Any], lang: str) -> AgeAdaptedExplanation:
    """Generate dynamic teenager-oriented explanation for any Kural."""
    trans = kural.get("translation", "")
    exp_tam = kural.get("explanation_tam", "") or kural.get("mv_explanation", "")
    chap_tam = kural.get("chapter_tamil", "")
    chap_eng = kural.get("chapter_english", "")

    if lang == "ta":
        explanation = (
            f"திருவள்ளுவர் இந்த குறளில் '{chap_tam}' என்ற அதிகாரத்தின் வழியே மிக எதார்த்தமான உண்மையைச் சொல்கிறார்: {exp_tam}"
        )
        example = (
            "பள்ளி, கல்லூரி, சமூக வலைத்தளங்கள் என எங்கும் நாம் எடுக்கும் முடிவுகள்தான் நம் எதிர்காலத்தை உருவாக்குகின்றன. "
            "உணர்ச்சிவசப்படாமல், நிதானத்துடன் செயல்பட இக்குறள் வழிகாட்டுகிறது."
        )
        moral = "தனித்துவமான சிந்தனையும், நல்வழியில் விடாமுயற்சியும் உன்னை நிச்சயம் வெற்றியாளராக்கும்."
        vocab = {"முயற்சி": "தொடர்ந்து உழைக்கும் மனவுறுதி"}
        tone = "நவீன, நேரடியான இளைஞர் குரல்"
    else:
        explanation = (
            f"Valluvar's core message on '{chap_eng}' is: {trans}. "
            "It gives you a pragmatic compass for modern challenges and peer dynamics."
        )
        example = (
            "Whether you're managing study pressure, friendships, or digital distractions, "
            "applying this principle helps you stay grounded and build self-discipline."
        )
        moral = "Clarity of purpose and consistency beat talent when talent doesn't work hard."
        vocab = {"Discipline": "Consistent focus on long-term goals"}
        tone = "Conversational, real-talk, actionable"

    return AgeAdaptedExplanation(
        age_group=AgeGroup.TEENAGER,
        explanation=explanation,
        real_world_example=example,
        moral_takeaway=moral,
        vocabulary_notes=vocab,
        tone=tone,
    )


def _generate_dynamic_adult_explanation(kural: Dict[str, Any], lang: str) -> AgeAdaptedExplanation:
    """Generate dynamic adult-oriented explanation with philosophical depth."""
    trans = kural.get("translation", "")
    exp_tam = kural.get("explanation_tam", "") or kural.get("mv_explanation", "")
    sp_exp = kural.get("sp_explanation", "")
    chap_tam = kural.get("chapter_tamil", "")
    chap_eng = kural.get("chapter_english", "")

    if lang == "ta":
        detailed_commentary = f"{exp_tam} {sp_exp}".strip()
        explanation = (
            f"அதிகாரம் '{chap_tam}' அமைப்பில் இக்குறள் மிக ஆழமான தத்துவார்த்த உண்மையைப் புலப்படுத்துகிறது: {detailed_commentary}"
        )
        example = (
            "நவீன சமுதாயத்தில் குடும்பப் பொறுப்புகள், கார்ப்பரேட் நிர்வாகம், மற்றும் சமூக உறவுகளில் அறநெறி பிறழாது "
            "முடிவெடுக்க இக்குறளின் விழுமியம் இன்றியமையாத அடித்தளமாக விளங்குகிறது."
        )
        moral = "அறம் சார்ந்த வாழ்வியலே தனிமனித அமைதிக்கும், நிலைத்த சமூக வளர்ச்சிக்கும் வித்தாகும்."
        vocab = {"விழுமியம்": "வாழ்வின் உன்னத விழுமிய நெறிகள்"}
        tone = "செழுமையான தத்துவார்த்த மற்றும் சான்றோர் பார்வை"
    else:
        explanation = (
            f"Within '{chap_eng}', Valluvar formulates this universal maxim: {trans}. "
            "Classical commentators observe that this couplet synthesizes ethical duty with pragmatic efficacy."
        )
        example = (
            "In modern executive governance, public ethics, and interpersonal leadership, "
            "this principle resolves the conflict between expediency and moral integrity."
        )
        moral = "Enduring institutional and personal greatness requires unwavering adherence to foundational ethics."
        vocab = {"Ethical Jurisprudence": "Principles of justice grounded in moral law"}
        tone = "Philosophically rigorous, analytical, and definitive"

    return AgeAdaptedExplanation(
        age_group=AgeGroup.ADULT,
        explanation=explanation,
        real_world_example=example,
        moral_takeaway=moral,
        vocabulary_notes=vocab,
        tone=tone,
    )


def adapt_kural_for_age(
    kural: Dict[str, Any],
    age_group: Optional[AgeGroup] = AgeGroup.ADULT,
    language: str = "en"
) -> AgeAdaptedExplanation:
    """Generate the age-adapted explanation for the specified age group and language."""
    if age_group is None:
        age_group = AgeGroup.ADULT

    if age_group in (AgeGroup.CHILD, AgeGroup.CHILDREN, "child", "children"):
        norm_group = AgeGroup.CHILD
    elif age_group in (AgeGroup.TEENAGER, AgeGroup.TEENAGERS, "teenager", "teenagers"):
        norm_group = AgeGroup.TEENAGER
    else:
        norm_group = AgeGroup.ADULT

    kural_no = kural.get("number")
    lang_key = "ta" if (language and language.startswith("ta")) else "en"

    # Check for curated profile
    if kural_no in CURATED_EXPLANATIONS:
        group_profiles = CURATED_EXPLANATIONS[kural_no]
        if norm_group in group_profiles and lang_key in group_profiles[norm_group]:
            entry = group_profiles[norm_group][lang_key]
            return AgeAdaptedExplanation(
                age_group=norm_group,
                explanation=entry["explanation"],
                real_world_example=entry["example"],
                moral_takeaway=entry["moral"],
                vocabulary_notes=entry.get("vocab", {}),
                tone=entry.get("tone", "Age-appropriate"),
            )

    # Dynamic generation
    if norm_group == AgeGroup.CHILD:
        return _generate_dynamic_child_explanation(kural, lang_key)
    elif norm_group == AgeGroup.TEENAGER:
        return _generate_dynamic_teen_explanation(kural, lang_key)
    else:
        return _generate_dynamic_adult_explanation(kural, lang_key)


def get_kural_detail(
    kural: Dict[str, Any],
    age_group: Optional[AgeGroup] = None,
    language: str = "en"
) -> KuralDetail:
    """Create a KuralDetail object ensuring the original verse is 100% UNTOUCHED

    while appending age-adapted explanations.
    """
    adapted = None
    if age_group:
        adapted = adapt_kural_for_age(kural, age_group, language)

    # Note: Kural verse fields (line1, line2, couplet, translation) remain 100% identical!
    return KuralDetail(
        **kural,
        adapted_explanation=adapted
    )
>>>>>>> 071a39a990d8d851a677928900ec91f75fab24b3
