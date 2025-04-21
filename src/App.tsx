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
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [time, setTime] = useState(60);
  const [typed, setTyped] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const typingTimeout = useRef<number | null>(null);

  const init = () => {
    const arr = codeSnippets[lang];
    setText(arr[Math.floor(Math.random() * arr.length)]);
    setIdx(0);
    setTime(60);
    setTyped(0);
    setCorrect(0);
    setActive(false);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => { init(); }, [lang]);

  useEffect(() => {
    if (active) {
      timerRef.current = window.setInterval(() => {
        setTime(t => (t > 0 ? t - 1 : (clearInterval(timerRef.current!), 0)));
      }, 1000);
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [active]);

  const cpm = time < 60 ? Math.round(typed / ((60 - time) / 60)) : 0;
  const acc = typed > 0 ? Math.round((correct / typed) * 100) : 0;

  return (
    <div className="App">
      <div className="header">
        <h1>VibeCode</h1>
        <p>Improve your coding speed with typing tests</p>
      </div>
      <div className="test-wrapper">
        <div className="language-select">
          {(['python','javascript','c'] as Language[]).map(l => (
            <button
              key={l}
              className={`language-btn ${l === lang ? 'active' : ''}`}
              onClick={() => setLang(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="timer">{time}</div>
        <div className="code-display">
          <div className="code-text">
            {text.split('').map((ch, i) => (
              <span
                key={i}
                className={`code-char ${
                  i < idx
                    ? ch === (inputRef.current?.value[i] || '') ? 'correct' : 'incorrect'
                    : ''
                } ${i === idx ? 'current' : ''} ${i > idx ? 'pending' : ''}`}
                dangerouslySetInnerHTML={{
                  __html:
                    ch === ' '
                      ? '&nbsp;'
                      : ch === '\n'
                      ? '<br/>'
                      : ch === '\t'
                      ? '&nbsp;&nbsp;&nbsp;&nbsp;'
                      : ch
                }}
              />
            ))}
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
            setCorrect(
              [...v].filter((c, i) => c === text[i]).length
            );
            setIdx(v.length);
          }}
          onKeyDown={e => {
            const currentChar = document.querySelector('.code-char.current');
            if (currentChar) {
              currentChar.classList.add('typing');
              if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
              }
              typingTimeout.current = window.setTimeout(() => {
                currentChar.classList.remove('typing');
              }, 500);
            }

            if (e.key === 'Tab') {
              e.preventDefault();
              const v = inputRef.current!.value;
              const ins = '    ';
              const s = inputRef.current!.selectionStart!;
              const ePos = inputRef.current!.selectionEnd!;
              inputRef.current!.value = v.slice(0, s) + ins + v.slice(ePos);
              setIdx(s + ins.length);
              setTimeout(() => inputRef.current!.dispatchEvent(new Event('input')), 0);
            }

            if (e.key === 'Enter') {
              e.preventDefault();
              const textarea = inputRef.current!;
              const value = textarea.value;
              const cursor = textarea.selectionStart;
            
              const beforeCursor = value.slice(0, cursor);
              const linesBefore = beforeCursor.split('\n');
              const currentLineIdx = linesBefore.length - 1;
              const cursorOffset = linesBefore[linesBefore.length - 1].length;
            
              const codeLines = text.split('\n');
              const currentLineInCode = codeLines[currentLineIdx] || '';
            
              // IDE-style Enter at end of line
              if (cursorOffset === currentLineInCode.length) {
                const nextLine = codeLines[currentLineIdx + 1] || '';
                const indent = nextLine.match(/^\s*/)?.[0] ?? '';
                const newValue = value.slice(0, cursor) + '\n' + indent + value.slice(cursor);
                const newPos = cursor + 1 + indent.length;
            
                textarea.value = newValue;
                textarea.setSelectionRange(newPos, newPos);
                setIdx(newValue.length);
                setTimeout(() => textarea.dispatchEvent(new Event('input')), 0);
              } else {
                // Enter in middle of line – count as incorrect space
                const newValue = value.slice(0, cursor) + ' ' + value.slice(cursor);
                const newPos = cursor + 1;
            
                textarea.value = newValue;
                textarea.setSelectionRange(newPos, newPos);
                setIdx(newValue.length);
            
                // Mark as incorrect manually
                setTyped(prev => prev + 1);
                setCorrect(prev => prev); // Don't increase correct count
            
                setTimeout(() => textarea.dispatchEvent(new Event('input')), 0);
              }
            }
          }}
        />
          <button className="restart-btn" onClick={init}>
            Restart Test
          </button>
        </div>
        <div className="result-wrapper">
          <div className="result-card">
            <div className="result-title">CPM</div>
            <div className="result-value">{cpm}</div>
          </div>
          <div className="result-card">
            <div className="result-title">Accuracy</div>
            <div className="result-value">{acc}%</div>
          </div>
          <div className="result-card">
            <div className="result-title">Time</div>
            <div className="result-value">{time}s</div>
          </div>
        </div>
      </div>
      <footer>Inspired by Monkeytype | Created for programmers</footer>
    </div>
  );
};

export default App;
