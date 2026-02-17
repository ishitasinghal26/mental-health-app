import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Activity = {
  id: number;
  title: string;
  duration: number;
};

type Card = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

const emojis = ["🌿","🌼","🌙","🧠","💙","✨"];

export default function MemoryGame({ activity }: { activity: Activity }) {
  const navigate = useNavigate();

  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(activity.duration * 60);
  const [finished, setFinished] = useState(false);

  // create shuffled cards
  useEffect(() => {
    const doubled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((v, i) => ({
        id: i,
        value: v,
        flipped: false,
        matched: false,
      }));
    setCards(doubled);
  }, []);

  // TIMER
  useEffect(() => {
    if (finished) return;

    const t = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(t);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [finished]);

  // CHECK WIN CONDITION
  useEffect(() => {
    if (cards.length && cards.every(c => c.matched)) {
      setFinished(true);
      setTimeout(endGame, 600);
    }
  }, [cards]);

  function calculateScore() {
    const pairs = cards.filter(c => c.matched).length / 2;
    const speedBonus = Math.max(0, time);
    return pairs * 10 + speedBonus - moves * 2;
  }

  function endGame() {
    navigate("/activity-result", {
      state: {
        activity,
        score: calculateScore()
      }
    });
  }

  function flipCard(index:number) {
    if (selected.length === 2 || cards[index].flipped || cards[index].matched || finished) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a,b] = newSelected;

      if (newCards[a].value === newCards[b].value) {
        newCards[a].matched = true;
        newCards[b].matched = true;
        setCards([...newCards]);
        setSelected([]);
      } else {
        setTimeout(() => {
          newCards[a].flipped = false;
          newCards[b].flipped = false;
          setCards([...newCards]);
          setSelected([]);
        }, 700);
      }
    }
  }

  return (
    <div style={{
      textAlign:"center",
      color:"#1e293b",
      padding:20
    }}>
      <h2 style={{fontSize:36, marginBottom:10}}>Memory Match 🧠</h2>

      {/* TIMER + MOVES (NOW VISIBLE) */}
      <p style={{
        fontSize:22,
        fontWeight:600,
        marginTop:10,
        color:"#334155"
      }}>
        Time: {time}s | Moves: {moves}
      </p>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(4,90px)",
        gap:14,
        justifyContent:"center",
        marginTop:30
      }}>
        {cards.map((c,i)=>(
          <div key={c.id}
            onClick={()=>flipCard(i)}
            style={{
              width:90,
              height:90,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              fontSize:34,
              cursor:"pointer",
              borderRadius:16,
              transition:"0.2s",
              background:c.flipped||c.matched?"#6366f1":"#1e293b",
              color:"white",
              userSelect:"none"
            }}>
            {(c.flipped||c.matched)?c.value:"?"}
          </div>
        ))}
      </div>
    </div>
  );
}



