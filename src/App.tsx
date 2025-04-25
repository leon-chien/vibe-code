import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const codeSnippets: Record<string, string[]> = {
  python: [
    `def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n\n    while left <= right:\n        mid = left + (right - left) // 2\n\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n\n    return -1`,
    `class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n\n    def append(self, data):\n        new_node = Node(data)\n\n        if not self.head:\n            self.head = new_node\n            return\n\n        current = self.head\n        while current.next:\n            current = current.next\n\n        current.next = new_node`,
    `def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n\n    return quick_sort(left) + middle + quick_sort(right)`,
    `import numpy as np\nimport matplotlib.pyplot as plt\n\ndef plot_function(f, x_range=(-10, 10), num_points=1000):\n    x = np.linspace(x_range[0], x_range[1], num_points)\n    y = f(x)\n\n    plt.figure(figsize=(10, 6))\n    plt.plot(x, y)\n    plt.grid(True)\n    plt.axhline(y=0, color='k', linestyle='-', alpha=0.3)\n    plt.axvline(x=0, color='k', linestyle='-', alpha=0.3)\n    plt.xlabel('x')\n    plt.ylabel('f(x)')\n    plt.title('Function Plot')\n    plt.show()`
  ],
  javascript: [
    `function bubbleSort(arr) {\n    const len = arr.length;\n\n    for (let i = 0; i < len; i++) {\n        for (let j = 0; j < len - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n            }\n        }\n    }\n\n    return arr;\n}`,
    `class Person {\n    constructor(name, age) {\n        this.name = name;\n        this.age = age;\n    }\n\n    greet() {\n        return \`Hello, my name is \${this.name} and I am \${this.age} years old.\`;\n    }\n\n    static compareAges(a, b) {\n        return a.age - b.age;\n    }\n}\n\nconst alice = new Person('Alice', 28);\nconsole.log(alice.greet());`,
    `const fetchData = async (url) => {\n    try {\n        const response = await fetch(url);\n        if (!response.ok) {\n            throw new Error(\`HTTP error! Status: \${response.status}\`);\n        }\n        const data = await response.json();\n        return data;\n    } catch (error) {\n        console.error('Fetch error:', error);\n        throw error;\n    }\n}`,
    `function debounce(func, delay) {\n    let timeoutId;\n    return function(...args) {\n        clearTimeout(timeoutId);\n        timeoutId = setTimeout(() => func.apply(this, args), delay);\n    };\n}`
  ],
  c: [
    `#include <stdio.h>\n#include <stdlib.h>\n\nstruct Node {\n    int data;\n    struct Node* next;\n};\n\nstruct Node* createNode(int data) {\n    struct Node* newNode = malloc(sizeof(*newNode));\n    newNode->data = data;\n    newNode->next = NULL;\n    return newNode;\n}\n\nvoid insertAtEnd(struct Node** head, int data) {\n    struct Node* newNode = createNode(data);\n    if (!*head) { *head = newNode; return; }\n    struct Node* tmp = *head;\n    while (tmp->next) tmp = tmp->next;\n    tmp->next = newNode;\n}`,
    `#include <stdio.h>\n\nvoid swap(int* a, int* b) {\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nvoid selectionSort(int arr[], int n) {\n    for (int i = 0; i < n-1; i++) {\n        int min = i;\n        for (int j = i+1; j < n; j++)\n            if (arr[j] < arr[min]) min = j;\n        swap(&arr[min], &arr[i]);\n    }\n}`,
    `#include <stdio.h>\n#include <stdlib.h>\n\n#define MAX_SIZE 100\n\ntypedef struct {\n    int items[MAX_SIZE];\n    int top;\n} Stack;\n\nvoid initialize(Stack* s) { s->top = -1; }\nint isEmpty(const Stack* s) { return s->top == -1; }\nint isFull(const Stack* s) { return s->top == MAX_SIZE-1; }\nvoid push(Stack* s, int v) { if (!isFull(s)) s->items[++s->top] = v; }\nint pop(Stack* s) { return isEmpty(s) ? -1 : s->items[s->top--]; }`,
    `#include <stdio.h>\n#include <string.h>\n\nvoid reverseString(char* str) {\n    int i = 0, j = strlen(str) - 1;\n    while (i < j) { char t = str[i]; str[i++] = str[j]; str[j--] = t; }\n}`
  ]
};

type Language = 'python' | 'javascript' | 'c';
const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('python');
  const [lines, setLines] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [time, setTime] = useState(60);
  const [typed, setTyped] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const typingTimeout = useRef<number | null>(null);

  const init = () => {
    const snippet = codeSnippets[lang][Math.floor(Math.random() * codeSnippets[lang].length)];
    const newLines = snippet.split('\n');
    setLines(newLines);
    setIdx(0);
    setTime(60);
    setTyped(0);
    setCorrect(0);
    setActive(false);
    if (inputRef.current) inputRef.current.value = '';
    if (timerRef.current !== null) clearInterval(timerRef.current);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => { init(); }, [lang]);

  useEffect(() => {
    if (active) {
      timerRef.current = window.setInterval(() => {
        setTime(t => (t > 0 ? t - 1 : (clearInterval(timerRef.current!), 0)));
      }, 1000);
    }
    return () => { if (timerRef.current !== null) clearInterval(timerRef.current); };
  }, [active]);

  const cpm = time < 60 ? Math.round(typed / ((60 - time) / 60)) : 0;
  const acc = typed > 0 ? Math.round((correct / typed) * 100) : 0;

  const totalText = lines.join('\n');

  const currentLineIndex = totalText.slice(0, idx).split('\n').length - 1;
  const scrollOffset = Math.max(0, currentLineIndex - 1); // scroll from second line
  const lineHeightPx = 60.8; // line height in px, must match CSS

  return (
    <div className="App">
      <div className="header">
        <h1>VibeCode</h1>
        <p>Improve your coding speed with typing tests</p>
      </div>
      <div className="test-wrapper">
        <div className="language-select">
          {(['python','javascript','c'] as Language[]).map(l => (
            <button key={l} className={`language-btn ${l === lang ? 'active' : ''}`} onClick={() => setLang(l)}>{l}</button>
          ))}
        </div>
        <div className="timer">{time}</div>
        <div className="code-display">
          <div className="code-text" style={{ transform: `translateY(-${scrollOffset * lineHeightPx}px)` }}>
            {lines.map((line, lineIdx) => {
              const startIdx = lines.slice(0, lineIdx).reduce((sum, l) => sum + l.length + 1, 0);
              const isEmptyLine = line.length === 0;
              const isCursorOnEmptyLine = isEmptyLine && idx === startIdx;
              const isCursorAtEnd = idx === startIdx + line.length;

              return (
                <div key={lineIdx}>
                  {isEmptyLine ? (
                    isCursorOnEmptyLine ? <span className="code-char current">&nbsp;</span> : <span className="code-char">&nbsp;</span>
                  ) : (
                    <>
                      {(() => {
                        const chars = line.split('');
                        const groupedSpans = [];
                        let group = '';
                        let lastClass = '';
                        for (let charIdx = 0; charIdx <= chars.length; charIdx++) {
                          const ch = chars[charIdx];
                          const flatIdx = startIdx + charIdx;
                          const userChar = inputRef.current?.value[flatIdx] ?? '';
                          const isPending = flatIdx >= (inputRef.current?.value.length ?? 0);
                          const isCurrent = flatIdx === idx;

                          let currentClass = isPending ? 'pending' : ch === userChar ? 'correct' : 'incorrect';
                          if (isCurrent) currentClass += ' current';

                          if (currentClass !== lastClass && group.length > 0) {
                            groupedSpans.push(
                              <span
                                key={charIdx + '-' + lastClass}
                                className={`code-char ${lastClass}`.trim()}
                                dangerouslySetInnerHTML={{
                                  __html: group
                                  .replace(/&/g, '&amp;')
                                  .replace(/</g, '&lt;')
                                  .replace(/>/g, '&gt;')
                                  .replace(/ /g, '&nbsp;')
                                  .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                                }}
                              />
                            );
                            group = '';
                          }

                          if (ch !== undefined) {
                            group += ch;
                            lastClass = currentClass;
                          }
                        }
                        if (group.length > 0) {
                          groupedSpans.push(
                            <span
                              key={'end-' + lastClass}
                              className={`code-char ${lastClass}`.trim()}
                              dangerouslySetInnerHTML={{
                                __html: group
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/ /g, '&nbsp;')
                                .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                              }}
                            />
                          );
                        }
                        return groupedSpans;
                      })()}
                      {isCursorAtEnd && <span className="code-char current">&nbsp;</span>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="input-area">
          <textarea
            ref={inputRef}
            className="input-field"
            onChange={e => {
              const v = e.target.value;
              if (!active && v.length > 0) setActive(true);
              setTyped(v.length);
              setCorrect([...v].filter((c, i) => c === totalText[i]).length);
              setIdx(v.length);
            }}
            onKeyDown={e => {
              const textarea = inputRef.current!;
              const pos = textarea.selectionStart;
              const value = textarea.value;
              const totalLen = totalText.length;

              const isAtEndOfLine = (() => {
                const lineIdx = totalText.slice(0, pos).split('\n').length - 1;
                const lineStart = lines.slice(0, lineIdx).reduce((sum, l) => sum + l.length + 1, 0);
                return pos === lineStart + (lines[lineIdx]?.length ?? 0);
              })();

              if (isAtEndOfLine && !(e.key === 'Enter' || e.key === 'Backspace')) {
                e.preventDefault();
                return;
              }

              if (e.key === 'Backspace') {
                if (pos > 0 && value[pos - 1] === '\n') {
                  e.preventDefault();
                }
              }

              if (e.key === 'Tab') {
                e.preventDefault();
                const s = textarea.selectionStart!;
                const ePos = textarea.selectionEnd!;
                const ins = '    ';
                textarea.value = value.slice(0, s) + ins + value.slice(ePos);
                setIdx(s + ins.length);
                setTimeout(() => textarea.dispatchEvent(new Event('input')), 0);
              }

              if (e.key === 'Enter') {
                e.preventDefault();
                const beforeCursor = value.slice(0, pos);
                const linesBefore = beforeCursor.split('\n');
                const currentLineIdx = linesBefore.length - 1;
                const cursorOffset = linesBefore[linesBefore.length - 1].length;

                const codeLine = lines[currentLineIdx] || '';
                const nextCodeLine = lines[currentLineIdx + 1] || '';
                const indent = nextCodeLine.match(/^\s*/)?.[0] ?? '';

                if (cursorOffset === codeLine.length) {
                  const newValue = value.slice(0, pos) + '\n' + indent + value.slice(pos);
                  const newPos = pos + 1 + indent.length;
                  textarea.value = newValue;
                  textarea.setSelectionRange(newPos, newPos);
                  setIdx(newValue.length);
                } else {
                  const newValue = value.slice(0, pos) + ' ' + value.slice(pos);
                  textarea.value = newValue;
                  textarea.setSelectionRange(pos + 1, pos + 1);
                  setIdx(newValue.length);
                  setTyped(prev => prev + 1);
                  setCorrect(prev => prev);
                }
                setTimeout(() => textarea.dispatchEvent(new Event('input')), 0);
              }
            }}
          />
          <button className="restart-btn" onClick={init}>Restart Test</button>
        </div>
        <div className="result-wrapper">
          <div className="result-card"><div className="result-title">CPM</div><div className="result-value">{cpm}</div></div>
          <div className="result-card"><div className="result-title">Accuracy</div><div className="result-value">{acc}%</div></div>
          <div className="result-card"><div className="result-title">Time</div><div className="result-value">{time}s</div></div>
        </div>
      </div>
      <footer>Inspired by Monkeytype | Created for programmers</footer>
    </div>
  );
};

export default App;