const { parseWithPointers } = require("@stoplight/yaml");
const refparser = require("json-schema-ref-parser");
const mergeAllOf = require("json-schema-merge-allof");
const { createElement } = require('./utils'); // Required for jsx
const marky = require("markyjs");

const styles = require("./styles");

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

  const app = (
    <html lang="en">
      {head(spec.info.title)}
      <body>
        <div>
          <div class="preview-banner">
            <h1>Fortellis API Details Preview</h1>
            <p>
              This is a preview and is not an exact representation of what will
              be avaliable on{" "}
              <a href="https://apidocs.fortellis.io">API Details Page</a> after spec
              publishing.
            </p>
          </div>
          <div>
            {apiTitle(spec)}
            {pathsDom}
          </div>
        </div>
      </body>
    </html>
  );

  return "<!DOCTYPE html>" + app;
}

function head(title) {
  return (
    <head>
      <meta charset="UTF=8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <link
        href="https://fonts.googleapis.com/css?family=Montserrat:700|Raleway:400,500i,700&display=swap"
        rel="stylesheet"
      />
      <style>{styles}</style>
    </head>
  );
}

function apiTitle(spec) {
  return (
    <div class="spec-header">
      <div class="spec-header__description">
        <h1 class="spec-header__description-title">{spec.info.title}</h1>
        <a href="https://apidocs.fortellis.io">
          {spec.basePath
            ? spec.basePath
                .split("/")[1]
                .split("-")
                .join(" ")
            : "basePath"}
        </a>
        <div class="spec-header__description-description">
          {marky(spec.info.description)}
        </div>
      </div>
    </div>
  );
}

function apiEndpoint(spec, path, method, endpoint) {
  return (
    <div class="spec-endpoint">
      <div class="spec-endpoint__header">
        <h2 class="spec-endpoint__header-title">
          <span class={`method ${method}`}>{method.toUpperCase()}</span>-{" "}
          {endpoint.operationId}
        </h2>
        <p class="spec-endpoint__header-description">{endpoint.description}</p>
      </div>
      <div class="spec-endpoint__body">
        <h3>Resource URL</h3>
        <div class="resource-url">
          <code>{`https://api.fortellis.io${path}`}</code>
        </div>
        <h3>Resource Details</h3>
        {spec.schemes ? (
          <div class="resource-detail">
            <div class="resource-detail__title">Security</div>
            <div class="resource-detail__content">
              {spec.schemes.join(", ")}
            </div>
          </div>
        ) : (
          ""
        )}
        {endpoint.tags ? (
          <div class="resource-detail">
            <div class="resource-detail__title">Category</div>
            <div class="resource-detail__content">
              {endpoint.tags.join(", ")}
            </div>
          </div>
        ) : null}
        <h2>Request</h2>
        {apiParameters(spec, endpoint)}
        <h2>Response</h2>
        {responseDetails(spec, endpoint)}
      </div>
    </div>
  );
}

function apiParameters(spec, endpoint) {
  const { parameters } = endpoint;
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

  const bodyParams = parameters.filter(p => p.in && p.in === "body");

  return (
    <div>
      {params.map(type => {
        if (type.params.length) {
          return (
            <div>
              <h3>{type.title}</h3>
              {createTable(
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
          );
        }
      })}
      {bodyParams.length && bodyParams[0].schema ? (
        <div>
          {bodyParams[0].schema.properties &&
          Object.keys(bodyParams[0].schema.properties).length ? (
            <div>
              <h3>Request Body Structure</h3>
              <ul class="schema-list first">
                {Object.entries(
                  bodyParams[0].schema.properties
                ).map(([name, property]) =>
                  renderProperty(name, property, bodyParams[0].schema.required)
                )}
              </ul>
            </div>
          ) : null}
          {bodyParams[0].schema.example ? (
            <div>
              <h3>Request Body Example</h3>
              <pre class="codeblock">
                {JSON.stringify(bodyParams[0].schema.example, null, 4)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function responseDetails(spec, endpoint) {
  if (!endpoint.responses || !Object.keys(endpoint.responses).length) {
    return null;
  }

  function renderResponseBody() {
    if (
      !endpoint.responses["200"] ||
      !endpoint.responses["200"].schema ||
      !endpoint.responses["200"].schema.properties
    ) {
      return null;
    }
    return (
      <div>
        <h3>Response Body Structure</h3>
        <ul class="schema-list first">
          {Object.entries(
            endpoint.responses["200"].schema.properties
          ).map(([name, property]) =>
            renderProperty(
              name,
              property,
              endpoint.responses["200"].schema.required
            )
          )}
        </ul>
      </div>
    );
  }

  function renderResponseExample() {
    if (
      !endpoint.responses["200"] ||
      !endpoint.responses["200"].schema ||
      !endpoint.responses["200"].schema.example
    ) {
      return null;
    }
    return (
      <div>
        <h3>Response Body Example</h3>
        <pre class="codeblock">
          {JSON.stringify(endpoint.responses["200"].schema.example, null, 4)}
        </pre>
      </div>
    );
  }

  function renderResponses() {
    const responses = Object.entries(endpoint.responses).map(
      ([code, response]) => {
        return [code, response.description || ""];
      }
    );

    return (
      <div>
        <h3>Response Code Details</h3>
        {createTable(["HTTP Code", "Description"], responses)}
      </div>
    );
  }

  return (
    <div>
      {renderResponseBody()}
      {renderResponseExample()}
      {renderResponses()}
    </div>
  );
}

function renderProperty(name, property, required = []) {
  function renderNestedProperties() {
    if (property.properties) {
      return (
        <ul class="schema-list">
          {Object.entries(property.properties).map(([name, property]) =>
            renderProperty(name, property, required)
          )}
        </ul>
      );
    }
    if (property.items && property.items.properties) {
      return (
        <div>
          <span class="array-bound">[</span>
          <ul class="schema-list">
            {Object.entries(property.items.properties).map(([name, prop]) =>
              renderProperty(name, prop, property.items.required || [])
            )}
          </ul>
          <span class="array-bound">]</span>
        </div>
      );
    }
  }

  return (
    <li class="schema-property">
      <div class="schema-property__description">
        <div class="schema-property__description-title">{name}</div>
        <span class="schmea-property__description-type">
          ({property.type || "Object"})
        </span>
        {required && required.includes(name) ? (
          <span class="required">* required</span>
        ) : null}
        <div class="schema-property__description-description">
          {property.description || ""}
        </div>
      </div>
      {renderNestedProperties()}
    </li>
  );
}

function createTable(headings, rows) {
  return (
    <div class="table-container">
      <table>
        <thead>
          <tr>
            {headings.map(th => (
              <th>{th}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(tr => (
            <tr>
              {tr.map(td => (
                <td>{td}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

module.exports = generatePreview;
