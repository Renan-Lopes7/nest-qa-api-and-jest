import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
}

export default function Questions() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .getQuestions(page, 10)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Mural</span>
          <h1>Perguntas recentes</h1>
        </div>
        <Link to="/questions/new" className="btn-primary">
          Fazer pergunta
        </Link>
      </div>

      {loading && <p className="muted">Carregando…</p>}
      {error && <p className="form-error">{error}</p>}

      {data && data.data.length === 0 && (
        <div className="empty-state">
          <p>Nenhuma pergunta por aqui ainda.</p>
          <p className="muted">Seja o primeiro a perguntar algo.</p>
        </div>
      )}

      <ul className="question-list">
        {data?.data.map((q) => (
          <li key={q.id}>
            <Link to={`/questions/${q.id}`} className="question-row">
              <h2>{q.title}</h2>
              <p className="question-excerpt">{q.body}</p>
              <div className="meta-row">
                <span>
                  por{' '}
                  <span className="author-name">
                    {q.user?.name || 'alguém'}
                  </span>
                </span>
                <span>{timeAgo(q.createdAt)}</span>
                {q.answers && <span>{q.answers.length} respostas</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Anterior
          </button>
          <span>
            página {data.meta.page} de {data.meta.totalPages}
          </span>
          <button
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
