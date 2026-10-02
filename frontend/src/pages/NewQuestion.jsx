import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function NewQuestion() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const question = await api.createQuestion({ title, body });
      navigate(`/questions/${question.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-narrow">
      <span className="eyebrow">Nova pergunta</span>
      <h1>O que você quer perguntar?</h1>

      <form className="stacked-form" onSubmit={handleSubmit}>
        <label>
          Título
          <input
            type="text"
            placeholder="Resuma sua dúvida em uma frase"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={3}
            required
          />
        </label>

        <label>
          Detalhes
          <textarea
            rows={8}
            placeholder="Descreva o contexto, o que você já tentou, e o que esperava que acontecesse"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Publicando…' : 'Publicar pergunta'}
        </button>
      </form>
    </div>
  );
}
