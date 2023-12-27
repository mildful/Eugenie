import { useEffect, useRef, useState } from 'react'
import './App.css'


function insertAt(str: string, index: number, what: string): string {
  return str.substring(0, index) + what + str.substring(index);
}

function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState('I am a test text, please click me!');
  const [displayContent, setDisplayContent] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [isPrinting, setIsPrinting] = useState(false);

  const [hiddenWords, setHiddenWords] = useState<string[]>([]);

  const handleKeydown = (key: string) => {
    if (key === 'Alt' && contentRef.current) {
      setContent(contentRef.current.innerText)
      onClickHandler();
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proxy = (e: any) => handleKeydown(e.key)
    document.addEventListener("keydown", proxy, false);
    return () => {
      document.removeEventListener("keydown", proxy, false);
    }
  }, []);

  useEffect(() => {
    setDisplayContent(content);
  }, [content]);

  useEffect(() => {
    let obfuscatedContent = content;
    let overallOffset = 0;
    hiddenWords.sort((a, b) => +a.split('-')[0] - +b.split('-')[0]).forEach(str => {
      const info = str.split('-');
      const start = +info[0]
      const end = +info[1]
      const delta = end - start;

      let suffix = ''
      if (delta > 15) {
        suffix = ' xl'
      } else if (delta > 10) {
        suffix = ' l'
      }

      obfuscatedContent = insertAt(obfuscatedContent, overallOffset + end, `</span>`);
      obfuscatedContent = insertAt(obfuscatedContent, overallOffset + start, `<span class="hide${suffix}">`);

      overallOffset += 7 + 19 + suffix.length;
    })
    setDisplayContent(obfuscatedContent)
  }, [hiddenWords, content]);

  const onClickHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selection: any = document.getSelection();
    if (selection === null) return;

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

  // useEffect(() => {
  //   if (isPrinting && contentRef.current)
  //     setContent(contentRef.current.innerText)
  // }, [isPrinting, contentRef])

  return (
    <>
      <div className="controls">
        <input type="number" value={fontSize} onChange={e => setFontSize(+e.target.value ?? 12)} />
        <button onClick={() => setIsPrinting(!isPrinting)}>Mode impression : {isPrinting ? 'active' : 'desactive'}</button>
      </div>

      <div
        className='content'
        style={{fontSize}}
        contentEditable={!isPrinting}
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: isPrinting ? new Array(4).fill(displayContent).join('<br/>') : displayContent }}
      ></div>
    </>
  )
}

export default App
