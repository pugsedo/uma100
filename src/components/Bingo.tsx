import { useEffect, useMemo, useState } from "react"
import type { Character } from "../types/Character"

const LINES = [
  // rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],

  // columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],

  // diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
]

export function Bingo() {
  const [randomCharacters, setRandomCharacters] = useState<Character[]>([])
  const [active, setActive] = useState<Set<string>>(new Set())

  const [lastActive, setLastActive] = useState<string | null>(null)
  const [guess, setGuess] = useState("")

  // fetch + shuffle once
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/data/data.json")
      const json: Character[] = await response.json()

      const shuffled = [...json].sort(() => Math.random() - 0.5)
      setRandomCharacters(shuffled.slice(0, 25))
    }

    fetchData()
  }, [])

  // ✅ DERIVED STATE (this replaces the effect + setWon)
  const won = useMemo(() => {
    if (active.size < 5) return false

    const activeIndices = new Set(
      randomCharacters
        .map((c, i) => (active.has(c.name) ? i : -1))
        .filter(i => i !== -1)
    )

    return LINES.some(line =>
      line.every(i => activeIndices.has(i))
    )
  }, [active, randomCharacters])

  const handleGuess = () => {
    if (won) return

    const normalized = guess.trim().toLowerCase()
    if (!normalized) return

    const match = randomCharacters.find(
      c => c.name.toLowerCase() === normalized
    )

    if (!match) {
      setGuess("")
      return
    }

    setLastActive(match.name)

    setActive(prev => {
      if (prev.has(match.name)) return prev
      const next = new Set(prev)
      next.add(match.name)
      return next
    })

    setGuess("")
  }

  if (randomCharacters.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="bingo">
      <input
        type="text"
        placeholder="Guess the character..."
        value={guess}
        disabled={won}
        onChange={e => setGuess(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleGuess()}
      />

      {won && <div className="win">BINGO 🎉</div>}

      <div className="grid">
        {randomCharacters.map(item => (
          <div
            key={item.name}
            className={`grid-item ${
              lastActive === item.name ? "selected" : ""
            }`}
          >
            <img
              src={`/data/${item.thumb
                .split("/")
                .map(encodeURIComponent)
                .join("/")}`}
              alt={item.name}
              title={item.name}
              data-tooltip={item.name}
              className={active.has(item.name) ? "active" : ""}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
