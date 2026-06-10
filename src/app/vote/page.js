'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { candidates } from '@/lib/candidates';
import { GAME_ID, localPlayer } from '@/lib/game';

export default function VotePage() {
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const p = localPlayer();
    if (!p) router.push('/');
    else setPlayer(p);
  }, [router]);

  useEffect(() => setImgError(false), [index]);

  if (!player) return null;

  const candidate = candidates[index];
  const progressText = `${index + 1} / ${candidates.length}`;

  async function vote(isSuitable) {
    if (busy) return;
    setBusy(true);
    try {
      const voteId = `${player.id}_${candidate.id}`;
      await setDoc(doc(db, 'games', GAME_ID, 'votes', voteId), {
        playerId: player.id,
        playerName: player.name,
        candidateId: candidate.id,
        candidateName: candidate.candidateName,
        isSuitable,
        weight: player.weight,
        createdAt: serverTimestamp()
      });

      if (index + 1 >= candidates.length) {
        await updateDoc(doc(db, 'games', GAME_ID, 'players', player.id), {
          completed: true,
          completedAt: serverTimestamp()
        });
        router.push('/done');
      } else {
        setIndex((i) => i + 1);
      }
    } catch (err) {
      alert('Nepavyko išsaugoti balso. Bandyk dar kartą.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="voteLayout">
      <header className="topbar">
        <div className="brand">NEXT</div>
        <div className="progress">{progressText}</div>
      </header>

      <section className="candidateWrap">
        <article className="candidateCard">
          <div className="photoBox">
            {!imgError ? (
              <img src={candidate.image} alt={candidate.candidateName} onError={() => setImgError(true)} />
            ) : (
              <div className="placeholder">
                <h2>{candidate.candidateName}</h2>
                <p>Įkelk nuotrauką į public/candidates/{candidate.id}.jpg</p>
              </div>
            )}
          </div>
          <div className="candidateInfo">
            <h1 className="candidateName">{candidate.candidateName}</h1>
            <div className="profession">{candidate.profession}</div>
            <p className="desc">{candidate.description}</p>
          </div>
          <div className="voteBtns">
            <button className="voteBtn no" onClick={() => vote(false)} disabled={busy}>❌ Netinkamas</button>
            <button className="voteBtn yes" onClick={() => vote(true)} disabled={busy}>✅ Tinkamas</button>
          </div>
        </article>
      </section>

      <footer className="topbar">
        <span className="muted">Balsuoja: {player.name}</span>
        {player.isBride && <b style={{ color: 'var(--gold-light)' }}>Monikos balsas x2</b>}
      </footer>
    </main>
  );
}
