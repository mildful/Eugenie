import { ChangeEventHandler, useEffect, useState } from 'react'
import './App.css'


function insertAt(str: string, index: number, what: string): string {
  return str.substring(0, index) + what + str.substring(index);
}

function App() {
  const [content, setContent] = useState('I am a test text, please click me!');
  const [displayContent, setDisplayContent] = useState('')
  const [hideMode, setHideMode] = useState(false);
  const [hiddenWords, setHiddenWords] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState(12);

  const handleKeydown = (hm: boolean, code: string) => {
    if (hm && code === 'KeyC') {
      onClickHandler();
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proxy = (e: any) => handleKeydown(hideMode, e.code)
    document.addEventListener("keydown", proxy, false);
    return () => {
      document.removeEventListener("keydown", proxy, false);
    }
  }, [hideMode]);

  useEffect(() => {
    setDisplayContent(content);
  }, [content]);

  useEffect(() => {
    if (!hideMode) return;
    let obfuscatedContent = content;
    let overallOffset = 0;
    hiddenWords.sort((a, b) => +a.split('-')[0] - +b.split('-')[0]).forEach(str => {
      const info = str.split('-');
      const start = +info[0]
      const end = +info[1]

      obfuscatedContent = insertAt(obfuscatedContent, overallOffset + end, `</span>`);
      obfuscatedContent = insertAt(obfuscatedContent, overallOffset + start, `<span class="hide">`);

      overallOffset += 7 + 19;
    })
    setDisplayContent(obfuscatedContent)
  }, [hiddenWords, content, hideMode]);

  const onChangeHandler: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    if (hideMode) return;
    setContent(e.target.value)
  }

  const onClickHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selection: any = document.getSelection();
    if (!hideMode || selection === null) return;

    let subNode = selection.baseNode;
    let parentNode = selection.baseNode.parentNode;
    let offset = 0;

    if (parentNode.classList.contains('hide')) {
      subNode = parentNode;
      parentNode = parentNode.parentNode;
    }

    for (const n of parentNode.childNodes) {
      if (n === subNode) {
        break;
      } else {
        const num = n.textContent ? n.textContent.length : n.length;
        offset += num ?? 5;
      }
    }

    const startIndex = offset+selection.anchorOffset
    const endIndex = offset+selection.focusOffset
    const key = `${startIndex}-${endIndex}`;

    const arrIndex = hiddenWords.indexOf(key);

    if (arrIndex >= 0) {
      setHiddenWords([
        ...hiddenWords.slice(0, arrIndex),
        ...hiddenWords.slice(arrIndex + 1)
      ])
    } else {
      if(parentNode.classList.contains('hide')) {
        alert ("La selection n'est pas valide sistah!");
        return;
      }
  
      if(endIndex < startIndex) {
        alert ("La selection n'est pas valide sistah!");
        return;
      }

      setHiddenWords(oldValue => [
        ...oldValue,
        key
      ])
    }
  }

  const switchMode = () => {
    if (hideMode) {
      //go to write
      setContent(content.replace(/<br\/>/gm, '\n'))
    } else {
      // go to hide
      setContent(content.replace(/\n/gm, ' <br/>'))
    }
    setHideMode(!hideMode);
  }

  return (
    <>
      <div className="controls">
        <input type="number" value={fontSize} onChange={e => setFontSize(+e.target.value ?? 12)} />
        <button onClick={switchMode}>mode: {hideMode?'cache':'ecriture'}</button>
        {hideMode && <button onClick={onClickHandler}>cacher/montrer</button>}
      </div>

      {hideMode ? (
        <div
          className='content'
          style={{fontSize}}
          dangerouslySetInnerHTML={{ __html: displayContent }}
        >
        </div>
      ) : (
        <textarea
          className='content'
          style={{fontSize}}
          value={content}
          onChange={onChangeHandler}
        />
      )}
    </>
  )
}

export default App
