const { parseWithPointers } = require("@stoplight/yaml");
const refparser = require("json-schema-ref-parser");
const mergeAllOf = require("json-schema-merge-allof");
const marky = require("markyjs");

const styles = require("./styles");
const start = '<!DOCTYPE html><html lang="en">';
const end = "</html>";

const EL = {
  body: "body",
  div: "div",
  span: "span",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  p: "p",
  a: "a",
  head: "head",
  title: "title",
  style: "style",
  meta: "meta",
  link: "link"
};

function createElement(type, attributes, children) {
  return `<${type} ${
    attributes
      ? Object.entries(attributes)
          .map(([attr, value]) => `${attr}="${value}"`)
          .join(" ")
      : ""
  }>${
    Array.isArray(children)
      ? children.filter(item => item !== null).join("\n")
      : children || ""
  }</${type}>`;
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

  return (
    "<!DOCTYPE html>" +
    createElement("html", { lang: "en" }, [
      head(spec.info.title),
      createElement(
        EL.body,
        null,
        createElement(EL.div, null, [
          createElement(EL.div, { class: "preview-banner" }, [
            createElement(
              EL.h1,
              null,
              "Fortellis API Documentation Preview"
            ),
            createElement(EL.p, null, [
              "This is a preview and is not an exact representation what will be avaliable on ",
              createElement(
                EL.a,
                { href: "https://apidocs.fortellis.io" },
                "API Docs"
              ),
              " after spec publishing."
            ])
          ]),
          createElement(EL.div, null, [apiTitle(spec), pathsDom])
        ])
      )
    ])
  );
}

function head(title) {
  return createElement(EL.head, null, [
    createElement(EL.meta, { charset: "UTF-8" }),
    createElement(EL.meta, {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0"
    }),
    createElement(EL.title, null, title),
    createElement(EL.link, {
      href:
        "https://fonts.googleapis.com/css?family=Montserrat:700|Raleway:400,500i,700&display=swap",
      rel: "stylesheet"
    }),
    createElement(EL.style, null, styles)
  ]);
}

function apiTitle(spec) {
  return createElement(
    EL.div,
    { class: "spec-header" },
    createElement(EL.div, { class: "spec-header__description" }, [
      createElement(
        EL.h1,
        { class: "spec-header__description-title" },
        spec.info.title
      ),
      createElement(
        EL.a,
        { href: "https://apidocs.fortellis.io" },
        spec.basePath
          ? spec.basePath
              .split("/")[1]
              .split("-")
              .join(" ")
          : "basePath"
      ),
      createElement(
        EL.div,
        { class: "spec-header__description-description" },
        marky(spec.info.description)
      )
    ])
  );
}

function apiEndpoint(spec, path, method, endpoint) {
  return createElement(EL.div, { class: 'spec-endpoint'}, [
    createElement(EL.div, { class: 'spec-endpoint__header'}, [
      createElement(El.h2, { class: 'spec-endpoint__header-title'},)
    ])
  ])
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
  if (property.items && property.items.properties) {
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

module.exports = generatePreview;
