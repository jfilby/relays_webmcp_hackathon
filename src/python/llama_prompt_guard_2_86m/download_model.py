from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_id = "meta-llama/Llama-Prompt-Guard-2-86M"

print("Downloading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_id)

print("Downloading model...")
model = AutoModelForSequenceClassification.from_pretrained(model_id)

print("Done! Model cached locally.")

