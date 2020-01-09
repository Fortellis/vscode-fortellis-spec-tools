const { parseWithPointers } = require("@stoplight/yaml");
const refparser = require("json-schema-ref-parser");
const mergeAllOf = require("json-schema-merge-allof");
const marky = require("markyjs");

const start = '<!DOCTYPE html><html lang="en">';
const end = "</html>";

const styles = `<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #fff;
    color: rgba(0,0,0,.87);
    font-family: Raleway, sans-serif;
  }

  a {
    color: #904778;
    font-weight: 600;
    text-decoration: none;
  }

  .preview-banner {
    top: 0;
    position: sticky;
    position: -webkit-sticky;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
    padding: 20px 0px;
    border-bottom: 2px solid #f5f5f5;
  }
  .preview-banner h1 {
    margin: 0px 0px 5px;
    font-size: 20px;
  }
  .preview-banner p {
    margin: 0px;
  }

  .spec-header {
    background-color: #f5f5f5;
  }
  .spec-header__description {
    padding: 30px 20px;
  }
  .spec-header__description-title {
    margin: 0;
    font-size 34px;
    font-weight: 600;
    line-height: 40px;
    letter-spacing: .25px;
    font-family: Montserrat, sans-serif;
  }
  .spec-header__description-description {
    margin: 10px 0px;
  }
  .spec-header__description-description h1 {
    font-size: 20px;
    line-height: 32px;
    letter-spacing: .15px;
    font-weight: 600;
  }
  .spec-header__description-description p {
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
  }

  .resource-detail {
    width: 100%;
    border-radius: 4px;
    border: 1px solid rgb(239, 239, 239);
    height: 50px;
    display: flex;
    margin-bottom: 5px;
    overflow: auto;

    font-size: 14px;
  }
  .resource-detail__title {
    background-color: rgb(245, 248, 250);
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 171px;
    max-width: 171px;
  }
  .resource-detail__content {
    display: flex;
    align-items: center;
    padding-left: 24px;
    font-weight: 500;
    color: rgba(0,0,0,.6);
  }

  .spec-endpoint {
    width: calc(100% - 40px);
    margin: 15px;
    border: 1px solid rgba(0,0,0,.12);
    box-sizing: border-box;
  }
  .spec-endpoint__header {
    padding: 16px 26px;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12)
  }
  .spec-endpoint__header-title {
    margin: 0px;
    font-size: 20px;
    font-weight: 600;
    line-height: 24px;
    font-family: Montserrat, sans-serif;
  }
  .spec-endpoint__header-description {
    font-size: 16px;
    line-height: 24px;
    margin: 9px 0px 0px;
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
  .spec-endpoint__body h2 {
    margin-top: 24px;
    font-size: 20px;
    line-height: 24px;
  }
  .spec-endpoint__body h3 {
    font-size: 14px;
    line-height: 24px;
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
    overflow: auto;
  }
  .resource-url code {
    white-space: pre;
    color: #fff;
    overflow: scroll;
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
  
  .codeblock {
    background-color: rgba(0,0,0,.87);
    color: white;
    border-radius: 4px;
    padding: 20px;
    box-sizing: border-box;
    max-height: 800px;
    overflow: auto;
    width: 100%;
  }

  .schema-list {
    list-style: none;
    padding-left: 0px;
    margin-top: 5px;
    margin-left: 40px;
    border-left: 1px solid rgb(204, 204, 204);
    overflow: visible;
  }
  .schema-list.first {
    margin-left: 5px;
  }
  .schema-property {
    margin: 0px 0px 8px;
  }
  .schema-property__description {

  }
  .schema-property__description-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 24px;
    display: inline-block;
    margin-left: 20px;
  }
  .schema-property__description-type {
    color: rgba(0,0,0,.6);
    display: inline;
    margin-left: 5px;
    font-size: 12px;
    line-height: 14px;
  }
  .schema-property__description-description {
    margin-left: 20px;
  }
  .array-bound {
    margin-left: 40px;
  }
  .required {
    color: rgb(176, 0, 32);
    display: inline;
    margin-left: 5px;
    font-size: 12px;
    line-height: 14px;
    font-weight: 500;
  }
</style>`;

function head(title) {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:700|Raleway:400,500i,700&display=swap" rel="stylesheet"> 
  ${styles}
</head>`;
}

function apiTitle(spec) {
  return `<div class="spec-header">
    <div class="spec-header__description">
      <h1 class="spec-header__description-title">${spec.info.title}</h1>
      <a href="https://apidocs.fortellis.io">${
        spec.basePath
          ? spec.basePath
              .split("/")[1]
              .split("-")
              .join(" ")
          : "basePath"
      }</a>
      <div class="spec-header__description-description">${marky(
        spec.info.description
      )}</div>
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
      <h3>Resource Details</h3>
      ${
        spec.schemes
          ? ` <div class="resource-detail">
      <div class="resource-detail__title">Security</div>
      <div class="resource-detail__content">${spec.schemes.join(", ")}</div>
    </div>`
          : ""
      }
      <div class="resource-detail">
        <div class="resource-detail__title">Category</div>
        <div class="resource-detail__content">${endpoint.tags.join(", ")}</div>
      </div>
      <h2>Request</h2>
      ${apiParameters(spec, endpoint)}
      <h2>Response</h2>
      ${responseDetails(spec, endpoint)}
    </div>
  </div>`;
}

function apiParameters(spec, endpoint) {
  const { parameters } = endpoint;
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
  if (bodyParams.length) {
    const body = bodyParams[0];
    if (
      body.schema &&
      body.schema.properties &&
      Object.keys(body.schema.properties).length
    ) {
      dom.push("<h3>Request Body Structure</h3>");
      // Add collapsing request structure
      dom.push(`<ul class="schema-list first">`);
      dom.push(
        ...Object.entries(body.schema.properties).map(([name, property]) => {
          return renderProperty(name, property, body.schema.required);
        })
      );
      dom.push(`</ul>`);
    }
    if (body.schema && body.schema.example) {
      dom.push("<h3>Request Body Example</h3>");
      dom.push(
        `<pre class="codeblock">${JSON.stringify(
          body.schema.example,
          null,
          4
        )}</pre>`
      );
    }
  }

  return dom.join("\n");
}

function responseDetails(spec, endpoint) {
  const dom = [];
  if (endpoint.responses && Object.keys(endpoint.responses).length) {
    if (endpoint.responses["200"] && endpoint.responses["200"].schema) {
      if (endpoint.responses["200"].schema.properties) {
        dom.push("<h3>Response Body Structure</h3>");
        // Add collapsing request structure
        dom.push(`<ul class="schema-list first">`);
        dom.push(
          ...Object.entries(endpoint.responses["200"].schema.properties).map(
            ([name, property]) => {
              return renderProperty(
                name,
                property,
                endpoint.responses["200"].schema.required
              );
            }
          )
        );
        dom.push(`</ul>`);
      }

      if (endpoint.responses["200"].schema.example) {
        dom.push("<h3>Response Body Example</h3>");
        dom.push(
          `<pre class="codeblock">${JSON.stringify(
            endpoint.responses["200"].schema.example,
            null,
            4
          )}</pre>`
        );
      }
    }
    dom.push("<h3>Response Code Details</h3>");
    const responses = Object.entries(endpoint.responses).map(
      ([code, response]) => {
        return [code, response.description || ""];
      }
    );
    dom.push(createTable(["HTTP Code", "Description"], responses));
  }
  return dom.join("\n");
}

function renderProperty(name, property, required = []) {
  const dom = [];
  // Create property dom
  dom.push(`<li class="schema-property">
  <div class="schema-property__description">
    <div class="schema-property__description-title">${name}</div>
    <span class="schmea-property__description-type">(${property.type ||
      "Object"})</span>
    ${required.includes(name) ? `<span class="required">* required</span>` : ""}
    <div class="schema-property__description-description">${property.description ||
      ""}</div>
  </div>`);
  // Render children if exist
  if (property.properties) {
    dom.push(`<ul class="schema-list">`);
    dom.push(
      Object.entries(property.properties)
        .map(([name, property]) => renderProperty(name, property, required))
        .join("\n")
    );
    dom.push("</ul>");
  }
  if (property.items) {
    dom.push('<span class="array-bound">[</span>');
    dom.push(`<ul class="schema-list">`);
    dom.push(
      Object.entries(property.items.properties)
        .map(([name, prop]) =>
          renderProperty(name, prop, property.items.required)
        )
        .join("\n")
    );
    dom.push("</ul>");
    dom.push('<span class="array-bound">]</span>');
  }
  // Close property dom element
  dom.push("</li>");
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
  const specParsed = await refparser.dereference(parsedSpec.data);
  const spec = mergeAllOf(specParsed, {
    resolvers: {
      defaultResolver: mergeAllOf.options.resolvers.title
    }
  });
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
    <div class="preview-banner">
      <h1>Fortellis API Documentation Preview</h1>
      <p>This is a preview and is not an exact representation what will be avaliable on <a href="https://apidocs.fortellis.io">API docs</a> after spec publishing.</p>
    </div>
    <div>
      ${apiTitle(spec)}
      ${pathsDom}
    </div>
  </div>
</body>
${end}`;

  return dom;
}

module.exports = generatePreview;
