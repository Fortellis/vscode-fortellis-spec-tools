const { createElement } = require("./utils"); // Required for jsx

const styles = `
  body {
    font-family: Raleway, sans-serif;
    background-color: #fff;
    color: #c81425;
  }
  h1 {
    font-size: 24px;
  }
  p {
    font-size: 18px;
  }

  .diagnostic-display {
    background-color: #fdf1f2;
    padding: 5px 20px;
  }
  .diagnostic-display__line {
    font-family: monospace;
    color: rgba(0,0,0,.87);
    white-space: pre;
  }
  .diagnostic-display__line.highlight {
    background-color: #fcc8c9;
  }`;

function generateError(err, document, diagnostics) {
  const app = (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Spec Error</title>
        <link
          href="https://fonts.googleapis.com/css?family=Raleway:400,500i,700&display=swap"
          rel="stylesheet"
        />
        <style>{styles}</style>
      </head>
      <body>
        <h1>Failed to Generate Spec Preview</h1>
        <p>{err.message}</p>
        {diagnostics && diagnostics.length
          ? generateErrorDom(document, diagnostics)
          : ""}
      </body>
    </html>
  );

  return "<!DOCTYPE html>" + app;
}

function generateErrorDom(document, diagnostics) {
  return diagnostics.map(diagnostic => {
    const line = diagnostic.range.start.line;

    return (
      <div class="diagnostic-display">
        {mapRange(line - 4, line + 4, i => (
          <div
            class={`diagnostic-display__line ${i === line ? "highlight" : ""}`}
          >
            {i + 1} | {document.lineAt(i).text}
          </div>
        ))}
      </div>
    );
  });
}

function mapRange(start, end, fn) {
  const arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(fn(i));
  }
  return arr;
}

module.exports = generateError;
