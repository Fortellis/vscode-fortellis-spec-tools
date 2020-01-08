const { parseWithPointers } = require("@stoplight/yaml");

const start = '<!DOCTYPE html><html lang="en">';
const end = "</html>";

function head(title) {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>`;
}

function generatePreview(document) {
  console.log('called gen')
  const parsedSpec = parseWithPointers(document, { json: false });
  const spec = parsedSpec.data;
  const dom = `${start}${head(spec.info.title)}
<body>
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
</body>
${end}`;

  console.log(dom);

  return dom;
}

module.exports = generatePreview;
