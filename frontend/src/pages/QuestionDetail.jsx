import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function QuestionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [error, setError] = useState('');
  const [answerBody, setAnswerBody] = useState('');
  const [answerError, setAnswerError] = useState('');
  const [sending, setSending] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  function load() {
    api
      .getQuestion(id)
      .then((q) => {
        setQuestion(q);
        setEditTitle(q.title);
        setEditBody(q.body);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, [id]);

  async function handleAnswer(e) {
    e.preventDefault();
    setAnswerError('');
    setSending(true);
    try {
      await api.createAnswer(id, { body: answerBody });
      setAnswerBody('');
      load();
    } catch (err) {
      setAnswerError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteQuestion() {
    if (!confirm('Excluir esta pergunta? Essa ação não pode ser desfeita.')) return;
    try {
      await api.deleteQuestion(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateQuestion(e) {
    e.preventDefault();
    try {
      await api.updateQuestion(id, { title: editTitle, body: editBody });
      setEditing(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteAnswer(answerId) {
    if (!confirm('Excluir esta resposta?')) return;
    try {
      await api.deleteAnswer(answerId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div className="page page-narrow form-error">{error}</div>;
  if (!question) return <div className="page page-narrow muted">Carregando…</div>;

  const isOwner = user && user.sub === question.userId;

  return (
    <div className="page page-narrow">
      {!editing ? (
        <>
          <div className="detail-header">
            <h1>{question.title}</h1>
            {isOwner && (
              <div className="owner-actions">
                <button className="btn-ghost" onClick={() => setEditing(true)}>
                  Editar
                </button>
                <button className="btn-ghost danger" onClick={handleDeleteQuestion}>
                  Excluir
                </button>
              </div>
            )}
          </div>
          <p className="question-body">{question.body}</p>
        </>
      ) : (
        <form className="stacked-form" onSubmit={handleUpdateQuestion}>
          <label>
            Título
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          </label>
          <label>
            Detalhes
            <textarea
              rows={6}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              required
            />
          </label>
          <div className="form-row">
            <button type="submit">Salvar</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <hr className="divider" />

      <h2 className="answers-title">
        {question.answers?.length || 0} respostas
      </h2>

      <ul className="answer-list">
        {question.answers?.map((a) => (
          <AnswerItem
            key={a.id}
            answer={a}
            isOwner={user && user.sub === a.userId}
            onDeleted={() => handleDeleteAnswer(a.id)}
            onUpdated={load}
          />
        ))}
      </ul>

      {user ? (
        <form className="stacked-form answer-form" onSubmit={handleAnswer}>
          <label>
            Sua resposta
            <textarea
              rows={4}
              value={answerBody}
              onChange={(e) => setAnswerBody(e.target.value)}
              required
            />
          </label>
          {answerError && <p className="form-error">{answerError}</p>}
          <button type="submit" disabled={sending}>
            {sending ? 'Enviando…' : 'Responder'}
          </button>
        </form>
      ) : (
        <p className="muted">Entre com sua conta para responder.</p>
      )}
    </div>
  );
}

function AnswerItem({ answer, isOwner, onDeleted, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(answer.body);

  async function save(e) {
    e.preventDefault();
    await api.updateAnswer(answer.id, { body });
    setEditing(false);
    onUpdated();
  }

  return (
    <li className="answer-item">
      {!editing ? (
        <>
          <p>{answer.body}</p>
          {isOwner && (
            <div className="owner-actions small">
              <button className="btn-ghost" onClick={() => setEditing(true)}>
                Editar
              </button>
              <button className="btn-ghost danger" onClick={onDeleted}>
                Excluir
              </button>
            </div>
          )}
        </>
      ) : (
        <form className="stacked-form" onSubmit={save}>
          <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} required />
          <div className="form-row">
            <button type="submit">Salvar</button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
