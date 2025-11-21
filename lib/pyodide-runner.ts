// Pyodideの型定義
type PyodideInterface = any;

// グローバルなloadPyodide関数の型定義
declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

let pyodideInstance: PyodideInterface | null = null;
let isLoading = false;

export async function initPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (isLoading) {
    // 既に読み込み中の場合は待機
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (pyodideInstance) {
      return pyodideInstance;
    }
  }

  isLoading = true;
  try {
    // ブラウザ環境でのみ実行
    if (typeof window === "undefined") {
      throw new Error("Pyodide can only be loaded in the browser");
    }

    // Pyodideスクリプトがまだロードされていない場合
    if (!window.loadPyodide) {
      // スクリプトを動的にロード
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Pyodide script"));
        document.head.appendChild(script);
      });
    }

    pyodideInstance = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/",
    });
    return pyodideInstance;
  } finally {
    isLoading = false;
  }
}

export async function runPythonCode(code: string): Promise<{
  output: string[];
  error: string | null;
}> {
  try {
    const pyodide = await initPyodide();

    // stdout/stderrをキャプチャする
    const output: string[] = [];
    const errorOutput: string[] = [];

    pyodide.setStdout({
      batched: (msg) => {
        output.push(msg);
      },
    });

    pyodide.setStderr({
      batched: (msg) => {
        errorOutput.push(msg);
      },
    });

    try {
      await pyodide.runPythonAsync(code);

      return {
        output,
        error: errorOutput.length > 0 ? errorOutput.join("\n") : null,
      };
    } catch (err) {
      return {
        output,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  } catch (err) {
    return {
      output: [],
      error: `Pyodideの初期化エラー: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
