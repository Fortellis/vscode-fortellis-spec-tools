const styles = `
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
  }`;

module.exports = styles;
