'use client';

import { useEffect, useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GAME_ID } from '@/lib/game';
import { candidates } from '@/lib/candidates';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '2601';

export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [ok, setOk] = useState(false);
  const [origin, setOrigin] = useState('');
  const [players, setPlayers] = useState([]);
  const [votes, setVotes] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setOk(window.localStorage.getItem('monikosAdminOk') === 'true');
  }, []);

  useEffect(() => {
    if (!ok) return;
    const unsubPlayers = onSnapshot(collection(db, 'games', GAME_ID, 'players'), (snap) => {
      setPlayers(snap.docs.map((d) => d.data()).sort((a, b) => (a.joinedAt?.seconds || 0) - (b.joinedAt?.seconds || 0)));
    });
    const unsubVotes = onSnapshot(collection(db, 'games', GAME_ID, 'votes'), (snap) => {
      setVotes(snap.docs.map((d) => d.data()));
    });
    const unsubState = onSnapshot(doc(db, 'games', GAME_ID, 'state', 'main'), (snap) => {
      setShowResults(Boolean(snap.data()?.showResults));
    });
    return () => { unsubPlayers(); unsubVotes(); unsubState(); };
  }, [ok]);

  const completed = players.filter((p) => p.completed).length;
  const voteCount = votes.length;
  const allVotesNeeded = players.length * candidates.length;

  const results = useMemo(() => {
    return candidates.map((c) => {
      const candidateVotes = votes.filter((v) => v.candidateId === c.id);
      const yesScore = candidateVotes.filter((v) => v.isSuitable).reduce((sum, v) => sum + (v.weight || 1), 0);
      const yesCount = candidateVotes.filter((v) => v.isSuitable).length;
      const noCount = candidateVotes.filter((v) => !v.isSuitable).length;
      return { ...c, yesScore, yesCount, noCount };
    }).sort((a, b) => b.yesScore - a.yesScore || a.candidateName.localeCompare(b.candidateName, 'lt'));
  }, [votes]);

  function login(e) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      window.localStorage.setItem('monikosAdminOk', 'true');
      setOk(true);
    } else {
      alert('Neteisingas PIN');
    }
  }

  async function toggleResults(value) {
    await setDoc(doc(db, 'games', GAME_ID, 'state', 'main'), {
      showResults: value,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  async function resetGame() {
    if (!confirm('Ar tikrai ištrinti visus dalyvius ir balsus?')) return;
    const playerDocs = await getDocs(collection(db, 'games', GAME_ID, 'players'));
    const voteDocs = await getDocs(collection(db, 'games', GAME_ID, 'votes'));
    await Promise.all([
      ...playerDocs.docs.map((d) => deleteDoc(d.ref)),
      ...voteDocs.docs.map((d) => deleteDoc(d.ref)),
      setDoc(doc(db, 'games', GAME_ID, 'state', 'main'), { showResults: false, updatedAt: serverTimestamp() }, { merge: true })
    ]);
  }

  if (!ok) {
    return (
      <main className="fullscreen">
        <form className="hero panel grid" onSubmit={login}>
          <h1 className="logo" style={{ fontSize: '76px' }}>ADMIN</h1>
          <p className="muted">Įvesk admin PIN. Numatytasis ZIP faile: 2601.</p>
          <input className="input" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" />
          <button className="btn">Prisijungti</button>
        </form>
      </main>
    );
  }

  return (
    <main className="container">
      <h1 className="logo" style={{ fontSize: '72px', textAlign: 'center' }}>NEXT ADMIN</h1>
      <div className="adminGrid">
        <section className="panel grid">
          <h2>QR kodas balsavimui</h2>
          <div className="qrBox">
            {origin && <QRCodeCanvas value={origin} size={260} includeMargin />}
          </div>
          <p className="small muted">Dalyvės skenuoja QR ir patenka į balsavimą.</p>
          <div className="btnRow">
            <button className="btn" onClick={() => toggleResults(true)}>Rodyti rezultatus</button>
            <button className="btn secondary" onClick={() => toggleResults(false)}>Slėpti rezultatus</button>
            <button className="btn danger" onClick={resetGame}>Išvalyti žaidimą</button>
          </div>
          <p className="muted">Rezultatai dabar: <b>{showResults ? 'rodomi' : 'paslėpti'}</b></p>
        </section>

        <section className="grid">
          <div className="statGrid">
            <div className="stat"><span>Dalyvės</span><b>{players.length}</b></div>
            <div className="stat"><span>Baigė</span><b>{completed}</b></div>
            <div className="stat"><span>Balsai</span><b>{voteCount}/{allVotesNeeded || 0}</b></div>
          </div>

          <div className="panel">
            <h2>Prisijungusios dalyvės</h2>
            <table className="table">
              <thead><tr><th>Vardas</th><th>Statusas</th><th>Svoris</th></tr></thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.completed ? 'Baigė balsuoti' : 'Balsuoja'}</td>
                    <td>{p.isBride ? 'x2' : 'x1'}</td>
                  </tr>
                ))}
                {players.length === 0 && <tr><td colSpan="3" className="muted">Dar niekas neprisijungė.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h2>Gyvi rezultatai adminui</h2>
            <table className="table">
              <thead><tr><th>#</th><th>Kandidatas</th><th>Profesija</th><th>Taškai</th><th>✅</th><th>❌</th></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id} className={i < 3 ? `top${i + 1}` : ''}>
                    <td className="rank">{i + 1}</td>
                    <td>{r.candidateName}</td>
                    <td>{r.profession}</td>
                    <td>{r.yesScore}</td>
                    <td>{r.yesCount}</td>
                    <td>{r.noCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
