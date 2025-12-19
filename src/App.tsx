import { Bingo } from "./components/Bingo"

function App() {
  return (
    <>
      <div className="content">
        <h1>UMA-100</h1>

        <p className="description">Can you guess the characters? Type the character's name in the input field to light up the corresponding character. Get 5 correct in a row to win!</p>
        
        <Bingo />

        <p>Page last updated: {new Date(__BUILD_TIME__).toLocaleString()}</p>
        <p>Created by <a href="https://github.com/pugsedo">@pugsedo</a></p>
      </div>
    </>
  )
}

export default App
