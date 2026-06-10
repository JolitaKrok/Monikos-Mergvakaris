'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { candidates } from '@/lib/candidates';
import { GAME_ID } from '@/lib/game';

export default function ResultsPage() {
  const [votes, setVotes] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const unsubVotes = onSnapshot(collection(db, 'games', GAME_ID, 'votes'), (snap) => {
      setVotes(snap.docs.map((d) => d.data()));
    });
    const unsubState = onSnapshot(doc(db, 'games', GAME_ID, 'state', 'main'), (snap) => {
      setShowResults(Boolean(snap.data()?.showResults));
    });
    return () => { unsubVotes(); unsubState(); };
  }, []);

  const results = useMemo(() => {
    return candidates.map((c) => {
      const candidateVotes = votes.filter((v) => v.candidateId === c.id);
      const yesScore = candidateVotes.filter((v) => v.isSuitable).reduce((sum, v) => sum + (v.weight || 1), 0);
      const yesCount = candidateVotes.filter((v) => v.isSuitable).length;
      const noCount = candidateVotes.filter((v) => !v.isSuitable).length;
      return { ...c, yesScore, yesCount, noCount };
    }).sort((a, b) => b.yesScore - a.yesScore || a.candidateName.localeCompare(b.candidateName, 'lt'));
  }, [votes]);

  if (!showResults) {
    return (
      <main className="waiting container">
        <section>
          <h1 className="logo">NEXT</h1>
          <p className="subtitle">Rezultatai dar paslėpti...</p>
          <p className="muted">Laukiam admin mygtuko „Rodyti rezultatus“.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <h1 className="resultsTitle">Monikos Jaunikio Atranka</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>Galutiniai rezultatai</p>
      <section className="resultsList">
        {results.map((r, i) => (
          <article className={`resultItem ${i < 3 ? 'top' : ''}`} key={r.id}>
            <div className="rank">{i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</div>
            <div>
              <div className="resultName">{r.candidateName} — {r.profession}</div>
              <div className="reveal">Iš tikrųjų buvo: <b>{r.originalName}</b></div>
              <div className="small muted">✅ {r.yesCount} · ❌ {r.noCount}</div>
            </div>
            <div className="score">{r.yesScore} tšk.</div>
          </article>
        ))}
      </section>
    </main>
  );
}
