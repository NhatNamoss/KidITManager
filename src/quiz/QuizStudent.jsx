import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QUIZ_SKILLS } from '../../shared/quiz';
import { Leaderboard, Question, QuizError, RoomHeading, SkillLog } from './QuizShared';
import { quizRequest, readQuizStorage, useQuizRoom, writeQuizStorage } from './useQuizRoom';
import './quiz.css';

function SkillControls({ room, now, busy, stale, act }) {
  const [targetId, setTargetId] = useState('');
  const team = room.teams.find(t => t.id === room.me.teamId);
  const captain = team.captainId === room.me.id;
  return <section className="quiz-skill-controls"><div><h3>Kỹ năng của {team.name}</h3><p>{team.charges} lượt còn lại{team.shield && ' · Lá chắn đang bảo vệ đội'}</p></div>
    {captain ? <><p className="quiz-muted">Bạn là đội trưởng. Mỗi kỹ năng tốn 1 lượt; kỹ năng tấn công ảnh hưởng tất cả máy của đội đối thủ.</p><label>Đội mục tiêu<select value={targetId} disabled={busy || stale || room.phase !== 'question'} onChange={e => setTargetId(e.target.value)}><option value="">Chọn đội đối thủ</option>{room.teams.filter(t => t.id !== team.id).map(t => <option key={t.id} value={t.id} disabled={t.protectedUntil > now}>{t.name}{t.protectedUntil > now ? ' · Đang được bảo vệ' : ''}</option>)}</select></label>
      <div className="quiz-skills">{QUIZ_SKILLS.map(skill => <button key={skill.id} className="quiz-button quiz-secondary" title={skill.description} disabled={busy || stale || room.phase !== 'question' || now >= room.deadline || !team.charges || (skill.id === 'shield' ? team.shield : targetId === '' || room.teams.find(t => t.id === Number(targetId))?.protectedUntil > now)} onClick={() => act('skill', { skill: skill.id, targetId: Number(targetId), index: room.index })}><strong>{skill.name}</strong><small>{skill.description}</small></button>)}</div></> : <p className="quiz-muted">Đội trưởng {team.members.find(p => p.id === team.captainId)?.name} chọn kỹ năng cho đội. Trả lời đúng để cùng giành thêm lượt.</p>}
  </section>;
}

function PlayerRoom({ code, token, exit }) {
  const { room, error, busy, act, now, stale } = useQuizRoom(code, token);
  if (!room) return <div className="quiz-panel"><p role="status">Đang kết nối với phòng {code}...</p><QuizError>{error}</QuizError><button className="quiz-button quiz-secondary" onClick={exit}>Đổi phòng</button></div>;
  const team = room.teams.find(t => t.id === room.me.teamId);
  const effect = room.phase === 'question' && team.effect?.until > now ? team.effect : null;
  const frozen = effect?.kind === 'freeze';
  return <><RoomHeading room={room} /><div className="quiz-player-identity"><p><strong>{room.me.name}</strong> · {team.name}{team.captainId === room.me.id && ' · Đội trưởng'}</p><button className="quiz-link" onClick={exit}>Đổi phòng</button></div><QuizError>{error}</QuizError>{stale && <p role="status" className="quiz-notice">Đang kết nối lại. Chờ đồng bộ trước khi trả lời; nếu bạn vừa gửi đáp án, hệ thống sẽ kiểm tra kết quả đã nhận.</p>}
    {room.phase === 'lobby' && <section className="quiz-waiting"><p>Bạn đã vào phòng</p><h1>Sẵn sàng cùng {team.name}!</h1><p>Giáo viên sẽ bắt đầu khi đủ người. Mỗi câu đúng mang về 100 điểm cho đội.</p><p>Đội có tỉ lệ đúng cao nhất nhận kỹ năng. Đội trưởng có thể dùng kỹ năng từ câu tiếp theo.</p></section>}
    {room.phase === 'finished' && <section className="quiz-finale"><p>Đã hoàn thành trận đấu</p><h1>{team.score === Math.max(...room.teams.map(t => t.score)) ? 'Đội của bạn dẫn đầu!' : 'Cảm ơn bạn đã cùng đội thi đấu!'}</h1><p>{team.name} giành được {team.score} điểm.</p><Link className="quiz-button" to="/play">Tham gia phòng khác</Link></section>}
    {room.question && <div className={`quiz-play-surface ${frozen ? 'quiz-frozen' : ''}`}>
      <Question room={room} now={now} me={room.me} answer={choice => act('answer', { choice, index: room.index })} disabled={busy || stale || frozen} />
      {effect && <div className={`quiz-effect quiz-effect-${effect.kind}`} aria-hidden="true"><div className="quiz-effect-shape" /><div className="quiz-effect-shape" /><div className="quiz-effect-shape" /></div>}
      {effect && <p className="quiz-effect-message" role="status">{frozen ? 'Đội bị đóng băng, tạm khóa trả lời' : 'Cầu lửa đang che một phần đáp án'} · {Math.max(0, Math.ceil((effect.until - now) / 1000))}s</p>}
    </div>}
    {room.phase !== 'lobby' && room.phase !== 'finished' && <SkillControls room={room} now={now} busy={busy} stale={stale} act={act} />}
    <Leaderboard room={room} lobby={room.phase === 'lobby'} me={room.me} /><SkillLog room={room} />
  </>;
}

export function QuizStudent() {
  const { code: routeCode = '' } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(routeCode);
  const [name, setName] = useState('');
  const [token, setToken] = useState(() => readQuizStorage(`kidit-quiz-player-${routeCode}`));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [storageNotice, setStorageNotice] = useState('');
  const tokens = useRef({});
  useEffect(() => { setCode(routeCode); setToken(tokens.current[routeCode] || readQuizStorage(`kidit-quiz-player-${routeCode}`)); }, [routeCode]);
  useEffect(() => { const previous = document.title; document.title = 'Đấu trường trắc nghiệm | KidIT'; return () => { document.title = previous; }; }, []);
  return <main className="quiz-app quiz-student"><header className="quiz-brand"><strong>KidIT</strong><span>Đấu trường trắc nghiệm</span></header>{storageNotice && <p className="quiz-notice" role="status">{storageNotice}</p>}
    {token && routeCode ? <PlayerRoom key={`${routeCode}-${token}`} code={routeCode} token={token} exit={() => { navigate('/play'); setToken(''); setError(''); }} /> : <section className="quiz-join"><div><p className="quiz-muted">Mỗi bạn một máy. Cả đội cùng thi đấu.</p><h1>Vào phòng đấu</h1><p>Nhập mã 6 số giáo viên cung cấp. Bạn sẽ được xếp vào đội khi tham gia.</p></div><form onSubmit={async e => {
      e.preventDefault(); setBusy(true); setError('');
      try {
        const saved = readQuizStorage(`kidit-quiz-player-${code}`);
        if (saved) { await quizRequest(`/api/play/${code}`, undefined, saved); setToken(saved); navigate(`/play/${code}`); return; }
        const data = await quizRequest(`/api/play/${code}/join`, { name });
        tokens.current[code] = data.token;
        if (!writeQuizStorage(`kidit-quiz-player-${code}`, data.token)) setStorageNotice('Trình duyệt không lưu được phiên chơi. Giữ trang này mở để tiếp tục trận đấu.');
        setToken(data.token); navigate(`/play/${code}`);
      } catch (err) { setError(err.message); } finally { setBusy(false); }
    }}><label>Mã phòng<input required inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" minLength={6} maxLength={6} placeholder="6 chữ số" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} disabled={busy} /></label><label>Tên của bạn<input required autoComplete="nickname" maxLength={40} placeholder="Nhập tên để giáo viên nhận ra bạn" value={name} onChange={e => setName(e.target.value)} disabled={busy} /></label><QuizError>{error}</QuizError><button className="quiz-button" type="submit" disabled={busy}>{busy ? 'Đang vào phòng...' : 'Tham gia trận đấu'}</button></form><p className="quiz-muted">Không cần tài khoản giáo viên. Nếu trùng tên, thêm tên lớp hoặc một số để phân biệt.</p></section>}
  </main>;
}
