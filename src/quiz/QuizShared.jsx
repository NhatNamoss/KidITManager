import { QUIZ_SKILLS, phaseLabel } from '../../shared/quiz';

export function QuizError({ children }) { return children ? <p className="quiz-error" role="alert">{children}</p> : null; }

export function RoomHeading({ room, children }) {
  return <header className="quiz-room-heading"><div><p className="quiz-muted">{phaseLabel(room.phase)} · {room.playerCount} học sinh</p><h2>{room.title}</h2></div><div className="quiz-room-code"><span>Mã phòng</span><strong>{room.code}</strong></div>{children}</header>;
}

export function Leaderboard({ room, lobby = false, move, busy, me }) {
  const teams = lobby ? room.teams : [...room.teams].sort((a, b) => b.score - a.score);
  return <section className="quiz-standings" aria-label="Bảng điểm đội"><h3>{lobby ? 'Danh sách đội' : 'Bảng điểm đội'}</h3>
    <p className="quiz-muted">{lobby ? 'Người đầu danh sách là đội trưởng, có quyền chọn kỹ năng.' : 'Mỗi câu đúng: 100 điểm. Điểm được công bố khi đóng câu.'}</p>
    <div className="quiz-team-list">{teams.map((team, i) => <article className={`quiz-team ${me?.teamId === team.id ? 'quiz-my-team' : ''}`} key={team.id}>
      <header><strong>{!lobby && `${i + 1}. `}{team.name}{me?.teamId === team.id && ' · Đội của bạn'}</strong><span>{team.score} điểm</span></header>
      <p className="quiz-muted">{team.members.length} thành viên · {team.charges} lượt kỹ năng{team.shield && ' · Có lá chắn'}</p>
      {!team.members.length && <p className="quiz-muted">Chưa có học sinh vào đội.</p>}
      <ul>{team.members.map(p => <li key={p.id}><span>{p.name}{team.captainId === p.id && <small>Đội trưởng</small>}{!lobby && <small>{p.answered ? 'Đã trả lời' : room.phase === 'question' ? 'Đang suy nghĩ' : 'Chưa trả lời'}</small>}</span>
        {lobby && move ? <label className="quiz-move"><span className="sr-only">Đội của {p.name}</span><select disabled={busy} value={team.id} onChange={e => move(p.id, Number(e.target.value))}>{room.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label> : <span>{p.score} điểm</span>}
      </li>)}</ul>
    </article>)}</div>
  </section>;
}

export function Question({ room, now, me, answer, disabled }) {
  if (!room.question) return null;
  const revealed = room.phase !== 'question';
  const remaining = Math.max(0, Math.ceil((room.deadline - now) / 1000));
  return <section className="quiz-question" aria-label={`Câu hỏi ${room.index + 1}`}>
    <div className="quiz-question-meta"><span>Câu {room.index + 1}/{room.questionCount}</span><span>{room.answered}/{room.playerCount} đã trả lời</span>{!revealed && <strong role="timer" aria-label={`Còn ${remaining} giây`}>{remaining}s</strong>}</div>
    {!revealed && <progress aria-label="Thời gian còn lại" max={room.seconds} value={remaining} />}
    <h2>{room.question.text}</h2>
    <div className="quiz-answers">{room.question.options.map((option, i) => {
      const correct = revealed && room.question.correct === i;
      const selected = me?.answer?.choice === i;
      return <button key={i} type="button" className={`quiz-answer ${correct ? 'quiz-correct' : ''} ${selected ? 'quiz-selected' : ''}`} disabled={!answer || disabled || revealed || Boolean(me?.answer) || remaining === 0} onClick={() => answer(i)} aria-pressed={selected}>
        <span className="quiz-letter">{'ABCD'[i]}</span><span>{option}{correct && <small>Đáp án đúng</small>}{selected && <small>Bạn đã chọn</small>}</span>
      </button>;
    })}</div>
    {room.phase === 'question' && me?.answer && <p className="quiz-notice" role="status">Đã nhận câu trả lời. Chờ kết quả của cả lớp.</p>}
    {revealed && me && <p className="quiz-notice" role="status">{!me.answer ? 'Bạn chưa trả lời câu này.' : me.answer.correct ? 'Chính xác! Bạn mang về 100 điểm cho đội.' : 'Chưa đúng. Xem đáp án đúng phía trên và thử sức ở câu tiếp theo.'}</p>}
    {revealed && room.result && <div className="quiz-round-result"><h3>Kết quả vòng này</h3>{room.result.stats.map(stat => <p key={stat.teamId}>{room.teams.find(t => t.id === stat.teamId)?.name}: {stat.correct}/{stat.total} câu đúng ({Math.round(stat.ratio * 100)}%){room.result.winners.includes(stat.teamId) && ' · Nhận 1 lượt kỹ năng'}</p>)}{!room.result.winners.length && <p>Chưa đội nào trả lời đúng nên vòng này không có kỹ năng thưởng.</p>}<p className="quiz-muted">Đội cùng tỉ lệ cao nhất đều nhận thưởng. Tích trữ tối đa 3 lượt; dùng ở câu tiếp theo.</p></div>}
  </section>;
}

export function SkillLog({ room }) {
  if (!room.events.length) return null;
  return <section className="quiz-log"><h3>Diễn biến kỹ năng</h3><ol>{[...room.events].reverse().slice(0, 5).map(e => <li key={e.id}>{e.from} dùng {QUIZ_SKILLS.find(s => s.id === e.skill)?.name.toLowerCase()}{e.skill === 'shield' ? ' để bảo vệ đội mình.' : ` lên ${e.to}.`}{e.blocked && ' Lá chắn đã chặn đòn!'}</li>)}</ol></section>;
}
