'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GAME_ID, normalizeName, isBrideName } from '@/lib/game';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function joinGame(event) {
    event.preventDefault();
    const clean = name.trim();
    setError('');

    if (clean.length < 2) {
      setError('Įvesk vardą.');
      return;
    }

    const playerId = normalizeName(clean);
    const isBride = isBrideName(clean);
    const weight = isBride ? 2 : 1;

    setLoading(true);
    try {
      const playerRef = doc(db, 'games', GAME_ID, 'players', playerId);
      await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(playerRef);
        if (existing.exists()) {
          throw new Error('TAKEN');
        }
        transaction.set(playerRef, {
          id: playerId,
          name: clean,
          normalizedName: playerId,
          isBride,
          weight,
          completed: false,
          joinedAt: serverTimestamp()
        });
      });

      window.localStorage.setItem('monikosPlayer', JSON.stringify({ id: playerId, name: clean, isBride, weight }));
      router.push('/vote');
    } catch (err) {
      if (err.message === 'TAKEN') setError('Toks vardas užimtas');
      else setError('Nepavyko prisijungti. Patikrink internetą ir bandyk dar kartą.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="fullscreen">
      <section className="hero">
        <h1 className="logo">NEXT</h1>
        <p className="subtitle">Monikos Jaunikio Atranka</p>
        <form className="panel grid" onSubmit={joinGame}>
          <label>
            <span className="muted">Įvesk savo vardą</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pvz., Jolita"
              autoFocus
            />
          </label>
          <button className="btn" disabled={loading}>{loading ? 'Jungiama...' : 'Pradėti balsavimą'}</button>
          {error && <div className="error">{error}</div>}
          <p className="small muted">Jeigu vardas „Monika“, balsai skaičiuosis dvigubai.</p>
        </form>
      </section>
    </main>
  );
}
