const { parseWithPointers } = require("@stoplight/yaml");
const refparser = require("json-schema-ref-parser");

const start = '<!DOCTYPE html><html lang="en">';
const end = "</html>";

const styles = `<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #fff;
    color: rgba(0,0,0,.87);
  }

  a {
    color: #904778;
    font-weight: 600;
    text-decoration: none;
  }

  .spec-header {
    background-color: #f5f5f5;
  }
  .spec-header__description {
    padding: 30px 20px;
  }
  .spec-header__description h1 {
    margin: 0;
    font-size 34px;
    font-weight: 600;
    line-height: 40px;
    letter-spacing: .25px;
  }
  .spec-header__description p {
    margin-bottom: 0;
    font-size: 16px;
    line-height: 24px;
    font-weightL 400;
  }

  .spec-endpoint {
    width: calc(100% - 40px);
    margin: 20px;
    border: 1px solid rgba(0,0,0,.12);
    box-sizing: border-box;
  }
  .spec-endpoint__header {
    padding: 16px 26px;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12)
  }
  .spec-endpoint__header-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
  }
  .spec-endpoint__header-description {
    font-size: 16px;
    line-height: 24px;
    margin-top: 9px;
  }
  .method.post {
    color: rgb(30, 135, 0);
  }
  .method.get {
    color: rgb(0, 78, 154);
  }
  .spec-endpoint__body {
    padding: 0px 26px 16px;
    box-sizing: border-box;
  }
  .resource-url {
    background-color: rgba(0,0,0,.87);
    margin: 0;
    font-family: monospace;
    font-size: 13px;
    letter-spacing: .82px;
    line-height: 18px;
    font-weight: 500;
    padding: 6px 16px;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .resource-url code {
    white-space: pre;
    color: #fff;
  }

  .table-container {
    border-radius: 4px;
    overflow: auto;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 2px 1px -1px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    overflow: auto;
    border-spacing: 0;
  }
  thead tr th {
    color: white;
    background-color: rgb(32, 38, 50);
    padding: 12px 16px;
    text-align: left;
  }
  thead tr th:first-child {
    border-radius: 4px 0px 0px 0px;
  }
  thead tr th:last-child {
    border-radius: 0px 4px 0px 0px;
  }
  tbody {
    border-radius: 0px 0px 4px 4px;
  }
  tbody tr td {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.15px;
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid rgb(224,224,224);
  }
</style>`;

function head(title) {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${styles}
</head>`;
}

function apiTitle(spec) {
  return `<div class="spec-header">
    <div class="spec-header__description">
      <h1>${spec.info.title}</h1>
      <a href="https://apidocs.fortellis.io">${
        spec.basePath
          ? spec.basePath
              .split("/")[1]
              .split("-")
              .join(" ")
          : "basePath"
      }</a>
      <p>${spec.info.description}</p>
    </div>
  </div>`;
}

function apiEndpoint(spec, path, method, endpoint) {
  return `<div class="spec-endpoint">
    <div class="spec-endpoint__header">
      <h2 class="spec-endpoint__header-title">
        <span class="method ${method}">${method.toUpperCase()}</span>
         - ${endpoint.operationId}
      </h2>
      <p class="spec-endpoint__header-description">${endpoint.description}</p>
    </div>
    <div class="spec-endpoint__body">
      <h3>Resource URL</h3>
      <div class="resource-url">
          <code>https://api.fortellis.io/${path}</code>
      </div>
      <h2>Request</h2>
      ${apiParameters(spec, endpoint)}
    </div>
  </div>`;
}

function apiParameters(spec, { parameters }) {
  console.log(parameters);
  const dom = [];
  const headers = ["Parameter", "Type", "Description", "Required"];
  const params = [
    {
      title: "Path Parameters",
      params: parameters.filter(p => p.in && p.in === "path")
    },
    {
      title: "Query Parameters",
      params: parameters.filter(p => p.in && p.in === "query")
    },
    {
      title: "Header Parameters",
      params: parameters.filter(p => p.in && p.in === "header")
    }
  ];

  params.forEach(type => {
    if (type.params.length) {
      dom.push(`
        <div>
          <h3>${type.title}</h3>
          ${createTable(
            headers,
            type.params.map(p => {
              return [
                p.name || "",
                p.type || "",
                p.description || "",
                p.required || false
              ];
            })
          )}
        </div>
      `);
    }
  });

  const bodyParams = parameters.filter(p => p.in && p.in === "body");

  return dom.join("\n");
}

function createTable(headings, rows) {
  return `<div class="table-container">
    <table>
      <thead>
        <tr>
          ${headings
            .map(th => {
              return `<th>${th}</th>`;
            })
            .join("\n")}
        </tr>
      </thead>
      <tbody>
          ${rows
            .map(tr => {
              return `<tr>${tr
                .map(td => {
                  return `<td>${td}</td>`;
                })
                .join("\n")}</tr>`;
            })
            .join("\n")}
      </tbody>
    </table>
  </div>`;
}

async function generatePreview(document) {
  const parsedSpec = parseWithPointers(document, { json: false });
  const spec = await refparser.dereference(parsedSpec.data);
  const paths = Object.entries(spec.paths).map(([path, pathObj]) => {
    const methods = Object.entries(pathObj).map(([method, methodObj]) => {
      return { method, methodObj };
    });
    return { path, methods };
  });

  const pathsDom = paths
    .map(({ path, methods }) => {
      return methods
        .map(({ method, methodObj }) => {
          return apiEndpoint(spec, spec.basePath + path, method, methodObj);
        })
        .join("\n");
    })
    .join("\n");

  const dom = `${start}${head(spec.info.title)}
<body>
    <div>
      ${apiTitle(spec)}
      ${pathsDom}
    </div>
</body>
${end}`;

  return dom;
}

module.exports = generatePreview;
