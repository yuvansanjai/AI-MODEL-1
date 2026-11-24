from backend.app.chatbot import answer_question
from backend.app.kural_search import get_kural


def test_exact_number_retrieval():
    records = [get_kural(391)]
    assert records[0]["kural_number"] == 391


def test_age_adapter_preserves_original_kural():
    result = answer_question("391", "Children", None, "English")
    assert "391" in result["answer"]
    assert result["records"][0]["tamil_line1"]
