import { useState, useEffect, useRef } from "react";
import './style.sass';
import book from './data.js'

function App() {

  const [sentenceArray, setSentenceArray] = useState(book.replace(/\n/g, " ").replace(/([.?!])\s*(?=[A-Z])/g, "|").split("|"))
  const [page, setPage] = useState(JSON.parse(localStorage.getItem("page")) ? JSON.parse(localStorage.getItem("page")) : 0)
  const [gameInputValue, setGameInputValue] = useState("")
  const [gameInputDisabled, setGameInputDisabled] = useState(true)
  const [okBtnText, setOkBtnText] = useState("Ok")
  const [answerText, setAnswerText] = useState("-")

  const [menu, setMenu] = useState(false)
  const [learn, setLearn] = useState(false)
  const [selectedSpans, setSelectedSpans] = useState(JSON.parse(localStorage.getItem("selectedSpans")) ? JSON.parse(localStorage.getItem("selectedSpans")) : [])
  const [taskNumbers, setTaskNumbers] = useState([])
  const [currentSentence, setCurrentSentence] = useState(0)
  const [score, setScore] = useState(0)
  const [translatedSentence, setTranslatedSentence] = useState("")
  const [originalSentence, setOriginalSentence] = useState("")
  const okBtn = useRef();
  const gameInput = useRef();

  useEffect(() => {
    if (selectedSpans.length > 0 && selectedSpans[selectedSpans.length - 1].translation === undefined) {
      translateQuestion(selectedSpans[selectedSpans.length - 1].spanId, selectedSpans[selectedSpans.length - 1].sentence)
    }
  }, [selectedSpans])

  function translateQuestion(spanId, sentence) {
    fetch("https://translate-service.scratch.mit.edu/translate?language=en&text=" + sentence)
      .then(response => response.json())
      .then(commits => {
        setSelectedSpans(() => {
          let nextSelectedSpans = [...selectedSpans]
          nextSelectedSpans.filter(obj => obj.spanId === spanId)[0].translation = commits.result
          localStorage.setItem("selectedSpans", JSON.stringify(nextSelectedSpans))
          return nextSelectedSpans
        })

      });
  }

  function spanClick(spanId, word, sentence) {
    let nextSelectedSpans = [...selectedSpans]
    if (nextSelectedSpans.filter(obj => obj.word === word).length === 0) {
      nextSelectedSpans.push({ spanId: spanId, word: word, sentence: sentence })
    } else {
      nextSelectedSpans.splice(nextSelectedSpans.indexOf(nextSelectedSpans.filter(obj => {
        return obj.word === word
      })[0]), 1)
      localStorage.setItem("selectedSpans", JSON.stringify(nextSelectedSpans))

    }
    console.log(nextSelectedSpans);
    setSelectedSpans(nextSelectedSpans)
  }

  useEffect(() => {
    if (selectedSpans.length > 0) {
      // console.log(selectedSpans[currentSentence]);
      setTranslatedSentence(selectedSpans[currentSentence].translation)
      let words = selectedSpans[currentSentence].sentence.split(/\r?\n/)[0].split(" ")
      let newSentence = ""
      for (let word of words) {
        if (word.includes(selectedSpans[currentSentence].word)) {
          newSentence = newSentence + '<input id="wordInp" type="text" size="10"> '
        }
        else {
          newSentence = newSentence + word + " "
        }
      }
      setOriginalSentence(newSentence)
    }
  }, [currentSentence])


  useEffect(() => {
    // handleLearnBtn()
    console.log(JSON.parse(localStorage.getItem("selectedSpans")));
    // localStorage.clear()
  }, [])

  useEffect(() => {
    if (taskNumbers.length > 0) {

      setCurrentSentence(taskNumbers[Math.floor(Math.random() * taskNumbers.length)])
    } else {

    }
  }, [taskNumbers])

  function handleLearnBtn() {
    setLearn(true)
    setGameInputDisabled(false)
    setTaskNumbers([...selectedSpans.keys()])
  }

  useEffect(() => {
    if (!gameInputDisabled) {
      console.log(gameInput.current);
      setTimeout(() => {
        gameInput.current.focus()
      }, 0)
    }
  }, [gameInputDisabled])

  function handleOkBtn(e) {
    e.preventDefault()
    if (okBtnText === "Ok") {
      console.log(taskNumbers);
      if (selectedSpans[currentSentence].word.toLowerCase() == gameInputValue.toLowerCase()) {
        setAnswerText("Correct!")
        if (taskNumbers.length == 1) {
          setOkBtnText("Again")
          setTaskNumbers(tn => {
            let newTn = []

            console.log(newTn);
            return newTn
          })
        } else {
          setOkBtnText("Next")
        }
      } else {
        setAnswerText("Wrong! Correct answer: " + selectedSpans[currentSentence].word)
        setOkBtnText("Next")
      }
      // wordInp.disabled = true
      setGameInputDisabled(true)
      // currentSentence = taskNumbers[Math.floor(Math.random() * taskNumbers.length)]
      // setCurrentSentence(taskNumbers[Math.floor(Math.random() * taskNumbers.length)])
      // ok.innerHTML = "Next"

      // ok.focus()
      okBtn.current.focus();
    } else if (okBtnText === "Next") {

      setTaskNumbers(tn => {
        let newTn = [...tn]
        if (answerText === "Correct!") {
          newTn.splice(tn.indexOf(currentSentence), 1)
        }
        console.log(newTn);
        return newTn
      })
      setAnswerText("-")
      setGameInputDisabled(false)
      setOkBtnText("Ok")
      // if (taskNumbers.length > 0) {

      //   getTask()
      //   ok.innerHTML = "Ok"
      //   answer.innerHTML = "-"
      //   wordInp.disabled = false

      // } else {
      //   ok.disabled = true
      //   answer.innerHTML = "Lesson complete!"
      // }
    } else {
      handleLearnBtn()
      setOkBtnText("Ok")
    }
  }

  function handleGameInput(e) {
    setGameInputValue(e.target.value)
    console.log(gameInputValue);
  }

  return (
    <div className="App">
      <div id="cont">
        {
          sentenceArray.slice(page * 100, (page + 1) * 100).map((sentence, sentenceId) =>
            <p key={sentenceId}>
              {
                sentence.split(" ").map((word, wordId) => {
                  let spanId = "" + page + sentenceId + wordId
                  return <span className={selectedSpans.filter(obj => obj.word === word).length > 0 ? "selectedSpan" : " "} key={wordId} onClick={() => spanClick(spanId, word, sentence)}>{sentence.split(" ").indexOf(word) === sentence.split(" ").length - 1 ? word + ". " : word + " "}</span>
                }
                )
              }
            </p>
          )
        }
      </div>
      <button id="menuBtn" className={menu ? "menuBtnSelected" : " "} type="button" onClick={() => setMenu(m => !m)}></button>
      <nav id="menu" className={menu ? "menuSelected" : " "}>
        <button type="button" id="readBtn" onClick={() => setLearn(false)}>Read</button>
        <button type="button" id="learnBtn" onClick={() => handleLearnBtn()}>Learn</button>
        <button>Dictionary</button>
        <button>Bin</button>
        <button>Books</button>
        <button>Settings</button>
      </nav>
      <div id="learn" className={learn ? "learnSelected" : " "}>
        <form action="">
          <p id="score">{(selectedSpans.length - taskNumbers.length) + "/" + selectedSpans.length}</p>
          <p id="eng">{translatedSentence}</p>
          {/* <p id="fr" dangerouslySetInnerHTML={{__html: originalSentence}}></p> */}
          <p id="fr">
            {
              selectedSpans[currentSentence] ? selectedSpans[currentSentence].sentence.split(/\r?\n/)[0].split(" ").map((el, i) =>
                el === selectedSpans[currentSentence].word ? <input id="wordInp" type="text" size={selectedSpans[currentSentence].word.length} maxLength={selectedSpans[currentSentence].word.length} onChange={(event) => handleGameInput(event)} disabled={gameInputDisabled} ref={gameInput}></input> : " " + el + " "
              ) : null
            }
          </p>
          <p id="answer">{answerText}</p>
          <button id="ok" ref={okBtn} onClick={(event) => handleOkBtn(event)}>{okBtnText}</button>
          <button id="reset" type="button">Reset</button>
        </form>
      </div>
      {/* <div id="learn">
        <form action="">
          <p id="score"></p>
          <p id="eng"></p>
          <p id="fr"></p>
          <p id="answer">-</p>
          <button id="loadBtn">Ok</button>
        </form>
      </div> */}
    </div>
  );
}

export default App;
