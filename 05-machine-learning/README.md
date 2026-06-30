# 06 — Machine Learning / IA

**Rol en el plan:** Primario en Fase 3. Mayor crecimiento y prima salarial proyectada.

La tendencia 2026 no es "ML clásico" aislado: es **LLMs + RAG + MLOps**, sobre
una base sólida de fundamentos clásicos. Este track tiene 3 capas, en orden.

## Capa 1 — Fundamentos clásicos (no te las saltes)
- [ ] NumPy/pandas: limpieza y transformación de datos sin loops manuales
- [ ] Train/test split correcto, evitar data leakage
- [ ] Métricas correctas según el problema (accuracy ≠ siempre la métrica correcta)
- [ ] scikit-learn: pipelines (`Pipeline`, `ColumnTransformer`)
- [ ] Regresión, clasificación, clustering — cuándo usar cada uno
- [ ] Validación cruzada, overfitting vs underfitting

## Capa 2 — Deep learning
- [ ] PyTorch: tensores, autograd, `nn.Module`, loop de entrenamiento manual
- [ ] Debugging de gradientes explosivos/desvanecientes
- [ ] Redes para visión (CNN básica) y secuencias (RNN/Transformer, nivel intro)

## Capa 3 — LLMs, RAG y MLOps (donde está la demanda creciente)
- [ ] Hugging Face Transformers: cargar modelo, inferencia, fine-tuning básico
- [ ] Prompt engineering estructurado (no prueba y error)
- [ ] Tool calling / function calling con APIs de LLM
- [ ] Embeddings + vector DB (Chroma/Pinecone/Weaviate) para RAG
- [ ] Evaluación de salidas de LLM (hallucination, consistencia)
- [ ] LoRA/QLoRA (fine-tuning eficiente) — nivel mid-avanzado
- [ ] Servir el modelo: FastAPI + Docker
- [ ] Tracking de experimentos (MLflow) y CI/CD básico para modelos

## Señal de que ya eres mid en este track
Puedes llevar un modelo o un flujo de LLM desde el notebook hasta un endpoint
servido en Docker, con una forma de medir si la salida es buena — no solo
"funciona en mi prueba".

## Carpetas
- `exercises/` — ejercicios generados por Claude Code
- `solutions/` — soluciones de referencia (tras tu intento)
- `notes/` — tus apuntes
